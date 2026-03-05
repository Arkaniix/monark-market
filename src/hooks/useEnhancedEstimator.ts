// Hook for enhanced estimator — calls real API in production, mock in dev only
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataProviderStatus } from "@/providers/DataContext";
import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useEntitlements } from "@/hooks/useEntitlements";
import { generateEnhancedEstimation, generateEstimatorStats } from "@/lib/estimatorEnhancedMock";
import type {
  EnhancedEstimationRequest,
  EnhancedEstimationResult,
  EstimationOptions,
  EnhancedEstimationHistoryItem,
  MarketDataEnhanced,
  ConfidenceAssessment,
  OpportunityScoreDetails,
  DecisionRecommendation,
  ActionablePrices,
  NegotiationData,
  PlatformsData,
  ScenariosData,
  WhatIfData,
  ListingRecommendation,
  ScoreComponent,
} from "@/types/estimator";
import { getOpportunityLabel } from "@/types/estimator";
import type { PlanType } from "@/hooks/useEntitlements";
import { MARKETPLACE_PLATFORMS } from "@/lib/platforms";

// Default options
export const DEFAULT_ESTIMATION_OPTIONS: EstimationOptions = {
  withoutPlatform: false,
  withoutCondition: false,
};

// ============= API Response Types =============
interface LensScoreResponse {
  component_id: number;
  component_name: string;
  asking_price: number;
  score: number; // 0-10
  verdict: string;
  verdict_label: string;
  market_median: number | null;
  gap_percent: number | null;
  gap_direction: string;
  confidence: number; // 0-1
  data_points_30d: number;
  // Optional fields from /lens/quick
  price_p25?: number | null;
  price_p75?: number | null;
  var_30d_pct?: number | null;
  var_90d_pct?: number | null;
  trend?: string | null;
  median_days_to_sell?: number | null;
}

// ============= Insufficient data threshold =============
const MIN_DATA_POINTS = 5;

