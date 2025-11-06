// Données mockées complètes pour la page Marché
import { addDays, subDays, format } from "date-fns";

export interface MarketDeal {
  ad_id: string;
  title: string;
  category: "GPU" | "CPU" | "RAM" | "SSD" | "Motherboard";
  model: string;
  price: number;
  fair_value: number;
  score: number;
  state: "Neuf" | "Comme neuf" | "Bon" | "À réparer";
  city: string;
  region: string;
  publication_date: string;
  seller_type: "particulier" | "professionnel";
  delivery_possible: boolean;
  url: string;
  trend: number[];
  labels: string[];
}

export interface MarketSummary {
  median_price_7d: number;
  price_variation: number;
  total_active_ads: number;
  new_deals_today: number;
  last_update: string;
}

export interface ModelTrend {
  model: string;
  category: string;
  current_price: number;
  variation_30d: number;
  avg_score: number;
  ads_count: number;
}

const regions = [
  "Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur",
  "Occitanie", "Nouvelle-Aquitaine", "Hauts-de-France", "Grand Est",
  "Pays de la Loire", "Bretagne", "Normandie", "Bourgogne-Franche-Comté",
  "Centre-Val de Loire", "Corse"
];

const cities = [
  "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg",
  "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Grenoble",
  "Dijon", "Angers", "Toulon", "Tours", "Clermont-Ferrand", "Amiens", "Metz",
  "Besançon", "Orléans", "Brest", "Caen", "Limoges", "Perpignan", "Poitiers"
];

const gpuModels = [
  "RTX 4090", "RTX 4080", "RTX 4070 Ti", "RTX 4070", "RTX 4060 Ti", "RTX 4060",
  "RTX 3090", "RTX 3080", "RTX 3070", "RTX 3060 Ti", "RTX 3060",
  "RX 7900 XTX", "RX 7900 XT", "RX 7800 XT", "RX 7700 XT", "RX 7600",
  "RX 6950 XT", "RX 6900 XT", "RX 6800 XT", "RX 6700 XT", "RX 6600 XT",
  "GTX 1660 Super", "GTX 1650"
];

const cpuModels = [
  "Ryzen 9 7950X", "Ryzen 9 7900X", "Ryzen 7 7800X3D", "Ryzen 7 7700X",
  "Ryzen 5 7600X", "Ryzen 5 5600X", "Ryzen 7 5800X3D",
  "i9-14900K", "i9-13900K", "i7-14700K", "i7-13700K", "i5-14600K",
  "i5-13600K", "i5-12400F", "i7-12700K"
];

const ramModels = [
  "DDR5 32GB 6000MHz", "DDR5 32GB 5600MHz", "DDR5 64GB 6400MHz",
  "DDR4 32GB 3600MHz", "DDR4 16GB 3200MHz", "DDR4 64GB 3200MHz"
];

const ssdModels = [
  "980 Pro 2TB", "980 Pro 1TB", "SN850X 2TB", "SN850X 1TB",
  "P3 Plus 4TB", "P3 Plus 2TB", "KC3000 2TB", "FireCuda 530 2TB",
  "MX500 1TB", "870 EVO 2TB"
];

