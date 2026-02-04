// API Provider - wraps real API calls (aligned with monark_api_v1.0)
import { apiFetch, apiPost, apiPut, apiDelete, apiPatch, ENDPOINTS } from "@/lib/api";
import { trackEndpointCall } from "@/lib/debugTracker";
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

function track(endpoint: string) {
  trackEndpointCall(endpoint, 'api');
}

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
    track('getDashboard');
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

  // Notifications (v0.19+)
  async getNotifications(limit = 20) {
    const query = buildQueryString({ limit });
    return apiFetch<NotificationsResponse>(`${ENDPOINTS.NOTIFICATIONS.LIST}${query}`);
  },
  async markNotificationRead(id) {
    return apiPatch(ENDPOINTS.NOTIFICATIONS.MARK_READ(Number(id)), {});
  },
  async markAllNotificationsRead() {
    return apiPost(ENDPOINTS.NOTIFICATIONS.READ_ALL, {});
  },
  async deleteNotification(id) {
    return apiDelete(ENDPOINTS.NOTIFICATIONS.DELETE(Number(id)));
  },

  // Deals
  async getDeals(filters) {
    track('getDeals');
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
    const response = await apiFetch<Array<{
      id: number;
      name: string;
      slug?: string;
    }>>(ENDPOINTS.CATEGORIES.LIST);
    
    return (response ?? []).map(c => ({
      id: c.id,
      name: c.name,
      count: 0,
    }));
  },
  async getManufacturers(category) {
    const query = category ? buildQueryString({ category }) : '';
    return apiFetch<string[]>(`${ENDPOINTS.CATALOG.MANUFACTURERS}${query}`);
  },
  async getBrands(category) {
    const query = category ? buildQueryString({ category }) : '';
    return apiFetch<string[]>(`${ENDPOINTS.CATALOG.BRANDS}${query}`);
  },
  async getFamilies(manufacturer) {
    const query = manufacturer ? buildQueryString({ manufacturer }) : '';
    return apiFetch<string[]>(`${ENDPOINTS.CATALOG.FAMILIES}${query}`);
  },
  async getCatalogModels(filters) {
    track('getCatalogModels');
    const query = buildQueryString(filters);
    return apiFetch<CatalogResponse>(`${ENDPOINTS.MODELS.LIST}${query}`);
  },
  async getCatalogSummary() {
    return apiFetch<CatalogSummary>(ENDPOINTS.CATALOG.SUMMARY);
  },

  // Model Detail (Hardware)
  async getModelDetail(modelId) {
    return apiFetch<ModelDetail>(ENDPOINTS.MODELS.DETAIL(modelId));
  },
  async getModelPriceHistory(modelId, period = '30') {
    return apiFetch<PriceHistoryPoint[]>(`${ENDPOINTS.MARKET.MODEL_HISTORY(modelId)}?period=${period}`);
  },
  async getModelAds(modelId, page = 1, limit = 10) {
    const query = buildQueryString({ page, limit });
    return apiFetch<ModelAdsResponse>(`${ENDPOINTS.ADS.BY_MODEL(modelId)}${query}`);
  },
  async getSimilarModels(modelId, limit = 6) {
    const query = buildQueryString({ limit });
    return apiFetch(`${ENDPOINTS.MODELS.SIMILAR(modelId)}${query}`);
  },
  async toggleModelWatchlist(modelId, add) {
    if (add) {
      return apiPost(ENDPOINTS.WATCHLIST.ADD, { target_type: 'model', target_id: modelId });
    } else {
      // Use generic remove with the watchlist item id, not model id
      return apiDelete(ENDPOINTS.WATCHLIST.REMOVE(modelId));
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
    const query = buildQueryString({ q: search });
    return apiFetch<ModelAutocomplete[]>(`${ENDPOINTS.MODELS.AUTOCOMPLETE}${query}`);
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
    const response = await apiFetch<{ tasks: any[] }>(ENDPOINTS.COMMUNITY.TASKS_AVAILABLE);
    
    return {
      active: (response.tasks?.length ?? 0) > 0,
      tasks: (response.tasks ?? []).map(t => ({
        ...t,
        type: t.type || 'list-only',
        pages_estimate: t.pages_estimate || 5,
      })),
      summary: {
        pending_missions: response.tasks?.length ?? 0,
        estimated_pages: (response.tasks?.length ?? 0) * 5,
        coverage_7d_pct: 0.75,
        credits_distributed_30d: 0,
      },
    };
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
    const response = await apiFetch<{
      entries: Array<{
        user_id: number;
        username: string | null;
        display_name: string | null;
        total_jobs: number;
        total_credits: number;
        rank: number;
      }>;
      current_user_rank: number | null;
    }>(`${ENDPOINTS.COMMUNITY.LEADERBOARD}?period=${period}`);
    
    return {
      items: (response.entries ?? []).map(e => ({
        rank: e.rank,
        user: e.username || `User #${e.user_id}`,
        user_display: e.display_name || e.username || `User #${e.user_id}`,
        missions: e.total_jobs,
        pages: 0,
        credits: e.total_credits,
        quality: 0,
        quality_score: 0,
        badge: e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : null,
      })),
      entries: (response.entries ?? []).map(e => ({
        rank: e.rank,
        user: e.username || `User #${e.user_id}`,
        user_display: e.display_name || e.username || `User #${e.user_id}`,
        missions: e.total_jobs,
        pages: 0,
        credits: e.total_credits,
        quality: 0,
        quality_score: 0,
        badge: e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : null,
      })),
      period: period,
      user_rank: response.current_user_rank ?? undefined,
    };
  },

  // Trends
  async getTrends(period = '30') {
    return apiFetch<TrendsData>(`${ENDPOINTS.MARKET.TRENDING}?period=${period}`);
  },

  // Training
  async getTrainingData() {
    const response = await apiFetch<{
      modules: Array<{
        id: number;
        code: string;
        title: string;
        description: string;
        content: string;
        order_index: number;
        duration_minutes: number;
        is_premium: boolean;
        is_completed: boolean;
        completed_at: string | null;
      }>;
      total_modules: number;
      completed_count: number;
      progress_percent: number;
    }>(ENDPOINTS.TRAINING.DATA);
    
    return {
      progress: {
        modules_completed: response.modules.filter(m => m.is_completed).map(m => m.id),
        total_modules: response.total_modules,
        hours_spent: 0,
      },
      modules: response.modules.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        duration: `${m.duration_minutes} min`,
        completed: m.is_completed,
        lessons: m.content ? m.content.split('\n').filter(l => l.trim()) : [],
        icon: '📚',
      })),
      faq: [],
    };
  },
  async completeModule(moduleId) {
    return apiPost(ENDPOINTS.TRAINING.COMPLETE_MODULE(moduleId), {});
  },

  // Jobs / Scrap
  async startScrap(data) {
    return apiPost<ScrapStartResponse>(ENDPOINTS.SCRAP.CREATE_JOB, data);
  },
  async getJobStatus(jobId) {
    return apiFetch<JobStatus>(ENDPOINTS.JOBS.DETAIL(jobId));
  },
  async cancelJob(jobId) {
    return apiPost(ENDPOINTS.JOBS.CANCEL(jobId), {});
  },
  async getUserJobs(limit = 10) {
    return apiFetch<UserJobsResponse>(`${ENDPOINTS.JOBS.LIST}?limit=${limit}`);
  },

  // Credits & Billing (v0.18)
  async getUserCredits() {
    const response = await apiFetch<{ balance: number }>(ENDPOINTS.CREDITS.BALANCE);
    return {
      credits_remaining: response.balance ?? 0,
      plan_name: 'Starter',
      credits_reset_date: undefined,
    };
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
  async consumeCredits(amount: number, reason: string) {
    return apiPost('/v1/credits/consume', { amount, reason });
  },

  // User Settings
  async getUserSettings() {
    return apiFetch(ENDPOINTS.USERS.SETTINGS);
  },
  async updateUserSettings(data) {
    return apiPut(ENDPOINTS.USERS.UPDATE_SETTINGS, data);
  },

  // Saved Searches
  async getSavedSearches() {
    return apiFetch(ENDPOINTS.USERS.SAVED_SEARCHES);
  },
  async getSavedSearch(id) {
    return apiFetch(ENDPOINTS.USERS.SAVED_SEARCH_DETAIL(id));
  },
  async createSavedSearch(data) {
    return apiPost(ENDPOINTS.USERS.SAVED_SEARCHES, data);
  },
  async updateSavedSearch(id, data) {
    return apiPut(ENDPOINTS.USERS.SAVED_SEARCH_DETAIL(id), data);
  },
  async deleteSavedSearch(id) {
    return apiDelete(ENDPOINTS.USERS.SAVED_SEARCH_DETAIL(id));
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
