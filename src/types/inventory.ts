// ============= Inventory Types =============

export type InventoryStatus = "in_stock" | "listed" | "sold";
export type InventoryCategory = "gpu" | "cpu" | "ram" | "ssd" | "other";
export type InventorySort = "date_desc" | "date_asc" | "price_desc" | "price_asc" | "profit_desc";
export type BuyCondition = "new" | "like_new" | "good" | "used" | "for_parts";

export interface InventoryItem {
  id: number;
  user_id: number;
  model_id: number | null;
  model_name: string | null;
  category_name: string | null;
  custom_name: string | null;
  category: InventoryCategory;
  buy_price: number;
  buy_platform: string | null;
  buy_date: string;
  buy_condition: string | null;
  sell_price: number | null;
  sell_platform: string | null;
  sell_date: string | null;
  sell_condition: string | null;
  fees_eur: number;
  profit_eur: number | null;
  profit_net_eur: number | null;
  hold_days: number | null;
  status: InventoryStatus;
  listed_platform: string | null;
  listed_price: number | null;
  listed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryPage {
  items: InventoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface InventoryDeal {
  id: number;
  model_name: string;
  profit_net: number;
  margin_pct: number;
  platform: string;
}

export interface InventoryPlatformStats {
  count: number;
  revenue: number;
  profit_net: number;
  avg_margin_pct: number;
  avg_hold_days: number;
}

export interface InventoryCategoryStats {
  count: number;
  revenue: number;
  profit_net: number;
  avg_margin_pct: number;
}

export interface InventoryStats {
  in_stock_count: number;
  in_stock_value: number;
  listed_count: number;
  listed_value: number;
  sold_count: number;
  total_revenue: number;
  total_cost: number;
  total_fees: number;
  total_profit: number;
  total_profit_net: number;
  avg_margin_pct: number;
  avg_hold_days: number;
  by_platform: Record<string, InventoryPlatformStats>;
  by_category: Record<string, InventoryCategoryStats>;
  best_deal: InventoryDeal | null;
  worst_deal: InventoryDeal | null;
}

export interface InventoryFilters {
  status?: InventoryStatus | "";
  category?: InventoryCategory | "";
  search?: string;
  sort?: InventorySort;
  limit?: number;
  offset?: number;
}

export interface CreateInventoryPayload {
  model_id?: number;
  custom_name?: string;
  category?: InventoryCategory;
  buy_price: number;
  buy_platform?: string;
  buy_date?: string;
  buy_condition?: string;
  fees_eur?: number;
  notes?: string;
}

export interface ListItemPayload {
  listed_platform: string;
  listed_price: number;
}

export interface SellItemPayload {
  sell_price: number;
  sell_platform: string;
  sell_date?: string;
  sell_condition?: string;
  fees_eur?: number;
}

export interface UpdateInventoryPayload {
  model_id?: number;
  custom_name?: string;
  category?: InventoryCategory;
  buy_price?: number;
  buy_platform?: string;
  buy_date?: string;
  buy_condition?: string;
  fees_eur?: number;
  notes?: string;
}

// UI helpers
export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  gpu: "GPU",
  cpu: "CPU",
  ram: "RAM",
  ssd: "SSD",
  other: "Autre",
};

export const CATEGORY_COLORS: Record<InventoryCategory, string> = {
  gpu: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  cpu: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  ram: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  ssd: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
};

export const STATUS_LABELS: Record<InventoryStatus, string> = {
  in_stock: "En stock",
  listed: "En vente",
  sold: "Vendu",
};

export const STATUS_COLORS: Record<InventoryStatus, string> = {
  in_stock: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  listed: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  sold: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

export const CONDITION_LABELS: Record<string, string> = {
  new: "Neuf",
  like_new: "Comme neuf",
  good: "Bon état",
  used: "Occasion",
  for_parts: "Pour pièces",
};

export const SORT_OPTIONS: { value: InventorySort; label: string }[] = [
  { value: "date_desc", label: "Date ↓ (récent)" },
  { value: "date_asc", label: "Date ↑ (ancien)" },
  { value: "price_desc", label: "Prix ↓" },
  { value: "price_asc", label: "Prix ↑" },
  { value: "profit_desc", label: "Profit ↓" },
];
