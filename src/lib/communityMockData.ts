export interface CommunityNeeds {
  active: boolean;
  summary: {
    pending_missions: number;
    estimated_pages: number;
    coverage_7d_pct: number;
    credits_distributed_30d: number;
  };
  priority_models: Array<{
    model: string;
    type: "list_only" | "open_on_new";
    region: string | null;
    pages_hint: string;
    priority: "high" | "medium" | "low";
    context: string;
    estimated_time_min: number;
    credit_reward: number;
  }>;
}

export interface UserLimits {
  max_comm_jobs_per_day: number;
  used_today: number;
  cooldown_minutes: number;
  cooldown_remaining: number;
}

export interface UserEligibility {
  eligible: boolean;
  user_limits: UserLimits;
}

export interface AssignedShard {
  shard_id: string;
  model: string;
  type: "list_only" | "open_on_new";
  region: string | null;
  pages_from: number;
  pages_to: number;
  date_window: string;
  recommended_delays: {
    min_delay_page_ms: number;
    max_delay_page_ms: number;
  };
  expires_at: string;
  estimated_time_min: number;
  credit_reward: number;
}

export interface HistoryItem {
  id: string;
  date: string;
  model: string;
  type: "list_only" | "open_on_new";
  pages_scanned: number;
  ads_new: number;
  ads_changed: number;
  status: "done" | "expired" | "failed";
  credits_earned: number;
  duration_seconds: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: string;
  missions: number;
  pages: number;
  credits: number;
  quality: number;
  badge?: "Top Contributeur" | "Élite" | "Régulier" | "Nouveau";
}

export const communityNeeds: CommunityNeeds = {
  active: true,
  summary: {
    pending_missions: 34,
    estimated_pages: 420,
    coverage_7d_pct: 0.78,
    credits_distributed_30d: 5820,
  },
  priority_models: [
    {
      model: "RTX 4060",
      type: "list_only",
      region: null,
      pages_hint: "1–6",
      priority: "high",
      context: "Besoin de nouvelles annonces des 4 derniers jours",
      estimated_time_min: 4,
      credit_reward: 1,
    },
    {
      model: "Ryzen 5 5600X",
      type: "open_on_new",
      region: "IDF",
      pages_hint: "10–18",
      priority: "high",
      context: "Zone Île-de-France, scan approfondi nécessaire",
      estimated_time_min: 9,
      credit_reward: 2,
    },
    {
      model: "RTX 3070",
      type: "list_only",
      region: null,
      pages_hint: "21–30",
      priority: "medium",
      context: "Mise à jour hebdomadaire",
      estimated_time_min: 6,
      credit_reward: 1,
    },
    {
      model: "Samsung 980 Pro 1TB",
      type: "list_only",
      region: "ARA",
      pages_hint: "1–10",
      priority: "medium",
      context: "Couverture Auvergne-Rhône-Alpes",
      estimated_time_min: 5,
      credit_reward: 1,
    },
    {
      model: "Corsair Vengeance DDR5",
      type: "open_on_new",
      region: null,
      pages_hint: "1–8",
      priority: "low",
      context: "Scan périodique",
      estimated_time_min: 7,
      credit_reward: 1,
    },
  ],
};

export const userEligibility: UserEligibility = {
  eligible: true,
  user_limits: {
    max_comm_jobs_per_day: 10,
    used_today: 3,
    cooldown_minutes: 10,
    cooldown_remaining: 0,
  },
};

