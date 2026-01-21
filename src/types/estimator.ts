// ============= Estimator Enhanced Types =============
// Complete type system for the improved Estimator

import type { PlanType } from "@/hooks/useEntitlements";

// ============= Input Options =============
export interface EstimationOptions {
  /** Skip platform input - aggregate multi-platform data */
  withoutPlatform: boolean;
  /** Skip condition input - show ranges by condition */
  withoutCondition: boolean;
}

export interface EnhancedEstimationRequest {
  model_id: number;
  /** Listed price from the ad */
  ad_price: number;
  /** Condition (optional if withoutCondition is true) */
  condition?: string;
  /** Platform (optional if withoutPlatform is true) */
  platform?: string;
  /** Estimation options */
  options: EstimationOptions;
}

// ============= Confidence & Opportunity Score =============
export type ConfidenceLevel = "high" | "medium" | "low";
export type OpportunityLabel = "excellent" | "good" | "average" | "poor";
export type DecisionAction = "buy" | "negotiate" | "wait" | "pass";
export type TimingStatus = "favorable" | "neutral" | "unfavorable";
export type SaturationLevel = "low" | "moderate" | "saturated";
export type VolatilityLevel = "low" | "medium" | "high";
export type RiskType = "saturated_market" | "price_drop" | "low_liquidity" | "high_competition" | "unstable_trend" | "overpriced";

// ============= Score Decomposition (Elite) =============
export interface ScoreComponent {
  id: string;
  label: string;
  value: number; // 0-100
  weight: number; // 0-1
  description: string;
}

export interface OpportunityScoreDetails {
  /** Overall score 0-100 */
  score: number;
  /** Human-readable label */
  label: OpportunityLabel;
  /** Score breakdown (Elite only) */
  components: ScoreComponent[];
}

// ============= Market Data Enhanced =============
export interface MarketDataEnhanced {
  /** Median market price */
  median_price: number;
  /** 25th percentile price */
  price_p25: number;
  /** 75th percentile price */
  price_p75: number;
  /** 30-day price variation percentage */
  var_30d_pct: number;
  /** 90-day price variation percentage */
  var_90d_pct?: number;
  /** Active listings count */
  volume_active: number;
  /** New listings in last 7 days */
  new_listings_7d: number;
  /** Price volatility assessment */
  volatility: VolatilityLevel;
  /** IQR (interquartile range) for dispersion */
  iqr: number;
  /** Trend direction */
  trend: "up" | "down" | "stable";
  /** Rarity index (higher = rarer) */
  rarity_index: number;
  /** Data freshness */
  last_update: string;
  /** Number of data points used */
  data_points: number;
}

// ============= Confidence Assessment =============
export interface ConfidenceAssessment {
  level: ConfidenceLevel;
  /** Factors affecting confidence */
  factors: Array<{
    factor: string;
    impact: "positive" | "negative";
    description: string;
  }>;
  /** Reason if confidence is reduced */
  reduction_reason?: string;
}

// ============= Hypotheses (when inputs are missing) =============
export interface Hypothesis {
  field: "platform" | "condition";
  assumption: string;
  impact_on_confidence: "minor" | "moderate" | "major";
}

// ============= Decision Block =============
export interface DecisionRecommendation {
  action: DecisionAction;
  label: string;
  /** 3 bullet points max */
  reasons: string[];
  /** Single main risk */
  main_risk: {
    type: RiskType;
    description: string;
  };
  /** Target user profile */
  target_profile: {
    label: string;
    description: string;
  };
}

// ============= Actionable Prices =============
export interface PriceRangeByCondition {
  condition: string;
  condition_label: string;
  buy_ceiling: number;
  sell_target: number;
  sell_floor: number;
  margin_euro: number;
  margin_pct: number;
}

export interface ActionablePrices {
  /** Maximum buy price (don't exceed) */
  buy_ceiling: number;
  /** Target resale price */
  sell_target: number;
  /** Floor price (quick sale) */
  sell_floor: number;
  /** Expected margin in euros */
  margin_euro: number;
  /** Expected margin percentage */
  margin_pct: number;
  /** If condition unknown, show ranges */
  ranges_by_condition?: PriceRangeByCondition[];
}

