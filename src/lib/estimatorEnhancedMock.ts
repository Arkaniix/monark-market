// ============= Enhanced Estimator Mock Data Generator =============
// Generates realistic estimation results based on inputs

import type {
  EnhancedEstimationResult,
  EnhancedEstimationRequest,
  EstimationOptions,
  OpportunityLabel,
  DecisionAction,
  VolatilityLevel,
  ConfidenceLevel,
  RiskType,
  ScoreComponent,
  MarketDataEnhanced,
  ConfidenceAssessment,
  Hypothesis,
  DecisionRecommendation,
  ActionablePrices,
  PriceRangeByCondition,
  NegotiationData,
  PriceChartData,
  VolumeChartData,
  ChartDataPoint,
  ResaleScenario,
  ScenariosData,
  PlatformAnalysis,
  PlatformsData,
  WhatIfData,
  ListingRecommendation,
} from "@/types/estimator";
import { CONDITION_OPTIONS, getOpportunityLabel } from "@/types/estimator";
import type { PlanType } from "@/hooks/useEntitlements";
import { MARKETPLACE_PLATFORMS } from "@/lib/platforms";

// ============= Seed-based Random =============
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ============= Mock Model Database =============
interface MockModelData {
  id: number;
  name: string;
  brand: string;
  category: string;
  base_price: number;
  volatility: VolatilityLevel;
  liquidity: number; // 0-100
  trend: "up" | "down" | "stable";
}

const MOCK_MODELS: MockModelData[] = [
  { id: 1, name: "RTX 4090", brand: "NVIDIA", category: "GPU", base_price: 1600, volatility: "medium", liquidity: 85, trend: "stable" },
  { id: 2, name: "RTX 4080", brand: "NVIDIA", category: "GPU", base_price: 950, volatility: "medium", liquidity: 80, trend: "down" },
  { id: 3, name: "RTX 4070 Ti", brand: "NVIDIA", category: "GPU", base_price: 680, volatility: "low", liquidity: 90, trend: "stable" },
  { id: 4, name: "RTX 3080", brand: "NVIDIA", category: "GPU", base_price: 450, volatility: "high", liquidity: 75, trend: "down" },
  { id: 5, name: "RTX 3070", brand: "NVIDIA", category: "GPU", base_price: 320, volatility: "medium", liquidity: 85, trend: "stable" },
  { id: 6, name: "RX 7900 XTX", brand: "AMD", category: "GPU", base_price: 850, volatility: "high", liquidity: 65, trend: "down" },
  { id: 7, name: "RX 7800 XT", brand: "AMD", category: "GPU", base_price: 450, volatility: "low", liquidity: 75, trend: "stable" },
  { id: 8, name: "Ryzen 9 7950X", brand: "AMD", category: "CPU", base_price: 480, volatility: "medium", liquidity: 70, trend: "down" },
  { id: 9, name: "Ryzen 7 7800X3D", brand: "AMD", category: "CPU", base_price: 380, volatility: "low", liquidity: 95, trend: "up" },
  { id: 10, name: "Core i9-14900K", brand: "Intel", category: "CPU", base_price: 520, volatility: "medium", liquidity: 60, trend: "stable" },
  { id: 11, name: "Core i7-14700K", brand: "Intel", category: "CPU", base_price: 350, volatility: "low", liquidity: 80, trend: "stable" },
  { id: 12, name: "DDR5 32GB Kit", brand: "Corsair", category: "RAM", base_price: 120, volatility: "low", liquidity: 90, trend: "down" },
  { id: 13, name: "Samsung 990 Pro 2TB", brand: "Samsung", category: "SSD", base_price: 180, volatility: "low", liquidity: 85, trend: "down" },
  { id: 14, name: "WD Black SN850X 1TB", brand: "WD", category: "SSD", base_price: 95, volatility: "low", liquidity: 90, trend: "stable" },
];

