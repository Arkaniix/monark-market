// DataProvider types
import type { DashboardOverview, Deal, PaginatedResponse } from "@/types/api";

// ============= Common Types =============
export interface ProviderResult<T> {
  data: T | null;
  error: string | null;
  isLoading?: boolean;
}

// ============= Dashboard =============
export type { DashboardOverview };

// ============= Watchlist =============
export interface WatchlistEntry {
  id: number;
  target_type: 'ad' | 'model';
  target_id: number;
  created_at: string;
  name?: string;
  brand?: string;
  category?: string;
  current_price?: number;
  price_change_7d?: number;
  fair_value?: number;
}

export interface WatchlistResponse {
  items: WatchlistEntry[];
  total: number;
}

// ============= Alerts =============
export type AlertType = 'deal_detected' | 'price_below' | 'price_above' | 'variation' | 'location' | 'new_listing';

export interface Alert {
  id: number;
  target_type: 'ad' | 'model';
  target_id: number;
  alert_type: AlertType;
  price_threshold?: number;
  variation_threshold?: number;
  region?: string;
  condition?: string;
  platform?: string;
  cooldown_hours?: number;
  is_active: boolean;
  created_at: string;
  last_triggered_at?: string;
  target_name?: string;
  target_category?: string;
  current_price?: number;
}

export interface AlertsResponse {
  items: Alert[];
  total: number;
}

export interface CreateAlertPayload {
  target_type: 'ad' | 'model';
  target_id: number;
  alert_type: AlertType;
  price_threshold?: number;
  variation_threshold?: number;
  region?: string;
  condition?: string;
  platform?: string;
  cooldown_hours?: number;
}

export interface UpdateAlertPayload {
  is_active?: boolean;
  alert_type?: AlertType;
  price_threshold?: number;
  variation_threshold?: number;
  region?: string;
  condition?: string;
  platform?: string;
  cooldown_hours?: number;
}

// ============= Notifications =============
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export interface NotificationsResponse {
  items: Notification[];
  total: number;
  unread_count: number;
}

// ============= Deals =============
export interface DealItem {
  id: number;
  ad_id: number;
  title: string;
  price: number;
  fair_value: number;
  deviation_pct: number;
  city: string;
  region: string;
  condition: string;
  category: string;
  model_name: string;
  platform: string;
  url: string;
  published_at: string;
  publication_date: string;
  score: number;
  item_type: 'component' | 'pc' | 'lot';
  delivery_possible: boolean;
  /** Ad-specific image URL (from the listing) */
  image_url?: string | null;
  /** Generic model image URL (from our database) */
  model_image_url?: string | null;
}

