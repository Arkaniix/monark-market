// Mock data for Estimator page

export interface EstimatorGlobalStats {
  last_recalc: string;
  total_estimations: number;
  data_sources: string[];
}

export interface MarketData {
  median_price: number;
  var_30d_pct: number;
  volume: number;
  rarity_index: number; // 0 = rare, 1 = common
  trend: "up" | "down" | "stable";
}

export interface EstimationResult {
  buy_price: number;
  sell_price_30d: number;
  sell_price_90d: number;
  profit_margin_pct: number;
  resell_probability: number; // 0-1
  risk_level: "low" | "medium" | "high";
  advice: string;
  badge: "good" | "caution" | "risk";
}

export interface ModelEstimation {
  id: number;
  category: string;
  model: string;
  brand: string;
  family?: string;
  state: string;
  region?: string;
  market: MarketData;
  estimate: EstimationResult;
  trend_90d: number[]; // price history
  volume_30d: number[]; // volume history
  tech?: Record<string, any>;
}

export interface EstimationHistoryItem {
  id: string;
  date: string;
  model: string;
  model_id: number;
  brand: string;
  category: string;
  condition: string;
  region?: string;
  buy_price: number;
  results: {
    buy_price_recommended: number;
    sell_price_1m: number;
    sell_price_3m?: number;
    margin_pct: number;
    resell_probability: number;
    risk_level: "low" | "medium" | "high";
    badge: "good" | "caution" | "risk";
    advice: string;
    market: {
      median_price: number;
      var_30d_pct: number;
      volume: number;
      rarity_index: number;
      trend: "up" | "down" | "stable";
    };
  };
  trend: "up" | "down" | "stable";
}

// Global statistics
export const estimatorStats: EstimatorGlobalStats = {
  last_recalc: "il y a 3 h",
  total_estimations: 12480,
  data_sources: ["LeBonCoin", "eBay", "Facebook Marketplace"],
};

// Example model catalog for autocomplete
export const estimatorModels = [
  { id: 1, category: "GPU", brand: "NVIDIA", name: "RTX 3060 Ti", fullName: "NVIDIA RTX 3060 Ti" },
  { id: 2, category: "GPU", brand: "NVIDIA", name: "RTX 4070", fullName: "NVIDIA RTX 4070" },
  { id: 3, category: "GPU", brand: "AMD", name: "RX 6800", fullName: "AMD RX 6800" },
  { id: 4, category: "GPU", brand: "NVIDIA", name: "RTX 3080", fullName: "NVIDIA RTX 3080" },
  { id: 5, category: "GPU", brand: "AMD", name: "RX 7900 XT", fullName: "AMD RX 7900 XT" },
  { id: 6, category: "CPU", brand: "AMD", name: "Ryzen 7 5800X3D", fullName: "AMD Ryzen 7 5800X3D" },
  { id: 7, category: "CPU", brand: "AMD", name: "Ryzen 5 5600X", fullName: "AMD Ryzen 5 5600X" },
  { id: 8, category: "CPU", brand: "Intel", name: "i5-12600K", fullName: "Intel Core i5-12600K" },
  { id: 9, category: "CPU", brand: "Intel", name: "i7-13700K", fullName: "Intel Core i7-13700K" },
  { id: 10, category: "CPU", brand: "AMD", name: "Ryzen 9 7950X", fullName: "AMD Ryzen 9 7950X" },
  { id: 11, category: "RAM", brand: "Corsair", name: "Vengeance 32GB DDR4", fullName: "Corsair Vengeance 32GB DDR4 3200MHz" },
  { id: 12, category: "RAM", brand: "G.Skill", name: "Trident Z 16GB DDR5", fullName: "G.Skill Trident Z 16GB DDR5 6000MHz" },
  { id: 13, category: "SSD", brand: "Samsung", name: "980 Pro 1TB", fullName: "Samsung 980 Pro 1TB NVMe" },
  { id: 14, category: "SSD", brand: "WD", name: "Black SN850X 2TB", fullName: "WD Black SN850X 2TB NVMe" },
  { id: 15, category: "CM", brand: "MSI", name: "B550 Tomahawk", fullName: "MSI B550 Tomahawk ATX" },
];