// ============= Platform Multipliers =============
const PLATFORM_CONFIG: Record<string, { multiplier: number; days_base: number; probability_base: number; reason: string; constraints: string[] }> = {
  leboncoin: { multiplier: 1.0, days_base: 14, probability_base: 75, reason: "Audience large, négociation courante", constraints: ["Négociation fréquente", "Rencontre en main propre recommandée"] },
  ebay: { multiplier: 1.05, days_base: 10, probability_base: 70, reason: "Acheteurs internationaux, enchères possibles", constraints: ["Frais ~10%", "Expédition requise"] },
  ldlc: { multiplier: 0.85, days_base: 7, probability_base: 90, reason: "Reprise rapide, mais prix bas", constraints: ["Prix reprise ~15% sous marché", "Paiement rapide"] },
  facebook: { multiplier: 0.95, days_base: 12, probability_base: 65, reason: "Local, pas de frais", constraints: ["Audience variable", "Vérification acheteur difficile"] },
  vinted: { multiplier: 0.98, days_base: 8, probability_base: 80, reason: "Protection acheteur, expédition facile", constraints: ["Frais vendeur ~5%", "Public généraliste"] },
};

// ============= Main Generator =============
export function generateEnhancedEstimation(
  request: EnhancedEstimationRequest,
  modelName: string,
  plan: PlanType
): EnhancedEstimationResult {
  const seed = request.model_id + request.ad_price + (request.condition?.length || 0);
  const rng = seededRandom(seed);
  
  // Find model data or generate defaults
  const modelData = MOCK_MODELS.find(m => m.id === request.model_id) || {
    id: request.model_id,
    name: modelName,
    brand: "Unknown",
    category: "GPU",
    base_price: request.ad_price * 1.1,
    volatility: "medium" as VolatilityLevel,
    liquidity: 70,
    trend: "stable" as const,
  };

  // === Calculate base market data ===
  const marketMedian = modelData.base_price * (0.95 + rng() * 0.1);
  const iqr = marketMedian * (0.08 + rng() * 0.12);
  const priceP25 = marketMedian - iqr / 2;
  const priceP75 = marketMedian + iqr / 2;
  const volumeActive = Math.round(50 + rng() * 250);
  const newListings7d = Math.round(volumeActive * (0.1 + rng() * 0.15));
  const var30dPct = (rng() - 0.5) * 20; // -10% to +10%
  const var90dPct = var30dPct * (1.5 + rng() * 0.5);

  // === Calculate confidence ===
  const { confidence, hypotheses } = calculateConfidence(request.options, volumeActive, modelData.volatility, rng);

  // === Calculate opportunity score ===
  const { opportunity, components } = calculateOpportunityScore(
    request.ad_price,
    marketMedian,
    modelData,
    var30dPct,
    volumeActive,
    rng,
    plan
  );

  // === Calculate decision ===
  const decision = calculateDecision(
    request.ad_price,
    marketMedian,
    priceP25,
    modelData,
    opportunity.score,
    rng
  );

  // === Calculate actionable prices ===
  const actionablePrices = calculateActionablePrices(
    marketMedian,
    priceP25,
    priceP75,
    request.condition,
    request.options.withoutCondition
  );

  // === Calculate negotiation ===
  const negotiation = calculateNegotiation(
    request.ad_price,
    actionablePrices.buy_ceiling,
    actionablePrices.sell_target,
    request.options.withoutCondition
  );

  // === Generate charts ===
  const charts = generateCharts(marketMedian, var30dPct, volumeActive, rng);

  // === Generate platforms analysis ===
  const platforms = generatePlatformsAnalysis(
    actionablePrices.sell_target,
    modelData.category,
    request.platform,
    plan,
    rng
  );

  // === Generate tags ===
  const tags = generateTags(modelData, decision, confidence, opportunity.score);

  // === Market data ===
  const market: MarketDataEnhanced = {
    median_price: Math.round(marketMedian),
    price_p25: Math.round(priceP25),
    price_p75: Math.round(priceP75),
    var_30d_pct: Math.round(var30dPct * 10) / 10,
    var_90d_pct: Math.round(var90dPct * 10) / 10,
    volume_active: volumeActive,
    new_listings_7d: newListings7d,
    volatility: modelData.volatility,
    iqr: Math.round(iqr),
    trend: modelData.trend,
    rarity_index: Math.round((100 - modelData.liquidity) * (0.8 + rng() * 0.4)),
    last_update: new Date().toISOString(),
    data_points: Math.round(200 + rng() * 500),
  };

  // === Build result ===
  const result: EnhancedEstimationResult = {
    inputs: {
      model_id: request.model_id,
      model_name: modelName,
      brand: modelData.brand,
      category: modelData.category,
      ad_price: request.ad_price,
      condition: request.condition,
      platform: request.platform,
      options: request.options,
    },
    meta: {
      plan,
      plan_at_creation: plan,
      created_at: new Date().toISOString(),
      credit_cost: 3,
    },
    opportunity,
    confidence,
    hypotheses,
    tags,
    market,
    decision,
    actionable_prices: actionablePrices,
    negotiation,
    charts,
    platforms,
  };

  // === Elite-only features ===
  if (plan === "elite") {
    result.scenarios = generateScenarios(actionablePrices, modelData, rng);
    result.what_if = generateWhatIf(request.ad_price, marketMedian, actionablePrices);
    result.listing_reco = generateListingReco(actionablePrices, modelName, modelData.category);
  }

  return result;
}

