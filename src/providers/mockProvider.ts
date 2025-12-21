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
import { trackEndpointCall } from "@/lib/debugTracker";

// Internal deterministic mock dataset
import {
  MOCK_MODELS,
  MOCK_DEALS,
  MOCK_ADS,
  MOCK_COMMUNITY_TASKS,
  MOCK_CATEGORIES,
  MOCK_BRANDS_BY_CATEGORY,
  MOCK_FAMILIES_BY_BRAND,
  getMockDataStats,
  generateAdPriceHistory,
  generateModelPriceHistory,
  type InternalModel,
  type InternalDeal,
  type InternalAd,
  type InternalCommunityTask,
} from "./mockDataset";

// Centralized filter utilities
import { isValidFilter, matchesSearch } from "./mockUtils";

// Mock subscription management
import {
  getMockSubscriptionState,
  setMockSubscriptionState,
  MOCK_PLANS,
  consumeMockCredits,
  addMockCredits,
  changeMockPlan,
  getCurrentPlanLimits,
  type MockSubscriptionState,
} from "./mockSubscription";

// ============= localStorage helpers =============
const STORAGE_KEYS = {
  WATCHLIST: 'mock_watchlist',
  ALERTS: 'mock_alerts',
  NOTIFICATIONS: 'mock_notifications',
  CREDITS: 'mock_credits', // Deprecated - now using mockSubscription
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

// Get credits from new subscription system
function getCreditsFromSubscription(): UserCredits {
  const state = getMockSubscriptionState();
  const plan = MOCK_PLANS[state.planName];
  return {
    credits_remaining: state.creditsRemaining,
    plan_name: plan.displayName,
    credits_reset_date: state.creditsResetDate,
  };
}

// ============= Initialize mock data with localStorage persistence =============
function initializeWatchlist(): WatchlistEntry[] {
  const stored = getFromStorage<WatchlistEntry[] | null>(STORAGE_KEYS.WATCHLIST, null);
  if (stored && stored.length > 0) return stored;
  
  // 8 items mix: 5 models + 3 ads with IDs matching MOCK_MODELS/MOCK_ADS
  const initial: WatchlistEntry[] = [
    { id: 1, target_type: 'model', target_id: 1, created_at: new Date(Date.now() - 86400000 * 2).toISOString(), name: 'RTX 4060 Ti 8GB', brand: 'NVIDIA', category: 'GPU', current_price: 385, price_change_7d: -2.3 },
    { id: 2, target_type: 'model', target_id: 5, created_at: new Date(Date.now() - 86400000 * 5).toISOString(), name: 'Ryzen 7 5800X3D', brand: 'AMD', category: 'CPU', current_price: 290, price_change_7d: -5.1 },
    { id: 3, target_type: 'model', target_id: 12, created_at: new Date(Date.now() - 86400000 * 8).toISOString(), name: 'RTX 3070', brand: 'NVIDIA', category: 'GPU', current_price: 340, price_change_7d: 1.2 },
    { id: 4, target_type: 'model', target_id: 25, created_at: new Date(Date.now() - 86400000 * 12).toISOString(), name: 'Samsung 980 Pro 1TB', brand: 'Samsung', category: 'SSD', current_price: 110, price_change_7d: -3.8 },
    { id: 5, target_type: 'model', target_id: 30, created_at: new Date(Date.now() - 86400000 * 15).toISOString(), name: 'Corsair Vengeance 32GB DDR5', brand: 'Corsair', category: 'RAM', current_price: 125, price_change_7d: 0.5 },
    { id: 6, target_type: 'ad', target_id: 3, created_at: new Date(Date.now() - 86400000 * 3).toISOString(), name: 'MSI RTX 4060 Ti Gaming X', category: 'GPU', current_price: 320, fair_value: 385 },
    { id: 7, target_type: 'ad', target_id: 15, created_at: new Date(Date.now() - 86400000 * 7).toISOString(), name: 'Gigabyte RTX 3080 Eagle OC', category: 'GPU', current_price: 450, fair_value: 520 },
    { id: 8, target_type: 'ad', target_id: 42, created_at: new Date(Date.now() - 86400000 * 10).toISOString(), name: 'AMD Ryzen 5 5600X', category: 'CPU', current_price: 120, fair_value: 145 },
  ];
  setToStorage(STORAGE_KEYS.WATCHLIST, initial);
  return initial;
}

function initializeAlerts(): Alert[] {
  const stored = getFromStorage<Alert[] | null>(STORAGE_KEYS.ALERTS, null);
  if (stored && stored.length > 0) return stored;
  
  // 6 active + 2 inactive = 8 alerts with varied types
  const now = Date.now();
  const initial: Alert[] = [
    { id: 1, target_type: 'model', target_id: 1, alert_type: 'price_below', price_threshold: 350, is_active: true, created_at: new Date(now - 86400000 * 3).toISOString(), target_name: 'RTX 4060 Ti 8GB', target_category: 'GPU', current_price: 385 },
    { id: 2, target_type: 'model', target_id: 5, alert_type: 'deal_detected', is_active: true, created_at: new Date(now - 86400000 * 7).toISOString(), last_triggered_at: new Date(now - 3600000 * 5).toISOString(), target_name: 'Ryzen 7 5800X3D', target_category: 'CPU', current_price: 290 },
    { id: 3, target_type: 'model', target_id: 12, alert_type: 'variation', variation_threshold: 10, is_active: true, created_at: new Date(now - 86400000 * 14).toISOString(), target_name: 'RTX 3070', target_category: 'GPU', current_price: 340 },
    { id: 4, target_type: 'ad', target_id: 3, alert_type: 'price_below', price_threshold: 300, is_active: true, created_at: new Date(now - 86400000 * 5).toISOString(), target_name: 'MSI RTX 4060 Ti Gaming X', target_category: 'GPU', current_price: 320 },
    { id: 5, target_type: 'model', target_id: 25, alert_type: 'new_listing', region: 'ile-de-france', is_active: true, created_at: new Date(now - 86400000 * 20).toISOString(), target_name: 'Samsung 980 Pro 1TB', target_category: 'SSD', current_price: 110 },
    { id: 6, target_type: 'model', target_id: 8, alert_type: 'price_above', price_threshold: 600, is_active: true, created_at: new Date(now - 86400000 * 25).toISOString(), target_name: 'RTX 4070', target_category: 'GPU', current_price: 520 },
    { id: 7, target_type: 'model', target_id: 30, alert_type: 'location', region: 'auvergne-rhone-alpes', is_active: false, created_at: new Date(now - 86400000 * 30).toISOString(), target_name: 'Corsair Vengeance 32GB DDR5', target_category: 'RAM', current_price: 125 },
    { id: 8, target_type: 'ad', target_id: 15, alert_type: 'deal_detected', is_active: false, created_at: new Date(now - 86400000 * 45).toISOString(), last_triggered_at: new Date(now - 86400000 * 10).toISOString(), target_name: 'Gigabyte RTX 3080 Eagle OC', target_category: 'GPU', current_price: 450 },
  ];
  setToStorage(STORAGE_KEYS.ALERTS, initial);
  return initial;
}

function initializeNotifications(): Notification[] {
  const stored = getFromStorage<Notification[] | null>(STORAGE_KEYS.NOTIFICATIONS, null);
  if (stored && stored.length > 0) return stored;
  
  const now = Date.now();
  const types = ['deal_detected', 'price_alert', 'community_reward'] as const;
  
  // Generate 20 notifications with mix of types over the past 14 days
  const initial: Notification[] = [
    // Today - 3 notifications
    { id: 'n1', type: 'deal_detected', title: 'Bonne affaire détectée !', message: 'RTX 4060 Ti à 320€ (-17%) trouvée à Paris', is_read: false, created_at: new Date(now - 3600000 * 1).toISOString(), link: '/ads/3' },
    { id: 'n2', type: 'price_alert', title: 'Alerte prix déclenchée', message: 'Ryzen 7 5800X3D est passé sous 280€', is_read: false, created_at: new Date(now - 3600000 * 3).toISOString(), link: '/models/5' },
    { id: 'n3', type: 'community_reward', title: 'Récompense communauté', message: 'Vous avez gagné 3 crédits pour votre contribution', is_read: false, created_at: new Date(now - 3600000 * 6).toISOString() },
    // Yesterday - 4 notifications
    { id: 'n4', type: 'deal_detected', title: 'Deal exceptionnel !', message: 'RTX 3080 à 450€ (-13%) disponible à Lyon', is_read: false, created_at: new Date(now - 86400000 - 3600000 * 2).toISOString(), link: '/ads/15' },
    { id: 'n5', type: 'price_alert', title: 'Baisse de prix', message: 'Samsung 980 Pro 1TB a baissé de 8%', is_read: false, created_at: new Date(now - 86400000 - 3600000 * 5).toISOString(), link: '/models/25' },
    { id: 'n6', type: 'community_reward', title: 'Mission terminée', message: 'Mission "Scrap GPU" complétée, +2 crédits', is_read: true, created_at: new Date(now - 86400000 - 3600000 * 8).toISOString() },
    { id: 'n7', type: 'deal_detected', title: 'Opportunité GPU', message: 'RTX 4070 Super à 590€ à Marseille', is_read: true, created_at: new Date(now - 86400000 - 3600000 * 12).toISOString(), link: '/ads/28' },
    // 2-3 days ago - 4 notifications  
    { id: 'n8', type: 'price_alert', title: 'Alerte variation', message: 'RTX 3070 a augmenté de 5% cette semaine', is_read: true, created_at: new Date(now - 86400000 * 2 - 3600000 * 4).toISOString(), link: '/models/12' },
    { id: 'n9', type: 'deal_detected', title: 'Deal CPU détecté', message: 'Ryzen 5 5600X à 120€ (-18%)', is_read: true, created_at: new Date(now - 86400000 * 2 - 3600000 * 10).toISOString(), link: '/ads/42' },
    { id: 'n10', type: 'community_reward', title: 'Contribution validée', message: 'Votre scrap a ajouté 47 nouvelles annonces', is_read: true, created_at: new Date(now - 86400000 * 3 - 3600000 * 3).toISOString() },
    { id: 'n11', type: 'price_alert', title: 'Prix cible atteint', message: 'Corsair Vengeance DDR5 disponible sous 120€', is_read: true, created_at: new Date(now - 86400000 * 3 - 3600000 * 8).toISOString(), link: '/models/30' },
    // 4-7 days ago - 5 notifications
    { id: 'n12', type: 'deal_detected', title: 'Deal RAM', message: 'Kit DDR5 32GB à 95€ à Toulouse', is_read: true, created_at: new Date(now - 86400000 * 4 - 3600000 * 6).toISOString(), link: '/ads/56' },
    { id: 'n13', type: 'community_reward', title: 'Rang amélioré', message: 'Vous êtes maintenant dans le top 100 contributeurs', is_read: true, created_at: new Date(now - 86400000 * 5 - 3600000 * 2).toISOString() },
    { id: 'n14', type: 'price_alert', title: 'Tendance baissière', message: 'RTX 4080 en baisse de 12% sur 30 jours', is_read: true, created_at: new Date(now - 86400000 * 5 - 3600000 * 10).toISOString(), link: '/models/6' },
    { id: 'n15', type: 'deal_detected', title: 'Deal SSD', message: 'Samsung 990 Pro 2TB à 180€', is_read: true, created_at: new Date(now - 86400000 * 6 - 3600000 * 4).toISOString(), link: '/ads/71' },
    { id: 'n16', type: 'community_reward', title: 'Bonus hebdomadaire', message: '+5 crédits pour votre activité cette semaine', is_read: true, created_at: new Date(now - 86400000 * 7).toISOString() },
    // 8-14 days ago - 4 notifications
    { id: 'n17', type: 'deal_detected', title: 'Opportunité rare', message: 'RTX 4090 à 1450€ (-10%) à Bordeaux', is_read: true, created_at: new Date(now - 86400000 * 9 - 3600000 * 5).toISOString(), link: '/ads/89' },
    { id: 'n18', type: 'price_alert', title: 'Nouvelle annonce', message: 'Nouveau listing RTX 4060 Ti dans votre région', is_read: true, created_at: new Date(now - 86400000 * 11 - 3600000 * 8).toISOString(), link: '/models/1' },
    { id: 'n19', type: 'community_reward', title: 'Badge débloqué', message: 'Badge "Chasseur de deals" obtenu', is_read: true, created_at: new Date(now - 86400000 * 12 - 3600000 * 3).toISOString() },
    { id: 'n20', type: 'deal_detected', title: 'Deal CM', message: 'ASUS ROG Strix B650E-F à 220€', is_read: true, created_at: new Date(now - 86400000 * 14).toISOString(), link: '/ads/102' },
  ];
  setToStorage(STORAGE_KEYS.NOTIFICATIONS, initial);
  return initial;
}

const initialCredits: UserCredits = {
  credits_remaining: 15,
  plan_name: 'Gratuit',
  credits_reset_date: new Date(Date.now() + 7 * 86400000).toISOString(),
};

// ============= Mock PC data =============
const mockPCs = [
  { name: 'Gaming RTX 4070', family: 'Gaming', cpu: 'Intel i5-13600K', gpu: 'RTX 4070', ram: '32 GB DDR5', storage: '1 TB NVMe + 2 TB HDD', motherboard: 'ASUS Z790', psu: '750W Corsair', case: 'NZXT H510', age_years: 1, condition: 'Excellent', warranty_months: 12, price: 1350, fairValue: 1500, score: 85, city: 'Paris', region: 'Île-de-France' },
  { name: 'Gaming RTX 4060', family: 'Gaming', cpu: 'AMD Ryzen 5 7600X', gpu: 'RTX 4060', ram: '16 GB DDR5', storage: '500 GB NVMe', motherboard: 'MSI B650', psu: '650W', case: 'Fractal Pop', age_years: 1.5, condition: 'Bon', warranty_months: 6, price: 850, fairValue: 950, score: 78, city: 'Lyon', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Workstation Ryzen 9', family: 'Workstation', cpu: 'AMD Ryzen 9 7950X', gpu: 'RTX 4080', ram: '64 GB DDR5', storage: '2 TB NVMe + 4 TB HDD', motherboard: 'ASUS X670E', psu: '1000W Seasonic', case: 'Lian Li O11', age_years: 0.5, condition: 'Excellent', warranty_months: 18, price: 2700, fairValue: 3000, score: 90, city: 'Toulouse', region: 'Occitanie' },
  { name: 'Gaming RTX 3080', family: 'Gaming', cpu: 'Intel i7-12700K', gpu: 'RTX 3080', ram: '32 GB DDR4', storage: '1 TB NVMe', motherboard: 'Gigabyte Z690', psu: '850W', case: 'Corsair 4000D', age_years: 2, condition: 'Bon', warranty_months: 0, price: 1100, fairValue: 1300, score: 72, city: 'Marseille', region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Office Ryzen 5', family: 'Office', cpu: 'AMD Ryzen 5 5600X', gpu: undefined, ram: '16 GB DDR4', storage: '500 GB SSD', motherboard: 'MSI B550', psu: '450W', case: 'Mini Tower', age_years: 2.5, condition: 'Correct', warranty_months: 0, price: 450, fairValue: 550, score: 65, city: 'Bordeaux', region: 'Nouvelle-Aquitaine' },
  { name: 'Gaming RX 7900 XT', family: 'Gaming', cpu: 'AMD Ryzen 7 7800X3D', gpu: 'RX 7900 XT', ram: '32 GB DDR5', storage: '2 TB NVMe', motherboard: 'ASRock X670E', psu: '850W', case: 'Lian Li Lancool', age_years: 0.8, condition: 'Excellent', warranty_months: 12, price: 1950, fairValue: 2200, score: 88, city: 'Nantes', region: 'Pays de la Loire' },
  { name: 'Streaming i7', family: 'Streaming', cpu: 'Intel i7-14700K', gpu: 'RTX 4070 Ti', ram: '32 GB DDR5', storage: '1 TB NVMe + 2 TB HDD', motherboard: 'ASUS Z790', psu: '850W', case: 'NZXT H7', age_years: 0.5, condition: 'Excellent', warranty_months: 24, price: 1750, fairValue: 1900, score: 92, city: 'Lille', region: 'Hauts-de-France' },
  { name: 'Compact Gaming', family: 'Compact', cpu: 'Intel i5-13400F', gpu: 'RTX 4060 Ti', ram: '16 GB DDR5', storage: '1 TB NVMe', motherboard: 'MSI B760I ITX', psu: '650W SFX', case: 'NR200', age_years: 1, condition: 'Bon', warranty_months: 6, price: 950, fairValue: 1050, score: 80, city: 'Strasbourg', region: 'Grand Est' },
  { name: 'Budget Gaming', family: 'Gaming', cpu: 'AMD Ryzen 5 5600', gpu: 'RTX 3060', ram: '16 GB DDR4', storage: '500 GB NVMe', motherboard: 'Gigabyte B550', psu: '550W', case: 'Zalman S4', age_years: 3, condition: 'Correct', warranty_months: 0, price: 580, fairValue: 700, score: 60, city: 'Rennes', region: 'Bretagne' },
  { name: 'Workstation i9', family: 'Workstation', cpu: 'Intel i9-14900K', gpu: 'RTX 4090', ram: '128 GB DDR5', storage: '4 TB NVMe', motherboard: 'ASUS ProArt Z790', psu: '1200W', case: 'be quiet! Dark Base', age_years: 0.3, condition: 'Excellent', warranty_months: 24, price: 4000, fairValue: 4500, score: 95, city: 'Nice', region: 'Provence-Alpes-Côte d\'Azur' },
];

function generatePriceHistory(basePrice: number, days: number): number[] {
  const history: number[] = [];
  let price = basePrice * 1.1;
  for (let i = 0; i < days; i++) {
    history.push(Math.round(price));
    price = price * (1 + (Math.random() - 0.55) * 0.03);
  }
  return history;
}

// ============= Helper functions =============
function delay(ms: number = 200): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function track(endpoint: string) {
  trackEndpointCall(endpoint, 'mock');
}

let nextId = 100;
function generateId(): number {
  return nextId++;
}

// ============= Mock Provider =============
export const mockProvider: DataProvider = {
  // Dashboard
  async getDashboard() {
    track('getDashboard');
    await delay();
    const watchlist = initializeWatchlist();
    const credits = getCreditsFromSubscription();
    const notifications = initializeNotifications();
    const trainingProgress = getFromStorage(STORAGE_KEYS.TRAINING_PROGRESS, mockUserProgress);
    const subState = getMockSubscriptionState();
    const planConfig = MOCK_PLANS[subState.planName];

    return {
      user: {
        id: 'mock-user-1',
        display_name: 'Utilisateur Test',
        email: 'test@example.com',
      },
      stats: {
        credits_remaining: credits.credits_remaining,
        credits_reset_date: credits.credits_reset_date ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan_name: planConfig.displayName,
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
      top_deals: MOCK_DEALS.slice(0, 5).map(deal => ({
        id: deal.id,
        title: deal.title,
        price: deal.price,
        fair_value: deal.fair_value,
        deviation_pct: deal.deviation_pct,
        city: deal.city,
        condition: deal.condition,
        category: deal.category,
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
    const items = initializeWatchlist();
    return { items, total: items.length };
  },
  async addToWatchlist(data) {
    await delay();
    const items = initializeWatchlist();
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
    const items = initializeWatchlist();
    const filtered = items.filter(item => item.id !== id);
    setToStorage(STORAGE_KEYS.WATCHLIST, filtered);
  },

  // Alerts
  async getAlerts() {
    await delay();
    const items = initializeAlerts();
    return { items, total: items.length };
  },
  async createAlert(data) {
    await delay();
    const items = initializeAlerts();
    const newAlert: Alert = {
      id: generateId(),
      ...data,
      is_active: true,
      created_at: new Date().toISOString(),
      target_name: 'Alerte personnalisée',
    };
    items.push(newAlert);
    setToStorage(STORAGE_KEYS.ALERTS, items);
    return newAlert;
  },
  async updateAlert(id, data) {
    await delay();
    const items = initializeAlerts();
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
    const items = initializeAlerts();
    const filtered = items.filter(a => a.id !== id);
    setToStorage(STORAGE_KEYS.ALERTS, filtered);
  },

  // Notifications
  async getNotifications(limit) {
    await delay();
    const items = initializeNotifications();
    const limited = limit ? items.slice(0, limit) : items;
    const unread_count = items.filter(n => !n.is_read).length;
    return { items: limited, total: items.length, unread_count };
  },
  async markNotificationRead(id) {
    await delay();
    const items = initializeNotifications();
    const index = items.findIndex(n => n.id === id);
    if (index >= 0) {
      items[index].is_read = true;
      setToStorage(STORAGE_KEYS.NOTIFICATIONS, items);
    }
  },
  async markAllNotificationsRead() {
    await delay();
    const items = initializeNotifications();
    items.forEach(n => n.is_read = true);
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, items);
  },
  async deleteNotification(id) {
    await delay();
    const items = initializeNotifications();
    const filtered = items.filter(n => n.id !== id);
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, filtered);
  },

  // Deals
  async getDeals(filters) {
    track('getDeals');
    await delay();
    let items = MOCK_DEALS.map(deal => ({
      id: deal.id,
      ad_id: deal.ad_id,
      title: deal.title,
      price: deal.price,
      fair_value: deal.fair_value,
      deviation_pct: deal.deviation_pct,
      city: deal.city,
      region: deal.region,
      condition: deal.condition,
      category: deal.category,
      model_name: deal.model_name,
      platform: deal.platform,
      url: deal.url,
      published_at: deal.published_at,
      publication_date: deal.publication_date,
      score: deal.score,
      item_type: deal.item_type,
      delivery_possible: deal.delivery_possible,
    }));

    // Apply filters only if they have meaningful values (use centralized isValidFilter)
    if (isValidFilter(filters.category)) {
      items = items.filter(i => i.category === filters.category);
    }
    if (isValidFilter(filters.condition)) {
      items = items.filter(i => i.condition === filters.condition);
    }
    if (isValidFilter(filters.region)) {
      items = items.filter(i => i.region === filters.region);
    }
    if (isValidFilter(filters.platform)) {
      items = items.filter(i => i.platform === filters.platform);
    }
    if (isValidFilter(filters.item_type)) {
      items = items.filter(i => i.item_type === filters.item_type);
    }
    
    // Price filters - only apply if they are valid numbers > 0
    if (filters.price_min && filters.price_min > 0) {
      items = items.filter(i => i.price >= filters.price_min!);
    }
    if (filters.price_max && filters.price_max > 0) {
      items = items.filter(i => i.price <= filters.price_max!);
    }
    if (filters.deviation_min && filters.deviation_min > 0) {
      items = items.filter(i => i.deviation_pct >= filters.deviation_min!);
    }

    // Search filter (if provided via extended filters)
    const searchTerm = (filters as Record<string, unknown>).search as string | undefined;
    if (searchTerm && searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim();
      items = items.filter(i => 
        matchesSearch(i.title, s) ||
        matchesSearch(i.model_name, s) ||
        matchesSearch(i.city, s) ||
        matchesSearch(i.category, s)
      );
    }

    // Sort - handle multiple sort options
    const sortBy = filters.sort_by || 'score';
    const sortOrder = filters.sort_order || 'desc';
    
    switch (sortBy) {
      case 'price_asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'price':
        items.sort((a, b) => sortOrder === 'desc' ? b.price - a.price : a.price - b.price);
        break;
      case 'score':
        items.sort((a, b) => sortOrder === 'desc' ? b.score - a.score : a.score - b.score);
        break;
      case 'date':
        items.sort((a, b) => {
          const dateA = new Date(a.published_at).getTime();
          const dateB = new Date(b.published_at).getTime();
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        break;
      case 'fair_value':
      case 'deviation':
        items.sort((a, b) => sortOrder === 'desc' ? b.deviation_pct - a.deviation_pct : a.deviation_pct - b.deviation_pct);
        break;
      default:
        // Default sort by score desc
        items.sort((a, b) => b.score - a.score);
    }

    // Paginate
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);
    const total_pages = Math.ceil(total / limit);

    // Debug tracking
    trackEndpointCall('getDeals', 'mock', { ...filters, page, limit }, paged.length);

    return { items: paged, total, page, page_size: limit, total_pages };
  },
  async getMarketSummary() {
    await delay();
    const median = Math.round(MOCK_DEALS.reduce((sum, d) => sum + d.price, 0) / MOCK_DEALS.length);
    return {
      total_ads: MOCK_DEALS.length,
      total_active_ads: MOCK_DEALS.length,
      total_opportunities: MOCK_DEALS.filter(d => d.score >= 75).length,
      median_price: median,
      median_price_7d: median,
      price_variation: -3.2,
      new_deals_today: 12,
      total_volume_24h: MOCK_DEALS.length * 23,
    };
  },

  // Catalog
  async getCategories() {
    await delay();
    return MOCK_CATEGORIES.map(cat => ({
      ...cat,
      count: MOCK_MODELS.filter(m => m.category === cat.name).length,
    }));
  },
  async getBrands(category) {
    await delay();
    if (category && MOCK_BRANDS_BY_CATEGORY[category]) {
      return MOCK_BRANDS_BY_CATEGORY[category];
    }
    return Object.values(MOCK_BRANDS_BY_CATEGORY).flat().filter((v, i, a) => a.indexOf(v) === i);
  },
  async getFamilies(brand) {
    await delay();
    if (brand && MOCK_FAMILIES_BY_BRAND[brand]) {
      return MOCK_FAMILIES_BY_BRAND[brand];
    }
    return Object.values(MOCK_FAMILIES_BY_BRAND).flat().filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);
  },
  async getCatalogModels(filters) {
    track('getCatalogModels');
    await delay();
    let items: CatalogModel[] = MOCK_MODELS.map(m => ({
      id: m.id,
      name: m.name,
      brand: m.brand,
      family: m.family,
      category: m.category,
      median_price: m.median_price,
      fair_value_30d: m.fair_value_30d,
      price_median_30d: m.price_median_30d,
      var_7d_pct: m.var_7d_pct,
      var_30d_pct: m.var_30d_pct,
      volume: m.volume,
      liquidity: m.liquidity,
      ads_count: m.ads_count,
      last_scan_at: m.last_scan_at,
    }));

    // Apply filters only if they have meaningful values (use centralized isValidFilter)
    if (isValidFilter(filters.category)) {
      items = items.filter(i => i.category === filters.category);
    }
    if (isValidFilter(filters.brand)) {
      items = items.filter(i => i.brand === filters.brand);
    }
    if (isValidFilter(filters.family)) {
      items = items.filter(i => i.family === filters.family);
    }
    
    // Search filter
    if (filters.search && filters.search.trim()) {
      const s = filters.search.toLowerCase().trim();
      items = items.filter(i => 
        matchesSearch(i.name, s) || 
        matchesSearch(i.brand, s) ||
        matchesSearch(i.family, s) ||
        matchesSearch(i.category, s)
      );
    }

    // Sort - handle multiple sort options
    const sortBy = filters.sort_by || 'name';
    const sortOrder = filters.sort_order || 'asc';
    
    switch (sortBy) {
      case 'price':
      case 'fair_value_30d':
        items.sort((a, b) => sortOrder === 'desc' 
          ? (b.fair_value_30d ?? b.median_price) - (a.fair_value_30d ?? a.median_price) 
          : (a.fair_value_30d ?? a.median_price) - (b.fair_value_30d ?? b.median_price));
        break;
      case 'var_7d':
        items.sort((a, b) => sortOrder === 'desc' ? b.var_7d_pct - a.var_7d_pct : a.var_7d_pct - b.var_7d_pct);
        break;
      case 'var_30d':
        items.sort((a, b) => sortOrder === 'desc' 
          ? (b.var_30d_pct ?? 0) - (a.var_30d_pct ?? 0) 
          : (a.var_30d_pct ?? 0) - (b.var_30d_pct ?? 0));
        break;
      case 'volume':
        items.sort((a, b) => sortOrder === 'desc' ? b.volume - a.volume : a.volume - b.volume);
        break;
      case 'liquidity':
        items.sort((a, b) => sortOrder === 'desc' ? b.liquidity - a.liquidity : a.liquidity - b.liquidity);
        break;
      case 'ads_count':
        items.sort((a, b) => sortOrder === 'desc' ? b.ads_count - a.ads_count : a.ads_count - b.ads_count);
        break;
      case 'name':
      default:
        items.sort((a, b) => sortOrder === 'desc' 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name));
    }

    // Paginate
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);
    const total_pages = Math.ceil(total / limit);

    // Debug tracking
    trackEndpointCall('getCatalogModels', 'mock', { ...filters, page, limit }, paged.length);

    return { items: paged, total, page, page_size: limit, total_pages };
  },
  async getCatalogSummary() {
    await delay();
    const totalAds = MOCK_MODELS.reduce((sum, m) => sum + m.ads_count, 0);
    const medianPrice = Math.round(MOCK_MODELS.reduce((sum, m) => sum + m.median_price, 0) / MOCK_MODELS.length);
    const avgVar = MOCK_MODELS.reduce((sum, m) => sum + m.var_7d_pct, 0) / MOCK_MODELS.length;
    return {
      total_models: MOCK_MODELS.length,
      total_brands: Object.keys(MOCK_BRANDS_BY_CATEGORY).length,
      categories_count: MOCK_CATEGORIES.length,
      last_update: new Date().toISOString(),
      median_price_global: medianPrice,
      avg_variation: Math.round(avgVar * 10) / 10,
      total_ads: totalAds,
    };
  },

  // Model Detail
  async getModelDetail(modelId) {
    track('getModelDetail');
    await delay();
    
    // Parse ID and find model
    const id = parseInt(modelId, 10);
    const model = MOCK_MODELS.find(m => m.id === id);
    
    // Handle NotFound
    if (!model) {
      throw new Error('MODEL_NOT_FOUND');
    }
    
    const watchlist = initializeWatchlist();
    const isInWatchlist = watchlist.some(w => w.target_type === 'model' && w.target_id === id);
    
    return {
      id: model.id,
      name: model.name,
      brand: model.brand,
      family: model.family,
      category: model.category,
      aliases: model.aliases || [],
      specs: { 
        vram_gb: model.category === 'GPU' ? 8 + Math.floor(model.id % 4) * 4 : undefined, 
        memory_type: model.category === 'GPU' ? 'GDDR6X' : undefined, 
        tdp_w: model.category === 'GPU' ? 150 + (model.id % 10) * 20 : undefined 
      },
      market: {
        median_price: model.median_price,
        price_p25: Math.round(model.median_price * 0.85),
        price_p75: Math.round(model.median_price * 1.15),
        var_7d_pct: model.var_7d_pct,
        var_30d_pct: model.var_30d_pct,
        var_90d_pct: model.var_30d_pct * 1.5,
        volume: model.volume,
        ads_count: model.ads_count,
        median_days_to_sell: 3 + (model.id % 8),
      },
      is_in_watchlist: isInWatchlist,
    };
  },
  async getModelPriceHistory(modelId, period = '30') {
    track('getModelPriceHistory');
    await delay();
    const id = parseInt(modelId, 10);
    const days = parseInt(period, 10);
    return generateModelPriceHistory(id, days);
  },
  async getModelAds(modelId, page = 1, limit = 10) {
    track('getModelAds');
    await delay();
    const id = parseInt(modelId, 10);
    
    // Find ads for this model
    const modelAds = MOCK_ADS
      .filter(ad => ad.model_id === id)
      .map(ad => ({
        id: ad.id,
        title: ad.title,
        price: ad.price,
        condition: ad.condition,
        city: ad.city,
        platform: ad.platform,
        url: ad.url,
        published_at: ad.published_at,
        score: ad.score,
        deviation_pct: ad.deviation_pct,
      }));
    
    const start = (page - 1) * limit;
    const paged = modelAds.slice(start, start + limit);
    
    return { items: paged, total: modelAds.length, page, page_size: limit };
  },
  async toggleModelWatchlist(modelId, add) {
    await delay();
    const items = initializeWatchlist();
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
    const items = initializeAlerts();
    const m = mockModels[(modelId - 1) % mockModels.length];
    items.push({
      id: generateId(),
      target_type: 'model',
      target_id: modelId,
      alert_type: 'price_below',
      price_threshold: threshold,
      is_active: true,
      created_at: new Date().toISOString(),
      target_name: m.name,
    });
    setToStorage(STORAGE_KEYS.ALERTS, items);
  },

  // Ad Detail
  async getAdDetail(adId) {
    track('getAdDetail');
    await delay();
    
    // Parse ID - support both string and number
    const id = parseInt(String(adId), 10);
    
    if (isNaN(id)) {
      throw new Error('AD_NOT_FOUND');
    }
    
    const watchlist = initializeWatchlist();
    const isInWatchlist = watchlist.some(w => w.target_type === 'ad' && w.target_id === id);

    // Check if this is a PC ad (IDs 1000+ are PCs)
    if (id >= 1000) {
      const pcIndex = (id - 1000) % mockPCs.length;
      const pc = mockPCs[pcIndex];
      return {
        id,
        title: pc.name,
        description: `PC complet ${pc.family} - Configuration ${pc.condition}. ${pc.cpu}, ${pc.gpu || 'Graphiques intégrés'}, ${pc.ram}, ${pc.storage}.`,
        price: pc.price,
        fair_value: pc.fairValue,
        deviation_pct: Math.round((1 - pc.price / pc.fairValue) * 100),
        score: pc.score,
        condition: pc.condition,
        city: pc.city,
        region: pc.region,
        postal_code: '75015',
        platform: 'leboncoin',
        url: '#',
        published_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
        first_seen_at: new Date(Date.now() - Math.random() * 60 * 86400000).toISOString(),
        last_seen_at: new Date().toISOString(),
        status: 'active',
        seller_type: 'Particulier',
        delivery_possible: true,
        secured_payment: true,
        model: null,
        components: [
          { type: 'CPU', model: pc.cpu, brand: pc.cpu.includes('Intel') ? 'Intel' : 'AMD' },
          ...(pc.gpu ? [{ type: 'GPU', model: pc.gpu, brand: pc.gpu.includes('RTX') || pc.gpu.includes('GTX') ? 'NVIDIA' : 'AMD' }] : []),
          { type: 'RAM', model: pc.ram, brand: 'Generic' },
          { type: 'Storage', model: pc.storage, brand: 'Generic' },
        ],
        images: [],
        is_in_watchlist: isInWatchlist,
        item_type: 'pc' as const,
        pc_components: {
          cpu: pc.cpu,
          gpu: pc.gpu,
          ram: pc.ram,
          storage: pc.storage,
          motherboard: pc.motherboard,
          psu: pc.psu,
          case: pc.case,
          age_years: pc.age_years,
          condition: pc.condition as 'Excellent' | 'Bon' | 'Correct' | 'Usé',
          warranty_months: pc.warranty_months,
        },
        price_history_30d: generatePriceHistory(pc.price, 30),
      };
    }

    // Find ad in MOCK_ADS by id
    const ad = MOCK_ADS.find(a => a.id === id);
    
    // Handle NotFound
    if (!ad) {
      throw new Error('AD_NOT_FOUND');
    }

    return {
      id: ad.id,
      title: ad.title,
      description: ad.description,
      price: ad.price,
      fair_value: ad.fair_value,
      deviation_pct: ad.deviation_pct,
      score: ad.score,
      condition: ad.condition,
      city: ad.city,
      region: ad.region,
      postal_code: ad.postal_code,
      platform: ad.platform,
      url: ad.url,
      published_at: ad.published_at,
      first_seen_at: ad.first_seen_at,
      last_seen_at: ad.last_seen_at,
      status: ad.status,
      seller_type: ad.seller_type,
      delivery_possible: ad.delivery_possible,
      secured_payment: ad.secured_payment,
      model: ad.model_id ? { 
        id: ad.model_id, 
        name: ad.model_name, 
        brand: MOCK_MODELS.find(m => m.id === ad.model_id)?.brand || 'Unknown', 
        category: ad.category 
      } : null,
      components: [],
      images: [],
      is_in_watchlist: isInWatchlist,
      item_type: ad.item_type,
    };
  },
  async getAdPriceHistory(adId) {
    track('getAdPriceHistory');
    await delay();
    
    const id = parseInt(String(adId), 10);
    const ad = MOCK_ADS.find(a => a.id === id);
    
    // If not found, return empty points
    if (!ad) {
      return { points: [] };
    }
    
    const points = generateAdPriceHistory(id, ad.price);
    return { points };
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
  async getAvailableTasks(): Promise<AvailableTasksResponse> {
    track('getAvailableTasks');
    await delay();
    const tasks = MOCK_COMMUNITY_TASKS.map((t) => ({
      id: t.id,
      model_id: t.model_id,
      model_name: t.model_name,
      model: t.model_name,
      platform: t.platform,
      type: t.type,
      region: t.region,
      pages_hint: `${t.pages_from}–${t.pages_to}`,
      pages_from: t.pages_from,
      pages_to: t.pages_to,
      priority: t.priority,
      context: t.context,
      estimated_time_min: t.estimated_time_min,
      credit_reward: t.reward_credits,
      reward_credits: t.reward_credits,
      expires_at: t.expires_at,
    }));
    return {
      active: true,
      summary: {
        pending_missions: tasks.length,
        estimated_pages: tasks.reduce((sum, t) => sum + t.pages_to, 0),
        coverage_7d_pct: 0.78,
        credits_distributed_30d: 5820,
      },
      tasks,
    };
  },
  async getMyTasks(): Promise<MyTasksResponse> {
    await delay();
    const tasks = mockHistory.map((h, idx) => ({
      id: idx + 1,
      task_id: idx + 1,
      job_id: idx + 1,
      date: h.date,
      model: h.model,
      model_name: h.model,
      platform: 'leboncoin',
      type: h.type,
      pages_scanned: h.pages_scanned,
      ads_new: h.ads_new,
      ads_found: h.ads_new,
      ads_changed: h.ads_changed,
      status: h.status as 'pending' | 'running' | 'completed' | 'failed' | 'expired' | 'done' | 'in_progress',
      credits_earned: h.credits_earned,
      duration_seconds: h.duration_seconds,
      claimed_at: h.date,
      completed_at: h.status === 'done' ? h.date : null,
    }));
    return {
      items: tasks,
      tasks,
      total: tasks.length,
      user_limits: {
        max_comm_jobs_per_day: 5,
        used_today: 2,
        cooldown_minutes: 30,
        cooldown_remaining: 0,
      },
    };
  },
  async claimTask(data): Promise<ClaimTaskResponse> {
    await delay();
    const task = MOCK_COMMUNITY_TASKS[0];
    return {
      success: true,
      shard_id: `shard-${data.task_id}`,
      job_id: data.task_id,
      upload_token: 'mock-token-123',
      model: task?.model_name || 'RTX 4060 Ti',
      task: {
        id: data.task_id,
        model_id: task?.model_id || 1,
        model_name: task?.model_name || 'RTX 4060 Ti',
        model: task?.model_name || 'RTX 4060 Ti',
        platform: task?.platform || 'leboncoin',
        type: task?.type || 'list_only',
        region: task?.region || null,
        pages_hint: task ? `${task.pages_from}–${task.pages_to}` : '1–10',
        pages_from: task?.pages_from || 1,
        pages_to: task?.pages_to || 10,
        priority: task?.priority || 'medium',
        context: task?.context || null,
        estimated_time_min: task?.estimated_time_min || 5,
        credit_reward: task?.reward_credits || 2,
        reward_credits: task?.reward_credits || 2,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      },
      type: task?.type || 'list_only',
      region: task?.region || null,
      pages_from: 1,
      pages_to: 10,
      date_window: '7d',
      recommended_delays: {
        min_delay_page_ms: 2000,
        max_delay_page_ms: 5000,
      },
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      estimated_time_min: task?.estimated_time_min || 5,
      credit_reward: task?.reward_credits || 2,
      params: {
        platform: task?.platform || 'leboncoin',
        keyword: task?.model_name || 'RTX 4060 Ti',
        type: task?.type || 'list_only',
        pages_from: 1,
        pages_to: 10,
        search_url: 'https://www.leboncoin.fr/recherche?text=RTX+4060+Ti',
      },
    };
  },
  async getCommunityStats(): Promise<CommunityStats> {
    await delay();
    return {
      total_contributors: 156,
      total_missions_30d: 1240,
      total_missions_completed: 1180,
      total_pages_30d: 12800,
      total_pages_scanned: 12500,
      total_credits_30d: 5820,
      total_credits_distributed: 5600,
      total_ads_found: 45000,
      coverage_7d_pct: 78,
      active_contributors_today: 23,
      your_rank: 42,
      your_percentile: 85,
    };
  },
  async getLeaderboard(period): Promise<LeaderboardResponse> {
    await delay();
    const entries = (period === '30d' ? leaderboard30d : leaderboardAllTime).map(e => ({
      ...e,
      user_display: e.user,
      quality_score: e.quality,
      badge: e.badge || null,
    }));
    return { items: entries, entries, period, user_rank: 42 };
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

  // User - Now using centralized mock subscription system
  async getUserCredits() {
    await delay();
    return getCreditsFromSubscription();
  },
  async getSubscriptionPlans() {
    await delay();
    // Return plans from centralized config
    return Object.values(MOCK_PLANS).map(plan => ({
      id: plan.id,
      name: plan.displayName,
      description: plan.name === 'starter' 
        ? 'Pour découvrir l\'outil' 
        : plan.name === 'pro' 
          ? 'Pour les utilisateurs réguliers'
          : 'Pour les professionnels',
      price: plan.price,
      currency: 'EUR',
      duration_months: 1,
      features: {
        credits: plan.creditsPerCycle,
        max_alerts: plan.limits.maxAlerts,
        max_watchlist: plan.limits.maxWatchlistItems,
        scrap_fort: plan.limits.canScrapStrong,
        export: plan.limits.canExport,
        stats_avancees: plan.limits.canAccessAdvancedStats,
        support_prioritaire: plan.limits.canAccessPrioritySupport,
        api_access: plan.limits.canAccessApiAccess,
      },
      is_active: true,
    }));
  },
  async getUserSubscription() {
    await delay();
    const state = getMockSubscriptionState();
    const plan = MOCK_PLANS[state.planName];
    
    return {
      id: 'mock-sub-1',
      plan_id: plan.id,
      status: state.status,
      started_at: state.cycleStartDate,
      expires_at: state.cycleEndDate,
      credits_remaining: state.creditsRemaining,
      credits_reset_date: state.creditsResetDate,
      billing_cycle: 'monthly',
      plan: {
        id: plan.id,
        name: plan.displayName,
        description: plan.name === 'starter' 
          ? 'Pour découvrir l\'outil' 
          : plan.name === 'pro' 
            ? 'Pour les utilisateurs réguliers'
            : 'Pour les professionnels',
        price: plan.price,
        currency: 'EUR',
        duration_months: 1,
        features: {
          credits: plan.creditsPerCycle,
          max_alerts: plan.limits.maxAlerts,
          scrap_fort: plan.limits.canScrapStrong,
          export: plan.limits.canExport,
        },
        is_active: true,
      },
    };
  },
  async getSubscriptionHistory() {
    await delay();
    const state = getMockSubscriptionState();
    const plan = MOCK_PLANS[state.planName];
    
    return [
      {
        id: 'mock-sub-1',
        plan_id: plan.id,
        status: state.status,
        started_at: state.cycleStartDate,
        expires_at: state.cycleEndDate,
        credits_remaining: state.creditsRemaining,
        credits_reset_date: state.creditsResetDate,
        billing_cycle: 'monthly',
        plan: {
          id: plan.id,
          name: plan.displayName,
          description: 'Plan actuel',
          price: plan.price,
          currency: 'EUR',
          duration_months: 1,
          features: { credits: plan.creditsPerCycle },
          is_active: true,
        },
      },
    ];
  },
  async getUserProfile() {
    await delay();
    const state = getMockSubscriptionState();
    return {
      id: 'mock-user-1',
      email: 'test@example.com',
      display_name: 'Utilisateur Test',
      avatar_url: null,
      discord_id: 'TestUser#1234',
      created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    };
  },
  async subscribe(planId) {
    await delay();
    // Use centralized plan change
    const planName = planId === 'plan-elite' || planId === 'elite' 
      ? 'elite' 
      : planId === 'plan-pro' || planId === 'pro' 
        ? 'pro' 
        : 'starter';
    changeMockPlan(planName);
    console.log(`[MockProvider] Changed plan to: ${planName}`);
  },
  async consumeCredits(amount: number, reason: string) {
    await delay();
    const result = consumeMockCredits(amount);
    if (result.success) {
      console.log(`[MockProvider] Consumed ${amount} credits for: ${reason}. Remaining: ${result.remaining}`);
    } else {
      console.warn(`[MockProvider] Failed to consume ${amount} credits: ${result.error}`);
    }
  },

  // Admin
  async getUserRole() {
    await delay();
    return {
      user_id: 'mock-user-1',
      role: 'admin', // In mock mode, always admin for testing
    };
  },
  async getAdminUsers(page = 1, limit = 20, search) {
    await delay();
    const users = [
      { id: 'user-1', email: 'admin@example.com', display_name: 'Admin Test', role: 'admin', credits_remaining: 400, plan_name: 'Elite', created_at: new Date(Date.now() - 90 * 86400000).toISOString(), last_sign_in_at: new Date().toISOString() },
      { id: 'user-2', email: 'john@example.com', display_name: 'John Doe', role: 'user', credits_remaining: 120, plan_name: 'Pro', created_at: new Date(Date.now() - 60 * 86400000).toISOString(), last_sign_in_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'user-3', email: 'jane@example.com', display_name: 'Jane Smith', role: 'user', credits_remaining: 25, plan_name: 'Basic', created_at: new Date(Date.now() - 30 * 86400000).toISOString(), last_sign_in_at: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: 'user-4', email: 'bob@example.com', display_name: 'Bob Wilson', role: 'user', credits_remaining: 80, plan_name: 'Pro', created_at: new Date(Date.now() - 45 * 86400000).toISOString(), last_sign_in_at: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: 'user-5', email: 'alice@example.com', display_name: null, role: 'user', credits_remaining: 10, plan_name: 'Basic', created_at: new Date(Date.now() - 15 * 86400000).toISOString(), last_sign_in_at: null },
    ];
    let filtered = users;
    if (search) {
      const s = search.toLowerCase();
      filtered = users.filter(u => u.email.toLowerCase().includes(s) || u.display_name?.toLowerCase().includes(s));
    }
    const start = (page - 1) * limit;
    return { items: filtered.slice(start, start + limit), total: filtered.length, page, page_size: limit };
  },
  async getAdminJobs(page = 1, limit = 20, filters) {
    await delay();
    const jobs = [
      { id: 1, user_id: 'user-1', user_name: 'Admin Test', keyword: 'RTX 4060', platform: 'leboncoin', type: 'weak', status: 'completed', pages_scanned: 10, pages_target: 10, ads_found: 45, error_message: null, created_at: new Date().toISOString(), started_at: new Date().toISOString(), ended_at: new Date().toISOString() },
      { id: 2, user_id: 'user-2', user_name: 'John Doe', keyword: 'Ryzen 5600X', platform: 'leboncoin', type: 'strong', status: 'completed', pages_scanned: 20, pages_target: 20, ads_found: 78, error_message: null, created_at: new Date(Date.now() - 3600000).toISOString(), started_at: new Date(Date.now() - 3600000).toISOString(), ended_at: new Date(Date.now() - 3000000).toISOString() },
      { id: 3, user_id: 'user-3', user_name: 'Jane Smith', keyword: 'RTX 3080', platform: 'leboncoin', type: 'communautaire', status: 'running', pages_scanned: 5, pages_target: 15, ads_found: 18, error_message: null, created_at: new Date(Date.now() - 7200000).toISOString(), started_at: new Date(Date.now() - 7200000).toISOString(), ended_at: null },
      { id: 4, user_id: 'user-4', user_name: 'Bob Wilson', keyword: '980 Pro', platform: 'leboncoin', type: 'weak', status: 'failed', pages_scanned: 3, pages_target: 10, ads_found: 0, error_message: 'Connection timeout', created_at: new Date(Date.now() - 86400000).toISOString(), started_at: new Date(Date.now() - 86400000).toISOString(), ended_at: new Date(Date.now() - 86000000).toISOString() },
    ];
    let filtered = jobs;
    if (filters?.status && filters.status !== 'all') filtered = filtered.filter(j => j.status === filters.status);
    if (filters?.type && filters.type !== 'all') filtered = filtered.filter(j => j.type === filters.type);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(j => j.keyword.toLowerCase().includes(s) || j.user_name?.toLowerCase().includes(s));
    }
    const start = (page - 1) * limit;
    return { items: filtered.slice(start, start + limit), total: filtered.length, page, page_size: limit };
  },
  async getAdminLogs(page = 1, limit = 50, filters) {
    await delay();
    const logs = [
      { id: 1, level: 'info' as const, message: 'User login successful', context: { user_id: 'user-1' }, created_at: new Date().toISOString() },
      { id: 2, level: 'info' as const, message: 'Job started', context: { job_id: 1, keyword: 'RTX 4060' }, created_at: new Date(Date.now() - 60000).toISOString() },
      { id: 3, level: 'warn' as const, message: 'Rate limit approached', context: { requests: 95, limit: 100 }, created_at: new Date(Date.now() - 120000).toISOString() },
      { id: 4, level: 'error' as const, message: 'Connection timeout', context: { job_id: 4, error: 'ETIMEDOUT' }, created_at: new Date(Date.now() - 180000).toISOString() },
      { id: 5, level: 'info' as const, message: 'Job completed', context: { job_id: 1, ads_found: 45 }, created_at: new Date(Date.now() - 300000).toISOString() },
    ];
    let filtered = logs;
    if (filters?.level && filters.level !== 'all') filtered = filtered.filter(l => l.level === filters.level);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(l => l.message.toLowerCase().includes(s));
    }
    const start = (page - 1) * limit;
    return { items: filtered.slice(start, start + limit), total: filtered.length, page, page_size: limit };
  },
  async getHealthStatus() {
    await delay();
    return {
      status: 'healthy' as const,
      version: '0.18.0-mock',
      uptime_seconds: 86400,
      services: [
        { name: 'database', status: 'operational' as const, latency_ms: 12 },
        { name: 'cache', status: 'operational' as const, latency_ms: 3 },
        { name: 'scraper', status: 'operational' as const, latency_ms: 45 },
      ],
      metrics: {
        db_connections: 15,
        requests_per_minute: 120,
        error_rate: 0.02,
      },
    };
  },
};
