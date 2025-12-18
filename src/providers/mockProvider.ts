// Mock Provider - uses mock data + localStorage persistence
import type {
  DataProvider,
  DashboardOverview,
  WatchlistResponse,
  WatchlistEntry,
  AlertsResponse,
  Alert,
  CreateAlertPayload,
  UpdateAlertPayload,
  NotificationsResponse,
  Notification,
  DealsResponse,
  DealsFilters,
  MarketSummary,
  Category,
  CatalogResponse,
  CatalogFilters,
  CatalogSummary,
  CatalogModel,
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
} from "./types";

import { mockAds, mockModels } from "@/lib/mockData";
import {
  marketSummary,
  marketTrends,
  volumeTrends,
  topIncreases,
  topDrops,
  mostActive,
  rareModels,
  regionStats,
  categoryDetails,
  categoryVariations,
} from "@/lib/trendsMockData";
import {
  mockUserProgress,
  mockTrainingModules,
  mockFAQ,
} from "@/lib/trainingMockData";
import {
  communityNeeds,
  mockHistory,
  leaderboard30d,
  leaderboardAllTime,
  generateAssignedShard,
} from "@/lib/communityMockData";
import {
  estimatorModels,
  generateEstimation,
  mockEstimationHistory,
} from "@/lib/estimatorMockData";

// ============= localStorage helpers =============
const STORAGE_KEYS = {
  WATCHLIST: 'mock_watchlist',
  ALERTS: 'mock_alerts',
  NOTIFICATIONS: 'mock_notifications',
  CREDITS: 'mock_credits',
  TRAINING_PROGRESS: 'mock_training_progress',
  ESTIMATION_HISTORY: 'mock_estimation_history',
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage error:', e);
  }
}

// ============= Initial mock data =============
const initialWatchlist: WatchlistEntry[] = [
  { id: 1, target_type: 'model', target_id: 1, created_at: new Date().toISOString(), name: 'RTX 4060 Ti', brand: 'NVIDIA', category: 'GPU', current_price: 380, price_change_7d: -2.3 },
  { id: 2, target_type: 'ad', target_id: 1, created_at: new Date().toISOString(), name: 'RTX 4060 Ti 8GB MSI', category: 'GPU', current_price: 320, fair_value: 380 },
];

const initialAlerts: Alert[] = [
  { id: 1, target_type: 'model', target_id: 1, alert_type: 'price_threshold', threshold_value: 350, is_active: true, created_at: new Date().toISOString(), name: 'RTX 4060 Ti' },
];

