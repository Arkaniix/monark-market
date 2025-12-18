// API Endpoints - All API routes organized by domain

// ============= Auth =============
export const AUTH = {
  LOGIN: '/v1/auth/login',
  REGISTER: '/v1/auth/register',
  REFRESH: '/v1/auth/refresh',
  LOGOUT: '/v1/auth/logout',
  ME: '/v1/users/me',
  ROLE: '/v1/users/me/role',
} as const;

// ============= Dashboard =============
export const DASHBOARD = {
  OVERVIEW: '/v1/dashboard/overview',
} as const;

// ============= Users =============
export const USERS = {
  ME: '/v1/users/me',
  CREDITS: '/v1/users/credits',
  NOTIFICATIONS: '/v1/users/notifications',
  NOTIFICATION_READ: (id: string) => `/v1/users/notifications/${id}/read`,
  NOTIFICATION_READ_ALL: '/v1/users/notifications/read-all',
  NOTIFICATION_DELETE: (id: string) => `/v1/users/notifications/${id}`,
} as const;

// ============= Watchlist =============
export const WATCHLIST = {
  LIST: '/v1/watchlist',
  ADD: '/v1/watchlist',
  REMOVE: (id: number) => `/v1/watchlist/${id}`,
  REMOVE_MODEL: (modelId: number) => `/v1/watchlist/model/${modelId}`,
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
} as const;

// ============= Market =============
export const MARKET = {
  TRENDING: '/v1/market/trending',
  MODEL_SUMMARY: (modelId: string) => `/v1/market/models/${modelId}/summary`,
  MODEL_HISTORY: (modelId: string) => `/v1/market/models/${modelId}/history`,
} as const;

// ============= Catalog =============
export const CATALOG = {
  BRANDS: '/v1/catalog/brands',
  FAMILIES: '/v1/catalog/families',
  SUMMARY: '/v1/catalog/summary',
} as const;

// ============= Hardware =============
export const HARDWARE = {
  CATEGORIES: '/v1/hardware/categories',
  MODELS: '/v1/hardware/models',
  MODEL_DETAIL: (id: string) => `/v1/hardware/models/${id}`,
  MODEL_PRICE_HISTORY: (id: string) => `/v1/hardware/models/${id}/price-history`,
  MODEL_ADS: (id: string) => `/v1/hardware/models/${id}/ads`,
  AUTOCOMPLETE: '/v1/hardware/models/autocomplete',
} as const;

// ============= Ads =============
export const ADS = {
  DETAIL: (id: string) => `/v1/ads/${id}`,
  PRICE_HISTORY: (id: string) => `/v1/ads/${id}/price-history`,
} as const;

// ============= Estimator =============
export const ESTIMATOR = {
  RUN: '/v1/estimator/run',
  HISTORY: '/v1/estimator/history',
  STATS: '/v1/estimator/stats',
} as const;

// ============= Community =============
export const COMMUNITY = {
  TASKS: '/v1/community/tasks',
  MY_TASKS: '/v1/community/my-tasks',
  CLAIM: '/v1/community/claim',
  STATS: '/v1/community/stats',
  LEADERBOARD: '/v1/community/leaderboard',
} as const;

// ============= Training =============
export const TRAINING = {
  DATA: '/v1/training',
  COMPLETE_MODULE: (moduleId: number) => `/v1/training/modules/${moduleId}/complete`,
} as const;

// ============= Jobs / Scrap =============
export const JOBS = {
  START: '/v1/scrap/start',
  STATUS: (id: number) => `/v1/jobs/${id}`,
  CANCEL: (id: number) => `/v1/jobs/${id}/cancel`,
  LIST: '/v1/jobs',
} as const;

// ============= Admin =============
export const ADMIN = {
  USERS: '/v1/admin/users',
  JOBS: '/v1/admin/jobs',
  JOB_DETAIL: (id: number) => `/v1/admin/jobs/${id}`,
  LOGS: '/v1/admin/logs',
} as const;

// ============= Health =============
export const HEALTH = {
  READY: '/health/ready',
} as const;

// Export all endpoints grouped
export const ENDPOINTS = {
  AUTH,
  DASHBOARD,
  USERS,
  WATCHLIST,
  ALERTS,
  DEALS,
  MARKET,
  CATALOG,
  HARDWARE,
  ADS,
  ESTIMATOR,
  COMMUNITY,
  TRAINING,
  JOBS,
  ADMIN,
  HEALTH,
} as const;
