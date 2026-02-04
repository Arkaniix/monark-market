// Estimator API types - aligned with backend FastAPI
// Last sync: 2026-02-04

// V1 - Basic estimation
export interface EstimatorRunCreate {
  model_id: number;
  side: 'buy' | 'sell';
  region?: string;
  condition?: string;
  currency?: string;  // default: 'EUR'
  input_price?: number;
  mode_advanced?: boolean;
}

export interface MarketSnapshot {
  model_id: number;
  price_median_current: number | null;
  fair_value_30d: number | null;
  price_p25: number | null;
  price_p75: number | null;
  buy_price_safe: number | null;
  sell_price_fast: number | null;
  var_7d_pct: number | null;
  var_30d_pct: number | null;
  volatility_30d: number | null;
  ads_count: number | null;
  median_days_to_sell: number | null;
  liquidity_score: number | null;
}

export type EstimatorSummary = 'EXCELLENT_BUY' | 'GOOD_BUY' | 'FAIR' | 'OVERPRICED';

export interface EstimatorRunResult {
  id: number;
  model_id: number;
  side: 'buy' | 'sell';
  region: string | null;
  condition: string | null;
  currency: string;
  input_price: number | null;
  mode_advanced: boolean;
  recommended_buy_price: number | null;
  recommended_sell_price: number | null;
  estimated_margin_eur: number | null;
  estimated_margin_pct: number | null;
  risk_score: number | null;  // 0-100
  summary: EstimatorSummary;
  market_snapshot: MarketSnapshot | null;
  created_at: string;
}

// V2 - Advanced estimation
export interface EstimatorV2Request {
  model_id: string | number;
  listed_price_eur: number;
  platform: 'leboncoin' | 'ebay' | 'amazon' | 'backmarket' | 'vinted' | 'facebook';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  quantity?: number;
  options?: {
    ignore_platform?: boolean;
    ignore_condition?: boolean;
    ignore_location?: boolean;
  };
}

export interface PriceRange {
  low: number;
  mid: number;
  high: number;
}

export interface ActionablePrices {
  buy_ceiling: number | null;
  sell_target: number | null;
  sell_floor: number | null;
  global_ranges: PriceRange | null;
  ranges_by_condition: Record<string, PriceRange>;
}

export interface EstimatorBreakdown {
  base_price: number;
  condition_adjustment: number;
  platform_adjustment: number;
  location_adjustment: number;
  final_price: number;
}

export interface EstimatorSections {
  market_data: boolean;
  price_breakdown: boolean;
  recommendations: boolean;
  risk_analysis: boolean;
  advanced_analytics: boolean;
}

export type DecisionAction = 'buy' | 'sell' | 'wait' | 'pass';
export type ConfidenceLabel = 'high' | 'medium' | 'low';
export type FairValueSource = 'sold_likely' | 'fallback_listed';

export interface EstimatorV2Response {
  tier: string;
  fair_value: number | null;
  fair_value_source: FairValueSource;
  show_window_stats: boolean;
  confidence: number;
  confidence_label: ConfidenceLabel;
  market_median_eur: number | null;
  volume_30d: number;
  decision_action: DecisionAction;
  decision_label: string;
  actionable_prices: ActionablePrices | null;
  breakdown: EstimatorBreakdown;
  sections: EstimatorSections;
  platforms: string[];
  meta: {
    model_id: number;
    assumptions: string[];
    computed_at: string;
  };
}

export interface EstimatorStats {
  total_runs: number;
  runs_this_month: number;
  distinct_models: number;
  favorite_category: string | null;
}
