// ============= Observatory =============
export interface ObservatoryModel {
  model_id: number;
  model_name: string;
  manufacturer: string;
  brand: string | null;
  category: string;
  ads_active: number;
  ads_total: number;
  ads_outlier_count: number;
  avg_model_confidence: number | null;
  price_median: number | null;
  price_p25: number | null;
  price_p75: number | null;
  trend_7d_pct: number | null;
  trend_30d_pct: number | null;
  volume_30d: number | null;
  new_ads_7d: number | null;
  regime: string | null;
  regime_confidence: number | null;
  regime_detected_at: string | null;
  new_price_eur: number | null;
  new_price_source: string | null;
  last_ad_seen_at: string | null;
  last_job_at: string | null;
  last_job_status: string | null;
  last_metrics_date: string | null;
  data_quality_score: number | null;
}

export interface ObservatorySummary {
  total_models: number;
  models_with_market_data: number;
  models_no_ads: number;
  total_active_ads: number;
  regimes_shock: number;
  avg_data_quality: number;
}

export interface ObservatoryResponse {
  models: ObservatoryModel[];
  total: number;
  summary: ObservatorySummary;
}

// ============= Billing / Compta =============
export interface ClientRow {
  user_id: number;
  email: string;
  display_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  current_plan_name: string | null;
  current_plan_code: string | null;
  subscription_status: string | null;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  billing_cycle: string | null;
  credits_per_cycle: number | null;
  stripe_subscription_id: string | null;
  credits_total_received: number;
  credits_total_consumed: number;
  credits_balance: number;
  credit_packs_purchased: number;
  credit_packs_total_credits: number;
  estimated_revenue_eur: number | null;
}

export interface ClientSummary {
  total_clients: number;
  active_subscribers: number;
  churned_subscribers: number;
  total_revenue_estimate_eur: number;
  total_credits_issued: number;
  total_credits_consumed: number;
  credits_pack_sales: number;
  mrr_estimate_eur: number;
}

export interface ClientListResponse {
  clients: ClientRow[];
  total: number;
  summary: ClientSummary;
}

export interface CreditHistoryEntry {
  id: number;
  created_at: string;
  delta: number;
  reason: string;
  meta: Record<string, unknown> | null;
}

// ============= Analytics - Décote =============
export interface DecoteModel {
  model_id: number;
  model_name: string;
  manufacturer: string;
  category: string;
  new_price_eur: number;
  new_price_source: string | null;
  median_price: number;
  p25: number | null;
  p75: number | null;
  sample_size: number;
  data_quality: string | null;
  decote_pct: number;
  economy_eur: number;
}

export interface DecoteSummary {
  avg_decote_pct: number;
  best_deal_model: string;
  best_deal_decote: number;
  models_over_50pct: number;
  total_models_with_both_prices: number;
}

export interface DecoteResponse {
  models: DecoteModel[];
  total: number;
  summary: DecoteSummary;
}

// ============= Analytics - Price History =============
export interface PriceHistoryPoint {
  date: string;
  source: string;
  obs_count: number;
  avg_price: number;
  median_price: number;
  min_price: number;
  max_price: number;
}

export interface PriceHistoryResponse {
  model_id: number;
  model_name: string;
  category: string;
  days_requested: number;
  data_points: PriceHistoryPoint[];
  summary: {
    total_observations: number;
    sources: string[];
    first_date: string;
    last_date: string;
  };
}

// ============= Variants =============
export interface VariantDetail {
  id: number;
  variant_name: string;
  brand: string;
  tier: string | null;
  price_delta_pct: number | null;
  boost_clock_mhz: number | null;
  core_clock_mhz: number | null;
  memory_gb: number | null;
  length_mm: number | null;
  color: string | null;
  price_usd: number | null;
  new_price_eur: number | null;
  new_price_source: string | null;
  new_price_updated_at: string | null;
  image_url: string | null;
  observations_count: number;
  signals_count: number;
}

export interface ModelVariantsResponse {
  model_id: number;
  model_name: string;
  total_variants: number;
  tier_summary: Record<string, number>;
  variants: VariantDetail[];
}