// ============= Build result from real API data =============
function buildResultFromApi(
  apiData: LensScoreResponse,
  params: {
    modelId: number;
    modelName: string;
    brand?: string;
    category?: string;
    adPrice: number;
    condition?: string;
    platform?: string;
    options: EstimationOptions;
  },
  plan: PlanType,
): EnhancedEstimationResult {
  const median = apiData.market_median ?? 0;
  const hasData = apiData.data_points_30d >= MIN_DATA_POINTS && median > 0;
  const score100 = Math.min(100, Math.max(0, Math.round(apiData.score * 10)));
  const gapPct = apiData.gap_percent ?? 0;
  const conf = apiData.confidence ?? 0;

  // P25/P75 — use API values if available, else derive from median
  const p25 = apiData.price_p25 ?? (hasData ? Math.round(median * 0.88) : 0);
  const p75 = apiData.price_p75 ?? (hasData ? Math.round(median * 1.12) : 0);

  // Confidence
  const confLevel = conf >= 0.8 ? "high" : conf >= 0.5 ? "medium" : "low";
  const confidence: ConfidenceAssessment = {
    level: confLevel as "high" | "medium" | "low",
    factors: buildConfidenceFactors(apiData, params.options),
    reduction_reason: confLevel !== "high" ? "Confiance réduite par le volume ou la volatilité des données" : undefined,
  };

  // Opportunity
  const opportunityLabel = getOpportunityLabel(score100);
  const components: ScoreComponent[] = hasData ? [
    {
      id: "price",
      label: "Prix vs Marché",
      value: Math.min(100, Math.max(0, Math.round(50 + gapPct * -3))),
      weight: 0.35,
      description: gapPct < 0 ? `${Math.abs(Math.round(gapPct))}% sous le marché` : `${Math.round(gapPct)}% au-dessus du marché`,
    },
  ] : [];

  const opportunity: OpportunityScoreDetails = {
    score: score100,
    label: opportunityLabel,
    components: plan === "pro" ? components : [],
  };

  // Trend
  const trend = (apiData.trend === "up" || apiData.trend === "down") ? apiData.trend : "stable";

  // Market data
  const market: MarketDataEnhanced = {
    median_price: Math.round(median),
    price_p25: Math.round(p25),
    price_p75: Math.round(p75),
    var_30d_pct: apiData.var_30d_pct != null ? Math.round(apiData.var_30d_pct * 10) / 10 : 0,
    var_90d_pct: apiData.var_90d_pct != null ? Math.round(apiData.var_90d_pct * 10) / 10 : undefined,
    volume_active: apiData.data_points_30d,
    new_listings_7d: 0, // Not available from API
    volatility: "medium",
    iqr: Math.round(p75 - p25),
    trend: trend as "up" | "down" | "stable",
    rarity_index: 0,
    last_update: new Date().toISOString(),
    data_points: apiData.data_points_30d,
  };

  // Tags
  const tags: string[] = [];
  if (hasData) {
    tags.push(apiData.verdict_label || mapVerdict(apiData.verdict));
    if (gapPct < -10) tags.push("Sous le marché");
    else if (gapPct > 10) tags.push("Au-dessus du marché");
    if (apiData.data_points_30d > 30) tags.push("Données fiables");
    else if (apiData.data_points_30d < 10) tags.push("Données limitées");
  } else {
    tags.push("Données insuffisantes");
  }

  // Decision
  const decision = hasData ? buildDecision(params.adPrice, median, p25, score100, trend, gapPct) : {
    action: "wait" as const,
    label: "Données insuffisantes",
    reasons: ["Pas assez de données marché pour une recommandation fiable"],
    main_risk: { type: "low_liquidity" as const, description: "Volume de données trop faible" },
    target_profile: { label: "—", description: "Enrichissez la base avec l'extension Monark Lens" },
  };

  // Actionable prices — only if sufficient data
  const actionablePrices: ActionablePrices = hasData ? {
    buy_ceiling: Math.round(p25 * 0.95),
    sell_target: Math.round(median * 1.02),
    sell_floor: Math.round(p25),
    margin_euro: Math.round(median * 1.02) - Math.round(p25 * 0.95),
    margin_pct: Math.round(((median * 1.02 - p25 * 0.95) / (p25 * 0.95)) * 100),
  } : {
    buy_ceiling: 0,
    sell_target: 0,
    sell_floor: 0,
    margin_euro: 0,
    margin_pct: 0,
  };

  // Negotiation — derived from median
  const negotiation: NegotiationData | undefined = hasData ? {
    buy: {
      first_offer: Math.round(median * 0.75),
      compromise: Math.round(median * 0.85),
      max_offer: Math.round(median * 0.90),
    },
    sell: {
      floor: Math.round(p25),
      listing_price: Math.round(median),
      premium: Math.round(p75),
    },
    tip: gapPct < -10
      ? "Le prix est déjà attractif, une légère négociation peut suffire."
      : "Utilisez la médiane du marché comme argument principal.",
    arguments: [
      `La médiane du marché est à ${Math.round(median)}€`,
      apiData.data_points_30d > 20 ? `Basé sur ${apiData.data_points_30d} annonces récentes` : "Volume de données limité",
      gapPct > 0 ? `Le prix est ${Math.round(gapPct)}% au-dessus du marché` : `Le prix est ${Math.abs(Math.round(gapPct))}% sous le marché`,
    ],
  } : undefined;

  // Scenarios — derived from median, only if sufficient data
  const scenarios: ScenariosData | undefined = hasData ? {
    scenarios: [
      {
        id: "quick",
        label: "Vente rapide",
        price: Math.round(p25),
        margin_euro: Math.round(p25) - params.adPrice,
        margin_pct: Math.round(((p25 - params.adPrice) / params.adPrice) * 100),
        days_estimate: { min: 3, max: 7 },
        probability_pct: 85,
        immobilization_days: 5,
      },
      {
        id: "optimal",
        label: "Vente optimale",
        price: Math.round(median),
        margin_euro: Math.round(median) - params.adPrice,
        margin_pct: Math.round(((median - params.adPrice) / params.adPrice) * 100),
        days_estimate: { min: 7, max: 21 },
        probability_pct: 65,
        immobilization_days: 14,
      },
      {
        id: "long",
        label: "Vente patiente",
        price: Math.round(p75),
        margin_euro: Math.round(p75) - params.adPrice,
        margin_pct: Math.round(((p75 - params.adPrice) / params.adPrice) * 100),
        days_estimate: { min: 21, max: 45 },
        probability_pct: 40,
        immobilization_days: 30,
      },
    ],
    timing: {
      status: trend === "up" ? "favorable" : trend === "down" ? "unfavorable" : "neutral",
      label: trend === "up" ? "Bon moment" : trend === "down" ? "À éviter" : "Neutre",
      justification: trend === "up"
        ? "Tendance haussière — les prix montent"
        : trend === "down"
        ? "Tendance baissière — risque de perte de valeur"
        : "Marché stable — pas de signal fort",
    },
    saturation: {
      level: apiData.data_points_30d > 100 ? "saturated" : apiData.data_points_30d > 30 ? "moderate" : "low",
      label: apiData.data_points_30d > 100 ? "Saturé" : apiData.data_points_30d > 30 ? "Modéré" : "Faible",
      justification: `${apiData.data_points_30d} annonces observées sur 30 jours`,
    },
  } : undefined;

  // Platforms — theoretical, based on median
  const platforms: PlatformsData | undefined = hasData ? buildPlatforms(median, params.platform) : undefined;

  // What-if
  const what_if: WhatIfData | undefined = hasData ? {
    presets: [
      { label: "-20%", price: Math.round(params.adPrice * 0.8), relative_pct: -20 },
      { label: "-10%", price: Math.round(params.adPrice * 0.9), relative_pct: -10 },
      { label: "Prix actuel", price: params.adPrice, relative_pct: 0 },
      { label: "+10%", price: Math.round(params.adPrice * 1.1), relative_pct: 10 },
    ],
    slider_min: Math.round(params.adPrice * 0.5),
    slider_max: Math.round(params.adPrice * 1.5),
  } : undefined;

  // Listing reco
  const listing_reco: ListingRecommendation | undefined = hasData ? {
    listing_price: Math.round(median),
    accept_down_to: Math.round(p25),
    keywords: [params.modelName, params.category || "", params.brand || ""].filter(Boolean),
    tips: [
      "Mentionnez l'état exact et les accessoires inclus",
      `Prix de vente suggéré : ${Math.round(median)}€ (médiane marché)`,
    ],
  } : undefined;

  // Hypotheses
  const hypotheses = buildHypotheses(params.options);

  return {
    inputs: {
      model_id: params.modelId,
      model_name: apiData.component_name || params.modelName,
      brand: params.brand,
      category: params.category || "",
      ad_price: params.adPrice,
      condition: params.condition,
      platform: params.platform,
      options: params.options,
    },
    meta: {
      plan,
      plan_at_creation: plan,
      created_at: new Date().toISOString(),
      credit_cost: 0,
    },
    opportunity,
    confidence,
    hypotheses,
    tags,
    market,
    decision,
    actionable_prices: actionablePrices,
    negotiation: negotiation || {
      buy: { first_offer: 0, compromise: 0, max_offer: 0 },
      sell: { floor: 0, listing_price: 0, premium: 0 },
      tip: "",
      arguments: [],
    },
    charts: {
      price: { series_30d: [], series_90d: [] },
      volume: { series_30d: [] },
    },
    platforms: platforms || { platforms: [], recommended: {} as any },
    scenarios,
    what_if,
    listing_reco,
    // Custom flag: signals whether data is sufficient
    _hasInsufficientData: !hasData,
  } as EnhancedEstimationResult & { _hasInsufficientData?: boolean };
}

