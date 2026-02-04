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
    const response = await apiFetch<any>(ENDPOINTS.CATEGORIES.LIST);
    // GARDE CRITIQUE - transforme la réponse en tableau sécurisé
    return (response || []).map((c: any) => ({
      id: c?.id || 0,
      name: c?.name || '',
      count: c?.count || 0,
    }));
  },
  async getManufacturers(category) {
    const query = category ? buildQueryString({ category }) : '';
    const response = await apiFetch<any>(`${ENDPOINTS.CATALOG.MANUFACTURERS}${query}`);
    // GARDE CRITIQUE - transforme [{name}] -> string[] avec protection null
    return (response || []).map((item: any) => typeof item === 'string' ? item : (item?.name || ''));
  },
  async getBrands(category) {
    const query = category ? buildQueryString({ category }) : '';
    const response = await apiFetch<any>(`${ENDPOINTS.CATALOG.BRANDS}${query}`);
    // GARDE CRITIQUE
    return (response || []).map((item: any) => typeof item === 'string' ? item : (item?.name || ''));
  },
  async getFamilies(manufacturer) {
    const query = manufacturer ? buildQueryString({ manufacturer }) : '';
    const response = await apiFetch<any>(`${ENDPOINTS.CATALOG.FAMILIES}${query}`);
    // GARDE CRITIQUE
    return (response || []).map((item: any) => typeof item === 'string' ? item : (item?.name || ''));
  },
  async getCatalogModels(filters) {
    track('getCatalogModels');
    const query = buildQueryString(filters);
    const response = await apiFetch<any>(`${ENDPOINTS.MODELS.LIST}${query}`);
    
    // GARDE CRITIQUE - protection contre undefined
    const items = response?.items || [];
    
    return {
      items: items.map((item: any) => ({
        id: item?.id || 0,
        name: item?.name || '',
        brand: item?.brand || null,
        manufacturer: item?.manufacturer || null,
        family: item?.family || null,
        category: item?.category || `Category ${item?.category_id || 0}`,
        median_price: item?.median_price || 0,
        fair_value_30d: item?.fair_value_30d || null,
        price_median_30d: item?.price_median_30d || null,
        var_7d_pct: item?.var_7d_pct || 0,
        var_30d_pct: item?.var_30d_pct || null,
        volume: item?.volume || 0,
        liquidity: item?.liquidity || 0,
        liquidity_score: item?.liquidity_score || 0,
        ads_count: item?.ads_count || 0,
        aliases: item?.aliases || [],
      })),
      total: response?.total || 0,
      page: Math.floor((response?.offset || 0) / (response?.limit || 20)) + 1,
      page_size: response?.limit || 20,
      total_pages: Math.ceil((response?.total || 1) / (response?.limit || 20)),
    };
  },
  async getCatalogSummary() {
    const response = await apiFetch<any>(ENDPOINTS.CATALOG.SUMMARY);
    // GARDE CRITIQUE - protection contre undefined
    return {
      total_models: response?.models || response?.total_models || 0,
      total_brands: response?.brands || response?.total_brands || 0,
      categories_count: response?.categories || response?.categories_count || 0,
      last_update: response?.last_updated_at || response?.last_update || new Date().toISOString(),
      median_price_global: response?.median_price_global || 0,
      avg_variation: response?.avg_variation || 0,
      total_ads: response?.total_ads || 0,
    };
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
    try {
      return await apiFetch<EstimatorStats>(ENDPOINTS.ESTIMATOR.STATS);
    } catch (error) {
      console.warn('EstimatorStats endpoint error, using defaults');
      return {
        total_runs: 0,
        runs_this_month: 0,
        distinct_models: 0,
        favorite_category: null,
      };
    }
  },

  // Community (v0.18)
  async getAvailableTasks() {
    const response = await apiFetch<any>(ENDPOINTS.COMMUNITY.TASKS_AVAILABLE);
    
    // GARDE CRITIQUE - protection contre undefined
    const items = response?.items || [];
    return {
      active: items.length > 0,
      tasks: items.map((t: any) => ({
        ...t,
        type: t?.type || 'list-only',
        pages_estimate: t?.pages_estimate || 5,
      })),
      summary: {
        pending_missions: response?.total || items.length,
        estimated_pages: (response?.total || items.length) * 5,
        coverage_7d_pct: 0.75,
        credits_distributed_30d: 0,
      },
    };
  },
  async getMyTasks() {
    const response = await apiFetch<any>(ENDPOINTS.COMMUNITY.TASKS_MY);
    
    // L'API retourne un tableau directement, pas un objet
    const tasks = Array.isArray(response) ? response : (response?.items || response?.tasks || []);
    
    return {
      items: tasks,
      tasks: tasks,
      total: tasks.length,
      user_limits: response?.user_limits || {
        max_comm_jobs_per_day: 5,
        used_today: 0,
        cooldown_minutes: 0,
        cooldown_remaining: 0,
      },
    };
  },
  async claimTask(data) {
    return apiPost<ClaimTaskResponse>(ENDPOINTS.COMMUNITY.TASKS_CLAIM, data);
  },
  async getCommunityStats() {
    const response = await apiFetch<any>(ENDPOINTS.COMMUNITY.STATS);
    
    return {
      total_contributors: response?.contributors_count ?? response?.total_contributors ?? 0,
      total_missions_30d: response?.total_community_jobs ?? response?.total_missions_30d ?? 0,
      total_missions_completed: response?.total_community_jobs ?? response?.total_missions_completed ?? 0,
      total_pages_30d: response?.total_community_ads_ingested ?? response?.total_pages_30d ?? 0,
      total_pages_scanned: response?.total_community_ads_ingested ?? response?.total_pages_scanned ?? 0,
      total_credits_30d: response?.total_community_credits_awarded ?? response?.total_credits_30d ?? 0,
      total_credits_distributed: response?.total_community_credits_awarded ?? response?.total_credits_distributed ?? 0,
      total_ads_found: response?.total_community_ads_ingested ?? response?.total_ads_found ?? 0,
      coverage_7d_pct: response?.coverage_7d_pct ?? 0.75,
      active_contributors_today: response?.active_contributors_today ?? 0,
      your_rank: response?.your_rank ?? 0,
      your_percentile: response?.your_percentile ?? 0,
    };
  },
  async getLeaderboard(period) {
    const response = await apiFetch<any>(`${ENDPOINTS.COMMUNITY.LEADERBOARD}?period=${period}`);
    
    // GARDE CRITIQUE - protection contre undefined
    const items = response?.items || response?.entries || [];
    
    const mappedEntries = items.map((e: any) => ({
      rank: e?.rank || 0,
      user: e?.username || `User #${e?.user_id || 0}`,
      user_display: e?.display_name || e?.username || `User #${e?.user_id || 0}`,
      missions: e?.total_jobs || 0,
      pages: 0,
      credits: e?.total_credits || 0,
      quality: 0,
      quality_score: 0,
      badge: (e?.rank && e.rank <= 3) ? ['🥇', '🥈', '🥉'][e.rank - 1] : null,
    }));
    
    return {
      items: mappedEntries,
      entries: mappedEntries,
      period: period,
      current_user_rank: response?.current_user_rank || null,
    };
  },

  // Trends
  async getTrends(period = '30') {
    return apiFetch<TrendsData>(`${ENDPOINTS.MARKET.TRENDING}?period=${period}`);
  },

  // Training
  async getTrainingData() {
    const response = await apiFetch<any>(ENDPOINTS.TRAINING.DATA);
    
    // GARDE CRITIQUE - protection contre undefined
    const modules = response?.modules || [];
    return {
      progress: {
        modules_completed: modules.filter((m: any) => m?.is_completed).map((m: any) => m?.id),
        total_modules: response?.total_modules || modules.length,
        hours_spent: Math.round(modules.reduce((acc: number, m: any) => acc + (m?.duration_minutes || 0), 0) / 60),
      },
      modules: modules.map((m: any) => ({
        id: m?.id || 0,
        title: m?.title || '',
        description: m?.description || '',
        duration: `${m?.duration_minutes || 0} min`,
        completed: m?.is_completed || false,
        lessons: [],
        icon: m?.category === 'estimator' ? '📊' : m?.category === 'market' ? '📈' : '📚',
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
    const response = await apiFetch<any>(ENDPOINTS.CREDITS.BALANCE);
    // GARDE CRITIQUE - utilise ?? pour gérer null et undefined
    return {
      credits_remaining: response?.balance ?? response?.credits_remaining ?? 0,
      plan_name: response?.plan_name || 'Starter',
      credits_reset_date: response?.credits_reset_date,
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
    
    const response = await apiFetch<any>(`/v1/admin/users?${params.toString()}`);
    
    return {
      items: (response.items || []).map((u: any) => ({
        id: String(u.id),
        email: u.email,
        display_name: u.display_name,
        role: u.role,
        credits_remaining: 0,
        plan_name: u.role,
        created_at: u.created_at,
        last_sign_in_at: u.last_login,
      })),
      total: response.total || 0,
      page: response.page || page,
      page_size: response.page_size || limit,
    };
  },
  async getAdminJobs(page = 1, limit = 20, filters) {
    const offset = (page - 1) * limit;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    return apiFetch<AdminJobsResponse>(`/v1/admin/jobs?${params.toString()}`);
  },
  async getAdminLogs(page = 1, limit = 50, filters) {
    const offset = (page - 1) * limit;
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (filters?.level && filters.level !== 'all') params.append('level', filters.level);
    if (filters?.search) params.append('search', filters.search);
    return apiFetch<AdminLogsResponse>(`/v1/admin/logs?${params.toString()}`);
  },
  async getHealthStatus() {
    return apiFetch<HealthStatus>('/health');
  },
};
