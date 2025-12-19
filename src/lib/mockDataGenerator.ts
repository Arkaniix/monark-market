// Deterministic mock data generator for deals, catalog, and community
// Uses seeded pseudo-random for consistent data across refreshes

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

const random = seededRandom(42);

// ============= Regions & Cities =============
const regions = [
  "Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur",
  "Occitanie", "Nouvelle-Aquitaine", "Hauts-de-France", "Grand Est",
  "Pays de la Loire", "Bretagne", "Normandie", "Bourgogne-Franche-Comté",
  "Centre-Val de Loire"
];

const citiesByRegion: Record<string, string[]> = {
  "Île-de-France": ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles", "Nanterre"],
  "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble", "Saint-Étienne", "Clermont-Ferrand", "Annecy"],
  "Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon"],
  "Occitanie": ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers"],
  "Nouvelle-Aquitaine": ["Bordeaux", "Limoges", "Poitiers", "Pau", "La Rochelle"],
  "Hauts-de-France": ["Lille", "Amiens", "Roubaix", "Dunkerque", "Calais"],
  "Grand Est": ["Strasbourg", "Reims", "Metz", "Nancy", "Mulhouse"],
  "Pays de la Loire": ["Nantes", "Angers", "Le Mans", "Saint-Nazaire"],
  "Bretagne": ["Rennes", "Brest", "Quimper", "Lorient", "Vannes"],
  "Normandie": ["Le Havre", "Rouen", "Caen", "Cherbourg"],
  "Bourgogne-Franche-Comté": ["Dijon", "Besançon", "Belfort"],
  "Centre-Val de Loire": ["Tours", "Orléans", "Blois", "Chartres"]
};

const conditions: string[] = ["Neuf", "Comme neuf", "Très bon état", "Bon état", "Satisfaisant"];
const platforms: string[] = ["leboncoin", "facebook", "rakuten", "ebay"];

// ============= GPU Data =============
const gpuModels = [
  { name: "RTX 4090", brand: "NVIDIA", family: "RTX 40", priceRange: [1500, 2000] },
  { name: "RTX 4080 Super", brand: "NVIDIA", family: "RTX 40", priceRange: [950, 1200] },
  { name: "RTX 4080", brand: "NVIDIA", family: "RTX 40", priceRange: [900, 1100] },
  { name: "RTX 4070 Ti Super", brand: "NVIDIA", family: "RTX 40", priceRange: [750, 900] },
  { name: "RTX 4070 Ti", brand: "NVIDIA", family: "RTX 40", priceRange: [650, 800] },
  { name: "RTX 4070 Super", brand: "NVIDIA", family: "RTX 40", priceRange: [550, 700] },
  { name: "RTX 4070", brand: "NVIDIA", family: "RTX 40", priceRange: [480, 600] },
  { name: "RTX 4060 Ti 16GB", brand: "NVIDIA", family: "RTX 40", priceRange: [400, 480] },
  { name: "RTX 4060 Ti", brand: "NVIDIA", family: "RTX 40", priceRange: [350, 420] },
  { name: "RTX 4060", brand: "NVIDIA", family: "RTX 40", priceRange: [270, 340] },
  { name: "RTX 3090 Ti", brand: "NVIDIA", family: "RTX 30", priceRange: [800, 1000] },
  { name: "RTX 3090", brand: "NVIDIA", family: "RTX 30", priceRange: [700, 900] },
  { name: "RTX 3080 Ti", brand: "NVIDIA", family: "RTX 30", priceRange: [550, 700] },
  { name: "RTX 3080", brand: "NVIDIA", family: "RTX 30", priceRange: [450, 600] },
  { name: "RTX 3070 Ti", brand: "NVIDIA", family: "RTX 30", priceRange: [380, 480] },
  { name: "RTX 3070", brand: "NVIDIA", family: "RTX 30", priceRange: [320, 420] },
  { name: "RTX 3060 Ti", brand: "NVIDIA", family: "RTX 30", priceRange: [280, 360] },
  { name: "RTX 3060", brand: "NVIDIA", family: "RTX 30", priceRange: [220, 300] },
  { name: "RX 7900 XTX", brand: "AMD", family: "RX 7000", priceRange: [850, 1050] },
  { name: "RX 7900 XT", brand: "AMD", family: "RX 7000", priceRange: [700, 900] },
  { name: "RX 7900 GRE", brand: "AMD", family: "RX 7000", priceRange: [550, 700] },
  { name: "RX 7800 XT", brand: "AMD", family: "RX 7000", priceRange: [450, 580] },
  { name: "RX 7700 XT", brand: "AMD", family: "RX 7000", priceRange: [380, 480] },
  { name: "RX 7600 XT", brand: "AMD", family: "RX 7000", priceRange: [320, 400] },
  { name: "RX 7600", brand: "AMD", family: "RX 7000", priceRange: [250, 330] },
  { name: "RX 6950 XT", brand: "AMD", family: "RX 6000", priceRange: [450, 580] },
  { name: "RX 6900 XT", brand: "AMD", family: "RX 6000", priceRange: [400, 520] },
  { name: "RX 6800 XT", brand: "AMD", family: "RX 6000", priceRange: [350, 450] },
  { name: "RX 6800", brand: "AMD", family: "RX 6000", priceRange: [300, 400] },
  { name: "RX 6700 XT", brand: "AMD", family: "RX 6000", priceRange: [250, 340] },
];