// ============= Helper Functions =============

function calculateConfidence(
  options: EstimationOptions,
  volume: number,
  volatility: VolatilityLevel,
  rng: () => number
): { confidence: ConfidenceAssessment; hypotheses: Hypothesis[] } {
  const factors: ConfidenceAssessment["factors"] = [];
  const hypotheses: Hypothesis[] = [];
  let baseLevel: ConfidenceLevel = "high";

  // Volume impact
  if (volume >= 150) {
    factors.push({ factor: "volume", impact: "positive", description: `${volume} annonces actives - données fiables` });
  } else if (volume >= 50) {
    factors.push({ factor: "volume", impact: "positive", description: `${volume} annonces - volume correct` });
    baseLevel = "medium";
  } else {
    factors.push({ factor: "volume", impact: "negative", description: `Seulement ${volume} annonces - données limitées` });
    baseLevel = "low";
  }

  // Volatility impact
  if (volatility === "high") {
    factors.push({ factor: "volatility", impact: "negative", description: "Prix volatils - prévisions moins stables" });
    if (baseLevel === "high") baseLevel = "medium";
  } else if (volatility === "low") {
    factors.push({ factor: "volatility", impact: "positive", description: "Prix stables - prévisions fiables" });
  }

  // Missing inputs impact
  if (options.withoutPlatform) {
    hypotheses.push({
      field: "platform",
      assumption: "Données agrégées multi-plateformes",
      impact_on_confidence: "minor",
    });
    factors.push({ factor: "platform", impact: "negative", description: "Plateforme inconnue - pas d'ajustement spécifique" });
  }

  if (options.withoutCondition) {
    hypotheses.push({
      field: "condition",
      assumption: "Fourchette basée sur états standards (Bon/Très bon)",
      impact_on_confidence: "moderate",
    });
    factors.push({ factor: "condition", impact: "negative", description: "État inconnu - fourchettes élargies" });
    if (baseLevel === "high") baseLevel = "medium";
    else if (baseLevel === "medium") baseLevel = "low";
  }

  return {
    confidence: {
      level: baseLevel,
      factors,
      reduction_reason: hypotheses.length > 0 ? "Certaines informations manquantes réduisent la précision" : undefined,
    },
    hypotheses,
  };
}

