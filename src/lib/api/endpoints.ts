// API Endpoints - All API routes aligned with backend API
// Last sync: 2026-02-04

// ============= Auth =============
export const AUTH = {
  LOGIN: '/v1/auth/login',
  REGISTER: '/v1/auth/register',
  REFRESH: '/v1/auth/refresh',
  LOGOUT: '/v1/auth/logout',
  LOGOUT_ALL: '/v1/auth/logout_all',
  FORGOT_PASSWORD: '/v1/auth/forgot_password',
  RESET_PASSWORD: '/v1/auth/reset_password',
} as const;

// ============= Dashboard =============
export const DASHBOARD = {
  OVERVIEW: '/v1/dashboard/overview',
} as const;

// ============= Users =============
export const USERS = {
  ME: '/v1/users/me',
  UPDATE_ME: '/v1/users/me', // PATCH
  DELETE_ME: '/v1/users/me', // DELETE
  ACTIVITY: '/v1/users/me/activity',
  LOGS: '/v1/users/me/logs',
  SESSIONS: '/v1/users/me/sessions',
  REVOKE_SESSION: (sessionToken: string) => `/v1/users/me/sessions/${sessionToken}`,
  SETTINGS: '/v1/users/me/settings',
  UPDATE_SETTINGS: '/v1/users/me/settings', // PATCH
  SAVED_SEARCHES: '/v1/users/me/saved_searches',
  SAVED_SEARCH_DETAIL: (id: number) => `/v1/users/me/saved_searches/${id}`,
} as const;

// ============= Credits =============
export const CREDITS = {
  BALANCE: '/v1/credits/balance',
  HISTORY: '/v1/credits/history',
} as const;

// ============= Billing =============
export const BILLING = {
  PLANS: '/v1/billing/plans',
  SUBSCRIPTIONS: '/v1/billing/subscriptions',
  HISTORY: '/v1/billing/history',
  CHECKOUT_SESSION: '/v1/billing/checkout_session',
} as const;

// ============= Watchlist =============
export const WATCHLIST = {
  LIST: '/v1/watchlist',
  ADD: '/v1/watchlist',
  REMOVE: (id: number) => `/v1/watchlist/${id}`,
  CLEAR: '/v1/watchlist', // DELETE without id
} as const;

// ============= Alerts =============
export const ALERTS = {
  LIST: '/v1/alerts',
  CREATE: '/v1/alerts',
  UPDATE: (id: number) => `/v1/alerts/${id}`,
  DELETE: (id: number) => `/v1/alerts/${id}`,
} as const;

// ============= Deals =============
export const DEALS = {
  LIST: '/v1/deals',
  FOR_MODEL: (modelId: number) => `/v1/deals/models/${modelId}`,
} as const;

// ============= Market =============
export const MARKET = {
  TRENDING: '/v1/market/trending',
  MODEL_SUMMARY: (modelId: string | number) => `/v1/market/models/${modelId}/summary`,
  MODEL_HISTORY: (modelId: string | number) => `/v1/market/models/${modelId}/history`,
  INGEST_SOLD: '/v1/market/ingest_sold', // POST
  LISTINGS_COUNT: (modelId: string | number) => `/v1/market/models/${modelId}/listings-count`,
} as const;

// ============= Categories =============
export const CATEGORIES = {
  LIST: '/v1/categories',
} as const;

// ============= Catalog (extended) =============
export const CATALOG = {
  SUMMARY: '/v1/catalog/summary',
  MANUFACTURERS: '/v1/catalog/manufacturers',
  BRANDS: '/v1/catalog/brands',
  FAMILIES: '/v1/catalog/families',
} as const;

// ============= Models (Hardware) =============
export const MODELS = {
  LIST: '/v1/models',
  DETAIL: (id: string | number) => `/v1/models/${id}`,
  SPECS: (id: string | number) => `/v1/models/${id}/specs`,
  MARKET_STATE: (id: string | number) => `/v1/models/${id}/market_state`,
  SIMILAR: (id: string | number) => `/v1/models/${id}/similar`,
  AUTOCOMPLETE: '/v1/models/autocomplete',
} as const;

// ============= Variants =============
export const VARIANTS = {
  DETAIL: (id: string | number) => `/v1/variants/${id}`,
} as const;

// ============= Ads =============
export const ADS = {
  LIST: '/v1/ads',
  SEARCH: '/v1/ads/search',
  BY_MODEL: (modelId: string | number) => `/v1/ads/model/${modelId}`,
  DETAIL: (id: string | number) => `/v1/ads/${id}`,
  PRICE_HISTORY: (id: string | number) => `/v1/ads/${id}/prices`,
} as const;

