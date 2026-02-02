// User Settings types - aligned with VPS schema

export interface UserSettings {
  id: number;
  user_id: number;
  // Theme & Display
  theme: 'light' | 'dark' | 'system';
  locale: string;
  // Notifications
  notify_email: boolean;
  notify_push: boolean;
  notify_discord: boolean;
  // Alert defaults
  alert_default_cooldown_hours: number;
  alert_platforms: string[];
  alert_regions: string[];
  // UI Preferences
  default_category: string | null;
  default_sort: string | null;
  items_per_page: number;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface UpdateUserSettingsPayload {
  theme?: 'light' | 'dark' | 'system';
  locale?: string;
  notify_email?: boolean;
  notify_push?: boolean;
  notify_discord?: boolean;
  alert_default_cooldown_hours?: number;
  alert_platforms?: string[];
  alert_regions?: string[];
  default_category?: string | null;
  default_sort?: string | null;
  items_per_page?: number;
}

// User Saved Searches types
export interface SavedSearch {
  id: number;
  user_id: number;
  name: string;
  search_type: 'catalog' | 'deals' | 'ads';
  filters: SavedSearchFilters;
  notify_on_new: boolean;
  last_run_at: string | null;
  results_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface SavedSearchFilters {
  category?: string;
  brand?: string;
  manufacturer?: string;
  family?: string;
  search?: string;
  condition?: string;
  region?: string;
  platform?: string;
  price_min?: number;
  price_max?: number;
  deviation_min?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateSavedSearchPayload {
  name: string;
  search_type: 'catalog' | 'deals' | 'ads';
  filters: SavedSearchFilters;
  notify_on_new?: boolean;
}

export interface UpdateSavedSearchPayload {
  name?: string;
  filters?: SavedSearchFilters;
  notify_on_new?: boolean;
}

export interface SavedSearchesResponse {
  items: SavedSearch[];
  total: number;
}
