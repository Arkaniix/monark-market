// API Provider - wraps real API calls (aligned with monark_api_v0.18)
import { apiFetch, apiPost, apiPut, apiDelete, ENDPOINTS } from "@/lib/api";
import type {
  DataProvider,
  DashboardOverview,
  WatchlistResponse,
  AlertsResponse,
  Alert,
  CreateAlertPayload,
  UpdateAlertPayload,
  NotificationsResponse,
  DealsResponse,
  DealsFilters,
  MarketSummary,
  Category,
  CatalogResponse,
  CatalogFilters,
  CatalogSummary,
  ModelDetail,
  PriceHistoryPoint,
  ModelAdsResponse,
  AdDetail,
  AdPriceHistory,
  ModelAutocomplete,
  EstimationRequest,
  EstimationResult,
  EstimationHistoryResponse,
  EstimatorStats,
  AvailableTasksResponse,
  MyTasksResponse,
  ClaimTaskRequest,
  ClaimTaskResponse,
  CommunityStats,
  LeaderboardResponse,
  TrendsData,
  TrainingData,
  ScrapStartRequest,
  ScrapStartResponse,
  JobStatus,
  UserJobsResponse,
  UserCredits,
  SubscriptionPlan,
  UserSubscription,
  UserProfile,
  AdminUsersResponse,
  AdminJobsResponse,
  AdminJobsFilters,
  AdminLogsResponse,
  AdminLogsFilters,
  HealthStatus,
} from "./types";

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const apiProvider: DataProvider = {
  // Dashboard
  async getDashboard() {
    return apiFetch<DashboardOverview>(ENDPOINTS.DASHBOARD.OVERVIEW);
  },

  // Watchlist
  async getWatchlist() {
    return apiFetch<WatchlistResponse>(ENDPOINTS.WATCHLIST.LIST);
  },
  async addToWatchlist(data) {
    return apiPost(ENDPOINTS.WATCHLIST.ADD, data);
  },
  async removeFromWatchlist(id) {
    return apiDelete(ENDPOINTS.WATCHLIST.REMOVE(id));
  },

  // Alerts
  async getAlerts() {
    return apiFetch<AlertsResponse>(ENDPOINTS.ALERTS.LIST);
  },
  async createAlert(data) {
    return apiPost<Alert>(ENDPOINTS.ALERTS.CREATE, data);
  },
  async updateAlert(id, data) {
    return apiPut<Alert>(ENDPOINTS.ALERTS.UPDATE(id), data);
  },
  async deleteAlert(id) {
    return apiDelete(ENDPOINTS.ALERTS.DELETE(id));
  },

  // Notifications - NOT IMPLEMENTED in v0.18, return empty
  async getNotifications(limit) {
    console.warn('[apiProvider] Notifications not implemented in API v0.18');
    return { items: [], total: 0, unread_count: 0 };
  },
  async markNotificationRead(id) {
    console.warn('[apiProvider] Notifications not implemented in API v0.18');
  },
  async markAllNotificationsRead() {
    console.warn('[apiProvider] Notifications not implemented in API v0.18');
  },
  async deleteNotification(id) {
    console.warn('[apiProvider] Notifications not implemented in API v0.18');
  },

  // Deals
  async getDeals(filters) {
    const query = buildQueryString(filters);
    return apiFetch<DealsResponse>(`${ENDPOINTS.DEALS.LIST}${query}`);
  },
  async getMarketSummary(modelId?: string) {
    if (modelId) {
      return apiFetch<MarketSummary>(ENDPOINTS.MARKET.MODEL_SUMMARY(modelId));
    }
    return apiFetch<MarketSummary>(ENDPOINTS.MARKET.TRENDING);
  },

  // Catalog
  async getCategories() {
    return apiFetch<Category[]>(ENDPOINTS.HARDWARE.CATEGORIES);
  },
  async getBrands(category) {
    console.warn('[apiProvider] Catalog brands not implemented in API v0.18');
    return [];
  },
  async getFamilies(brand) {
    console.warn('[apiProvider] Catalog families not implemented in API v0.18');
    return [];
  },
  async getCatalogModels(filters) {
    const query = buildQueryString(filters);
    return apiFetch<CatalogResponse>(`${ENDPOINTS.HARDWARE.MODELS}${query}`);
  },
  async getCatalogSummary() {
    console.warn('[apiProvider] Catalog summary not implemented in API v0.18');
    return { total_models: 0, total_brands: 0, categories_count: 0, last_update: new Date().toISOString() };
  },

  // Model Detail (Hardware)
  async getModelDetail(modelId) {
    return apiFetch<ModelDetail>(ENDPOINTS.HARDWARE.MODEL_DETAIL(modelId));
  },
  async getModelPriceHistory(modelId, period = '30') {
    return apiFetch<PriceHistoryPoint[]>(`${ENDPOINTS.MARKET.MODEL_HISTORY(modelId)}?period=${period}`);
  },
  async getModelAds(modelId, page = 1, limit = 10) {
    console.warn('[apiProvider] Model ads endpoint not implemented in API v0.18');
    return { items: [], total: 0, page, page_size: limit };
  },
  async toggleModelWatchlist(modelId, add) {
    if (add) {
      return apiPost(ENDPOINTS.WATCHLIST.ADD, { target_type: 'model', target_id: modelId });
    } else {
      return apiDelete(ENDPOINTS.WATCHLIST.REMOVE_MODEL(modelId));
    }
  },
  async createPriceAlert(modelId, threshold) {
    return apiPost(ENDPOINTS.ALERTS.CREATE, {
      target_type: 'model',
      target_id: modelId,
      alert_type: 'price_threshold',
      threshold_value: threshold,
    });
  },

  // Ad Detail
  async getAdDetail(adId) {
    return apiFetch<AdDetail>(ENDPOINTS.ADS.DETAIL(adId));
  },
  async getAdPriceHistory(adId) {
    return apiFetch<AdPriceHistory>(ENDPOINTS.ADS.PRICE_HISTORY(adId));
  },

  // Estimator
  async getModelsAutocomplete(search) {
    console.warn('[apiProvider] Models autocomplete not implemented in API v0.18');
    return [];
  },
  async runEstimation(data) {
    return apiPost<EstimationResult>(ENDPOINTS.ESTIMATOR.RUN, data);
  },
  async getEstimationHistory(page = 1, limit = 10) {
    return apiFetch<EstimationHistoryResponse>(`${ENDPOINTS.ESTIMATOR.HISTORY}?page=${page}&limit=${limit}`);
  },
  async getEstimatorStats() {
    return apiFetch<EstimatorStats>(ENDPOINTS.ESTIMATOR.STATS);
  },

  // Community (v0.18)
  async getAvailableTasks() {
    return apiFetch<AvailableTasksResponse>(ENDPOINTS.COMMUNITY.TASKS_AVAILABLE);
  },
  async getMyTasks() {
    return apiFetch<MyTasksResponse>(ENDPOINTS.COMMUNITY.TASKS_MY);
  },
  async claimTask(data) {
    return apiPost<ClaimTaskResponse>(ENDPOINTS.COMMUNITY.TASKS_CLAIM, data);
  },
  async getCommunityStats() {
    return apiFetch<CommunityStats>(ENDPOINTS.COMMUNITY.STATS);
  },
  async getLeaderboard(period) {
    return apiFetch<LeaderboardResponse>(`${ENDPOINTS.COMMUNITY.LEADERBOARD}?period=${period}`);
  },

  // Trends
  async getTrends(period = '30') {
    return apiFetch<TrendsData>(`${ENDPOINTS.MARKET.TRENDING}?period=${period}`);
  },

  // Training
  async getTrainingData() {
    return apiFetch<TrainingData>(ENDPOINTS.TRAINING.DATA);
  },
  async completeModule(moduleId) {
    return apiPost(ENDPOINTS.TRAINING.COMPLETE_MODULE(moduleId), {});
  },

  // Jobs (v0.18: /v1/scrap/create_job)
  async startScrap(data) {
    return apiPost<ScrapStartResponse>(ENDPOINTS.JOBS.CREATE, data);
  },
  async getJobStatus(jobId) {
    return apiFetch<JobStatus>(ENDPOINTS.JOBS.STATUS(jobId));
  },
  async cancelJob(jobId) {
    return apiPost(ENDPOINTS.JOBS.CANCEL(jobId), {});
  },
  async getUserJobs(limit = 10) {
    return apiFetch<UserJobsResponse>(`${ENDPOINTS.JOBS.LIST}?limit=${limit}`);
  },

  // Credits & Billing (v0.18)
  async getUserCredits() {
    return apiFetch<UserCredits>(ENDPOINTS.CREDITS.BALANCE);
  },
  async getSubscriptionPlans() {
    return apiFetch<SubscriptionPlan[]>(ENDPOINTS.BILLING.PLANS);
  },
  async getUserSubscription() {
    return apiFetch<UserSubscription | null>(ENDPOINTS.BILLING.SUBSCRIPTIONS);
  },
  async getSubscriptionHistory() {
    return apiFetch<UserSubscription[]>(ENDPOINTS.BILLING.HISTORY);
  },
  async getUserProfile() {
    return apiFetch<UserProfile>(ENDPOINTS.USERS.ME);
  },
  async subscribe(planId) {
    return apiPost(ENDPOINTS.BILLING.CHECKOUT_SESSION, { plan_id: planId });
  },

  // Admin
  async getUserRole() {
    return apiFetch<{ user_id: string; role: string }>('/v1/users/me/role');
  },
  async getAdminUsers(page = 1, limit = 20, search) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    return apiFetch<AdminUsersResponse>(`/v1/admin/users?${params.toString()}`);
  },
  async getAdminJobs(page = 1, limit = 20, filters) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    return apiFetch<AdminJobsResponse>(`/v1/admin/jobs?${params.toString()}`);
  },
  async getAdminLogs(page = 1, limit = 50, filters) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters?.level && filters.level !== 'all') params.append('level', filters.level);
    if (filters?.search) params.append('search', filters.search);
    return apiFetch<AdminLogsResponse>(`/v1/admin/logs?${params.toString()}`);
  },
  async getHealthStatus() {
    return apiFetch<HealthStatus>('/health');
  },
};