// ============= Estimator =============
export const ESTIMATOR = {
  RUN: '/v1/estimator/run',
  EVALUATE: '/v1/estimator/evaluate',
  EVALUATE_V3: '/v1/estimator/evaluate',
  HISTORY: '/v1/estimator/history',
  GET_RUN: (runId: string | number) => `/v1/estimator/${runId}`,
  MODEL_VALUE: (modelId: string | number) => `/v1/estimator/models/${modelId}`,
  STATS: '/v1/estimator/stats',
} as const;

// ============= Notifications =============
export const NOTIFICATIONS = {
  LIST: '/v1/notifications',
  MARK_READ: (id: number) => `/v1/notifications/${id}/read`,
  READ_ALL: '/v1/notifications/read_all',
  DELETE: (id: number) => `/v1/notifications/${id}`,
} as const;

// ============= Community =============
export const COMMUNITY = {
  LEADERBOARD: '/v1/community/leaderboard',
  STATS: '/v1/community/stats',
  MY_STATS: '/v1/community/my-stats',
  RECENT_ACTIVITY: '/v1/community/recent-activity',
  CONSENSUS: '/v1/community/consensus',
  TASKS_AVAILABLE: '/v1/community/tasks/available',
  TASKS_CLAIM: '/v1/community/tasks/claim',
  TASKS_MY: '/v1/community/tasks/my',
  TASK_COMPLETE: (taskId: number) => `/v1/community/tasks/${taskId}/complete`,
  TASK_RELEASE: (taskId: number) => `/v1/community/tasks/${taskId}/release`,
} as const;

// ============= Training =============
export const TRAINING = {
  DATA: '/v1/training',
  COMPLETE_MODULE: (moduleId: number) => `/v1/training/modules/${moduleId}/complete`,
} as const;

// ============= Jobs / Scrap =============
// DEPRECATED - Lens pivot
export const JOBS = {
  LIST: '/v1/jobs',
  DETAIL: (id: number) => `/v1/jobs/${id}`,
  CANCEL: (id: number) => `/v1/jobs/${id}/cancel`,
} as const;

// DEPRECATED - Lens pivot
export const SCRAP = {
  CREATE_JOB: '/v1/scrap/create_job',
  JOB_DONE: '/v1/scrap/job_done',
  UPLOAD_BATCH: '/v1/scrap/upload_batch',
} as const;

// DEPRECATED - Lens pivot
export const PREMIUM_SCRAP = {
  QUOTE: '/v1/premium/scrap/quote',
  START: '/v1/premium/scrap/start',
} as const;

// ============= Ingest (Admin) =============
export const INGEST = {
  BATCH: (batchId: number) => `/v1/ingest/batch/${batchId}`,
  RAW: (rawId: number) => `/v1/ingest/raw/${rawId}`,
  REPROCESS: (batchId: number) => `/v1/ingest/reprocess/${batchId}`,
} as const;

// ============= Lens (Extension) =============
export const LENS = {
  SCORE: '/v1/lens/score',
  QUICK: '/v1/lens/quick',
  HISTORY: '/v1/lens/history',
  HISTORY_ITEM: (id: number) => `/v1/lens/history/${id}`,
  HISTORY_DELETE_BATCH: '/v1/lens/history/delete-batch',
  SIGNAL: (id: number) => `/v1/lens/signals/${id}`,
  SIGNALS: '/v1/lens/signals',
  SIGNALS_DELETE_BATCH: '/v1/lens/signals/delete-batch',
  STATS: '/v1/lens/stats',
  ANALYZE_BUNDLE: '/v1/lens/analyze-bundle',
} as const;

// ============= Signals =============
export const SIGNALS = {
  INGEST: '/v1/signals/ingest',
} as const;

// ============= Missions =============
export const MISSIONS = {
  ACTIVE: '/v1/missions/active',
  PROGRESS: '/v1/missions/progress',
} as const;

// ============= Config (Extension) =============
export const CONFIG = {
  SELECTORS: '/v1/config/selectors',
  COMPONENT_DB: '/v1/config/component-db',
} as const;