// ============= Helpers =============

function mapVerdict(verdict: string): string {
  const map: Record<string, string> = {
    bonne_affaire: "Bonne affaire",
    good_deal: "Bonne affaire",
    fair: "Prix correct",
    overpriced: "Trop cher",
    insufficient_data: "Données insuffisantes",
  };
  return map[verdict] || verdict || "—";
}

function buildConfidenceFactors(api: LensScoreResponse, options: EstimationOptions) {
  const factors: ConfidenceAssessment["factors"] = [];

  if (api.data_points_30d >= 30) {
    factors.push({ factor: "volume", impact: "positive", description: `${api.data_points_30d} annonces — données fiables` });
  } else if (api.data_points_30d >= MIN_DATA_POINTS) {
    factors.push({ factor: "volume", impact: "positive", description: `${api.data_points_30d} annonces — volume correct` });
  } else {
    factors.push({ factor: "volume", impact: "negative", description: `Seulement ${api.data_points_30d} annonces — données limitées` });
  }

  if (options.withoutPlatform) {
    factors.push({ factor: "platform", impact: "negative", description: "Plateforme inconnue — pas d'ajustement spécifique" });
  }
  if (options.withoutCondition) {
    factors.push({ factor: "condition", impact: "negative", description: "État inconnu — fourchettes élargies" });
  }

  return factors;
}

