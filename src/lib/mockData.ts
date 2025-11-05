// Mock data for the hardware marketplace

export interface Ad {
  id: string;
  title: string;
  price: number;
  component: "GPU" | "CPU" | "RAM" | "SSD" | "Motherboard";
  model: string;
  condition: "Neuf" | "Comme neuf" | "Très bon état" | "Bon état" | "Satisfaisant";
  location: string;
  region: string;
  date: string;
  seller: "Particulier" | "Professionnel";
  dealScore: number; // 0-100
  fairValue: number;
  shipping: boolean;
  imageUrl?: string;
  priceHistory?: { date: string; price: number }[];
}

export interface Model {
  id: string;
  name: string;
  category: "GPU" | "CPU" | "RAM" | "SSD" | "Motherboard";
  brand: string;
  medianPrice: number;
  priceChange7d: number;
  priceChange30d: number;
  volume: number;
  rarity: "Commun" | "Peu courant" | "Rare" | "Très rare";
  lastUpdate: string;
  priceHistory: { date: string; price: number }[];
}

export interface MarketStats {
  totalAds: number;
  opportunities: number;
  medianGPUPrice: number;
  totalVolume: number;
}

// Mock Ads
export const mockAds: Ad[] = [
  {
    id: "1",
    title: "RTX 4060 Ti 8GB MSI Gaming X",
    price: 320,
    component: "GPU",
    model: "RTX 4060 Ti",
    condition: "Comme neuf",
    location: "Paris 15e",
    region: "Île-de-France",
    date: "2025-01-15",
    seller: "Particulier",
    dealScore: 92,
    fairValue: 380,
    shipping: true,
    priceHistory: [
      { date: "2025-01-01", price: 350 },
      { date: "2025-01-08", price: 335 },
      { date: "2025-01-15", price: 320 },
    ],
  },
  {
    id: "2",
    title: "AMD Ryzen 7 7800X3D",
    price: 380,
    component: "CPU",
    model: "Ryzen 7 7800X3D",
    condition: "Neuf",
    location: "Lyon 3e",
    region: "Auvergne-Rhône-Alpes",
    date: "2025-01-14",
    seller: "Professionnel",
    dealScore: 85,
    fairValue: 430,
    shipping: true,
  },
  {
    id: "3",
    title: "Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz",
    price: 110,
    component: "RAM",
    model: "DDR5 32GB 6000MHz",
    condition: "Très bon état",
    location: "Marseille",
    region: "Provence-Alpes-Côte d'Azur",
    date: "2025-01-13",
    seller: "Particulier",
    dealScore: 78,
    fairValue: 130,
    shipping: false,
  },
  {
    id: "4",
    title: "RTX 3080 10GB ASUS TUF",
    price: 450,
    component: "GPU",
    model: "RTX 3080",
    condition: "Bon état",
    location: "Toulouse",
    region: "Occitanie",
    date: "2025-01-12",
    seller: "Particulier",
    dealScore: 88,
    fairValue: 520,
    shipping: true,
  },
  {
    id: "5",
    title: "Samsung 980 Pro 2TB NVMe",
    price: 140,
    component: "SSD",
    model: "980 Pro 2TB",
    condition: "Comme neuf",
    location: "Bordeaux",
    region: "Nouvelle-Aquitaine",
    date: "2025-01-11",
    seller: "Particulier",
    dealScore: 91,
    fairValue: 170,
    shipping: true,
  },
];

// Mock Models
export const mockModels: Model[] = [
  {
    id: "1",
    name: "RTX 4060 Ti 8GB",
    category: "GPU",
    brand: "NVIDIA",
    medianPrice: 380,
    priceChange7d: -5.2,
    priceChange30d: -8.1,
    volume: 245,
    rarity: "Commun",
    lastUpdate: "2025-01-15",
    priceHistory: [
      { date: "2024-12-15", price: 410 },
      { date: "2024-12-22", price: 405 },
      { date: "2024-12-29", price: 395 },
      { date: "2025-01-05", price: 390 },
      { date: "2025-01-12", price: 380 },
    ],
  },
  {
    id: "2",
    name: "RTX 3080 10GB",
    category: "GPU",
    brand: "NVIDIA",
    medianPrice: 520,
    priceChange7d: -2.8,
    priceChange30d: -12.5,
    volume: 180,
    rarity: "Peu courant",
    lastUpdate: "2025-01-14",
    priceHistory: [
      { date: "2024-12-15", price: 590 },
      { date: "2024-12-22", price: 570 },
      { date: "2024-12-29", price: 550 },
      { date: "2025-01-05", price: 535 },
      { date: "2025-01-12", price: 520 },
    ],
  },
  {
    id: "3",
    name: "Ryzen 7 7800X3D",
    category: "CPU",
    brand: "AMD",
    medianPrice: 430,
    priceChange7d: +1.2,
    priceChange30d: -3.4,
    volume: 89,
    rarity: "Peu courant",
    lastUpdate: "2025-01-13",
    priceHistory: [
      { date: "2024-12-15", price: 445 },
      { date: "2024-12-22", price: 440 },
      { date: "2024-12-29", price: 435 },
      { date: "2025-01-05", price: 425 },
      { date: "2025-01-12", price: 430 },
    ],
  },
  {
    id: "4",
    name: "DDR5 32GB 6000MHz",
    category: "RAM",
    brand: "Corsair",
    medianPrice: 130,
    priceChange7d: -4.5,
    priceChange30d: -9.8,
    volume: 320,
    rarity: "Commun",
    lastUpdate: "2025-01-15",
    priceHistory: [
      { date: "2024-12-15", price: 145 },
      { date: "2024-12-22", price: 140 },
      { date: "2024-12-29", price: 135 },
      { date: "2025-01-05", price: 132 },
      { date: "2025-01-12", price: 130 },
    ],
  },
  {
    id: "5",
    name: "Samsung 980 Pro 2TB",
    category: "SSD",
    brand: "Samsung",
    medianPrice: 170,
    priceChange7d: -1.8,
    priceChange30d: -6.2,
    volume: 156,
    rarity: "Commun",
    lastUpdate: "2025-01-14",
    priceHistory: [
      { date: "2024-12-15", price: 182 },
      { date: "2024-12-22", price: 178 },
      { date: "2024-12-29", price: 174 },
      { date: "2025-01-05", price: 172 },
      { date: "2025-01-12", price: 170 },
    ],
  },
];

export const mockStats: MarketStats = {
  totalAds: 12547,
  opportunities: 342,
  medianGPUPrice: 385,
  totalVolume: 1847230,
};

export const subscriptionPlans = [
  {
    name: "Basic",
    price: 20,
    credits: 50,
    features: [
      "50 crédits/mois",
      "Catalogue complet",
      "Alertes email quotidiennes",
      "Historique des prix 30 jours",
    ],
  },
  {
    name: "Pro",
    price: 45,
    credits: 150,
    features: [
      "150 crédits/mois",
      "Accès à l'estimator",
      "Alertes temps réel",
      "Historique complet",
      "Analyses détaillées",
      "Comparateur de modèles",
    ],
    popular: true,
  },
  {
    name: "Elite",
    price: 90,
    credits: 400,
    features: [
      "400 crédits/mois",
      "Accès complet",
      "Scrap personnel",
      "Publication données 24h après",
      "Exports personnalisés (CSV, Excel)",
      "Support prioritaire",
      "Alertes instantanées",
    ],
  },
];
