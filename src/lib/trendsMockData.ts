// Mock data for Trends page

export interface MarketSummary {
  median_price: number;
  var_30d: number;
  volume_total: number;
  new_models: number;
  offer_demand_ratio: number;
  last_update: string;
}

export interface MarketTrendPoint {
  date: string;
  gpu: number;
  cpu: number;
  ram: number;
  ssd: number;
  cm: number;
  global: number;
}

export interface VolumeTrendPoint {
  date: string;
  total: number;
  gpu: number;
  cpu: number;
  ram: number;
  ssd: number;
  cm: number;
}

export interface TopModel {
  model: string;
  category: string;
  var_30d_pct: number;
  median: number;
  volume: number;
  brand: string;
}

export interface RegionStat {
  region: string;
  code: string;
  median_price: number;
  volume: number;
  var_30d_pct: number;
}

export interface CategoryDetail {
  category: string;
  summary: string;
  var_30d_pct: number;
  median_price: number;
  volume: number;
  trend: "up" | "down" | "stable";
  top_models: TopModel[];
  price_history: Array<{ date: string; price: number }>;
  volume_history: Array<{ date: string; volume: number }>;
}

// Global market summary
export const marketSummary: MarketSummary = {
  median_price: 312,
  var_30d: -3.2,
  volume_total: 18524,
  new_models: 37,
  offer_demand_ratio: 1.27,
  last_update: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

// Generate 90 days of market trends
const generateMarketTrends = (): MarketTrendPoint[] => {
  const trends: MarketTrendPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  for (let i = 0; i <= 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const noise = () => (Math.random() - 0.5) * 20;
    const trend = i / 90;
    
    trends.push({
      date: date.toISOString().split('T')[0],
      gpu: Math.round(420 - trend * 38 + noise()),
      cpu: Math.round(290 - trend * 14 + noise()),
      ram: Math.round(115 + trend * 3 + noise()),
      ssd: Math.round(90 - trend * 1 + noise()),
      cm: Math.round(145 - trend * 8 + noise()),
      global: Math.round(320 - trend * 8 + noise()),
    });
  }
  
  return trends;
};

export const marketTrends = generateMarketTrends();

// Generate volume trends
const generateVolumeTrends = (): VolumeTrendPoint[] => {
  const trends: VolumeTrendPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  for (let i = 0; i <= 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const growth = 1 + (i / 90) * 0.22;
    const noise = () => (Math.random() - 0.3) * 500;
    
    trends.push({
      date: date.toISOString().split('T')[0],
      total: Math.round(15200 * growth + noise()),
      gpu: Math.round(4200 * growth + noise() * 0.3),
      cpu: Math.round(3800 * growth + noise() * 0.3),
      ram: Math.round(2900 * growth + noise() * 0.3),
      ssd: Math.round(2400 * growth + noise() * 0.3),
      cm: Math.round(1900 * growth + noise() * 0.3),
    });
  }
  
  return trends;
};

export const volumeTrends = generateVolumeTrends();

// Top increases
export const topIncreases: TopModel[] = [
  { model: "Ryzen 7 5800X3D", category: "CPU", brand: "AMD", var_30d_pct: 12.4, median: 270, volume: 410 },
  { model: "RTX 4070", category: "GPU", brand: "NVIDIA", var_30d_pct: 8.2, median: 540, volume: 320 },
  { model: "DDR5 6000MHz 32GB", category: "RAM", brand: "Corsair", var_30d_pct: 7.8, median: 165, volume: 280 },
  { model: "Ryzen 9 7900X", category: "CPU", brand: "AMD", var_30d_pct: 6.5, median: 380, volume: 240 },
  { model: "RTX 4060 Ti", category: "GPU", brand: "NVIDIA", var_30d_pct: 5.9, median: 410, volume: 390 },
  { model: "Samsung 990 Pro 2TB", category: "SSD", brand: "Samsung", var_30d_pct: 5.2, median: 180, volume: 310 },
  { model: "Intel i7-13700K", category: "CPU", brand: "Intel", var_30d_pct: 4.8, median: 350, volume: 270 },
  { model: "RX 7800 XT", category: "GPU", brand: "AMD", var_30d_pct: 4.3, median: 480, volume: 220 },
  { model: "MSI B650 Tomahawk", category: "CM", brand: "MSI", var_30d_pct: 3.7, median: 200, volume: 180 },
  { model: "G.Skill Trident Z5 RGB", category: "RAM", brand: "G.Skill", var_30d_pct: 3.2, median: 145, volume: 260 },
];

// Top drops
export const topDrops: TopModel[] = [
  { model: "RTX 3060 Ti", category: "GPU", brand: "NVIDIA", var_30d_pct: -14.6, median: 280, volume: 600 },
  { model: "Ryzen 5 5600X", category: "CPU", brand: "AMD", var_30d_pct: -10.3, median: 160, volume: 470 },
  { model: "RTX 3070", category: "GPU", brand: "NVIDIA", var_30d_pct: -9.8, median: 350, volume: 550 },
  { model: "Intel i5-12600K", category: "CPU", brand: "Intel", var_30d_pct: -8.4, median: 220, volume: 420 },
  { model: "DDR4 3200MHz 16GB", category: "RAM", brand: "Corsair", var_30d_pct: -7.9, median: 65, volume: 680 },
  { model: "RX 6700 XT", category: "GPU", brand: "AMD", var_30d_pct: -7.2, median: 310, volume: 380 },
  { model: "WD Black SN850 1TB", category: "SSD", brand: "Western Digital", var_30d_pct: -6.5, median: 95, volume: 450 },
  { model: "Ryzen 7 5700X", category: "CPU", brand: "AMD", var_30d_pct: -5.8, median: 190, volume: 340 },
  { model: "RTX 3060", category: "GPU", brand: "NVIDIA", var_30d_pct: -5.3, median: 240, volume: 720 },
  { model: "Intel i5-11400F", category: "CPU", brand: "Intel", var_30d_pct: -4.9, median: 130, volume: 510 },
];

// Most active models
export const mostActive: TopModel[] = [
  { model: "RTX 3060", category: "GPU", brand: "NVIDIA", var_30d_pct: -5.3, median: 240, volume: 720 },
  { model: "DDR4 3200MHz 16GB", category: "RAM", brand: "Corsair", var_30d_pct: -7.9, median: 65, volume: 680 },
  { model: "RTX 3060 Ti", category: "GPU", brand: "NVIDIA", var_30d_pct: -14.6, median: 280, volume: 600 },
  { model: "RTX 3070", category: "GPU", brand: "NVIDIA", var_30d_pct: -9.8, median: 350, volume: 550 },
  { model: "Intel i5-11400F", category: "CPU", brand: "Intel", var_30d_pct: -4.9, median: 130, volume: 510 },
  { model: "Ryzen 5 5600X", category: "CPU", brand: "AMD", var_30d_pct: -10.3, median: 160, volume: 470 },
  { model: "WD Black SN850 1TB", category: "SSD", brand: "Western Digital", var_30d_pct: -6.5, median: 95, volume: 450 },
  { model: "Intel i5-12600K", category: "CPU", brand: "Intel", var_30d_pct: -8.4, median: 220, volume: 420 },
  { model: "Ryzen 7 5800X3D", category: "CPU", brand: "AMD", var_30d_pct: 12.4, median: 270, volume: 410 },
  { model: "RTX 4060 Ti", category: "GPU", brand: "NVIDIA", var_30d_pct: 5.9, median: 410, volume: 390 },
];

// Rare models
export const rareModels: TopModel[] = [
  { model: "RTX 4090", category: "GPU", brand: "NVIDIA", var_30d_pct: 2.1, median: 1650, volume: 45 },
  { model: "Ryzen 9 7950X3D", category: "CPU", brand: "AMD", var_30d_pct: 3.4, median: 580, volume: 52 },
  { model: "RTX 4080", category: "GPU", brand: "NVIDIA", var_30d_pct: -1.8, median: 1150, volume: 68 },
  { model: "Intel i9-13900KS", category: "CPU", brand: "Intel", var_30d_pct: 1.2, median: 650, volume: 38 },
  { model: "DDR5 7200MHz 64GB", category: "RAM", brand: "G.Skill", var_30d_pct: 4.5, median: 380, volume: 41 },
  { model: "Samsung 990 Pro 4TB", category: "SSD", brand: "Samsung", var_30d_pct: 2.8, median: 340, volume: 57 },
  { model: "RX 7900 XTX", category: "GPU", brand: "AMD", var_30d_pct: -2.3, median: 920, volume: 73 },
  { model: "Ryzen 9 7950X", category: "CPU", brand: "AMD", var_30d_pct: 1.9, median: 520, volume: 62 },
  { model: "ASUS ROG Crosshair X670E", category: "CM", brand: "ASUS", var_30d_pct: 0.8, median: 450, volume: 34 },
  { model: "Corsair Dominator Titanium 64GB", category: "RAM", brand: "Corsair", var_30d_pct: 3.1, median: 420, volume: 29 },
];

// Regional statistics
export const regionStats: RegionStat[] = [
  { region: "Île-de-France", code: "IDF", median_price: 345, volume: 4820, var_30d_pct: -2.8 },
  { region: "Auvergne-Rhône-Alpes", code: "ARA", median_price: 298, volume: 2940, var_30d_pct: -3.5 },
  { region: "Provence-Alpes-Côte d'Azur", code: "PAC", median_price: 315, volume: 2150, var_30d_pct: -3.1 },
  { region: "Occitanie", code: "OCC", median_price: 285, volume: 1680, var_30d_pct: -3.9 },
  { region: "Nouvelle-Aquitaine", code: "NAQ", median_price: 280, volume: 1520, var_30d_pct: -2.9 },
  { region: "Grand Est", code: "GES", median_price: 292, volume: 1450, var_30d_pct: -3.3 },
  { region: "Hauts-de-France", code: "HDF", median_price: 275, volume: 1380, var_30d_pct: -4.2 },
  { region: "Pays de la Loire", code: "PDL", median_price: 288, volume: 1240, var_30d_pct: -2.7 },
  { region: "Bretagne", code: "BRE", median_price: 295, volume: 980, var_30d_pct: -2.5 },
  { region: "Normandie", code: "NOR", median_price: 282, volume: 890, var_30d_pct: -3.4 },
  { region: "Bourgogne-Franche-Comté", code: "BFC", median_price: 270, volume: 720, var_30d_pct: -3.8 },
  { region: "Centre-Val de Loire", code: "CVL", median_price: 278, volume: 650, var_30d_pct: -3.2 },
  { region: "Corse", code: "COR", median_price: 320, volume: 104, var_30d_pct: -1.9 },
];

// Category details
export const categoryDetails: CategoryDetail[] = [
  {
    category: "GPU",
    summary: "Les GPU ont baissé de 6.4% ce mois-ci, portés par l'arrivée des RTX 40 Super et la stabilisation des stocks.",
    var_30d_pct: -6.4,
    median_price: 382,
    volume: 6820,
    trend: "down",
    top_models: topDrops.filter(m => m.category === "GPU").slice(0, 5),
    price_history: marketTrends.slice(-30).map(t => ({ date: t.date, price: t.gpu })),
    volume_history: volumeTrends.slice(-30).map(t => ({ date: t.date, volume: t.gpu })),
  },
  {
    category: "CPU",
    summary: "Les CPU AMD Ryzen X3D connaissent une forte hausse tandis que les Intel de 12e génération continuent de baisser.",
    var_30d_pct: -4.8,
    median_price: 276,
    volume: 4950,
    trend: "down",
    top_models: [
      ...topIncreases.filter(m => m.category === "CPU").slice(0, 2),
      ...topDrops.filter(m => m.category === "CPU").slice(0, 3),
    ],
    price_history: marketTrends.slice(-30).map(t => ({ date: t.date, price: t.cpu })),
    volume_history: volumeTrends.slice(-30).map(t => ({ date: t.date, volume: t.cpu })),
  },
  {
    category: "RAM",
    summary: "Le marché de la RAM DDR4 continue de chuter, tandis que la DDR5 se stabilise avec une légère hausse.",
    var_30d_pct: -0.9,
    median_price: 114,
    volume: 3420,
    trend: "stable",
    top_models: [
      ...topIncreases.filter(m => m.category === "RAM").slice(0, 2),
      ...topDrops.filter(m => m.category === "RAM").slice(0, 3),
    ],
    price_history: marketTrends.slice(-30).map(t => ({ date: t.date, price: t.ram })),
    volume_history: volumeTrends.slice(-30).map(t => ({ date: t.date, volume: t.ram })),
  },
  {
    category: "SSD",
    summary: "Les SSD NVMe Gen4 restent stables, avec une légère hausse des modèles premium (990 Pro, WD Black SN850X).",
    var_30d_pct: -1.1,
    median_price: 89,
    volume: 2460,
    trend: "stable",
    top_models: [
      ...topIncreases.filter(m => m.category === "SSD"),
      ...topDrops.filter(m => m.category === "SSD"),
    ].slice(0, 5),
    price_history: marketTrends.slice(-30).map(t => ({ date: t.date, price: t.ssd })),
    volume_history: volumeTrends.slice(-30).map(t => ({ date: t.date, volume: t.ssd })),
  },
  {
    category: "CM",
    summary: "Les cartes mères AM5 et LGA1700 voient une demande croissante, avec une hausse des prix de 2.1% ce mois-ci.",
    var_30d_pct: 2.1,
    median_price: 137,
    volume: 1874,
    trend: "up",
    top_models: topIncreases.filter(m => m.category === "CM"),
    price_history: marketTrends.slice(-30).map(t => ({ date: t.date, price: t.cm })),
    volume_history: volumeTrends.slice(-30).map(t => ({ date: t.date, volume: t.cm })),
  },
];

// Category variation data for bar chart
export const categoryVariations = [
  { category: "GPU", variation: -6.4 },
  { category: "CPU", variation: -4.8 },
  { category: "RAM", variation: -0.9 },
  { category: "SSD", variation: -1.1 },
  { category: "CM", variation: 2.1 },
];