// Function to generate estimation based on input
export function generateEstimation(
  modelId: number,
  state: string,
  purchasePrice: number,
  region?: string
): ModelEstimation | null {
  const model = estimatorModels.find((m) => m.id === modelId);
  if (!model) return null;

  // Base market data (mocked)
  const baseMedian = modelId <= 5 ? 280 + modelId * 50 : modelId <= 10 ? 180 + modelId * 20 : 90 + modelId * 15;
  
  // State multiplier
  const stateMultipliers: Record<string, number> = {
    neuf: 1.0,
    "comme-neuf": 0.95,
    bon: 0.85,
    "a-reparer": 0.6,
  };
  const stateMultiplier = stateMultipliers[state] || 0.85;

  // Region adjustment (mock)
  const regionAdjustments: Record<string, number> = {
    IDF: 1.05,
    ARA: 0.98,
    PACA: 1.02,
    Occitanie: 0.95,
    "Grand Est": 1.0,
  };
  const regionMultiplier = region ? regionAdjustments[region] || 1.0 : 1.0;

  const adjustedMedian = Math.round(baseMedian * stateMultiplier * regionMultiplier);
  const variance = Math.random() * 0.2 - 0.1; // -10% to +10%
  const var_30d_pct = Math.round(variance * 100) / 10;
  
  const volume = Math.floor(200 + Math.random() * 400);
  const rarity_index = Math.random() * 0.6 + 0.2; // 0.2 to 0.8

  // Trend history (90 days)
  const trend_90d: number[] = [];
  let currentPrice = adjustedMedian * 1.1;
  for (let i = 0; i < 30; i++) {
    trend_90d.push(Math.round(currentPrice));
    currentPrice *= 0.997 + Math.random() * 0.006; // slight downtrend
  }

  // Volume history (30 days)
  const volume_30d: number[] = [];
  let currentVolume = volume * 0.8;
  for (let i = 0; i < 30; i++) {
    volume_30d.push(Math.round(currentVolume + Math.random() * 50 - 25));
    currentVolume += Math.random() * 10 - 5;
  }

  // Calculate buy/sell recommendations
  const safetyMargin = 0.05 + rarity_index * 0.05; // 5-10% margin
  const buyPrice = Math.round(adjustedMedian * (1 - safetyMargin));
  const sellPrice30d = Math.round(adjustedMedian * 1.02);
  const sellPrice90d = Math.round(adjustedMedian * (1 + var_30d_pct / 100));

  const profitMargin = ((sellPrice30d - purchasePrice) / purchasePrice) * 100;
  const resellProbability = Math.min(0.95, Math.max(0.3, (volume / 600) * (1 - rarity_index) * 0.8 + 0.2));

  // Risk assessment
  let riskLevel: "low" | "medium" | "high" = "medium";
  let badge: "good" | "caution" | "risk" = "caution";
  let advice = "";

  if (purchasePrice <= buyPrice) {
    riskLevel = "low";
    badge = "good";
    advice = "Bonne opportunité d'achat – marché stable ou légèrement baissier. Le prix envisagé est inférieur au prix médian ajusté.";
  } else if (purchasePrice <= adjustedMedian) {
    riskLevel = "low";
    badge = "good";
    advice = "Prix correct dans la fourchette recommandée. Vous devriez pouvoir revendre avec une marge raisonnable.";
  } else if (purchasePrice <= adjustedMedian * 1.15) {
    riskLevel = "medium";
    badge = "caution";
    advice = "Prix légèrement élevé. Marge limitée mais l'opération reste viable si le composant est en très bon état.";
  } else {
    riskLevel = "high";
    badge = "risk";
    advice = "Prix trop élevé par rapport au marché actuel. Risque de perte ou de difficulté à revendre. Déconseillé sauf besoin urgent.";
  }

  const trend: "up" | "down" | "stable" = var_30d_pct > 2 ? "up" : var_30d_pct < -2 ? "down" : "stable";

  return {
    id: modelId,
    category: model.category,
    model: model.fullName,
    brand: model.brand,
    state,
    region,
    market: {
      median_price: adjustedMedian,
      var_30d_pct,
      volume,
      rarity_index,
      trend,
    },
    estimate: {
      buy_price: buyPrice,
      sell_price_30d: sellPrice30d,
      sell_price_90d: sellPrice90d,
      profit_margin_pct: Math.round(profitMargin * 10) / 10,
      resell_probability: Math.round(resellProbability * 100) / 100,
      risk_level: riskLevel,
      advice,
      badge,
    },
    trend_90d,
    volume_30d,
  };
}

// Mock history (could be in localStorage)
export const mockEstimationHistory: EstimationHistoryItem[] = [
  {
    id: "1",
    date: "2025-11-05",
    model: "NVIDIA RTX 3060 Ti",
    model_id: 1,
    brand: "NVIDIA",
    category: "GPU",
    condition: "bon",
    buy_price: 260,
    results: {
      buy_price_recommended: 252,
      sell_price_1m: 286,
      sell_price_3m: 290,
      margin_pct: 9.6,
      resell_probability: 0.78,
      risk_level: "low",
      badge: "good",
      advice: "Bonne opportunité d'achat – marché stable ou légèrement baissier.",
      market: {
        median_price: 280,
        var_30d_pct: -2.1,
        volume: 342,
        rarity_index: 0.35,
        trend: "down",
      },
    },
    trend: "down",
  },
  {
    id: "2",
    date: "2025-11-04",
    model: "AMD Ryzen 7 5800X3D",
    model_id: 6,
    brand: "AMD",
    category: "CPU",
    condition: "comme-neuf",
    buy_price: 255,
    results: {
      buy_price_recommended: 243,
      sell_price_1m: 275,
      sell_price_3m: 280,
      margin_pct: 5.9,
      resell_probability: 0.82,
      risk_level: "low",
      badge: "good",
      advice: "Prix correct dans la fourchette recommandée.",
      market: {
        median_price: 270,
        var_30d_pct: 3.5,
        volume: 289,
        rarity_index: 0.42,
        trend: "up",
      },
    },
    trend: "up",
  },
  {
    id: "3",
    date: "2025-11-03",
    model: "Samsung 980 Pro 1TB",
    model_id: 13,
    brand: "Samsung",
    category: "SSD",
    condition: "neuf",
    buy_price: 108,
    results: {
      buy_price_recommended: 103,
      sell_price_1m: 117,
      sell_price_3m: 115,
      margin_pct: 6.5,
      resell_probability: 0.71,
      risk_level: "low",
      badge: "good",
      advice: "Prix correct dans la fourchette recommandée.",
      market: {
        median_price: 115,
        var_30d_pct: 0.8,
        volume: 456,
        rarity_index: 0.55,
        trend: "stable",
      },
    },
    trend: "stable",
  },
];
