// API Endpoints - All API routes aligned with monark_api_v0.18

// ============= Auth =============
export const AUTH = {
  LOGIN: "/v1/auth/login",
  REGISTER: "/v1/auth/register",
  REFRESH: "/v1/auth/refresh",
  LOGOUT: "/v1/auth/logout",
  ME: "/v1/users/me",
} as const;

// ============= Dashboard =============
export const DASHBOARD = {
  OVERVIEW: "/v1/dashboard/overview",
} as const;

// ============= Users =============
export const USERS = {
  ME: "/v1/users/me",
} as const;

// ============= Credits =============
export const CREDITS = {
  BALANCE: "/v1/credits/balance",
  HISTORY: "/v1/credits/history",
} as const;

// ============= Billing =============
export const BILLING = {
  PLANS: "/v1/billing/plans",
  SUBSCRIPTIONS: "/v1/billing/subscriptions",
  HISTORY: "/v1/billing/history",
  CHECKOUT_SESSION: "/v1/billing/checkout_session",
} as const;

// ============= Watchlist =============
export const WATCHLIST = {
  LIST: "/v1/watchlist",
  ADD: "/v1/watchlist",
  REMOVE: (id: number) => `/v1/watchlist/${id}`,
  REMOVE_MODEL: (modelId: number) => `/v1/watchlist/model/${modelId}`,
} as const;

// ============= Alerts =============
export const ALERTS = {
  LIST: "/v1/alerts",
  CREATE: "/v1/alerts",
  UPDATE: (id: number) => `/v1/alerts/${id}`,
  DELETE: (id: number) => `/v1/alerts/${id}`,
} as const;

// ============= Deals =============
export const DEALS = {
  LIST: "/v1/deals",
} as const;

// ============= Market =============
export const MARKET = {
  TRENDING: "/v1/market/trending",
  MODEL_SUMMARY: (modelId: string) => `/v1/market/models/${modelId}/summary`,
  MODEL_HISTORY: (modelId: string) => `/v1/market/models/${modelId}/history`,
} as const;

// ============= Hardware =============
export const HARDWARE = {
  CATEGORIES: "/v1/hardware/categories",
  MODELS: "/v1/hardware/models",
  MODEL_DETAIL: (id: string) => `/v1/hardware/models/${id}`,
} as const;

// ============= Ads =============
export const ADS = {
  DETAIL: (id: string) => `/v1/ads/${id}`,
  PRICE_HISTORY: (id: string) => `/v1/ads/${id}/prices`,
} as const;

// ============= Estimator =============
export const ESTIMATOR = {
  RUN: "/v1/estimator/run",
  HISTORY: "/v1/estimator/history",
  STATS: "/v1/estimator/stats",
} as const;

// ============= Community =============
export const COMMUNITY = {
  LEADERBOARD: "/v1/community/leaderboard",
  STATS: "/v1/community/stats",
  TASKS_AVAILABLE: "/v1/community/tasks/available",
  TASKS_CLAIM: "/v1/community/tasks/claim",
  TASKS_MY: "/v1/community/tasks/my",
} as const;

// ============= Training =============
export const TRAINING = {
  DATA: "/v1/training",
  COMPLETE_MODULE: (moduleId: number) => `/v1/training/modules/${moduleId}/complete`,
} as const;

// ============= Jobs / Scrap =============
export const JOBS = {
  CREATE: "/v1/scrap/create_job",
  STATUS: (id: number) => `/v1/jobs/${id}`,
  CANCEL: (id: number) => `/v1/jobs/${id}/cancel`,
  LIST: "/v1/jobs",
} as const;

// ============= Admin =============
export const ADMIN = {
  USERS: "/v1/admin/usesr",
  SYSTEM: "/v1/admin/system",
} as const;

// ============= Health =============
export const HEALTH = {
  READY: "/health/ready",
} as const;

// Export all endpoints grouped
export const ENDPOINTS = {
  AUTH,
  DASHBOARD,
  USERS,
  CREDITS,
  BILLING,
  WATCHLIST,
  ALERTS,
  DEALS,
  MARKET,
  HARDWARE,
  ADS,
  ESTIMATOR,
  COMMUNITY,
  TRAINING,
  JOBS,
  ADMIN,
  HEALTH,
} as const;