// ============= Negotiation =============
export interface NegotiationData {
  buy: {
    /** Aggressive first offer */
    first_offer: number;
    /** Compromise offer */
    compromise: number;
    /** Maximum (don't exceed) */
    max_offer: number;
  };
  sell: {
    /** Floor price */
    floor: number;
    /** Recommended listing price */
    listing_price: number;
    /** Premium price (if perfect condition) */
    premium: number;
  };
  /** Negotiation tip */
  tip: string;
  /** Arguments to use */
  arguments: string[];
}

// ============= Charts Data =============
export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface PriceChartData {
  series_30d: ChartDataPoint[];
  series_90d: ChartDataPoint[];
  /** P25-P75 bands (Elite) */
  bands?: {
    p25: ChartDataPoint[];
    p75: ChartDataPoint[];
  };
  /** Segmented by condition (Elite) */
  by_condition?: Record<string, ChartDataPoint[]>;
}

export interface VolumeChartData {
  series_30d: ChartDataPoint[];
}

// ============= Resale Scenarios (Elite) =============
export interface ResaleScenario {
  id: "quick" | "optimal" | "long";
  label: string;
  price: number;
  margin_euro: number;
  margin_pct: number;
  days_estimate: { min: number; max: number };
  probability_pct: number;
  /** Capital immobilization info */
  immobilization_days: number;
}

export interface MarketTiming {
  status: TimingStatus;
  label: string;
  justification: string;
}

export interface MarketSaturation {
  level: SaturationLevel;
  label: string;
  justification: string;
}

export interface ScenariosData {
  scenarios: ResaleScenario[];
  timing: MarketTiming;
  saturation: MarketSaturation;
}

// ============= Platform Analysis =============
export interface PlatformAnalysis {
  platform: string;
  platform_label: string;
  /** Importance score 1-5 */
  importance: number;
  /** Recommended listing price */
  recommended_price: number;
  /** Sale probability percentage */
  sale_probability: number;
  /** Average days to sell */
  avg_days_to_sell: number;
  /** Why this platform (Elite) */
  reason?: string;
  /** Constraints/notes (Elite) */
  constraints?: string[];
  /** Is this the recommended platform */
  is_recommended: boolean;
}

export interface PlatformsData {
  platforms: PlatformAnalysis[];
  /** Best platform recommendation */
  recommended: PlatformAnalysis;
  /** Source platform info if known */
  source_platform_note?: string;
}

// ============= What-If Simulator (Elite) =============
export interface WhatIfPreset {
  label: string;
  price: number;
  /** Price relative to ad price (e.g., -10%, 0%, +10%) */
  relative_pct: number;
}

export interface WhatIfResult {
  buy_price: number;
  margin_euro: number;
  margin_pct: number;
  decision: DecisionAction;
  verdict: string;
}

export interface WhatIfData {
  presets: WhatIfPreset[];
  slider_min: number;
  slider_max: number;
  /** Current calculation based on slider value */
  current_result?: WhatIfResult;
}

// ============= Listing Recommendations (Elite) =============
export interface ListingRecommendation {
  /** Recommended listing price */
  listing_price: number;
  /** Minimum acceptable price */
  accept_down_to: number;
  /** Suggested keywords */
  keywords: string[];
  /** Listing tips */
  tips: string[];
}

// ============= Main Enhanced Result =============
export interface EnhancedEstimationResult {
  // === Input echo ===
  inputs: {
    model_id: number;
    model_name: string;
    brand?: string;
    category: string;
    ad_price: number;
    condition?: string;
    platform?: string;
    options: EstimationOptions;
  };

  // === Meta ===
  meta: {
    plan: PlanType;
    plan_at_creation: PlanType;
    created_at: string;
    credit_cost: number;
  };

  // === Opportunity & Confidence (All plans) ===
  opportunity: OpportunityScoreDetails;
  confidence: ConfidenceAssessment;
  /** Hypotheses if inputs are missing */
  hypotheses: Hypothesis[];
  /** Tags for quick summary */
  tags: string[];

  // === Market Data (All plans, some fields Pro+) ===
  market: MarketDataEnhanced;

