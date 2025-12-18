// API Provider - wraps real API calls
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
    return apiFetch<DashboardOverview>('/v1/dashboard/overview');
  },

  // Watchlist
  async getWatchlist() {
    return apiFetch<WatchlistResponse>('/v1/watchlist');
  },
  async addToWatchlist(data) {
    return apiPost('/v1/watchlist', data);
  },
  async removeFromWatchlist(id) {
    return apiDelete(`/v1/watchlist/${id}`);
  },

  // Alerts
  async getAlerts() {
    return apiFetch<AlertsResponse>('/v1/alerts');
  },
  async createAlert(data) {
    return apiPost<Alert>('/v1/alerts', data);
  },
  async updateAlert(id, data) {
    return apiPut<Alert>(`/v1/alerts/${id}`, data);
  },
  async deleteAlert(id) {
    return apiDelete(`/v1/alerts/${id}`);
  },

  // Notifications
  async getNotifications(limit) {
    const params = limit ? `?limit=${limit}` : '';
    return apiFetch<NotificationsResponse>(`/v1/users/notifications${params}`);
  },
  async markNotificationRead(id) {
    return apiPut(`/v1/users/notifications/${id}/read`, {});
  },
  async markAllNotificationsRead() {
    return apiPut('/v1/users/notifications/read-all', {});
  },
  async deleteNotification(id) {
    return apiDelete(`/v1/users/notifications/${id}`);
  },

  // Deals
  async getDeals(filters) {
    const query = buildQueryString(filters);
    return apiFetch<DealsResponse>(`/v1/deals${query}`);
  },
  async getMarketSummary(modelId?: string) {
    if (modelId) {
      return apiFetch<MarketSummary>(`/v1/market/models/${modelId}/summary`);
    }
    // Fallback for global summary - may need backend endpoint
    return apiFetch<MarketSummary>('/v1/market/trending');
  },

  // Catalog
  async getCategories() {
    return apiFetch<Category[]>('/v1/hardware/categories');
  },
  async getBrands(category) {
    const query = category ? `?category=${category}` : '';
    return apiFetch<string[]>(`/v1/catalog/brands${query}`);
  },
  async getFamilies(brand) {
    const query = brand ? `?brand=${brand}` : '';
    return apiFetch<string[]>(`/v1/catalog/families${query}`);
  },
  async getCatalogModels(filters) {
    const query = buildQueryString(filters);
    return apiFetch<CatalogResponse>(`/v1/hardware/models${query}`);
  },
  async getCatalogSummary() {
    return apiFetch<CatalogSummary>('/v1/catalog/summary');
  },

  // Model Detail (Hardware)
  async getModelDetail(modelId) {
    return apiFetch<ModelDetail>(`/v1/hardware/models/${modelId}`);
  },
  async getModelPriceHistory(modelId, period = '30') {
    return apiFetch<PriceHistoryPoint[]>(`/v1/hardware/models/${modelId}/price-history?period=${period}`);
  },
  async getModelAds(modelId, page = 1, limit = 10) {
    return apiFetch<ModelAdsResponse>(`/v1/hardware/models/${modelId}/ads?page=${page}&limit=${limit}`);
  },
  async toggleModelWatchlist(modelId, add) {
    if (add) {
      return apiPost('/v1/watchlist', { target_type: 'model', target_id: modelId });
    } else {
      return apiDelete(`/v1/watchlist/model/${modelId}`);
    }
  },
  async createPriceAlert(modelId, threshold) {
    return apiPost('/v1/alerts', {
      target_type: 'model',
      target_id: modelId,
      alert_type: 'price_threshold',
      threshold_value: threshold,
    });
  },

  // Ad Detail
  async getAdDetail(adId) {
    return apiFetch<AdDetail>(`/v1/ads/${adId}`);
  },
  async getAdPriceHistory(adId) {
    return apiFetch<AdPriceHistory>(`/v1/ads/${adId}/price-history`);
  },

  // Estimator
  async getModelsAutocomplete(search) {
    return apiFetch<ModelAutocomplete[]>(`/v1/hardware/models/autocomplete?q=${encodeURIComponent(search)}`);
  },
  async runEstimation(data) {
    return apiPost<EstimationResult>('/v1/estimator/run', data);
  },
  async getEstimationHistory(page = 1, limit = 10) {
    return apiFetch<EstimationHistoryResponse>(`/v1/estimator/history?page=${page}&limit=${limit}`);
  },
  async getEstimatorStats() {
    return apiFetch<EstimatorStats>('/v1/estimator/stats');
  },

  // Community
  async getAvailableTasks() {
    return apiFetch<AvailableTasksResponse>('/v1/community/tasks');
  },
  async getMyTasks() {
    return apiFetch<MyTasksResponse>('/v1/community/my-tasks');
  },
  async claimTask(data) {
    return apiPost<ClaimTaskResponse>('/v1/community/claim', data);
  },
  async getCommunityStats() {
    return apiFetch<CommunityStats>('/v1/community/stats');
  },
  async getLeaderboard(period) {
    return apiFetch<LeaderboardResponse>(`/v1/community/leaderboard?period=${period}`);
  },

  // Trends
  async getTrends(period = '30') {
    return apiFetch<TrendsData>(`/v1/market/trending?period=${period}`);
  },

  // Training
  async getTrainingData() {
    return apiFetch<TrainingData>('/v1/training');
  },
  async completeModule(moduleId) {
    return apiPost(`/v1/training/modules/${moduleId}/complete`, {});
  },

  // Jobs
  async startScrap(data) {
    return apiPost<ScrapStartResponse>('/v1/scrap/start', data);
  },
  async getJobStatus(jobId) {
    return apiFetch<JobStatus>(`/v1/jobs/${jobId}`);
  },
  async cancelJob(jobId) {
    return apiPost(`/v1/jobs/${jobId}/cancel`, {});
  },
  async getUserJobs(limit = 10) {
    return apiFetch<UserJobsResponse>(`/v1/jobs?limit=${limit}`);
  },

  // User
  async getUserCredits() {
    return apiFetch<UserCredits>('/v1/users/credits');
  },
  async getSubscriptionPlans() {
    return apiFetch<SubscriptionPlan[]>('/v1/subscriptions/plans');
  },
  async getUserSubscription() {
    return apiFetch<UserSubscription | null>('/v1/subscriptions/current');
  },
  async getSubscriptionHistory() {
    return apiFetch<UserSubscription[]>('/v1/subscriptions/history');
  },
  async getUserProfile() {
    return apiFetch<UserProfile>('/v1/users/me');
  },
  async subscribe(planId) {
    return apiPost('/v1/subscriptions', { plan_id: planId });
  },
};
