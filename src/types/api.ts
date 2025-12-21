// API response types for dashboard

export interface DashboardOverview {
  user: {
    id: string;
    display_name: string;
    email: string;
  };
  stats: {
    credits_remaining: number;
    credits_reset_date: string | null;
    plan_name: string;
    total_scraps: number;
    watchlist_count: number;
    estimated_gains: number;
  };
  last_scrap_date: string | null;
  recent_activity: ActivityItem[];
  performance_data: PerformancePoint[];
  top_deals: Deal[];
  trends: {
    rising: Trend[];
    falling: Trend[];
  };
  market: {
    daily_volume: number;
    category_breakdown: Record<string, number>;
  };
  notifications: NotificationItem[];
  community: {
    user_rank: number;
    user_percentile: number;
    total_contributions: number;
    credits_earned: number;
  };
  training: {
    completed: number;
    total: number;
    last_module: string;
  };
  watchlist: WatchlistItem[];
  alerts: AlertItem[];
}

export interface ActivityItem {
  id: number;
  type: 'scrap' | 'credit' | 'alert' | 'notification';
  description: string;
  date: string;
}

export interface PerformancePoint {
  day: number;
  scraps?: number;
  margin?: number;
  credits?: number;
}

export interface Deal {
  id: number;
  title: string;
  price: number;
  fair_value: number;
  deviation_pct: number;
  city: string;
  condition: string;
  category: string;
}

export interface Trend {
  name: string;
  change: number;
  category: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export interface WatchlistItem {
  name: string;
  category: string;
}

export interface AlertItem {
  message: string;
  type: string;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Pagination response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