const motherboardModels = [
  "Z790-E", "Z790-A", "B650 Tomahawk", "B550 AORUS Elite",
  "X670E-Plus", "B760M Pro", "X570 Master"
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTrend(): number[] {
  const trend: number[] = [];
  let basePrice = 200 + Math.random() * 800;
  for (let i = 0; i < 7; i++) {
    trend.push(Math.round(basePrice + (Math.random() - 0.5) * 50));
    basePrice = trend[trend.length - 1];
  }
  return trend;
}

function generateDeals(count: number): MarketDeal[] {
  const deals: MarketDeal[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = getRandomItem<"GPU" | "CPU" | "RAM" | "SSD" | "Motherboard">(
      ["GPU", "CPU", "RAM", "SSD", "Motherboard"]
    );
    
    let model: string;
    let priceRange: [number, number];
    
    switch (category) {
      case "GPU":
        model = getRandomItem(gpuModels);
        priceRange = [150, 2000];
        break;
      case "CPU":
        model = getRandomItem(cpuModels);
        priceRange = [100, 700];
        break;
      case "RAM":
        model = getRandomItem(ramModels);
        priceRange = [40, 300];
        break;
      case "SSD":
        model = getRandomItem(ssdModels);
        priceRange = [60, 400];
        break;
      case "Motherboard":
        model = getRandomItem(motherboardModels);
        priceRange = [80, 500];
        break;
    }
    
    const fair_value = priceRange[0] + Math.random() * (priceRange[1] - priceRange[0]);
    const discount = 0.7 + Math.random() * 0.4; // 70% à 110% de la fair value
    const price = Math.round(fair_value * discount);
    const score = Math.round(40 + (1 - discount) * 120);
    
    const state = getRandomItem<"Neuf" | "Comme neuf" | "Bon" | "À réparer">(
      ["Neuf", "Comme neuf", "Bon", "À réparer"]
    );
    const region = getRandomItem(regions);
    const city = getRandomItem(cities);
    
    const daysAgo = Math.floor(Math.random() * 30);
    const publication_date = format(subDays(new Date(), daysAgo), "yyyy-MM-dd'T'HH:mm:ss'Z'");
    
    const labels: string[] = [];
    if (daysAgo < 1) labels.push("⚡ Nouvelle annonce");
    if (score >= 85) labels.push("🔥 Très bon prix");
    if (Math.random() > 0.7) labels.push("Livraison dispo");
    
    deals.push({
      ad_id: `${30000000 + i}`,
      title: `${model} ${getRandomItem(["Gaming", "Pro", "Elite", "OC", "Turbo", "Ultra"])}`,
      category,
      model,
      price,
      fair_value: Math.round(fair_value),
      score: Math.min(100, Math.max(40, score)),
      state,
      city,
      region,
      publication_date,
      seller_type: Math.random() > 0.3 ? "particulier" : "professionnel",
      delivery_possible: Math.random() > 0.4,
      url: `https://www.leboncoin.fr/ad/ordinateurs/${30000000 + i}`,
      trend: generateTrend(),
      labels
    });
  }
  
  return deals.sort((a, b) => b.score - a.score);
}

export const marketDeals: MarketDeal[] = generateDeals(180);

export const marketSummary: MarketSummary = {
  median_price_7d: 285,
  price_variation: -3.2,
  total_active_ads: 1847,
  new_deals_today: 42,
  last_update: format(subDays(new Date(), 0), "yyyy-MM-dd'T'HH:mm:ss'Z'")
};

export const topModels: ModelTrend[] = [
  {
    model: "RTX 4070",
    category: "GPU",
    current_price: 580,
    variation_30d: -8.5,
    avg_score: 84,
    ads_count: 127
  },
  {
    model: "Ryzen 7 7800X3D",
    category: "CPU",
    current_price: 385,
    variation_30d: -5.2,
    avg_score: 88,
    ads_count: 94
  },
  {
    model: "DDR5 32GB 6000MHz",
    category: "RAM",
    current_price: 125,
    variation_30d: -12.3,
    avg_score: 82,
    ads_count: 156
  },
  {
    model: "980 Pro 2TB",
    category: "SSD",
    current_price: 165,
    variation_30d: -6.8,
    avg_score: 86,
    ads_count: 89
  },
  {
    model: "RTX 4090",
    category: "GPU",
    current_price: 1680,
    variation_30d: +2.1,
    avg_score: 79,
    ads_count: 34
  },
  {
    model: "RX 7900 XTX",
    category: "GPU",
    current_price: 980,
    variation_30d: -15.4,
    avg_score: 91,
    ads_count: 67
  }
];

// Données pour les graphiques de tendances globales
export const marketTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = format(subDays(new Date(), 29 - i), "dd/MM");
  return {
    date,
    gpu: 520 + Math.random() * 60 - 30,
    cpu: 285 + Math.random() * 40 - 20,
    ram: 115 + Math.random() * 20 - 10,
    ssd: 145 + Math.random() * 25 - 12
  };
});

export const volumeData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), "dd/MM"),
  count: 1500 + Math.floor(Math.random() * 600 - 300)
}));