function buildHypotheses(options: EstimationOptions) {
  const hypotheses: Array<{ field: "platform" | "condition"; assumption: string; impact_on_confidence: "minor" | "moderate" | "major" }> = [];
  if (options.withoutPlatform) {
    hypotheses.push({ field: "platform", assumption: "Données agrégées multi-plateformes", impact_on_confidence: "minor" });
  }
  if (options.withoutCondition) {
    hypotheses.push({ field: "condition", assumption: "Fourchette basée sur états standards (Bon/Très bon)", impact_on_confidence: "moderate" });
  }
  return hypotheses;
}

function buildDecision(
  adPrice: number, median: number, p25: number, score: number, trend: string, gapPct: number
): DecisionRecommendation {
  let action: "buy" | "negotiate" | "wait" | "pass";
  let reasons: string[];

  if (score >= 70 && gapPct < -5) {
    action = "buy";
    reasons = [
      `Prix ${Math.abs(Math.round(gapPct))}% sous la médiane du marché`,
      "Bon potentiel de marge à la revente",
      trend !== "down" ? "Tendance stable ou positive" : "Négocier pour anticiper la baisse",
    ];
  } else if (score >= 50 || (gapPct > -5 && gapPct <= 5)) {
    action = "negotiate";
    reasons = [
      `Prix proche du marché (${Math.round(gapPct)}%)`,
      "Marge de négociation possible",
      `Viser un achat autour de ${Math.round(p25)}€`,
    ];
  } else if (score >= 30) {
    action = "wait";
    reasons = [
      `Prix ${Math.round(Math.abs(gapPct))}% au-dessus du marché`,
      "Attendre une baisse ou une meilleure offre",
      trend === "down" ? "Tendance baissière — les prix devraient baisser" : "Surveiller les nouvelles annonces",
    ];
  } else {
    action = "pass";
    reasons = [
      `Prix trop élevé (${Math.round(Math.abs(gapPct))}% au-dessus)`,
      "Marge négative probable",
      "Rechercher une alternative moins chère",
    ];
  }

  const labelMap = { buy: "Acheter", negotiate: "Négocier", wait: "Attendre", pass: "Passer" };

  return {
    action,
    label: labelMap[action],
    reasons,
    main_risk: {
      type: gapPct > 10 ? "overpriced" : trend === "down" ? "price_drop" : "high_competition",
      description: gapPct > 10 ? "Prix vendeur trop élevé" : trend === "down" ? "Tendance baissière" : "Marché concurrentiel",
    },
    target_profile: score >= 60
      ? { label: "Acheteur régulier", description: "Stock rotation rapide" }
      : score >= 40
      ? { label: "Acheteur patient", description: "Peut attendre la bonne opportunité" }
      : { label: "Non recommandé", description: "À éviter pour ce profil" },
  };
}

function buildPlatforms(median: number, sourcePlatform?: string): PlatformsData {
  const configs: Record<string, { label: string; multiplier: number; days: number; prob: number }> = {
    leboncoin: { label: "Leboncoin", multiplier: 1.0, days: 14, prob: 75 },
    ebay: { label: "eBay", multiplier: 1.05, days: 10, prob: 70 },
    facebook: { label: "Facebook", multiplier: 0.95, days: 12, prob: 65 },
    vinted: { label: "Vinted", multiplier: 0.98, days: 8, prob: 80 },
  };

  const platforms = Object.entries(configs).map(([key, cfg]) => ({
    platform: key,
    platform_label: cfg.label,
    importance: key === "leboncoin" ? 5 : key === "vinted" ? 4 : 3,
    recommended_price: Math.round(median * cfg.multiplier),
    sale_probability: cfg.prob,
    avg_days_to_sell: cfg.days,
    reason: `Prix suggéré basé sur la médiane marché (${Math.round(median)}€)`,
    constraints: [],
    is_recommended: key === "leboncoin",
  }));

  const recommended = platforms.find(p => p.is_recommended) || platforms[0];

  return {
    platforms,
    recommended,
    source_platform_note: sourcePlatform ? `Annonce originale sur ${sourcePlatform}` : undefined,
  };
}

// ============= Main Hook =============