// ============= CPU Data =============
const cpuModels = [
  { name: "Ryzen 9 9950X", brand: "AMD", family: "Ryzen 9000", priceRange: [550, 700] },
  { name: "Ryzen 9 9900X", brand: "AMD", family: "Ryzen 9000", priceRange: [450, 580] },
  { name: "Ryzen 7 9700X", brand: "AMD", family: "Ryzen 9000", priceRange: [350, 450] },
  { name: "Ryzen 5 9600X", brand: "AMD", family: "Ryzen 9000", priceRange: [270, 350] },
  { name: "Ryzen 9 7950X", brand: "AMD", family: "Ryzen 7000", priceRange: [500, 650] },
  { name: "Ryzen 9 7900X", brand: "AMD", family: "Ryzen 7000", priceRange: [400, 520] },
  { name: "Ryzen 7 7800X3D", brand: "AMD", family: "Ryzen 7000", priceRange: [370, 450] },
  { name: "Ryzen 7 7700X", brand: "AMD", family: "Ryzen 7000", priceRange: [300, 380] },
  { name: "Ryzen 5 7600X", brand: "AMD", family: "Ryzen 7000", priceRange: [220, 300] },
  { name: "Ryzen 9 5950X", brand: "AMD", family: "Ryzen 5000", priceRange: [350, 450] },
  { name: "Ryzen 7 5800X3D", brand: "AMD", family: "Ryzen 5000", priceRange: [280, 360] },
  { name: "Ryzen 7 5800X", brand: "AMD", family: "Ryzen 5000", priceRange: [180, 250] },
  { name: "Ryzen 5 5600X", brand: "AMD", family: "Ryzen 5000", priceRange: [120, 170] },
  { name: "i9-14900K", brand: "Intel", family: "Intel 14th", priceRange: [520, 650] },
  { name: "i9-14900KF", brand: "Intel", family: "Intel 14th", priceRange: [480, 600] },
  { name: "i7-14700K", brand: "Intel", family: "Intel 14th", priceRange: [380, 480] },
  { name: "i5-14600K", brand: "Intel", family: "Intel 14th", priceRange: [280, 360] },
  { name: "i9-13900K", brand: "Intel", family: "Intel 13th", priceRange: [450, 580] },
  { name: "i7-13700K", brand: "Intel", family: "Intel 13th", priceRange: [320, 420] },
  { name: "i5-13600K", brand: "Intel", family: "Intel 13th", priceRange: [250, 330] },
  { name: "i5-12600K", brand: "Intel", family: "Intel 12th", priceRange: [180, 250] },
  { name: "i5-12400F", brand: "Intel", family: "Intel 12th", priceRange: [120, 170] },
];