const initialNotifications: Notification[] = [
  { id: '1', type: 'price_alert', title: 'Alerte prix', message: 'RTX 4060 Ti est passé sous 380€', is_read: false, created_at: new Date().toISOString(), link: '/model/1' },
  { id: '2', type: 'deal', title: 'Bonne affaire détectée', message: 'Ryzen 7 5800X3D à 270€ (-12%)', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString(), link: '/ad/2' },
  { id: '3', type: 'community', title: 'Mission terminée', message: 'Vous avez gagné 2 crédits', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
];

const initialCredits: UserCredits = {
  credits_remaining: 15,
  plan_name: 'Gratuit',
  credits_reset_date: new Date(Date.now() + 7 * 86400000).toISOString(),
};

// ============= Helper functions =============
function delay(ms: number = 200): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let nextId = 100;
function generateId(): number {
  return nextId++;
}

// ============= Mock Provider =============
export const mockProvider: DataProvider = {
  // Dashboard
  async getDashboard() {
    await delay();
    const watchlist = getFromStorage(STORAGE_KEYS.WATCHLIST, initialWatchlist);
    const credits = getFromStorage(STORAGE_KEYS.CREDITS, initialCredits);
    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const trainingProgress = getFromStorage(STORAGE_KEYS.TRAINING_PROGRESS, mockUserProgress);

    return {
      user: {
        id: 'mock-user-1',
        display_name: 'Utilisateur Test',
        email: 'test@example.com',
      },
      stats: {
        credits_remaining: credits.credits_remaining,
        plan_name: credits.plan_name,
        total_scraps: 47,
        watchlist_count: watchlist.length,
        estimated_gains: 340,
      },
      last_scrap_date: new Date(Date.now() - 3600000).toISOString(),
      recent_activity: [
        { id: 1, type: 'scrap' as const, description: 'Scrap RTX 4060 terminé', date: new Date().toISOString() },
        { id: 2, type: 'alert' as const, description: 'Alerte prix déclenchée', date: new Date(Date.now() - 3600000).toISOString() },
      ],
      performance_data: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        scraps: Math.floor(Math.random() * 5) + 1,
        margin: Math.floor(Math.random() * 50) + 20,
      })),
      top_deals: mockAds.slice(0, 5).map(ad => ({
        id: parseInt(ad.id),
        title: ad.title,
        price: ad.price,
        fair_value: ad.fairValue,
        deviation_pct: Math.round((1 - ad.price / ad.fairValue) * 100),
        city: ad.location,
        condition: ad.condition,
        category: ad.component,
      })),
      trends: {
        rising: topIncreases.slice(0, 3).map(m => ({ name: m.model, change: m.var_30d_pct, category: m.category })),
        falling: topDrops.slice(0, 3).map(m => ({ name: m.model, change: m.var_30d_pct, category: m.category })),
      },
      market: {
        daily_volume: 1850,
        category_breakdown: { GPU: 35, CPU: 25, RAM: 20, SSD: 12, CM: 8 },
      },
      notifications: notifications.slice(0, 5).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        is_read: n.is_read,
        created_at: n.created_at,
        link: n.link,
      })),
      community: {
        user_rank: 42,
        user_percentile: 85,
        total_contributions: 23,
        credits_earned: 12,
      },
      training: {
        completed: trainingProgress.modules_completed.length,
        total: trainingProgress.total_modules,
        last_module: 'Comprendre le marché',
      },
      watchlist: watchlist.slice(0, 5).map(w => ({ name: w.name || 'Item', category: w.category || 'Unknown' })),
      alerts: [
        { message: 'RTX 4060 Ti sous 350€', type: 'price_threshold' },
        { message: 'Nouvelle annonce Ryzen 5600X', type: 'availability' },
      ],
    } as DashboardOverview;
  },

  // Watchlist
  async getWatchlist() {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.WATCHLIST, initialWatchlist);
    return { items, total: items.length };
  },
  async addToWatchlist(data) {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.WATCHLIST, initialWatchlist);
    const newEntry: WatchlistEntry = {
      id: generateId(),
      target_type: data.target_type,
      target_id: data.target_id,
      created_at: new Date().toISOString(),
      name: data.target_type === 'model' ? mockModels[data.target_id % mockModels.length]?.name : mockAds[data.target_id % mockAds.length]?.title,
      category: 'GPU',
    };
    items.push(newEntry);
    setToStorage(STORAGE_KEYS.WATCHLIST, items);
  },
  async removeFromWatchlist(id) {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.WATCHLIST, initialWatchlist);
    const filtered = items.filter(item => item.id !== id);
    setToStorage(STORAGE_KEYS.WATCHLIST, filtered);
  },

  // Alerts
  async getAlerts() {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.ALERTS, initialAlerts);
    return { items, total: items.length };
  },
  async createAlert(data) {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.ALERTS, initialAlerts);
    const newAlert: Alert = {
      id: generateId(),
      ...data,
      is_active: true,
      created_at: new Date().toISOString(),
      name: 'Alerte personnalisée',
    };
    items.push(newAlert);
    setToStorage(STORAGE_KEYS.ALERTS, items);
    return newAlert;
  },
  async updateAlert(id, data) {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.ALERTS, initialAlerts);
    const index = items.findIndex(a => a.id === id);
    if (index >= 0) {
      items[index] = { ...items[index], ...data };
      setToStorage(STORAGE_KEYS.ALERTS, items);
      return items[index];
    }
    throw new Error('Alert not found');
  },
  async deleteAlert(id) {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.ALERTS, initialAlerts);
    const filtered = items.filter(a => a.id !== id);
    setToStorage(STORAGE_KEYS.ALERTS, filtered);
  },

  // Notifications
  async getNotifications(limit) {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const limited = limit ? items.slice(0, limit) : items;
    const unread_count = items.filter(n => !n.is_read).length;
    return { items: limited, total: items.length, unread_count };
  },
  async markNotificationRead(id) {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const index = items.findIndex(n => n.id === id);
    if (index >= 0) {
      items[index].is_read = true;
      setToStorage(STORAGE_KEYS.NOTIFICATIONS, items);
    }
  },
  async markAllNotificationsRead() {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    items.forEach(n => n.is_read = true);
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, items);
  },
  async deleteNotification(id) {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const filtered = items.filter(n => n.id !== id);
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, filtered);
  },

  // Deals
  async getDeals(filters) {
    await delay();
    let items = mockAds.map(ad => ({
      id: parseInt(ad.id),
      title: ad.title,
      price: ad.price,
      fair_value: ad.fairValue,
      deviation_pct: Math.round((1 - ad.price / ad.fairValue) * 100),
      city: ad.location,
      region: ad.region,
      condition: ad.condition,
      category: ad.component,
      model_name: ad.model,
      platform: 'leboncoin',
      url: '#',
      published_at: ad.date,
      score: ad.dealScore,
    }));

    // Apply filters
    if (filters.category) items = items.filter(i => i.category === filters.category);
    if (filters.condition) items = items.filter(i => i.condition === filters.condition);
    if (filters.region) items = items.filter(i => i.region === filters.region);
    if (filters.price_min) items = items.filter(i => i.price >= filters.price_min!);
    if (filters.price_max) items = items.filter(i => i.price <= filters.price_max!);
    if (filters.deviation_min) items = items.filter(i => i.deviation_pct >= filters.deviation_min!);

    // Sort
    if (filters.sort_by === 'price') {
      items.sort((a, b) => filters.sort_order === 'desc' ? b.price - a.price : a.price - b.price);
    } else if (filters.sort_by === 'score') {
      items.sort((a, b) => filters.sort_order === 'desc' ? b.score - a.score : a.score - b.score);
    }

    // Paginate
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return { items: paged, total: items.length, page, page_size: limit };
  },
  async getMarketSummary() {
    await delay();
    return {
      total_ads: marketSummary.volume_total,
      total_opportunities: 234,
      median_price: marketSummary.median_price,
      total_volume_24h: 1850,
    };
  },

  // Catalog
  async getCategories() {
    await delay();
    return [
      { id: 1, name: 'GPU', count: 450 },
      { id: 2, name: 'CPU', count: 320 },
      { id: 3, name: 'RAM', count: 280 },
      { id: 4, name: 'SSD', count: 210 },
      { id: 5, name: 'Motherboard', count: 150 },
    ];
  },
  async getBrands(category) {
    await delay();
    if (category === 'GPU') return ['NVIDIA', 'AMD', 'Intel'];
    if (category === 'CPU') return ['AMD', 'Intel'];
    return ['Corsair', 'G.Skill', 'Kingston', 'Samsung', 'WD'];
  },
  async getFamilies(brand) {
    await delay();
    if (brand === 'NVIDIA') return ['GeForce RTX 40', 'GeForce RTX 30', 'GeForce GTX 16'];
    if (brand === 'AMD') return ['Radeon RX 7000', 'Radeon RX 6000', 'Ryzen 7000', 'Ryzen 5000'];
    return ['Series A', 'Series B'];
  },
  async getCatalogModels(filters) {
    await delay();
    let items: CatalogModel[] = mockModels.map((m, i) => ({
      id: i + 1,
      name: m.name,
      brand: m.brand,
      family: null,
      category: m.category,
      median_price: m.medianPrice,
      var_7d_pct: m.priceChange7d,
      var_30d_pct: m.priceChange30d,
      volume: m.volume,
      liquidity: m.volume > 100 ? 'high' : m.volume > 50 ? 'medium' : 'low',
      ads_count: Math.floor(m.volume * 1.5),
    }));

    if (filters.category) items = items.filter(i => i.category === filters.category);
    if (filters.brand) items = items.filter(i => i.brand === filters.brand);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(s) || i.brand.toLowerCase().includes(s));
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return { items: paged, total: items.length, page, page_size: limit };
  },
  async getCatalogSummary() {
    await delay();
    return {
      total_models: mockModels.length,
      total_brands: 15,
      categories_count: 5,
      last_update: new Date().toISOString(),
    };
  },

  // Model Detail
  async getModelDetail(modelId) {
    await delay();
    const idx = parseInt(modelId) - 1;
    const m = mockModels[idx % mockModels.length];
    const watchlist = getFromStorage(STORAGE_KEYS.WATCHLIST, initialWatchlist);
    const isInWatchlist = watchlist.some(w => w.target_type === 'model' && w.target_id === parseInt(modelId));
    
    return {
      id: parseInt(modelId),
      name: m.name,
      brand: m.brand,
      family: null,
      category: m.category,
      aliases: [],
      specs: { vram_gb: 8, memory_type: 'GDDR6', tdp_w: 200 },
      market: {
        median_price: m.medianPrice,
        price_p25: Math.round(m.medianPrice * 0.85),
        price_p75: Math.round(m.medianPrice * 1.15),
        var_7d_pct: m.priceChange7d,
        var_30d_pct: m.priceChange30d,
        var_90d_pct: m.priceChange30d * 1.5,
        volume: m.volume,
        ads_count: Math.floor(m.volume * 1.5),
        median_days_to_sell: 5,
      },
      is_in_watchlist: isInWatchlist,
    };
  },
  async getModelPriceHistory(modelId, period = '30') {
    await delay();
    const days = parseInt(period);
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 86400000).toISOString().split('T')[0],
      price_median: 350 + Math.random() * 50 - 25,
      price_p25: 300 + Math.random() * 30,
      price_p75: 400 + Math.random() * 30,
      volume: Math.floor(Math.random() * 50) + 20,
    }));
  },
  async getModelAds(modelId, page = 1, limit = 10) {
    await delay();
    const ads = mockAds.slice(0, 10).map((ad, i) => ({
      id: i + 1,
      title: ad.title,
      price: ad.price,
      condition: ad.condition,
      city: ad.location,
      platform: 'leboncoin',
      url: '#',
      published_at: ad.date,
      score: ad.dealScore,
      deviation_pct: Math.round((1 - ad.price / ad.fairValue) * 100),
    }));
    return { items: ads, total: ads.length, page, page_size: limit };
  },
  async toggleModelWatchlist(modelId, add) {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.WATCHLIST, initialWatchlist);
    if (add) {
      const m = mockModels[(modelId - 1) % mockModels.length];
      items.push({
        id: generateId(),
        target_type: 'model',
        target_id: modelId,
        created_at: new Date().toISOString(),
        name: m.name,
        brand: m.brand,
        category: m.category,
        current_price: m.medianPrice,
      });
    } else {
      const idx = items.findIndex(w => w.target_type === 'model' && w.target_id === modelId);
      if (idx >= 0) items.splice(idx, 1);
    }
    setToStorage(STORAGE_KEYS.WATCHLIST, items);
  },
  async createPriceAlert(modelId, threshold) {
    await delay();
    const items = getFromStorage(STORAGE_KEYS.ALERTS, initialAlerts);
    const m = mockModels[(modelId - 1) % mockModels.length];
    items.push({
      id: generateId(),
      target_type: 'model',
      target_id: modelId,
      alert_type: 'price_threshold',
      threshold_value: threshold,
      is_active: true,
      created_at: new Date().toISOString(),
      name: m.name,
    });
    setToStorage(STORAGE_KEYS.ALERTS, items);
  },

  // Ad Detail
  async getAdDetail(adId) {
    await delay();
    const idx = parseInt(adId) - 1;
    const ad = mockAds[idx % mockAds.length];
    const watchlist = getFromStorage(STORAGE_KEYS.WATCHLIST, initialWatchlist);
    const isInWatchlist = watchlist.some(w => w.target_type === 'ad' && w.target_id === parseInt(adId));

    return {
      id: parseInt(adId),
      title: ad.title,
      description: 'Description détaillée de l\'annonce...',
      price: ad.price,
      fair_value: ad.fairValue,
      deviation_pct: Math.round((1 - ad.price / ad.fairValue) * 100),
      score: ad.dealScore,
      condition: ad.condition,
      city: ad.location,
      region: ad.region,
      postal_code: '75015',
      platform: 'leboncoin',
      url: '#',
      published_at: ad.date,
      first_seen_at: ad.date,
      last_seen_at: new Date().toISOString(),
      status: 'active',
      seller_type: ad.seller,
      delivery_possible: ad.shipping,
      secured_payment: true,
      model: { id: 1, name: ad.model, brand: 'NVIDIA', category: ad.component },
      components: [],
      images: [],
      is_in_watchlist: isInWatchlist,
    };
  },
  async getAdPriceHistory(adId) {
    await delay();
    const ad = mockAds[parseInt(adId) % mockAds.length];
    return {
      points: ad.priceHistory || [
        { date: new Date(Date.now() - 14 * 86400000).toISOString(), price: ad.price + 30 },
        { date: new Date(Date.now() - 7 * 86400000).toISOString(), price: ad.price + 15 },
        { date: new Date().toISOString(), price: ad.price },
      ],
    };
  },

  // Estimator
  async getModelsAutocomplete(search) {
    await delay();
    const s = search.toLowerCase();
    return estimatorModels
      .filter(m => m.fullName.toLowerCase().includes(s) || m.name.toLowerCase().includes(s))
      .map(m => ({
        id: m.id,
        name: m.name,
        brand: m.brand,
        category: m.category,
        full_name: m.fullName,
      }));
  },
  async runEstimation(data) {
    await delay(500);
    const result = generateEstimation(data.model_id, data.state, data.purchase_price, data.region);
    if (!result) throw new Error('Model not found');

    // Save to history
    const history = getFromStorage(STORAGE_KEYS.ESTIMATION_HISTORY, mockEstimationHistory);
    history.unshift({
      id: generateId().toString(),
      date: new Date().toISOString().split('T')[0],
      model: result.model,
      category: result.category,
      median_price: result.market.median_price,
      buy_price: result.estimate.buy_price,
      margin_pct: result.estimate.profit_margin_pct,
      trend: result.market.trend,
    });
    setToStorage(STORAGE_KEYS.ESTIMATION_HISTORY, history.slice(0, 50));

    // Deduct credits
    const credits = getFromStorage(STORAGE_KEYS.CREDITS, initialCredits);
    credits.credits_remaining = Math.max(0, credits.credits_remaining - 2);
    setToStorage(STORAGE_KEYS.CREDITS, credits);

    return {
      model_id: data.model_id,
      model_name: result.model,
      category: result.category,
      state: data.state,
      region: data.region,
      market: result.market,
      estimate: result.estimate,
      trend_90d: result.trend_90d,
      volume_30d: result.volume_30d,
    };
  },
  async getEstimationHistory(page = 1, limit = 10) {
    await delay();
    const history = getFromStorage(STORAGE_KEYS.ESTIMATION_HISTORY, mockEstimationHistory);
    const start = (page - 1) * limit;
    return {
      items: history.slice(start, start + limit),
      total: history.length,
      page,
      page_size: limit,
    };
  },
  async getEstimatorStats() {
    await delay();
    return {
      last_recalc: 'il y a 3 h',
      total_estimations: 12480,
    };
  },

  // Community
  async getAvailableTasks() {
    await delay();
    return {
      active: communityNeeds.active,
      summary: communityNeeds.summary,
      tasks: communityNeeds.priority_models.map((m, i) => ({
        id: `task_${i}`,
        ...m,
      })),
    };
  },
  async getMyTasks() {
    await delay();
    return {
      items: mockHistory,
      total: mockHistory.length,
    };
  },
  async claimTask(data) {
    await delay();
    return generateAssignedShard();
  },
  async getCommunityStats() {
    await delay();
    return {
      total_contributors: 156,
      total_missions_30d: 1240,
      total_pages_30d: 12800,
      total_credits_30d: communityNeeds.summary.credits_distributed_30d,
      your_rank: 42,
      your_percentile: 85,
    };
  },
  async getLeaderboard(period) {
    await delay();
    const items = period === '30d' ? leaderboard30d : leaderboardAllTime;
    return { items, period };
  },

  // Trends
  async getTrends(period = '30') {
    await delay();
    const days = parseInt(period);
    return {
      summary: marketSummary,
      marketTrends: marketTrends.slice(-days),
      volumeTrends: volumeTrends.slice(-days),
      topIncreases,
      topDrops,
      mostActive,
      rareModels,
      regionStats,
      categoryDetails,
      categoryVariations,
    };
  },

  // Training
  async getTrainingData() {
    await delay();
    const progress = getFromStorage(STORAGE_KEYS.TRAINING_PROGRESS, mockUserProgress);
    const modules = mockTrainingModules.map(m => ({
      ...m,
      completed: progress.modules_completed.includes(m.id),
    }));
    return { progress, modules, faq: mockFAQ };
  },
  async completeModule(moduleId) {
    await delay();
    const progress = getFromStorage(STORAGE_KEYS.TRAINING_PROGRESS, mockUserProgress);
    if (!progress.modules_completed.includes(moduleId)) {
      progress.modules_completed.push(moduleId);
      progress.credits_earned += 1;
      progress.hours_spent += 0.5;
      setToStorage(STORAGE_KEYS.TRAINING_PROGRESS, progress);

      // Add credits
      const credits = getFromStorage(STORAGE_KEYS.CREDITS, initialCredits);
      credits.credits_remaining += 1;
      setToStorage(STORAGE_KEYS.CREDITS, credits);
    }
  },

  // Jobs
  async startScrap(data) {
    await delay();
    const jobId = generateId();
    
    // Deduct credits
    const credits = getFromStorage(STORAGE_KEYS.CREDITS, initialCredits);
    const cost = data.type === 'strong' ? 3 : 1;
    credits.credits_remaining = Math.max(0, credits.credits_remaining - cost);
    setToStorage(STORAGE_KEYS.CREDITS, credits);

    return {
      job_id: jobId,
      upload_token: `token_${jobId}`,
      status: 'pending',
    };
  },
  async getJobStatus(jobId) {
    await delay();
    return {
      id: jobId,
      status: 'done',
      keyword: 'RTX 4060',
      platform: 'leboncoin',
      type: 'weak',
      pages_target: 5,
      pages_scanned: 5,
      ads_found: 42,
      created_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
    };
  },
  async cancelJob(jobId) {
    await delay();
  },
  async getUserJobs(limit = 10) {
    await delay();
    const items: JobStatus[] = [
      { id: 1, status: 'done', keyword: 'RTX 4060', platform: 'leboncoin', type: 'weak', pages_target: 5, pages_scanned: 5, ads_found: 42, created_at: new Date().toISOString() },
      { id: 2, status: 'done', keyword: 'Ryzen 5600X', platform: 'leboncoin', type: 'strong', pages_target: 10, pages_scanned: 10, ads_found: 28, created_at: new Date(Date.now() - 86400000).toISOString() },
    ];
    return { items: items.slice(0, limit), total: items.length };
  },

  // User
  async getUserCredits() {
    await delay();
    return getFromStorage(STORAGE_KEYS.CREDITS, initialCredits);
  },
};
