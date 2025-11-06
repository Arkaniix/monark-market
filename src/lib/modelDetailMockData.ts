// Mock data for Model Detail page

export interface ModelKPI {
  median_30d: number;
  var_30d_pct: number;
  volume_active: number;
  rarity_index: number;
  last_scan_at: string;
  confidence: number;
}

export interface ModelInfo {
  model_id: number;
  name: string;
  category: string;
  brand: string;
  family: string;
  generation: string;
  is_popular: boolean;
  kpi: ModelKPI;
}

export interface PricePoint {
  date: string;
  median: number;
  p25: number;
  p75: number;
}

export interface VolumePoint {
  date: string;
  count: number;
  new: number;
  removed: number;
}

export interface HistogramBucket {
  bucket: number;
  count: number;
}

export interface ModelSeries {
  price_median: PricePoint[];
  volume: VolumePoint[];
  histogram: HistogramBucket[];
}

export interface RegionStat {
  code: string;
  name: string;
  median: number;
  volume: number;
  var_30d_pct: number;
}

export interface ModelDeal {
  ad_id: string;
  price: number;
  state: "neuf" | "comme_neuf" | "bon" | "à_réparer";
  city: string;
  region: string;
  score: number;
  published_at: string;
  url: string;
  delivery_available?: boolean;
}

export interface ModelSpecs {
  specs_core: Record<string, any>;
  specs_json: Record<string, any>;
  source: string;
}

export interface ModelInsights {
  fair_value_30d: number;
  deal_score_avg: number;
  var_7d_pct: number;
  var_90d_pct: number;
  resell_probability: number;
  advice: string;
}

export interface RelatedModel {
  model_id: number;
  name: string;
  brand: string;
  category: string;
  median_30d: number;
  var_30d_pct: number;
  volume: number;
}

// Generate price history for different periods
function generatePriceHistory(days: number, startPrice: number, trend: number): PricePoint[] {
  const points: PricePoint[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const variation = (Math.random() - 0.5) * 20;
    const median = Math.round(startPrice + (days - i) * trend + variation);
    const p25 = Math.round(median * 0.92);
    const p75 = Math.round(median * 1.08);
    
    points.push({
      date: date.toISOString().split('T')[0],
      median,
      p25,
      p75,
    });
  }
  
  return points;
}

// Generate volume history
function generateVolumeHistory(days: number, avgVolume: number): VolumePoint[] {
  const points: VolumePoint[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const variation = (Math.random() - 0.5) * 50;
    const count = Math.round(avgVolume + variation);
    const newAds = Math.round(count * 0.15);
    const removed = Math.round(count * 0.12);
    
    points.push({
      date: date.toISOString().split('T')[0],
      count,
      new: newAds,
      removed,
    });
  }
  
  return points;
}

// Mock model info (RTX 4060)
export const mockModelInfo: ModelInfo = {
  model_id: 101,
  name: "GeForce RTX 4060",
  category: "GPU",
  brand: "NVIDIA",
  family: "RTX 40",
  generation: "Ada Lovelace",
  is_popular: true,
  kpi: {
    median_30d: 279,
    var_30d_pct: -6.5,
    volume_active: 342,
    rarity_index: 0.35,
    last_scan_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    confidence: 0.9,
  },
};

// Mock series data
export const mockModelSeries: ModelSeries = {
  price_median: generatePriceHistory(90, 305, -0.28),
  volume: generateVolumeHistory(90, 320),
  histogram: [
    { bucket: 200, count: 3 },
    { bucket: 220, count: 7 },
    { bucket: 240, count: 14 },
    { bucket: 260, count: 21 },
    { bucket: 280, count: 29 },
    { bucket: 300, count: 18 },
    { bucket: 320, count: 12 },
    { bucket: 340, count: 5 },
  ],
};

// Mock regional stats
export const mockRegionStats: RegionStat[] = [
  { code: "IDF", name: "Île-de-France", median: 290, volume: 80, var_30d_pct: -7.2 },
  { code: "ARA", name: "Auvergne-Rhône-Alpes", median: 275, volume: 60, var_30d_pct: -4.1 },
  { code: "PACA", name: "Provence-Alpes-Côte d'Azur", median: 282, volume: 45, var_30d_pct: -5.8 },
  { code: "NAQ", name: "Nouvelle-Aquitaine", median: 270, volume: 38, var_30d_pct: -3.5 },
  { code: "OCC", name: "Occitanie", median: 268, volume: 35, var_30d_pct: -6.2 },
  { code: "HDF", name: "Hauts-de-France", median: 285, volume: 28, var_30d_pct: -8.1 },
  { code: "GES", name: "Grand Est", median: 278, volume: 24, var_30d_pct: -4.7 },
  { code: "BRE", name: "Bretagne", median: 272, volume: 18, var_30d_pct: -5.3 },
  { code: "PDL", name: "Pays de la Loire", median: 276, volume: 14, var_30d_pct: -6.8 },
];