// ============= RAM Data =============
const ramModels = [
  { name: "DDR5 64GB 6400MHz", brand: "G.Skill", family: "DDR5", priceRange: [280, 380] },
  { name: "DDR5 32GB 7200MHz", brand: "G.Skill", family: "DDR5", priceRange: [180, 250] },
  { name: "DDR5 32GB 6000MHz", brand: "Corsair", family: "DDR5", priceRange: [120, 170] },
  { name: "DDR5 32GB 5600MHz", brand: "Kingston", family: "DDR5", priceRange: [100, 140] },
  { name: "DDR5 16GB 6000MHz", brand: "Corsair", family: "DDR5", priceRange: [70, 100] },
  { name: "DDR4 64GB 3600MHz", brand: "G.Skill", family: "DDR4", priceRange: [140, 200] },
  { name: "DDR4 32GB 3600MHz", brand: "Corsair", family: "DDR4", priceRange: [70, 100] },
  { name: "DDR4 32GB 3200MHz", brand: "Kingston", family: "DDR4", priceRange: [55, 80] },
  { name: "DDR4 16GB 3600MHz", brand: "G.Skill", family: "DDR4", priceRange: [40, 60] },
  { name: "DDR4 16GB 3200MHz", brand: "Crucial", family: "DDR4", priceRange: [30, 50] },
];

// ============= SSD Data =============
const ssdModels = [
  { name: "990 Pro 4TB", brand: "Samsung", family: "NVMe", priceRange: [350, 450] },
  { name: "990 Pro 2TB", brand: "Samsung", family: "NVMe", priceRange: [180, 240] },
  { name: "990 Pro 1TB", brand: "Samsung", family: "NVMe", priceRange: [100, 140] },
  { name: "980 Pro 2TB", brand: "Samsung", family: "NVMe", priceRange: [150, 200] },
  { name: "980 Pro 1TB", brand: "Samsung", family: "NVMe", priceRange: [85, 120] },
  { name: "SN850X 2TB", brand: "WD", family: "NVMe", priceRange: [140, 190] },
  { name: "SN850X 1TB", brand: "WD", family: "NVMe", priceRange: [80, 115] },
  { name: "P5 Plus 2TB", brand: "Crucial", family: "NVMe", priceRange: [120, 170] },
  { name: "KC3000 2TB", brand: "Kingston", family: "NVMe", priceRange: [130, 180] },
  { name: "FireCuda 530 2TB", brand: "Seagate", family: "NVMe", priceRange: [160, 220] },
  { name: "870 EVO 4TB", brand: "Samsung", family: "SATA", priceRange: [250, 340] },
  { name: "870 EVO 2TB", brand: "Samsung", family: "SATA", priceRange: [130, 180] },
  { name: "MX500 2TB", brand: "Crucial", family: "SATA", priceRange: [100, 150] },
];

// ============= Motherboard Data =============
const motherboardModels = [
  { name: "ROG Crosshair X670E Hero", brand: "ASUS", family: "AM5", priceRange: [500, 650] },
  { name: "MEG X670E ACE", brand: "MSI", family: "AM5", priceRange: [550, 700] },
  { name: "X670E AORUS Master", brand: "Gigabyte", family: "AM5", priceRange: [450, 580] },
  { name: "B650E Taichi", brand: "ASRock", family: "AM5", priceRange: [350, 450] },
  { name: "ROG Strix B650E-F", brand: "ASUS", family: "AM5", priceRange: [280, 360] },
  { name: "B650 Tomahawk WiFi", brand: "MSI", family: "AM5", priceRange: [200, 270] },
  { name: "ROG Maximus Z790 Hero", brand: "ASUS", family: "LGA1700", priceRange: [520, 680] },
  { name: "Z790 AORUS Master", brand: "Gigabyte", family: "LGA1700", priceRange: [450, 580] },
  { name: "MAG Z790 Tomahawk", brand: "MSI", family: "LGA1700", priceRange: [280, 360] },
  { name: "ROG Strix Z790-E", brand: "ASUS", family: "LGA1700", priceRange: [380, 480] },
  { name: "B760M AORUS Elite", brand: "Gigabyte", family: "LGA1700", priceRange: [150, 200] },
  { name: "B550 AORUS Pro", brand: "Gigabyte", family: "AM4", priceRange: [120, 170] },
  { name: "B550 Tomahawk", brand: "MSI", family: "AM4", priceRange: [100, 150] },
];

// Helper to pick random element
function pick<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

