// ============= Estimator V3 API Types =============
// Maps to POST /v1/estimator/evaluate

// ============= Request =============
export type EstimationLevel = "basic" | "complete" | "pro";
export type EstimationMode = "component" | "bundle";

export type ConditionValue = "new" | "like_new" | "good" | "occasion" | "for_parts";
export type PlatformValue = "ebay" | "leboncoin" | "vinted" | "facebook" | "other";

export interface V3ComponentRequest {
  model_id: number;
  condition?: ConditionValue;
}

export interface V3EstimationRequest {
  mode: EstimationMode;
  // Component mode
  model_id?: number;
  price?: number;
  // Bundle mode
  total_price?: number;
  components?: V3ComponentRequest[];
  // Common
  condition?: ConditionValue | null;
  platform?: PlatformValue | null;
  level: EstimationLevel;
}

// ============= Response — Score =============
export interface V3ScoreModifiers {
  trend: number;
  liquidity: number;
  value_vs_new: number;
  total_raw: number;
  total_adjusted: number;
}

export interface V3ConfidenceFactor {
  label: string;
  impact: "positive" | "negative";
}

export interface V3Confidence {
  level: "high" | "medium" | "low";
  score: number;
  factors: V3ConfidenceFactor[];
}

export type V3Verdict = "BUY" | "NEGOTIATE" | "WAIT" | "AVOID";

export interface V3Score {
  overall: number;
  base_score: number | null;
  percentile_rank: number | null;
  percentile_label: string | null;
  verdict: V3Verdict;
  verdict_label: string;
  verdict_description: string;
  verdict_color: "green" | "yellow" | "orange" | "red";
  summary: string;
  confidence: V3Confidence;
  modifiers: V3ScoreModifiers | null;
}

// ============= Response — Model =============
export interface V3Model {
  id: number;
  name: string;
  category: string;
  manufacturer: string;
  image_url: string | null;
}

// ============= Response — Input Echo =============
export interface V3Input {
  price: number;
  condition: string | null;
  condition_label: string | null;
  platform: string | null;
  platform_label: string | null;
  region: string | null;
}

// ============= Response — Market =============
export interface V3Distribution {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface V3ConditionAdjusted {
  condition_label: string;
  median_price: number;
  price_vs_condition_pct: number;
}

export interface V3Market {
  median_price: number;
  fair_value: number | null;
  price_vs_median_pct: number;
  percentile_rank: number;
  percentile_label: string;
  distribution: V3Distribution;
  condition_adjusted: V3ConditionAdjusted | null;
  new_price: number | null;
  discount_vs_new_pct: number | null;
}

// ============= Response — Trends =============
export type V3Momentum = "rising" | "stable" | "falling";

export interface V3Trends {
  momentum: V3Momentum;
  trend_7d_pct: number | null;
  trend_30d_pct: number | null;
  interpretation: string;
}

// ============= Response — Liquidity =============
export interface V3Liquidity {
  level: "high" | "medium" | "low";
  level_label: string;
  sold_30d: number;
  active_listings: number;
  interpretation: string;
}

// ============= Response — Volatility =============
export interface V3Volatility {
  level: "low" | "moderate" | "high";
  level_label: string;
  sigma: number;
  iqr: number;
  interpretation: string;
}

// ============= Response — Primary Risk =============
export interface V3PrimaryRisk {
  level: "danger" | "warning" | "info";
  text: string;
  detail: string;
}

// ============= Response — Negotiation =============
export interface V3NegotiationOffer {
  price: number;
  savings_eur: number;
  savings_pct: number;
}

export interface V3Negotiation {
  aggressive: V3NegotiationOffer;
  compromise: V3NegotiationOffer;
  max: V3NegotiationOffer;
  tip: string;
  arguments: string[];
}

// ============= Response — Resale =============
export interface V3ResalePlatform {
  platform: string;
  platform_label: string;
  recommended_price: number;
  margin_eur: number;
  margin_pct: number;
  volume_30d: number;
  est_sell_days: number;
  sell_probability_30d_pct: number;
  is_recommended: boolean;
  note: string | null;
}

export interface V3Resale {
  platforms: V3ResalePlatform[];
}

// ============= Response — Scenarios =============
export interface V3Scenario {
  id: "quick" | "optimal" | "patient";
  label: string;
  sell_price: number;
  margin_eur: number;
  margin_pct: number;
  est_days: number;
  probability_pct: number;
}

export interface V3Timing {
  timing: "good" | "neutral" | "cautious" | "bad";
  label: string;
  detail: string;
}

export interface V3Saturation {
  level: "low" | "moderate" | "high";
  label: string;
  detail: string;
}

export interface V3Scenarios {
  quick: V3Scenario;
  optimal: V3Scenario;
  patient: V3Scenario;
  timing: V3Timing;
  saturation: V3Saturation;
}

// ============= Response — What-If =============
export interface V3WhatIfPricePoint {
  price: number;
  delta_pct: number;
  score: number;
  verdict: V3Verdict;
  verdict_label: string;
  margin_at_median_pct: number;
  label: string;
}

export interface V3WhatIfReferencePrices {
  buy_ceiling: number;
  sell_floor: number;
  optimal_buy: number;
}

export interface V3WhatIf {
  price_points: V3WhatIfPricePoint[];
  reference_prices: V3WhatIfReferencePrices;
}

// ============= Response — Bundle =============
export interface V3BundleComponent {
  model_id: number;
  name: string;
  category: string;
  condition: string | null;
  condition_label: string | null;
  status: "ok" | "no_data";
  median_price: number | null;
  fair_value: number | null;
  image_url: string | null;
}

export interface V3BundleAnalysis {
  total_parts_value: number;
  bundle_discount_pct: number;
  bundle_discount_eur: number;
  estimated_bundle_value: number;
  price_vs_bundle_pct: number;
  savings_vs_separate_eur: number;
  savings_vs_separate_pct: number;
  key_component: string;
}

// ============= Response — Upgrade Hint =============
export interface V3UpgradePreview {
  has_negotiation: boolean;
  has_trend_data: boolean;
  has_distribution: boolean;
  negotiation_savings_hint: string | null;
}

export interface V3UpgradeHint {
  next_level: EstimationLevel;
  next_level_label: string;
  preview: V3UpgradePreview;
}

// ============= Response — Justifications =============
export type V3Justification = string;

// ============= Full V3 Response =============
export interface V3EstimationResponse {
  estimation_id: string;
  created_at: string;
  plan_level: EstimationLevel;
  credits_used: number;
  mode: EstimationMode;

