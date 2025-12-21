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

// Updated with new credit calculation: base 10 + bonus based on priority/freshness, capped at 20
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
      credit_reward: 20, // Base 10 + priority high 10 = 20 (capped)
    },
    {
      model: "Ryzen 5 5600X",
      type: "open_on_new",
      region: "IDF",
      pages_hint: "10–18",
      priority: "high",
      context: "Zone Île-de-France, scan approfondi nécessaire",
      estimated_time_min: 9,
      credit_reward: 20, // Base 10 + priority high 10 + type 3 = 23 -> capped at 20
    },
    {
      model: "RTX 3070",
      type: "list_only",
      region: null,
      pages_hint: "21–30",
      priority: "medium",
      context: "Mise à jour hebdomadaire",
      estimated_time_min: 6,
      credit_reward: 18, // Base 10 + priority medium 5 + freshness 3 = 18
    },
    {
      model: "Samsung 980 Pro 1TB",
      type: "list_only",
      region: "ARA",
      pages_hint: "1–10",
      priority: "medium",
      context: "Couverture Auvergne-Rhône-Alpes",
      estimated_time_min: 5,
      credit_reward: 15, // Base 10 + priority medium 5 = 15
    },
    {
      model: "Corsair Vengeance DDR5",
      type: "open_on_new",
      region: null,
      pages_hint: "1–8",
      priority: "low",
      context: "Scan périodique",
      estimated_time_min: 7,
      credit_reward: 13, // Base 10 + type 3 = 13
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

// Updated history with new credit amounts
export const mockHistory: HistoryItem[] = [
  {
    id: "hist_1",
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    model: "RTX 4060",
    type: "list_only",
    pages_scanned: 10,
    ads_new: 42,
    ads_changed: 15,
    status: "done",
    credits_earned: 18, // High priority task
    duration_seconds: 420,
  },
  {
    id: "hist_2",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    model: "Ryzen 7 5800X3D",
    type: "open_on_new",
    pages_scanned: 8,
    ads_new: 28,
    ads_changed: 8,
    status: "done",
    credits_earned: 20, // High priority + open_on_new, capped
    duration_seconds: 510,
  },
  {
    id: "hist_3",
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
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
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    model: "Samsung 980 Pro 1TB",
    type: "list_only",
    pages_scanned: 12,
    ads_new: 35,
    ads_changed: 10,
    status: "done",
    credits_earned: 15, // Medium priority
    duration_seconds: 380,
  },
  {
    id: "hist_5",
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    model: "Corsair RM850x",
    type: "open_on_new",
    pages_scanned: 6,
    ads_new: 18,
    ads_changed: 5,
    status: "done",
    credits_earned: 13, // Low priority + open_on_new
    duration_seconds: 340,
  },
  {
    id: "hist_6",
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
    model: "RTX 4070 Ti",
    type: "list_only",
    pages_scanned: 15,
    ads_new: 52,
    ads_changed: 20,
    status: "done",
    credits_earned: 20, // High priority, capped
    duration_seconds: 550,
  },
  {
    id: "hist_7",
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    model: "Intel i5-13600K",
    type: "list_only",
    pages_scanned: 8,
    ads_new: 25,
    ads_changed: 8,
    status: "done",
    credits_earned: 12, // Low priority + freshness bonus
    duration_seconds: 290,
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
  const priority: "high" | "medium" | "low" = Math.random() > 0.6 ? "high" : Math.random() > 0.3 ? "medium" : "low";
  
  // Calculate credit reward based on new formula
  const baseReward = 10;
  const priorityBonus = priority === "high" ? 10 : priority === "medium" ? 5 : 0;
  const typeBonus = type === "open_on_new" ? 3 : 0;
  const freshnessBonus = Math.floor(Math.random() * 8); // Random freshness
  const totalReward = Math.min(20, baseReward + priorityBonus + typeBonus + freshnessBonus);
  
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
    credit_reward: totalReward,
  };
}