// ============= Generate Deals =============
export interface GeneratedDeal {
  id: number;
  ad_id: number;
  title: string;
  price: number;
  fair_value: number;
  score: number;
  deviation_pct: number;
  platform: string;
  city: string;
  region: string;
  condition: string;
  category: string;
  item_type: 'component' | 'pc' | 'lot';
  delivery_possible: boolean;
  publication_date: string;
  url: string;
  model_name: string;
}

export function generateDeals(count: number): GeneratedDeal[] {
  const deals: GeneratedDeal[] = [];
  const allModels = [
    ...gpuModels.map(m => ({ ...m, category: 'GPU' })),
    ...cpuModels.map(m => ({ ...m, category: 'CPU' })),
    ...ramModels.map(m => ({ ...m, category: 'RAM' })),
    ...ssdModels.map(m => ({ ...m, category: 'SSD' })),
    ...motherboardModels.map(m => ({ ...m, category: 'Motherboard' })),
  ];

  for (let i = 0; i < count; i++) {
    const model = pick(allModels);
    const region = pick(regions);
    const cities = citiesByRegion[region] || ["Ville"];
    const city = pick(cities);
    const condition = pick(conditions);
    
    // Calculate fair value and price with deal
    const fairValue = model.priceRange[0] + random() * (model.priceRange[1] - model.priceRange[0]);
    const discountFactor = 0.65 + random() * 0.45; // 65% to 110%
    const price = Math.round(fairValue * discountFactor);
    const deviationPct = Math.round((1 - price / fairValue) * 100);
    const score = Math.min(100, Math.max(40, 50 + deviationPct * 1.5));
    
    // Random date in last 30 days
    const daysAgo = Math.floor(random() * 30);
    const pubDate = new Date(Date.now() - daysAgo * 86400000);
    
    const suffixes = ["Gaming", "OC", "Pro", "Elite", "", "Ti", "Super", "Turbo"];
    const brands = ["ASUS", "MSI", "Gigabyte", "EVGA", "Sapphire", "XFX", "Zotac", ""];
    
    deals.push({
      id: i + 1,
      ad_id: 30000000 + i,
      title: `${pick(brands)} ${model.name} ${pick(suffixes)}`.trim(),
      price,
      fair_value: Math.round(fairValue),
      score,
      deviation_pct: deviationPct,
      platform: pick(platforms),
      city,
      region,
      condition,
      category: model.category,
      item_type: 'component',
      delivery_possible: random() > 0.3,
      publication_date: pubDate.toISOString(),
      url: `https://www.leboncoin.fr/ad/${30000000 + i}`,
      model_name: model.name,
    });
  }

  // Sort by score descending
  return deals.sort((a, b) => b.score - a.score);
}

// ============= Generate Catalog Models =============
export interface GeneratedCatalogModel {
  id: number;
  name: string;
  brand: string;
  family: string;
  category: string;
  median_price: number;
  var_7d_pct: number;
  var_30d_pct: number;
  volume: number;
  liquidity: 'high' | 'medium' | 'low';
  ads_count: number;
}

export function generateCatalogModels(): GeneratedCatalogModel[] {
  const models: GeneratedCatalogModel[] = [];
  let id = 1;

  const allBase = [
    ...gpuModels.map(m => ({ ...m, category: 'GPU' })),
    ...cpuModels.map(m => ({ ...m, category: 'CPU' })),
    ...ramModels.map(m => ({ ...m, category: 'RAM' })),
    ...ssdModels.map(m => ({ ...m, category: 'SSD' })),
    ...motherboardModels.map(m => ({ ...m, category: 'Motherboard' })),
  ];

  for (const base of allBase) {
    const medianPrice = Math.round(base.priceRange[0] + random() * (base.priceRange[1] - base.priceRange[0]));
    const var7d = -8 + random() * 16;
    const var30d = -15 + random() * 30;
    const volume = Math.floor(20 + random() * 200);
    const liquidity = volume > 120 ? 'high' : volume > 50 ? 'medium' : 'low';
    
    models.push({
      id: id++,
      name: base.name,
      brand: base.brand,
      family: base.family,
      category: base.category,
      median_price: medianPrice,
      var_7d_pct: Math.round(var7d * 10) / 10,
      var_30d_pct: Math.round(var30d * 10) / 10,
      volume,
      liquidity,
      ads_count: Math.floor(volume * 1.5),
    });
  }

  return models;
}

