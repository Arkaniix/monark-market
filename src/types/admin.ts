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
