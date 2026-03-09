import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { LENS } from "@/lib/api/endpoints";
import { useState } from "react";

// ── Bundle component from API ──
export interface BundleComponent {
  component_id: number;
  component_name: string;
  name?: string; // backend may send "name" instead of "component_name"
  category: string;
  market_median: number | null;
  data_points: number;
  catalog_slug: string | null;
}

// ── Insight from API ──
export interface Insight {
  type: string; // "positive" | "warning" | "negative" | "info"
  text: string;
  icon: string; // emoji
}

// ── Single history signal from API ──
export interface LensHistoryItem {
  id: number;
  ad_hash: string | null;

  // Component
  component_id: number;
  component_name: string;
  category: string;

  // Listing
  price: number;
  platform: string;
  condition: string | null;
  region: string | null;
  listing_intent: string;
  created_at: string;

  // Bundle
  is_bundle: boolean;
  bundle_components: BundleComponent[] | null;

  // Market
  market_median: number | null;
  price_vs_market: number | null;
  verdict: string | null;
  data_points: number;
  confidence: number;

  // Bundle market
  bundle_total_value: number | null;
  bundle_verdict: string | null;

  // Insights
  insights: Insight[];

  // Deep analysis
  has_deep_analysis: boolean;
  deep_analysis_level: string | null;
  deep_data: any | null;

  // Quality
  is_qualified: boolean;
  is_outlier: boolean;
  cache_stale: boolean;
}

// ── Stats from API ──
export interface LensStats {
  total_signals: number;
  qualified: number;
  bundles: number;
  credits_earned: number;
}

// ── API response shape ──
interface LensHistoryResponse {
  signals: LensHistoryItem[];
  total: number;
  page: number;
  per_page: number;
  stats: LensStats;
  history_limit: number | null;
  history_usage: number;
}

interface UseLensHistoryOptions {
  platform?: string;
  signalType?: string;
  enabled?: boolean;
}

export function useLensHistory(options: UseLensHistoryOptions = {}) {
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const { platform, signalType, enabled = true } = options;

  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("per_page", String(pageSize));
  if (platform && platform !== "all") queryParams.set("platform", platform);
  if (signalType && signalType !== "all") queryParams.set("intent", signalType);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<LensHistoryResponse>({
    queryKey: ["lens-history", page, platform, signalType],
    queryFn: async () => {
      const raw = await apiFetch<LensHistoryResponse>(`${LENS.HISTORY}?${queryParams.toString()}`);
      // Normalize: backend may send "name" instead of "component_name" in bundle_components
      if (raw?.signals) {
        for (const sig of raw.signals) {
          if (sig.bundle_components) {
            sig.bundle_components = sig.bundle_components.map((c: any) => ({
              ...c,
              component_name: c.component_name || c.name || `Composant #${c.component_id}`,
            }));
          }
        }
      }
      return raw;
    },
    staleTime: 60_000,
    enabled,
  });

  return {
    items: data?.signals ?? [],
    total: data?.total ?? 0,
    page,
    pageSize,
    setPage,
    stats: data?.stats ?? null,
    isLoading,
    isError,
    error,
    refresh: refetch,
  };
}