function calculateOpportunityScore(
  adPrice: number,
  marketMedian: number,
  model: MockModelData,
  var30dPct: number,
  volume: number,
  rng: () => number,
  plan: PlanType
): { opportunity: { score: number; label: OpportunityLabel; components: ScoreComponent[] }; components: ScoreComponent[] } {
  
  // Price vs Market (weight 0.35)
  const priceDeviation = (marketMedian - adPrice) / marketMedian * 100;
  const priceScore = Math.min(100, Math.max(0, 50 + priceDeviation * 3));
  
  // Trend (weight 0.20)
  let trendScore = 50;
  if (model.trend === "up") trendScore = 75;
  else if (model.trend === "down") trendScore = 35;
  trendScore += var30dPct * 0.5; // Adjust by actual variation
  trendScore = Math.min(100, Math.max(0, trendScore));
  
  // Liquidity (weight 0.20)
  const liquidityScore = model.liquidity;
  
  // Competition (weight 0.15) - inverse of volume (less = better opportunity)
  const competitionScore = Math.max(0, 100 - (volume / 3));
  
  // Risk (weight 0.10)
  let riskScore = 60;
  if (model.volatility === "low") riskScore = 80;
  else if (model.volatility === "high") riskScore = 40;
  
  const components: ScoreComponent[] = [
    { id: "price", label: "Prix vs Marché", value: Math.round(priceScore), weight: 0.35, description: priceDeviation > 0 ? `${Math.round(priceDeviation)}% sous le marché` : `${Math.round(-priceDeviation)}% au-dessus du marché` },
    { id: "trend", label: "Tendance", value: Math.round(trendScore), weight: 0.20, description: model.trend === "up" ? "Tendance haussière" : model.trend === "down" ? "Tendance baissière" : "Marché stable" },
    { id: "liquidity", label: "Liquidité", value: Math.round(liquidityScore), weight: 0.20, description: liquidityScore > 70 ? "Vente rapide probable" : "Délai de vente moyen" },
    { id: "competition", label: "Concurrence", value: Math.round(competitionScore), weight: 0.15, description: volume < 100 ? "Peu de concurrence" : "Marché concurrentiel" },
    { id: "risk", label: "Risque", value: Math.round(riskScore), weight: 0.10, description: model.volatility === "low" ? "Risque faible" : model.volatility === "high" ? "Risque élevé" : "Risque modéré" },
  ];
  
  const weightedScore = components.reduce((sum, c) => sum + c.value * c.weight, 0);
  const score = Math.round(weightedScore);
  
  return {
    opportunity: {
      score,
      label: getOpportunityLabel(score),
      components: plan === "elite" ? components : [], // Only Elite sees decomposition
    },
    components,
  };
}

function calculateDecision(
  adPrice: number,
  marketMedian: number,
  priceP25: number,
  model: MockModelData,
  opportunityScore: number,
  rng: () => number
): DecisionRecommendation {
  const priceDeviation = (marketMedian - adPrice) / marketMedian * 100;
  
  let action: DecisionAction;
  let reasons: string[] = [];
  let riskType: RiskType;
  let riskDescription: string;
  
  if (opportunityScore >= 70 && priceDeviation > 5) {
    action = "buy";
    reasons = [
      `Prix ${Math.round(priceDeviation)}% sous la médiane du marché`,
      model.liquidity > 70 ? "Bonne liquidité - revente rapide probable" : "Liquidité correcte",
      model.trend !== "down" ? "Tendance stable ou positive" : "Négocier pour anticiper la baisse",
    ];
    riskType = model.volatility === "high" ? "unstable_trend" : "low_liquidity";
    riskDescription = model.volatility === "high" ? "Volatilité élevée - surveiller le marché" : "Prévoir un délai de 2-3 semaines";
  } else if (opportunityScore >= 50 || (priceDeviation > -5 && priceDeviation <= 5)) {
    action = "negotiate";
    reasons = [
      priceDeviation > 0 ? `Prix proche du marché (${Math.round(priceDeviation)}% sous)` : `Prix au niveau du marché`,
      "Marge de négociation possible",
      `Viser un achat autour de ${Math.round(priceP25)}€`,
    ];
    riskType = model.trend === "down" ? "price_drop" : "high_competition";
    riskDescription = model.trend === "down" ? "Tendance baissière - négocier fermement" : "Beaucoup d'annonces similaires";
  } else if (opportunityScore >= 30) {
    action = "wait";
    reasons = [
      `Prix ${Math.round(-priceDeviation)}% au-dessus du marché`,
      "Attendre une baisse de prix ou une meilleure offre",
      model.trend === "down" ? "Tendance baissière - les prix devraient baisser" : "Surveiller les nouvelles annonces",
    ];
    riskType = "overpriced";
    riskDescription = "Prix vendeur trop élevé pour être rentable";
  } else {
    action = "pass";
    reasons = [
      `Prix trop élevé (${Math.round(-priceDeviation)}% au-dessus du marché)`,
      "Marge négative probable",
      "Rechercher une alternative moins chère",
    ];
    riskType = "overpriced";
    riskDescription = "Aucune rentabilité possible à ce prix";
  }
  
  // Target profile
  const targetProfile = opportunityScore >= 60 
    ? { label: "Acheteur régulier", description: "Stock rotation rapide" }
    : opportunityScore >= 40
    ? { label: "Acheteur patient", description: "Peut attendre la bonne opportunité" }
    : { label: "Non recommandé", description: "À éviter pour ce profil" };
  
  return {
    action,
    label: getDecisionLabelFr(action),
    reasons,
    main_risk: { type: riskType, description: riskDescription },
    target_profile: targetProfile,
  };
}