export const mockHistory: HistoryItem[] = [
  {
    id: "hist_1",
    date: "2025-11-06T14:30:00Z",
    model: "RTX 4060",
    type: "list_only",
    pages_scanned: 10,
    ads_new: 42,
    ads_changed: 15,
    status: "done",
    credits_earned: 1,
    duration_seconds: 420,
  },
  {
    id: "hist_2",
    date: "2025-11-05T10:15:00Z",
    model: "Ryzen 7 5800X3D",
    type: "open_on_new",
    pages_scanned: 8,
    ads_new: 28,
    ads_changed: 8,
    status: "done",
    credits_earned: 2,
    duration_seconds: 510,
  },
  {
    id: "hist_3",
    date: "2025-11-04T16:45:00Z",
    model: "RTX 3060 Ti",
    type: "list_only",
    pages_scanned: 0,
    ads_new: 0,
    ads_changed: 0,
    status: "expired",
    credits_earned: 0,
    duration_seconds: 0,
  },
  {
    id: "hist_4",
    date: "2025-11-03T11:20:00Z",
    model: "Samsung 980 Pro 1TB",
    type: "list_only",
    pages_scanned: 12,
    ads_new: 35,
    ads_changed: 10,
    status: "done",
    credits_earned: 1,
    duration_seconds: 380,
  },
  {
    id: "hist_5",
    date: "2025-11-02T09:00:00Z",
    model: "Corsair RM850x",
    type: "open_on_new",
    pages_scanned: 6,
    ads_new: 18,
    ads_changed: 5,
    status: "done",
    credits_earned: 1,
    duration_seconds: 340,
  },
];

export const leaderboard30d: LeaderboardEntry[] = [
  {
    rank: 1,
    user: "Alex***",
    missions: 45,
    pages: 420,
    credits: 52,
    quality: 0.96,
    badge: "Top Contributeur",
  },
  {
    rank: 2,
    user: "Marie***",
    missions: 38,
    pages: 360,
    credits: 44,
    quality: 0.94,
    badge: "Élite",
  },
  {
    rank: 3,
    user: "Thomas***",
    missions: 32,
    pages: 310,
    credits: 38,
    quality: 0.92,
    badge: "Élite",
  },
  {
    rank: 4,
    user: "Sophie***",
    missions: 28,
    pages: 270,
    credits: 32,
    quality: 0.91,
    badge: "Régulier",
  },
  {
    rank: 5,
    user: "Julien***",
    missions: 24,
    pages: 230,
    credits: 28,
    quality: 0.89,
    badge: "Régulier",
  },
  {
    rank: 6,
    user: "Etienne***",
    missions: 7,
    pages: 70,
    credits: 8,
    quality: 0.95,
    badge: "Nouveau",
  },
];

export const leaderboardAllTime: LeaderboardEntry[] = [
  {
    rank: 1,
    user: "Alex***",
    missions: 180,
    pages: 1820,
    credits: 210,
    quality: 0.95,
    badge: "Top Contributeur",
  },
  {
    rank: 2,
    user: "Marie***",
    missions: 165,
    pages: 1650,
    credits: 192,
    quality: 0.93,
    badge: "Élite",
  },
  {
    rank: 3,
    user: "Thomas***",
    missions: 142,
    pages: 1380,
    credits: 168,
    quality: 0.91,
    badge: "Élite",
  },
  {
    rank: 4,
    user: "Sophie***",
    missions: 128,
    pages: 1240,
    credits: 152,
    quality: 0.90,
    badge: "Régulier",
  },
  {
    rank: 5,
    user: "Julien***",
    missions: 115,
    pages: 1100,
    credits: 138,
    quality: 0.88,
    badge: "Régulier",
  },
  {
    rank: 6,
    user: "Etienne***",
    missions: 7,
    pages: 70,
    credits: 8,
    quality: 0.95,
    badge: "Nouveau",
  },
];

export function generateAssignedShard(): AssignedShard {
  const models = ["RTX 4060", "Ryzen 5 5600X", "RTX 3070", "Samsung 980 Pro 1TB"];
  const model = models[Math.floor(Math.random() * models.length)];
  const type: "list_only" | "open_on_new" = Math.random() > 0.5 ? "list_only" : "open_on_new";
  
  return {
    shard_id: `sh_${Math.random().toString(36).substr(2, 6)}`,
    model,
    type,
    region: Math.random() > 0.7 ? "IDF" : null,
    pages_from: 1,
    pages_to: type === "list_only" ? 10 : 8,
    date_window: "depuis 4 jours",
    recommended_delays: {
      min_delay_page_ms: 3000,
      max_delay_page_ms: 8000,
    },
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    estimated_time_min: type === "list_only" ? 4 : 7,
    credit_reward: type === "open_on_new" ? 2 : 1,
  };
}