// Mock deals
export const mockDeals: ModelDeal[] = [
  {
    ad_id: "LBC-3084970823",
    price: 250,
    state: "bon",
    city: "Lyon",
    region: "ARA",
    score: 88,
    published_at: "2025-11-01T15:30:00Z",
    url: "https://example.com",
    delivery_available: true,
  },
  {
    ad_id: "LBC-3084971234",
    price: 259,
    state: "comme_neuf",
    city: "Paris",
    region: "IDF",
    score: 83,
    published_at: "2025-11-02T10:10:00Z",
    url: "https://example.com",
    delivery_available: false,
  },
  {
    ad_id: "LBC-3084972456",
    price: 265,
    state: "bon",
    city: "Marseille",
    region: "PACA",
    score: 81,
    published_at: "2025-11-03T08:45:00Z",
    url: "https://example.com",
    delivery_available: true,
  },
  {
    ad_id: "LBC-3084973789",
    price: 270,
    state: "comme_neuf",
    city: "Toulouse",
    region: "OCC",
    score: 79,
    published_at: "2025-11-03T14:20:00Z",
    url: "https://example.com",
  },
  {
    ad_id: "LBC-3084974012",
    price: 275,
    state: "neuf",
    city: "Bordeaux",
    region: "NAQ",
    score: 76,
    published_at: "2025-11-04T11:30:00Z",
    url: "https://example.com",
    delivery_available: true,
  },
];

// Mock specifications
export const mockSpecs: ModelSpecs = {
  specs_core: {
    chip: "AD107",
    vram_gb: 8,
    tdp_w: 115,
    memory_type: "GDDR6",
    bus_width_bit: 128,
    outputs_count: 3,
  },
  specs_json: {
    cuda_cores: 3072,
    base_clock_mhz: 1830,
    boost_clock_mhz: 2460,
    nvenc: "8th gen",
    dlss: "3",
    ray_tracing: "3rd gen",
    pcie: "4.0 x8",
    power_connector: "1x 8-pin",
    dimensions_mm: "244 x 112 x 40",
    cooler: "dual fan",
    recommended_psu_w: 550,
  },
  source: "HardwareDB + TechPowerUp",
};

// Mock insights
export const mockInsights: ModelInsights = {
  fair_value_30d: 281,
  deal_score_avg: 72,
  var_7d_pct: -2.1,
  var_90d_pct: -8.9,
  resell_probability: 0.78,
  advice: "Bon point d'entrée si ≤ 265 € ; tendance baissière légère. Revente attendue 30j : 285 €, marge ~8%.",
};

// Mock related models
export const mockRelatedModels: RelatedModel[] = [
  {
    model_id: 102,
    name: "GeForce RTX 4060 Ti",
    brand: "NVIDIA",
    category: "GPU",
    median_30d: 389,
    var_30d_pct: -4.2,
    volume: 285,
  },
  {
    model_id: 103,
    name: "Radeon RX 7600",
    brand: "AMD",
    category: "GPU",
    median_30d: 269,
    var_30d_pct: -3.8,
    volume: 198,
  },
  {
    model_id: 104,
    name: "GeForce RTX 3060",
    brand: "NVIDIA",
    category: "GPU",
    median_30d: 245,
    var_30d_pct: -9.2,
    volume: 520,
  },
  {
    model_id: 105,
    name: "GeForce RTX 4050",
    brand: "NVIDIA",
    category: "GPU",
    median_30d: 219,
    var_30d_pct: -5.1,
    volume: 167,
  },
];

// Scrap estimation mock
export interface ScrapEstimation {
  estimated_pages: number;
  estimated_duration_min: number;
  expected_new_ads: number;
  expected_updates: number;
}

export function estimateScrap(type: "faible" | "fort", filters?: any): ScrapEstimation {
  if (type === "faible") {
    return {
      estimated_pages: 15,
      estimated_duration_min: 8,
      expected_new_ads: 12,
      expected_updates: 8,
    };
  }
  
  // Fort with filters
  const hasFilters = filters && Object.keys(filters).length > 0;
  return {
    estimated_pages: hasFilters ? 8 : 12,
    estimated_duration_min: hasFilters ? 5 : 7,
    expected_new_ads: hasFilters ? 6 : 10,
    expected_updates: hasFilters ? 4 : 7,
  };
}