function getDecisionLabelFr(action: DecisionAction): string {
  const map: Record<DecisionAction, string> = {
    buy: "Acheter",
    negotiate: "Négocier",
    wait: "Attendre",
    pass: "Passer",
  };
  return map[action];
}

function calculateActionablePrices(
  marketMedian: number,
  priceP25: number,
  priceP75: number,
  condition?: string,
  withoutCondition?: boolean
): ActionablePrices {
  // Base calculations
  const buyCeiling = Math.round(priceP25 * 0.95);
  const sellTarget = Math.round(marketMedian * 1.02);
  const sellFloor = Math.round(priceP25);
  const marginEuro = sellTarget - buyCeiling;
  const marginPct = Math.round((marginEuro / buyCeiling) * 100);
  
  let rangesByCondition: PriceRangeByCondition[] | undefined;
  
  if (withoutCondition) {
    rangesByCondition = CONDITION_OPTIONS.slice(0, 4).map(opt => {
      const adjBuyCeiling = Math.round(buyCeiling * opt.multiplier);
      const adjSellTarget = Math.round(sellTarget * opt.multiplier);
      const adjSellFloor = Math.round(sellFloor * opt.multiplier);
      const adjMargin = adjSellTarget - adjBuyCeiling;
      return {
        condition: opt.value,
        condition_label: opt.label,
        buy_ceiling: adjBuyCeiling,
        sell_target: adjSellTarget,
        sell_floor: adjSellFloor,
        margin_euro: adjMargin,
        margin_pct: Math.round((adjMargin / adjBuyCeiling) * 100),
      };
    });
  }
  
  return {
    buy_ceiling: buyCeiling,
    sell_target: sellTarget,
    sell_floor: sellFloor,
    margin_euro: marginEuro,
    margin_pct: marginPct,
    ranges_by_condition: rangesByCondition,
  };
}

function calculateNegotiation(
  adPrice: number,
  buyCeiling: number,
  sellTarget: number,
  withoutCondition: boolean
): NegotiationData {
  return {
    buy: {
      first_offer: Math.round(buyCeiling * 0.85),
      compromise: Math.round(buyCeiling * 0.92),
      max_offer: buyCeiling,
    },
    sell: {
      floor: Math.round(sellTarget * 0.92),
      listing_price: Math.round(sellTarget * 1.05),
      premium: Math.round(sellTarget * 1.12),
    },
    tip: withoutCondition 
      ? "Négociez d'abord sur l'état : demandez facture, boîte d'origine, et tests fonctionnels."
      : "Mentionnez le prix du marché et les annonces similaires pour justifier votre offre.",
    arguments: [
      "Prix du marché actuel",
      "Annonces comparables moins chères",
      "État réel vs annoncé",
      "Accessoires manquants",
    ],
  };
}