// ============= Generate Community Tasks =============
export interface GeneratedTask {
  id: string;
  model: string;
  type: 'list_only' | 'open_on_new';
  region: string | null;
  pages_hint: string;
  priority: 'high' | 'medium' | 'low';
  context: string;
  estimated_time_min: number;
  credit_reward: number;
}

export function generateCommunityTasks(count: number): GeneratedTask[] {
  const priorityModels = [
    "RTX 4060", "RTX 4070", "RTX 3060", "RTX 3070", "RX 7800 XT",
    "Ryzen 5 5600X", "Ryzen 7 7800X3D", "i5-13600K", "i5-12400F",
    "DDR5 32GB 6000MHz", "980 Pro 2TB", "SN850X 1TB"
  ];

  const contexts = [
    "Besoin de nouvelles annonces des derniers jours",
    "Zone prioritaire, scan approfondi nécessaire",
    "Mise à jour hebdomadaire",
    "Couverture régionale à compléter",
    "Scan périodique planifié",
    "Données obsolètes à rafraîchir",
    "Forte demande, nécessite actualisation"
  ];

  const regionCodes = [null, null, "IDF", "ARA", "PACA", "OCC", null];
  const priorities: ('high' | 'medium' | 'low')[] = ['high', 'high', 'medium', 'medium', 'medium', 'low', 'low'];

  const tasks: GeneratedTask[] = [];
  for (let i = 0; i < count; i++) {
    const type = random() > 0.6 ? 'open_on_new' : 'list_only';
    const pagesFrom = Math.floor(random() * 20) + 1;
    const pagesTo = pagesFrom + Math.floor(random() * 15) + 5;
    
    tasks.push({
      id: `task_${i}`,
      model: priorityModels[i % priorityModels.length],
      type,
      region: regionCodes[i % regionCodes.length],
      pages_hint: `${pagesFrom}–${pagesTo}`,
      priority: priorities[i % priorities.length],
      context: contexts[i % contexts.length],
      estimated_time_min: type === 'open_on_new' ? 7 + Math.floor(random() * 5) : 4 + Math.floor(random() * 4),
      credit_reward: type === 'open_on_new' ? 2 : 1,
    });
  }

  return tasks;
}

// ============= Pre-generated data (deterministic) =============
export const mockDeals = generateDeals(80);
export const mockCatalogModels = generateCatalogModels();
export const mockCommunityTasks = generateCommunityTasks(8);

// Category/brand data derived from models
export const mockCategories = [
  { id: 1, name: 'GPU', count: gpuModels.length },
  { id: 2, name: 'CPU', count: cpuModels.length },
  { id: 3, name: 'RAM', count: ramModels.length },
  { id: 4, name: 'SSD', count: ssdModels.length },
  { id: 5, name: 'Motherboard', count: motherboardModels.length },
];

export const mockBrandsByCategory: Record<string, string[]> = {
  GPU: ['NVIDIA', 'AMD'],
  CPU: ['AMD', 'Intel'],
  RAM: ['G.Skill', 'Corsair', 'Kingston', 'Crucial'],
  SSD: ['Samsung', 'WD', 'Crucial', 'Kingston', 'Seagate'],
  Motherboard: ['ASUS', 'MSI', 'Gigabyte', 'ASRock'],
};

export const mockFamiliesByBrand: Record<string, string[]> = {
  NVIDIA: ['RTX 40', 'RTX 30'],
  AMD: ['RX 7000', 'RX 6000', 'Ryzen 9000', 'Ryzen 7000', 'Ryzen 5000'],
  Intel: ['Intel 14th', 'Intel 13th', 'Intel 12th'],
  'G.Skill': ['DDR5', 'DDR4'],
  Corsair: ['DDR5', 'DDR4'],
  Kingston: ['DDR5', 'DDR4', 'NVMe'],
  Crucial: ['DDR4', 'NVMe', 'SATA'],
  Samsung: ['NVMe', 'SATA'],
  WD: ['NVMe'],
  Seagate: ['NVMe'],
  ASUS: ['AM5', 'LGA1700', 'AM4'],
  MSI: ['AM5', 'LGA1700', 'AM4'],
  Gigabyte: ['AM5', 'LGA1700', 'AM4'],
  ASRock: ['AM5'],
};