export function useEnhancedEstimation() {
  const { plan } = useEntitlements();
  const { isMockMode } = useDataProviderStatus();
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<(EnhancedEstimationResult & { _hasInsufficientData?: boolean }) | null>(null);

  const mutation = useMutation({
    mutationFn: async (params: {
      modelId: number;
      modelName: string;
      brand?: string;
      category?: string;
      adPrice: number;
      condition?: string;
      platform?: string;
      options: EstimationOptions;
    }): Promise<EnhancedEstimationResult & { _hasInsufficientData?: boolean }> => {
      // === MOCK MODE (dev only) ===
      if (isMockMode) {
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        const request: EnhancedEstimationRequest = {
          model_id: params.modelId,
          ad_price: params.adPrice,
          condition: params.options.withoutCondition ? undefined : params.condition,
          platform: params.options.withoutPlatform ? undefined : params.platform,
          options: params.options,
        };
        return { ...generateEnhancedEstimation(request, params.modelName, plan), _hasInsufficientData: false };
      }

      // === API MODE (production) ===
      const query = new URLSearchParams({
        component_id: params.modelId.toString(),
        price: params.adPrice.toString(),
      });
      if (params.condition) query.set("condition", params.condition);
      if (params.options.withoutCondition) query.set("has_warranty", "false");

      const apiData = await apiFetch<LensScoreResponse>(
        `${ENDPOINTS.LENS.SCORE}?${query.toString()}`,
        { auth: false },
      );

      return buildResultFromApi(apiData, params, plan);
    },
    onSuccess: (result) => {
      setLastResult(result);
      saveToEnhancedHistory(result);
      queryClient.invalidateQueries({ queryKey: ['estimation-history-enhanced'] });
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    },
  });

  return {
    runEstimation: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    result: lastResult,
    reset: () => setLastResult(null),
  };
}

// ============= History =============

function saveToEnhancedHistory(result: EnhancedEstimationResult) {
  const storageKey = 'enhanced_estimation_history';
  const stored = localStorage.getItem(storageKey);
  let items: EnhancedEstimationHistoryItem[] = [];
  if (stored) {
    try { items = JSON.parse(stored); } catch { items = []; }
  }

  const historyItem: EnhancedEstimationHistoryItem = {
    id: `est_${Date.now()}`,
    created_at: new Date().toISOString(),
    model_id: result.inputs.model_id,
    model_name: result.inputs.model_name,
    brand: result.inputs.brand,
    category: result.inputs.category,
    condition: result.inputs.condition,
    platform: result.inputs.platform,
    ad_price: result.inputs.ad_price,
    plan_at_creation: result.meta.plan_at_creation,
    options: result.inputs.options,
    results: result,
  };

  items.unshift(historyItem);
  items = items.slice(0, 50);
  localStorage.setItem(storageKey, JSON.stringify(items));
}

export function useEnhancedEstimatorStats() {
  const { isMockMode } = useDataProviderStatus();

  return useQuery({
    queryKey: ['estimator-stats-enhanced'],
    queryFn: async () => {
      if (isMockMode) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return generateEstimatorStats();
      }
      // In API mode, stats are not critical — return empty defaults
      return { total_runs: 0, runs_this_month: 0, distinct_models: 0, favorite_category: null };
    },
    staleTime: 300000,
  });
}

export function useEnhancedEstimationHistory(page: number = 1, enabled: boolean = true) {
  return useQuery({
    queryKey: ['estimation-history-enhanced', page],
    queryFn: async (): Promise<{
      items: EnhancedEstimationHistoryItem[];
      total: number;
      page: number;
      page_size: number;
    }> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const storageKey = 'enhanced_estimation_history';
      const stored = localStorage.getItem(storageKey);
      let items: EnhancedEstimationHistoryItem[] = [];
      if (stored) {
        try { items = JSON.parse(stored); } catch { items = []; }
      }
      const pageSize = 10;
      return {
        items: items.slice((page - 1) * pageSize, page * pageSize),
        total: items.length,
        page,
        page_size: pageSize,
      };
    },
    enabled,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useClearEstimationHistory() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    localStorage.removeItem('enhanced_estimation_history');
    queryClient.invalidateQueries({ queryKey: ['estimation-history-enhanced'] });
  }, [queryClient]);
}

// Re-export types
export type { EnhancedEstimationResult, EnhancedEstimationRequest, EstimationOptions };