function generateCharts(
  marketMedian: number,
  var30dPct: number,
  volume: number,
  rng: () => number
): { price: PriceChartData; volume: VolumeChartData } {
  const now = new Date();
  const series30d: ChartDataPoint[] = [];
  const series90d: ChartDataPoint[] = [];
  const volumeSeries: ChartDataPoint[] = [];
  const bandsP25: ChartDataPoint[] = [];
  const bandsP75: ChartDataPoint[] = [];
  
  // Generate 90 days of price data
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    
    // Price with trend and noise
    const trendFactor = 1 + (var30dPct / 100) * ((89 - i) / 89);
    const noise = 1 + (rng() - 0.5) * 0.06;
    const price = Math.round(marketMedian * trendFactor * noise);
    
    const point: ChartDataPoint = { date: dateStr, value: price };
    series90d.push(point);
    if (i < 30) series30d.push(point);
    
    // Bands
    const iqr = marketMedian * 0.1;
    bandsP25.push({ date: dateStr, value: Math.round(price - iqr / 2) });
    bandsP75.push({ date: dateStr, value: Math.round(price + iqr / 2) });
  }
  
  // Generate 30 days of volume data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayVolume = Math.round((volume / 30) * (0.5 + rng()));
    volumeSeries.push({ date: dateStr, value: dayVolume });
  }
  
  return {
    price: {
      series_30d: series30d,
      series_90d: series90d,
      bands: { p25: bandsP25.slice(-30), p75: bandsP75.slice(-30) },
    },
    volume: {
      series_30d: volumeSeries,
    },
  };
}

function generatePlatformsAnalysis(
  sellTarget: number,
  category: string,
  sourcePlatform: string | undefined,
  plan: PlanType,
  rng: () => number
): PlatformsData {
  const platforms: PlatformAnalysis[] = [];
  
  for (const p of MARKETPLACE_PLATFORMS) {
    const config = PLATFORM_CONFIG[p.value] || PLATFORM_CONFIG.leboncoin;
    
    const recommendedPrice = Math.round(sellTarget * config.multiplier);
    const probability = Math.round(config.probability_base + (rng() - 0.5) * 20);
    const daysToSell = Math.round(config.days_base * (0.8 + rng() * 0.4));
    
    // Category adjustments
    let importance = 3;
    if (category === "GPU" && p.value === "leboncoin") importance = 5;
    if (category === "GPU" && p.value === "ebay") importance = 4;
    if (p.value === "ldlc") importance = 2; // Lower margin
    
    const platform: PlatformAnalysis = {
      platform: p.value,
      platform_label: p.label,
      importance,
      recommended_price: recommendedPrice,
      sale_probability: probability,
      avg_days_to_sell: daysToSell,
      is_recommended: false,
    };
    
    // Elite gets extra details
    if (plan === "elite") {
      platform.reason = config.reason;
      platform.constraints = config.constraints;
    }
    
    platforms.push(platform);
  }
  
  // Sort by importance
  platforms.sort((a, b) => b.importance - a.importance);
  
  // Mark recommended
  platforms[0].is_recommended = true;
  
  // Limit for non-elite
  const limitedPlatforms = plan === "elite" ? platforms : platforms.slice(0, 3);
  
  return {
    platforms: limitedPlatforms,
    recommended: platforms[0],
    source_platform_note: sourcePlatform 
      ? undefined 
      : "Plateforme d'achat inconnue : pas d'ajustement spécifique sur le prix d'achat.",
  };
}

