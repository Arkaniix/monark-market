import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuth } from "@/context/AuthContext";

// ============= Types =============

export interface CommunityMyStats {
  trust_score: number;
  total_flags: number;
  flags_this_week: number;
  flags_confirmed: number;
  flags_rejected: number;
  flags_by_type: Record<string, number>;
  trust_level: "expert" | "confirmed" | "standard" | "new" | "restricted";
}

export interface CommunityActivity {
  intent_type: string;
  platform: string;
  source: string;
  component_name: string;
  component_category: string;
  created_at: string;
}

export interface CommunityRecentActivity {
  activities: CommunityActivity[];
  count: number;
}

// ============= Mock Data =============

const MOCK_COMMUNITY_STATS: CommunityMyStats = {
  trust_score: 0.72,
  total_flags: 47,
  flags_this_week: 8,
  flags_confirmed: 38,
  flags_rejected: 4,
  flags_by_type: {
    broken: 12,
    bundle: 8,
    sale: 15,
    box_only: 4,
    mining: 3,
    trade: 2,
    symbolic_price: 3,
  },
  trust_level: "confirmed",
};

const MOCK_RECENT_ACTIVITY: CommunityRecentActivity = {
  activities: [
    {
      intent_type: "broken",
      platform: "leboncoin",
      source: "auto_confirmed",
      component_name: "GeForce RTX 4090",
      component_category: "gpu",
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      intent_type: "bundle",
      platform: "leboncoin",
      source: "manual_flag",
      component_name: "Ryzen 7 5800X",
      component_category: "cpu",
      created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      intent_type: "sale",
      platform: "ebay",
      source: "auto_overridden",
      component_name: "GeForce RTX 3080",
      component_category: "gpu",
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      intent_type: "mining",
      platform: "leboncoin",
      source: "manual_flag",
      component_name: "Radeon RX 6800 XT",
      component_category: "gpu",
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      intent_type: "box_only",
      platform: "vinted",
      source: "auto_confirmed",
      component_name: "GeForce RTX 4070 Ti",
      component_category: "gpu",
      created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    },
  ],
  count: 5,
};

// ============= Mappings =============

export const INTENT_ICONS: Record<string, string> = {
  sale: "✅",
  broken: "⚠️",
  bundle: "🖥️",
  box_only: "📦",
  trade: "🔄",
  wanted: "🔎",
  mining: "⛏️",
  accessory: "🔧",
  symbolic_price: "💬",
  reserved: "🔒",
  rental: "🏠",
  rma_refurb: "🔄",
  multiple: "📦",
  professional: "🏪",
  other: "❓",
};

export const INTENT_LABELS: Record<string, string> = {
  sale: "Vente confirmée",
  broken: "Composant HS",
  bundle: "PC complet",
  box_only: "Boîte seule",
  trade: "Échange",
  wanted: "Demande d'achat",
  mining: "Ex-minage",
  accessory: "Accessoire",
  symbolic_price: "Prix symbolique",
  reserved: "Réservé / vendu",
  rental: "Location",
  rma_refurb: "Reconditionné",
  multiple: "Lot",
  professional: "Vendeur pro",
  other: "Autre",
};

export const TRUST_LEVELS = {
  expert: { label: "Expert", icon: "🏆", color: "text-yellow-500", bgColor: "bg-yellow-500/10", progressColor: "[&>div]:bg-yellow-500" },
  confirmed: { label: "Confirmé", icon: "✅", color: "text-green-500", bgColor: "bg-green-500/10", progressColor: "[&>div]:bg-green-500" },
  standard: { label: "Standard", icon: "👤", color: "text-blue-500", bgColor: "bg-blue-500/10", progressColor: "[&>div]:bg-blue-500" },
  new: { label: "Nouveau", icon: "🆕", color: "text-muted-foreground", bgColor: "bg-muted", progressColor: "" },
  restricted: { label: "Restreint", icon: "⚠️", color: "text-orange-500", bgColor: "bg-orange-500/10", progressColor: "[&>div]:bg-orange-500" },
} as const;

export function getPlatformLabel(platform: string): string {
  switch (platform) {
    case "leboncoin": return "Leboncoin";
    case "ebay": return "eBay";
    case "vinted": return "Vinted";
    default: return platform;
  }
}

export function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

function getTrustScoreProgressColor(score: number): string {
  if (score < 0.3) return "[&>div]:bg-destructive";
  if (score < 0.5) return "[&>div]:bg-orange-500";
  if (score < 0.7) return "[&>div]:bg-blue-500";
  return "[&>div]:bg-green-500";
}

export { getTrustScoreProgressColor };

// ============= Hooks =============

function isMockMode(): boolean {
  if (typeof window === "undefined") return true;
  const hostname = window.location.hostname;
  const isDev = hostname === "localhost" || hostname.includes("lovable") || hostname.includes("127.0.0.1") || import.meta.env.DEV;
  if (isDev) {
    const override = localStorage.getItem("DATA_PROVIDER_OVERRIDE");
    if (override === "mock") return true;
    if (override === "api") return false;
  }
  const providerType = import.meta.env.VITE_DATA_PROVIDER || "mock";
  return providerType === "mock";
}

export function useCommunityMyStats() {
  const { user } = useAuth();
  const mock = isMockMode();

  return useQuery({
    queryKey: ["community", "my-stats"],
    queryFn: async (): Promise<CommunityMyStats> => {
      if (mock) return MOCK_COMMUNITY_STATS;
      return apiFetch<CommunityMyStats>(ENDPOINTS.COMMUNITY.MY_STATS);
    },
    enabled: !!user,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCommunityRecentActivity(limit = 20) {
  const { user } = useAuth();
  const mock = isMockMode();

  return useQuery({
    queryKey: ["community", "recent-activity", limit],
    queryFn: async (): Promise<CommunityRecentActivity> => {
      if (mock) return MOCK_RECENT_ACTIVITY;
      return apiFetch<CommunityRecentActivity>(`${ENDPOINTS.COMMUNITY.RECENT_ACTIVITY}?limit=${limit}`);
    },
    enabled: !!user,
    staleTime: 60_000,
    retry: 1,
  });
}