// ============= Admin =============
export const ADMIN = {
  DASHBOARD: '/v1/admin/dashboard',
  USERS: '/v1/admin/users',
  USER_DETAIL: (id: number | string) => `/v1/admin/users/${id}`,
  USER_DETAIL_FULL: (id: number | string) => `/v1/admin/users/${id}/detail`,
  USER_UPDATE: (id: number | string) => `/v1/admin/users/${id}`,
  USER_CREDITS: (id: number | string) => `/v1/admin/users/${id}/credits`,
  CREATE_USER: '/v1/admin/users',
  SYSTEM: '/v1/admin/system',
  JOBS: '/v1/admin/jobs',
  LOGS: '/v1/admin/logs',
  REJECTS_STATS: '/v1/admin/rejects/stats',
  REJECTS_LIST: '/v1/admin/rejects',
  REJECTS_REVIEW: (id: number) => `/v1/admin/rejects/${id}/review`,
  REJECTS_EXPORT: '/v1/admin/rejects/export/csv',
  CRON: '/v1/admin/cron',
  CRON_RUN: (id: string) => `/v1/admin/cron/${id}/run`,
  OBSERVATIONS_TIMELINE: '/v1/admin/observations/timeline',
  OBSERVATORY: '/v1/admin/observatory',
  OBSERVATORY_MISSION: '/v1/admin/observatory/mission',
  OBSERVATORY_EXPORT: '/v1/admin/observatory/export',
  BILLING_CLIENTS: '/v1/admin/billing/clients',
  BILLING_CLIENT_HISTORY: (userId: number) => `/v1/admin/billing/client/${userId}/history`,
  BILLING_EXPORT: '/v1/admin/billing/export',
  MODELS: '/v1/admin/models',
  MODEL_DETAIL: (id: number) => `/v1/admin/models/${id}`,
  MODEL_IMAGE: (id: number) => `/v1/admin/models/${id}/image`,
  CATEGORIES: '/v1/admin/categories',
  ANALYTICS_DECOTE: '/v1/admin/analytics/decote',
  ANALYTICS_PRICE_HISTORY: (modelId: number) => `/v1/admin/analytics/price-history/${modelId}`,
  ANALYTICS_PRICE_TRENDS: '/v1/admin/analytics/price-trends',
  ANALYTICS_TOP_MOVERS: '/v1/admin/analytics/top-movers',
  ANALYTICS_DATA_FRESHNESS: '/v1/admin/analytics/data-freshness',
  ANALYTICS_SCRAPER_HISTORY: '/v1/admin/analytics/scraper-history',
  ANALYTICS_EXTENSION_USAGE: '/v1/admin/analytics/extension-usage',
  ANALYTICS_MARKET_LIQUIDITY: '/v1/admin/analytics/market-liquidity',
  MODEL_VARIANTS: (modelId: number) => `/v1/admin/models/${modelId}/variants`,
  VARIANT_UPDATE: (variantId: number) => `/v1/admin/variants/${variantId}`,
  SCRAPERS_LIST: '/v1/admin/scrapers/list',
  SCRAPER_STATUS: (name: string) => `/v1/admin/scrapers/${name}/status`,
  SCRAPER_LOGS: (name: string, lines = 100) => `/v1/admin/scrapers/${name}/logs?lines=${lines}`,
  SCRAPER_START: (name: string) => `/v1/admin/scrapers/${name}/start`,
  SCRAPER_STOP: (name: string) => `/v1/admin/scrapers/${name}/stop`,
  SCRAPER_PAUSE: (name: string) => `/v1/admin/scrapers/${name}/pause`,
  SCRAPER_RESUME: (name: string) => `/v1/admin/scrapers/${name}/resume`,
  SCRAPER_CONFIG: (name: string) => `/v1/admin/scrapers/${name}/config`,
  SCRAPERS_WS: '/v1/admin/scrapers/ws',
  SCRAPER_REPORT: (name: string) => `/v1/admin/scrapers/${name}/report`,
  SCRAPER_LOGS_DOWNLOAD: (name: string) => `/v1/admin/scrapers/${name}/logs/download`,
} as const;

// ============= Health =============
export const HEALTH = {
  ROOT: '/health',
  LIVE: '/health/live',
  READY: '/health/ready',
} as const;

// ============= Misc =============
export const MISC = {
  PING: '/ping',
  VERSION: '/version',
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
  CATEGORIES,
  CATALOG,
  MODELS,
  VARIANTS,
  ADS,
  ESTIMATOR,
  NOTIFICATIONS,
  COMMUNITY,
  TRAINING,
  JOBS,
  SCRAP,
  PREMIUM_SCRAP,
  INGEST,
  LENS,
  SIGNALS,
  MISSIONS,
  CONFIG,
  ADMIN,
  HEALTH,
  MISC,
} as const;