function generateScenarios(
  prices: ActionablePrices,
  model: MockModelData,
  rng: () => number
): ScenariosData {
  const scenarios: ResaleScenario[] = [
    {
      id: "quick",
      label: "Vente rapide",
      price: prices.sell_floor,
      margin_euro: prices.sell_floor - prices.buy_ceiling,
      margin_pct: Math.round(((prices.sell_floor - prices.buy_ceiling) / prices.buy_ceiling) * 100),
      days_estimate: { min: 3, max: 7 },
      probability_pct: 85,
      immobilization_days: 5,
    },
    {
      id: "optimal",
      label: "Vente optimale",
      price: prices.sell_target,
      margin_euro: prices.margin_euro,
      margin_pct: prices.margin_pct,
      days_estimate: { min: 10, max: 21 },
      probability_pct: 70,
      immobilization_days: 15,
    },
    {
      id: "long",
      label: "Vente patiente",
      price: Math.round(prices.sell_target * 1.08),
      margin_euro: Math.round(prices.sell_target * 1.08) - prices.buy_ceiling,
      margin_pct: Math.round(((prices.sell_target * 1.08 - prices.buy_ceiling) / prices.buy_ceiling) * 100),
      days_estimate: { min: 21, max: 45 },
      probability_pct: 50,
      immobilization_days: 30,
    },
  ];
  
  const timing: ScenariosData["timing"] = {
    status: model.trend === "up" ? "favorable" : model.trend === "down" ? "unfavorable" : "neutral",
    label: model.trend === "up" ? "Bon moment" : model.trend === "down" ? "À éviter" : "Neutre",
    justification: model.trend === "up" 
      ? "Tendance haussière - les prix pourraient encore monter"
      : model.trend === "down"
      ? "Tendance baissière - risque de dépréciation pendant la revente"
      : "Marché stable - conditions normales",
  };
  
  const saturation: ScenariosData["saturation"] = {
    level: model.liquidity > 80 ? "low" : model.liquidity > 50 ? "moderate" : "saturated",
    label: model.liquidity > 80 ? "Faible" : model.liquidity > 50 ? "Modérée" : "Saturé",
    justification: model.liquidity > 80 
      ? "Peu d'annonces similaires - moins de concurrence"
      : model.liquidity > 50
      ? "Volume d'annonces normal"
      : "Beaucoup d'annonces similaires - concurrence forte",
  };
  
  return { scenarios, timing, saturation };
}

function generateWhatIf(
  adPrice: number,
  marketMedian: number,
  prices: ActionablePrices
): WhatIfData {
  return {
    presets: [
      { label: "-10%", price: Math.round(adPrice * 0.9), relative_pct: -10 },
      { label: "Prix annonce", price: adPrice, relative_pct: 0 },
      { label: "+10%", price: Math.round(adPrice * 1.1), relative_pct: 10 },
    ],
    slider_min: Math.round(adPrice * 0.7),
    slider_max: Math.round(adPrice * 1.3),
  };
}

function generateListingReco(
  prices: ActionablePrices,
  modelName: string,
  category: string
): ListingRecommendation {
  const keywords = [
    modelName.split(" ")[0],
    category,
    "occasion",
    "comme neuf",
    "garanti",
  ].slice(0, 5);
  
  return {
    listing_price: Math.round(prices.sell_target * 1.05),
    accept_down_to: prices.sell_floor,
    keywords,
    tips: [
      "Prenez des photos de qualité avec bon éclairage",
      "Mentionnez les accessoires inclus",
      "Indiquez si facture ou garantie disponible",
      "Répondez rapidement aux messages",
    ],
  };
}

function generateTags(
  model: MockModelData,
  decision: DecisionRecommendation,
  confidence: ConfidenceAssessment,
  score: number
): string[] {
  const tags: string[] = [];
  
  if (model.trend === "up") tags.push("Tendance haussière");
  else if (model.trend === "down") tags.push("Tendance baissière");
  else tags.push("Marché stable");
  
  if (model.liquidity > 80) tags.push("Bonne liquidité");
  else if (model.liquidity < 50) tags.push("Faible liquidité");
  
  if (model.volatility === "low") tags.push("Prix stables");
  else if (model.volatility === "high") tags.push("Volatilité élevée");
  
  if (score >= 70) tags.push("Opportunité");
  else if (score < 30) tags.push("À éviter");
  
  if (confidence.level === "high") tags.push("Données fiables");
  
  return tags.slice(0, 4);
}

// ============= Stats Generator =============
export function generateEstimatorStats(): { last_recalc: string; total_estimations: number } {
  return {
    last_recalc: new Date().toISOString(),
    total_estimations: 15847 + Math.floor(Math.random() * 100),
  };
}