export interface DealsResponse {
  items: DealItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DealsFilters {
  category?: string;
  condition?: string;
  region?: string;
  platform?: string;
  item_type?: string;
  price_min?: number;
  price_max?: number;
  deviation_min?: number;
  sort_by?: 'score' | 'price_asc' | 'price_desc' | 'date' | string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface MarketSummary {
  total_ads: number;
  total_active_ads: number;
  total_opportunities: number;
  median_price: number;
  median_price_7d: number;
  price_variation: number;
  new_deals_today: number;
  total_volume_24h: number;
}

// ============= Catalog =============
export interface Category {
  id: number;
  name: string;
  count: number;
}

export interface CatalogModel {
  id: number;
  name: string;
  brand: string;
  family: string | null;
  category: string;
  median_price: number;
  fair_value_30d: number | null;
  price_median_30d: number | null;
  var_7d_pct: number;
  var_30d_pct: number | null;
  volume: number;
  liquidity: number;
  ads_count: number;
  last_scan_at?: string | null;
  aliases?: string[];
  image_url?: string | null;
}

export interface CatalogResponse {
  items: CatalogModel[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CatalogFilters {
  category?: string;
  brand?: string;
  family?: string;
  search?: string;
  sort_by?: 'fair_value_30d' | 'var_30d' | 'liquidity' | 'name' | string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CatalogSummary {
  total_models: number;
  total_brands: number;
  categories_count: number;
  last_update: string;
  median_price_global: number;
  avg_variation: number;
  total_ads: number;
}

// ============= Model Detail =============
export interface ModelSpecs {
  // Architecture
  chip?: string;
  architecture?: string;
  process_nm?: number;
  cuda_cores?: number;
  rt_cores?: number;
  tensor_cores?: number;
  // Mémoire
  vram_gb?: number;
  memory_type?: string;
  bus_width_bit?: number;
  memory_bandwidth_gbs?: number;
  // Fréquences
  base_clock_mhz?: number;
  boost_clock_mhz?: number;
  // Alimentation & Interface
  tdp_w?: number;
  pcie_interface?: string;
  power_connectors?: string;
  outputs_count?: number;
  // Technologies
  technologies?: string[];
  // Dates
  release_date?: string;
}

export interface ModelDetail {
  id: number;
  name: string;
  brand: string;
  family: string | null;
  category: string;
  aliases: string[];
  specs: ModelSpecs;
  market: {
    median_price: number;
    price_p25: number;
    price_p75: number;
    var_7d_pct: number;
    var_30d_pct: number;
    var_90d_pct: number;
    volume: number;
    ads_count: number;
    median_days_to_sell: number;
  };
  is_in_watchlist: boolean;
}

export interface PriceHistoryPoint {
  date: string;
  price_median: number;
  price_p25: number;
  price_p75: number;
  volume: number;
}

export interface ModelAd {
  id: number;
  title: string;
  price: number;
  condition: string;
  city: string;
  platform: string;
  url: string;
  published_at: string;
  score: number;
  deviation_pct: number;
}

export interface ModelAdsResponse {
  items: ModelAd[];
  total: number;
  page: number;
  page_size: number;
}

export interface SimilarModel {
  id: number;
  name: string;
  brand: string;
  category: string;
  median_price: number;
  var_30d_pct: number;
  similarity_reason: 'generation' | 'performance' | 'price_range';
}

// ============= Ad Detail =============
export interface AdComponent {
  role: string;
  model_name: string;
  model_id: number | null;
  brand: string;
  category: string;
}

export interface AdPricePoint {
  date: string;
  price: number;
}

export interface PCComponents {
  cpu: string;
  gpu?: string;
  ram: string;
  storage: string;
  motherboard?: string;
  psu?: string;
  case?: string;
  age_years?: number;
  condition?: 'Excellent' | 'Bon' | 'Correct' | 'Usé';
  warranty_months?: number;
}

export interface AdDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  fair_value: number;
  deviation_pct: number;
  score: number;
  condition: string;
  city: string;
  region: string;
  postal_code: string;
  platform: string;
  url: string;
  published_at: string;
  first_seen_at: string;
  last_seen_at: string;
  status: string;
  seller_type: string;
  delivery_possible: boolean;
  secured_payment: boolean;
  model: {
    id: number;
    name: string;
    brand: string;
    category: string;
  } | null;
  components: AdComponent[];
  images: string[];
  is_in_watchlist: boolean;
  item_type?: 'component' | 'pc' | 'lot';
  pc_components?: PCComponents;
  price_history_30d?: number[];
}

export interface AdPriceHistory {
  points: AdPricePoint[];
}

// ============= Estimator =============
export interface ModelAutocomplete {
  id: number;
  name: string;
  brand: string;
  category: string;
  full_name?: string;
  family?: string | null;
}

export interface EstimationRequest {
  model_id: number;
  state: string;
  purchase_price: number;
  region?: string;
}

export interface MarketSnapshot {
  median_price: number;
  var_30d_pct: number;
  volume: number;
  rarity_index: number;
  trend: 'up' | 'down' | 'stable';
}

export interface EstimationResult {
  model_id: number;
  model_name: string;
  category: string;
  state: string;
  region?: string;
  market: MarketSnapshot;
  estimate: {
    buy_price: number;
    sell_price_30d: number;
    sell_price_90d: number;
    profit_margin_pct: number;
    resell_probability: number;
    risk_level: 'low' | 'medium' | 'high';
    advice: string;
    badge: 'good' | 'caution' | 'risk';
  };
  trend_90d: number[];
  volume_30d: number[];
}

export interface EstimationHistoryItem {
  id: string;
  date: string;
  model: string;
  model_id: number;
  brand: string;
  category: string;
  condition: string;
  region?: string;
  buy_price: number;
  // Stored results from when estimation was run
  results: {
    buy_price_recommended: number;
    sell_price_1m: number;
    sell_price_3m?: number;
    margin_pct: number;
    resell_probability: number;
    risk_level: 'low' | 'medium' | 'high';
    badge: 'good' | 'caution' | 'risk';
    advice: string;
    market: {
      median_price: number;
      var_30d_pct: number;
      volume: number;
      rarity_index: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  trend: 'up' | 'down' | 'stable';
}

export interface EstimationHistoryResponse {
  items: EstimationHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface EstimatorStats {
  last_recalc: string;
  total_estimations: number;
}

// ============= Community =============
export interface CommunityTask {
  id: number;
  model_id: number;
  model_name: string;
  model: string;
  platform: string;
  type: 'list_only' | 'open_on_new';
  region: string | null;
  pages_hint: string;
  pages_from: number;
  pages_to: number;
  priority: 'high' | 'medium' | 'low';
  context: string | null;
  estimated_time_min: number;
  credit_reward: number;
  reward_credits: number;
  expires_at: string;
}

export interface AvailableTasksResponse {
  active: boolean;
  summary: {
    pending_missions: number;
    estimated_pages: number;
    coverage_7d_pct: number;
    credits_distributed_30d: number;
  };
  tasks: CommunityTask[];
}

export interface MyTask {
  id: number;
  task_id: number;
  job_id: number;
  date: string;
  model: string;
  model_name: string;
  platform: string;
  type: 'list_only' | 'open_on_new';
  pages_scanned: number;
  ads_new: number;
  ads_found: number;
  ads_changed: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'expired' | 'done' | 'in_progress';
  credits_earned: number;
  duration_seconds: number;
  claimed_at: string;
  completed_at: string | null;
}

export interface MyTasksResponse {
  items: MyTask[];
  tasks: MyTask[];
  total: number;
  user_limits: {
    max_comm_jobs_per_day: number;
    used_today: number;
    cooldown_minutes: number;
    cooldown_remaining: number;
  };
}

export interface ClaimTaskRequest {
  task_id: number;
}

export interface ClaimTaskResponse {
  success: boolean;
  shard_id: string;
  job_id: number;
  upload_token: string;
  model: string;
  task: CommunityTask;
  type: 'list_only' | 'open_on_new';
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
  params: {
    platform: string;
    keyword: string;
    type: string;
    pages_from: number;
    pages_to: number;
    search_url: string;
  };
}

export interface CommunityStats {
  total_contributors: number;
  total_missions_30d: number;
  total_missions_completed: number;
  total_pages_30d: number;
  total_pages_scanned: number;
  total_credits_30d: number;
  total_credits_distributed: number;
  total_ads_found: number;
  coverage_7d_pct: number;
  active_contributors_today: number;
  your_rank: number;
  your_percentile: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: string;
  user_display: string;
  missions: number;
  pages: number;
  credits: number;
  quality: number;
  quality_score: number;
  badge: 'Top Contributeur' | 'Élite' | 'Régulier' | 'Nouveau' | string | null;
}

export interface LeaderboardResponse {
  items: LeaderboardEntry[];
  entries: LeaderboardEntry[];
  period: '30d' | 'all';
  user_rank?: number;
}

// ============= Trends =============
export interface TrendsMarketSummary {
  median_price: number;
  var_30d: number;
  volume_total: number;
  new_models: number;
  offer_demand_ratio: number;
  last_update: string;
}

export interface MarketTrendPoint {
  date: string;
  gpu: number;
  cpu: number;
  ram: number;
  ssd: number;
  cm: number;
  global: number;
}

export interface VolumeTrendPoint {
  date: string;
  total: number;
  gpu: number;
  cpu: number;
  ram: number;
  ssd: number;
  cm: number;
}

export interface TopModel {
  model: string;
  category: string;
  var_30d_pct: number;
  median: number;
  volume: number;
  brand: string;
}

export interface RegionStat {
  region: string;
  code: string;
  median_price: number;
  volume: number;
  var_30d_pct: number;
}

export interface CategoryDetail {
  category: string;
  summary: string;
  var_30d_pct: number;
  median_price: number;
  volume: number;
  trend: 'up' | 'down' | 'stable';
  top_models: TopModel[];
  price_history: Array<{ date: string; price: number }>;
  volume_history: Array<{ date: string; volume: number }>;
}

export interface TrendsData {
  summary: TrendsMarketSummary;
  marketTrends: MarketTrendPoint[];
  volumeTrends: VolumeTrendPoint[];
  topIncreases: TopModel[];
  topDrops: TopModel[];
  mostActive: TopModel[];
  rareModels: TopModel[];
  regionStats: RegionStat[];
  categoryDetails: CategoryDetail[];
  categoryVariations: Array<{ category: string; variation: number }>;
}

// ============= Training =============
export interface UserProgress {
  modules_completed: number[];
  total_modules: number;
  hours_spent: number;
}

export interface TrainingModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  lessons: string[];
  icon: string;
}

export interface TrainingFAQ {
  question: string;
  answer: string;
}

export interface TrainingData {
  progress: UserProgress;
  modules: TrainingModule[];
  faq: TrainingFAQ[];
}

// ============= Jobs =============
export interface ScrapStartRequest {
  platform: string;
  type: string;
  keyword: string;
  filters?: {
    price_min?: number;
    price_max?: number;
    region?: string;
    pages_target?: number;
  };
}

export interface ScrapStartResponse {
  job_id: number;
  upload_token: string;
  status: string;
  params?: {
    platform: string;
    keyword: string;
    type: string;
    filters: Record<string, unknown>;
    pages_target: number;
    search_url?: string;
  };
}

export interface JobStatus {
  id: number;
  status: 'pending' | 'running' | 'done' | 'completed' | 'failed' | 'cancelled';
  keyword: string;
  platform: string;
  type: string;
  pages_target: number;
  pages_scanned: number;
  ads_found: number;
  error_message?: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

export interface UserJobsResponse {
  items: JobStatus[];
  total: number;
}

// ============= User =============
export interface UserCredits {
  credits_remaining: number;
  plan_name: string;
  credits_reset_date?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_months: number;
  features: Record<string, unknown> | string[] | null;
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  credits_remaining: number | null;
  credits_reset_date: string | null;
  billing_cycle: string | null;
  plan: SubscriptionPlan;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  discord_id: string | null;
  created_at: string;
}

// ============= DataProvider Interface =============
export interface DataProvider {
  // Dashboard
  getDashboard(): Promise<DashboardOverview>;
  
  // Watchlist
  getWatchlist(): Promise<WatchlistResponse>;
  addToWatchlist(data: { target_type: 'ad' | 'model'; target_id: number }): Promise<void>;
  removeFromWatchlist(id: number): Promise<void>;
  
  // Alerts
  getAlerts(): Promise<AlertsResponse>;
  createAlert(data: CreateAlertPayload): Promise<Alert>;
  updateAlert(id: number, data: UpdateAlertPayload): Promise<Alert>;
  deleteAlert(id: number): Promise<void>;
  
  // Notifications
  getNotifications(limit?: number): Promise<NotificationsResponse>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  
  // Deals
  getDeals(filters: DealsFilters): Promise<DealsResponse>;
  getMarketSummary(): Promise<MarketSummary>;
  
  // Catalog
  getCategories(): Promise<Category[]>;
  getBrands(category?: string): Promise<string[]>;
  getFamilies(brand?: string): Promise<string[]>;
  getCatalogModels(filters: CatalogFilters): Promise<CatalogResponse>;
  getCatalogSummary(): Promise<CatalogSummary>;
  
  // Model Detail
  getModelDetail(modelId: string): Promise<ModelDetail>;
  getModelPriceHistory(modelId: string, period?: '7' | '30' | '90'): Promise<PriceHistoryPoint[]>;
  getModelAds(modelId: string, page?: number, limit?: number): Promise<ModelAdsResponse>;
  getSimilarModels(modelId: string, limit?: number): Promise<SimilarModel[]>;
  toggleModelWatchlist(modelId: number, add: boolean): Promise<void>;
  createPriceAlert(modelId: number, threshold: number): Promise<void>;
  
  // Ad Detail
  getAdDetail(adId: string): Promise<AdDetail>;
  getAdPriceHistory(adId: string): Promise<AdPriceHistory>;
  
  // Estimator
  getModelsAutocomplete(search: string): Promise<ModelAutocomplete[]>;
  runEstimation(data: EstimationRequest): Promise<EstimationResult>;
  getEstimationHistory(page?: number, limit?: number): Promise<EstimationHistoryResponse>;
  getEstimatorStats(): Promise<EstimatorStats>;
  
  // Community
  getAvailableTasks(): Promise<AvailableTasksResponse>;
  getMyTasks(): Promise<MyTasksResponse>;
  claimTask(data: ClaimTaskRequest): Promise<ClaimTaskResponse>;
  getCommunityStats(): Promise<CommunityStats>;
  getLeaderboard(period: '30d' | 'all'): Promise<LeaderboardResponse>;
  
  // Trends
  getTrends(period?: '7' | '30' | '90' | '180'): Promise<TrendsData>;
  
  // Training
  getTrainingData(): Promise<TrainingData>;
  completeModule(moduleId: number): Promise<void>;
  
  // Jobs
  startScrap(data: ScrapStartRequest): Promise<ScrapStartResponse>;
  getJobStatus(jobId: number): Promise<JobStatus>;
  cancelJob(jobId: number): Promise<void>;
  getUserJobs(limit?: number): Promise<UserJobsResponse>;
  
  // User
  getUserCredits(): Promise<UserCredits>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getUserSubscription(): Promise<UserSubscription | null>;
  getSubscriptionHistory(): Promise<UserSubscription[]>;
  getUserProfile(): Promise<UserProfile>;
  subscribe(planId: string): Promise<void>;
  consumeCredits(amount: number, reason: string): Promise<void>;
  
  // Admin
  getUserRole(): Promise<{ user_id: string; role: string }>;
  getAdminUsers(page?: number, limit?: number, search?: string): Promise<AdminUsersResponse>;
  getAdminJobs(page?: number, limit?: number, filters?: AdminJobsFilters): Promise<AdminJobsResponse>;
  getAdminLogs(page?: number, limit?: number, filters?: AdminLogsFilters): Promise<AdminLogsResponse>;
  getHealthStatus(): Promise<HealthStatus>;
}

// ============= Admin Types =============
export interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  credits_remaining: number;
  plan_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface AdminUsersResponse {
  items: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminJob {
  id: number;
  user_id: string;
  user_name: string | null;
  keyword: string;
  platform: string;
  type: string;
  status: string;
  pages_scanned: number;
  pages_target: number | null;
  ads_found: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface AdminJobsResponse {
  items: AdminJob[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminJobsFilters {
  status?: string;
  type?: string;
  search?: string;
}

export interface SystemLog {
  id: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  context: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminLogsResponse {
  items: SystemLog[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminLogsFilters {
  level?: string;
  search?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime_seconds: number;
  services: {
    name: string;
    status: 'operational' | 'degraded' | 'down';
    latency_ms: number;
  }[];
  metrics: {
    db_connections: number;
    requests_per_minute: number;
    error_rate: number;
  };
}