  // === Decision (Starter: simple, Pro+: detailed) ===
  decision: DecisionRecommendation;

  // === Actionable Prices (Pro+) ===
  actionable_prices: ActionablePrices;

  // === Negotiation (Pro+) ===
  negotiation: NegotiationData;

  // === Charts (Pro+) ===
  charts: {
    price: PriceChartData;
    volume: VolumeChartData;
  };

  // === Platforms (Pro: top 3, Elite: all + details) ===
  platforms: PlatformsData;

  // === Elite-only features ===
  /** Resale scenarios with timing/saturation */
  scenarios?: ScenariosData;
  /** What-if simulator data */
  what_if?: WhatIfData;
  /** Listing recommendations */
  listing_reco?: ListingRecommendation;
}

// ============= History Item Enhanced =============
export interface EnhancedEstimationHistoryItem {
  id: string;
  created_at: string;
  model_id: number;
  model_name: string;
  brand?: string;
  category: string;
  condition?: string;
  platform?: string;
  ad_price: number;
  plan_at_creation: PlanType;
  options: EstimationOptions;
  // Stored results
  results: EnhancedEstimationResult;
}

// ============= UI State Types =============
export interface EstimatorFormState {
  modelSearch: string;
  selectedModel: {
    id: number;
    name: string;
    brand: string;
    category: string;
    family?: string | null;
  } | null;
  adPrice: string;
  condition: string;
  platform: string;
  options: EstimationOptions;
}

export interface EstimatorUIState {
  activeTab: "estimator" | "history";
  modelPopoverOpen: boolean;
  isPCBlocked: boolean;
  whatIfSliderValue?: number;
}

// ============= Condition mappings =============
export const CONDITION_OPTIONS = [
  { value: "neuf", label: "Neuf", multiplier: 1.15 },
  { value: "comme-neuf", label: "Comme neuf", multiplier: 1.08 },
  { value: "bon", label: "Bon état", multiplier: 1.0 },
  { value: "moyen", label: "État moyen", multiplier: 0.85 },
  { value: "a-reparer", label: "À réparer", multiplier: 0.65 },
] as const;

export const CONDITION_MAP: Record<string, string> = {
  neuf: "Neuf",
  "comme-neuf": "Comme neuf",
  bon: "Bon état",
  moyen: "État moyen",
  "a-reparer": "À réparer",
};

// ============= Label helpers =============
export function getOpportunityLabel(score: number): OpportunityLabel {
  if (score >= 75) return "excellent";
  if (score >= 55) return "good";
  if (score >= 35) return "average";
  return "poor";
}

export function getOpportunityLabelFr(label: OpportunityLabel): string {
  const map: Record<OpportunityLabel, string> = {
    excellent: "Excellente",
    good: "Bonne",
    average: "Moyenne",
    poor: "Faible",
  };
  return map[label];
}

export function getConfidenceLabelFr(level: ConfidenceLevel): string {
  const map: Record<ConfidenceLevel, string> = {
    high: "Élevée",
    medium: "Moyenne",
    low: "Faible",
  };
  return map[level];
}

export function getDecisionLabelFr(action: DecisionAction): string {
  const map: Record<DecisionAction, string> = {
    buy: "Acheter",
    negotiate: "Négocier",
    wait: "Attendre",
    pass: "Passer",
  };
  return map[action];
}

export function getTimingLabelFr(status: TimingStatus): string {
  const map: Record<TimingStatus, string> = {
    favorable: "Bon moment",
    neutral: "Neutre",
    unfavorable: "À éviter",
  };
  return map[status];
}

export function getSaturationLabelFr(level: SaturationLevel): string {
  const map: Record<SaturationLevel, string> = {
    low: "Faible",
    moderate: "Modérée",
    saturated: "Saturé",
  };
  return map[level];
}

export function getRiskLabelFr(type: RiskType): string {
  const map: Record<RiskType, string> = {
    saturated_market: "Marché saturé",
    price_drop: "Baisse de prix",
    low_liquidity: "Faible liquidité",
    high_competition: "Forte concurrence",
    unstable_trend: "Tendance instable",
    overpriced: "Prix trop élevé",
  };
  return map[type];
}