  model: V3Model;
  input: V3Input;
  score: V3Score;
  market: V3Market;
  justifications: V3Justification[];
  primary_risk: V3PrimaryRisk | null;

  // Complete+ fields
  trends?: V3Trends;
  liquidity?: V3Liquidity;
  volatility?: V3Volatility;
  negotiation?: V3Negotiation;

  // Pro fields
  resale?: V3Resale;
  scenarios?: V3Scenarios;
  what_if?: V3WhatIf;

  // Bundle mode
  components?: V3BundleComponent[];
  bundle_analysis?: V3BundleAnalysis;

  // Upgrade teaser
  upgrade_hint?: V3UpgradeHint;
}

// ============= Error responses =============
export interface V3ErrorResponse {
  error: "validation_error" | "insufficient_credits" | "internal_error";
  message: string;
  credits_required?: number;
  plan_level?: EstimationLevel;
}

// ============= UI helpers =============
export const VERDICT_COLORS: Record<V3Verdict, string> = {
  BUY: "#22c55e",
  NEGOTIATE: "#eab308",
  WAIT: "#f97316",
  AVOID: "#ef4444",
};

export const VERDICT_BG_CLASSES: Record<string, string> = {
  green: "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400",
  yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400",
  orange: "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400",
  red: "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400",
};

export const VERDICT_ICONS: Record<V3Verdict, string> = {
  BUY: "🟢",
  NEGOTIATE: "🟡",
  WAIT: "🟠",
  AVOID: "🔴",
};

export const CONDITION_OPTIONS_V3 = [
  { value: "new" as ConditionValue, label: "Neuf" },
  { value: "like_new" as ConditionValue, label: "Comme neuf" },
  { value: "good" as ConditionValue, label: "Bon état" },
  { value: "occasion" as ConditionValue, label: "Occasion" },
  { value: "for_parts" as ConditionValue, label: "Pour pièces" },
];

export const PLATFORM_OPTIONS_V3 = [
  { value: "ebay" as PlatformValue, label: "eBay" },
  { value: "leboncoin" as PlatformValue, label: "Leboncoin" },
  { value: "vinted" as PlatformValue, label: "Vinted" },
  { value: "facebook" as PlatformValue, label: "Facebook" },
  { value: "other" as PlatformValue, label: "Autre" },
];

export function getVerdictColorClass(color: string): string {
  return VERDICT_BG_CLASSES[color] || VERDICT_BG_CLASSES.green;
}
