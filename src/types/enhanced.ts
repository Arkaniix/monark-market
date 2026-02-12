// Enhanced types - aligned with VPS schema (additional fields from real API)

// ============= Enhanced Ad fields =============
export interface EnhancedAdFields {
  // Quality indicators
  quality_score: number | null;
  is_outlier: boolean;
  // Enhanced pricing
  base_price: number | null;
  shipping_price: number | null;
  // Sale signals
  is_pro_seller: boolean;
  has_phone: boolean;
  response_time_hours: number | null;
}

export interface AdSaleSignal {
  id: number;
  ad_id: number;
  signal_type: 'price_drop' | 'sold' | 'renewed' | 'boosted';
  detected_at: string;
  data: Record<string, unknown> | null;
}

// ============= Enhanced Model Daily Metrics =============
export interface EnhancedModelMetrics {
  // Supply/demand indicators
  supply_index: number | null;
  demand_index: number | null;
  liquidity_score: number | null;
  // Advanced price points
  price_min: number | null;
  price_max: number | null;
  // Volume breakdown
  new_listings_count: number | null;
  sold_count: number | null;
}

// ============= PC Components (from ad_components table) =============
export interface AdComponentEntry {
  id: number;
  ad_id: number;
  role: 'cpu' | 'gpu' | 'ram' | 'storage' | 'motherboard' | 'psu' | 'case' | 'cooler' | 'other';
  model_id: number | null;
  raw_text: string | null;
  confidence: number | null;
  extracted_at: string;
  model?: {
    id: number;
    name: string;
    brand: string;
    category: string;
  };
}

// ============= Estimator Runs (from estimator_runs table) =============
export interface EstimatorRun {
  id: number;
  user_id: number;
  model_id: number;
  condition: string;
  region: string | null;
  platform: string | null;
  purchase_price: number;
  // Results
  recommended_buy: number | null;
  recommended_sell_30d: number | null;
  recommended_sell_90d: number | null;
  margin_pct: number | null;
  resell_probability: number | null;
  risk_level: 'low' | 'medium' | 'high' | null;
  badge: 'good' | 'caution' | 'risk' | null;
  advice: string | null;
  // Market snapshot at time of estimation
  market_snapshot: {
    median_price: number;
    var_30d_pct: number;
    volume: number;
    rarity_index: number;
    trend: 'up' | 'down' | 'stable';
  } | null;
  // Detailed results (JSON)
  detailed_results: Record<string, unknown> | null;
  // Plan info
  plan_at_creation: 'free' | 'standard' | 'pro';
  credits_consumed: number;
  // Timestamps
  created_at: string;
  // Model info (joined)
  model?: {
    id: number;
    name: string;
    brand: string;
    category: string;
  };
}

// ============= Community Tasks (from community_tasks table) =============
export interface CommunityTaskExtended {
  id: number;
  model_id: number;
  platform: string;
  task_type: 'list_only' | 'open_on_new' | 'deep_scan';
  region: string | null;
  priority: number;
  pages_from: number;
  pages_to: number;
  context: string | null;
  estimated_minutes: number;
  credit_reward: number;
  status: 'pending' | 'assigned' | 'completed' | 'failed' | 'expired';
  assigned_user_id: number | null;
  assigned_at: string | null;
  completed_at: string | null;
  expires_at: string;
  created_at: string;
  // Results
  pages_scanned: number | null;
  ads_found: number | null;
  new_ads: number | null;
  updated_ads: number | null;
}

// ============= Billing & Stripe =============
export interface BillingCustomer {
  id: number;
  user_id: number;
  stripe_customer_id: string;
  default_payment_method: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingInvoice {
  id: number;
  user_id: number;
  subscription_id: number | null;
  stripe_invoice_id: string | null;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  pdf_url: string | null;
  hosted_invoice_url: string | null;
  invoice_date: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface BillingPayment {
  id: number;
  user_id: number;
  invoice_id: number | null;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  payment_method_type: string | null;
  error_message: string | null;
  created_at: string;
}

// ============= Enhanced Subscription Plan =============
export interface EnhancedSubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  stripe_product_id: string | null;
  stripe_price_monthly_id: string | null;
  stripe_price_yearly_id: string | null;
  // Limits
  credits_per_month: number;
  max_alerts: number;
  max_saved_searches: number;
  max_watchlist_items: number;
  // Features
  features: string[];
  has_advanced_estimator: boolean;
  has_community_access: boolean;
  has_priority_support: boolean;
  has_api_access: boolean;
  // Status
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============= User Sessions =============
export interface UserSession {
  id: number;
  user_id: number;
  token_hash: string;
  device_info: string | null;
  ip_address: string | null;
  user_agent: string | null;
  last_active_at: string;
  expires_at: string;
  created_at: string;
  is_current?: boolean;
}
