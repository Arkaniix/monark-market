// ============= Internal Mock Dataset for mockProvider =============
// Deterministic, seeded pseudo-random for consistent data across refreshes
// This file should ONLY be imported by mockProvider.ts

// ============= Seeded Random Generator =============
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const random = createSeededRandom(42);

// ============= Helper Functions =============
function pick<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

function pickWeighted<T>(arr: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

// ============= Reference Data =============
const REGIONS = [
  "Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur",
  "Occitanie", "Nouvelle-Aquitaine", "Hauts-de-France", "Grand Est",
  "Pays de la Loire", "Bretagne", "Normandie", "Bourgogne-Franche-Comté",
  "Centre-Val de Loire"
];

const CITIES_BY_REGION: Record<string, string[]> = {
  "Île-de-France": ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles", "Nanterre", "Créteil", "Argenteuil"],
  "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble", "Saint-Étienne", "Clermont-Ferrand", "Annecy", "Villeurbanne"],
  "Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon", "Cannes"],
  "Occitanie": ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers", "Carcassonne"],
  "Nouvelle-Aquitaine": ["Bordeaux", "Limoges", "Poitiers", "Pau", "La Rochelle", "Bayonne"],
  "Hauts-de-France": ["Lille", "Amiens", "Roubaix", "Dunkerque", "Calais", "Tourcoing"],
  "Grand Est": ["Strasbourg", "Reims", "Metz", "Nancy", "Mulhouse", "Colmar"],
  "Pays de la Loire": ["Nantes", "Angers", "Le Mans", "Saint-Nazaire", "La Roche-sur-Yon"],
  "Bretagne": ["Rennes", "Brest", "Quimper", "Lorient", "Vannes", "Saint-Malo"],
  "Normandie": ["Le Havre", "Rouen", "Caen", "Cherbourg", "Dieppe"],
  "Bourgogne-Franche-Comté": ["Dijon", "Besançon", "Belfort", "Auxerre"],
  "Centre-Val de Loire": ["Tours", "Orléans", "Blois", "Chartres", "Bourges"]
};

const CONDITIONS = ["Neuf", "Comme neuf", "Très bon état", "Bon état", "Satisfaisant"];
const PLATFORMS = ["leboncoin", "facebook", "ebay", "ldlc", "vinted"];
const CARD_BRANDS = ["ASUS", "MSI", "Gigabyte", "EVGA", "Sapphire", "XFX", "Zotac", "PowerColor", "Palit", "PNY", "Gainward"];
const SUFFIXES = ["Gaming", "OC", "Pro", "Elite", "Strix", "Tuf", "Ventus", "Gaming X", "Eagle", ""];

// ============= Hardware Models Database =============
interface BaseModel {
  name: string;
  /** Brand of the product (for GPU: card brand like MSI, ASUS. For CPU/RAM/SSD: chip maker) */
  brand: string;
  family: string;
  priceRange: [number, number];
  /** Optional: chipset manufacturer for GPUs (NVIDIA, AMD, Intel) */
  manufacturer?: string;
}

const GPU_MODELS: BaseModel[] = [
  // RTX 50 Series (newest)
  { name: "RTX 5090", brand: "ASUS", manufacturer: "NVIDIA", family: "RTX 50", priceRange: [1999, 2499] },
  { name: "RTX 5080", brand: "MSI", manufacturer: "NVIDIA", family: "RTX 50", priceRange: [999, 1299] },
  { name: "RTX 5070 Ti", brand: "Gigabyte", manufacturer: "NVIDIA", family: "RTX 50", priceRange: [749, 899] },
  { name: "RTX 5070", brand: "EVGA", manufacturer: "NVIDIA", family: "RTX 50", priceRange: [549, 699] },
  // RTX 40 Series
  { name: "RTX 4090", brand: "ASUS", manufacturer: "NVIDIA", family: "RTX 40", priceRange: [1500, 2000] },
  { name: "RTX 4090 D", brand: "MSI", manufacturer: "NVIDIA", family: "RTX 40", priceRange: [1400, 1800] },
  { name: "RTX 4080 Super", brand: "Gigabyte", manufacturer: "NVIDIA", family: "RTX 40", priceRange: [950, 1200] },
  { name: "RTX 4080", brand: "ASUS", manufacturer: "NVIDIA", family: "RTX 40", priceRange: [900, 1100] },
  { name: "RTX 4070 Ti Super", brand: "MSI", manufacturer: "NVIDIA", family: "RTX 40", priceRange: [750, 900] },
  { name: "RTX 4070 Ti", brand: "Gigabyte", manufacturer: "NVIDIA", family: "RTX 40", priceRange: [650, 800] },
  { name: "RTX 4070 Super", brand: "EVGA", manufacturer: "NVIDIA", family: "RTX 40", priceRange: [550, 700] },
  { name: "RTX 4070", brand: "Zotac", manufacturer: "NVIDIA", family: "RTX 40", priceRange: [480, 600] },
  { name: "RTX 4060 Ti 16GB", brand: "ASUS", manufacturer: "NVIDIA", family: "RTX 40", priceRange: [400, 480] },
  { name: "RTX 4060 Ti 8GB", brand: "MSI", manufacturer: "NVIDIA", family: "RTX 40", priceRange: [350, 420] },
  { name: "RTX 4060", brand: "Palit", manufacturer: "NVIDIA", family: "RTX 40", priceRange: [270, 340] },
  // RTX 30 Series
  { name: "RTX 3090 Ti", brand: "ASUS", manufacturer: "NVIDIA", family: "RTX 30", priceRange: [750, 950] },
  { name: "RTX 3090", brand: "MSI", manufacturer: "NVIDIA", family: "RTX 30", priceRange: [650, 850] },
  { name: "RTX 3080 Ti", brand: "Gigabyte", manufacturer: "NVIDIA", family: "RTX 30", priceRange: [520, 680] },
  { name: "RTX 3080 12GB", brand: "EVGA", manufacturer: "NVIDIA", family: "RTX 30", priceRange: [450, 600] },
  { name: "RTX 3080 10GB", brand: "ASUS", manufacturer: "NVIDIA", family: "RTX 30", priceRange: [420, 550] },
  { name: "RTX 3070 Ti", brand: "MSI", manufacturer: "NVIDIA", family: "RTX 30", priceRange: [360, 460] },
  { name: "RTX 3070", brand: "Zotac", manufacturer: "NVIDIA", family: "RTX 30", priceRange: [300, 400] },
  { name: "RTX 3060 Ti", brand: "Gigabyte", manufacturer: "NVIDIA", family: "RTX 30", priceRange: [260, 340] },
  { name: "RTX 3060 12GB", brand: "PNY", manufacturer: "NVIDIA", family: "RTX 30", priceRange: [200, 280] },
  { name: "RTX 3060 8GB", brand: "Gainward", manufacturer: "NVIDIA", family: "RTX 30", priceRange: [180, 250] },
  { name: "RTX 3050", brand: "ASUS", manufacturer: "NVIDIA", family: "RTX 30", priceRange: [150, 220] },
  // RTX 20 Series
  { name: "RTX 2080 Ti", brand: "MSI", manufacturer: "NVIDIA", family: "RTX 20", priceRange: [350, 480] },
  { name: "RTX 2080 Super", brand: "Gigabyte", manufacturer: "NVIDIA", family: "RTX 20", priceRange: [280, 380] },
  { name: "RTX 2080", brand: "EVGA", manufacturer: "NVIDIA", family: "RTX 20", priceRange: [250, 340] },
  { name: "RTX 2070 Super", brand: "ASUS", manufacturer: "NVIDIA", family: "RTX 20", priceRange: [220, 300] },
  { name: "RTX 2070", brand: "Zotac", manufacturer: "NVIDIA", family: "RTX 20", priceRange: [180, 260] },
  { name: "RTX 2060 Super", brand: "MSI", manufacturer: "NVIDIA", family: "RTX 20", priceRange: [160, 230] },
  { name: "RTX 2060", brand: "Palit", manufacturer: "NVIDIA", family: "RTX 20", priceRange: [130, 190] },
  // AMD RX 9000
  { name: "RX 9070 XT", brand: "Sapphire", manufacturer: "AMD", family: "RX 9000", priceRange: [549, 699] },
  { name: "RX 9070", brand: "XFX", manufacturer: "AMD", family: "RX 9000", priceRange: [449, 579] },
  // AMD RX 7000
  { name: "RX 7900 XTX", brand: "Sapphire", manufacturer: "AMD", family: "RX 7000", priceRange: [850, 1050] },
  { name: "RX 7900 XT", brand: "PowerColor", manufacturer: "AMD", family: "RX 7000", priceRange: [700, 900] },
  { name: "RX 7900 GRE", brand: "XFX", manufacturer: "AMD", family: "RX 7000", priceRange: [520, 660] },
  { name: "RX 7800 XT", brand: "Sapphire", manufacturer: "AMD", family: "RX 7000", priceRange: [430, 560] },
  { name: "RX 7700 XT", brand: "ASUS", manufacturer: "AMD", family: "RX 7000", priceRange: [360, 460] },
  { name: "RX 7600 XT", brand: "MSI", manufacturer: "AMD", family: "RX 7000", priceRange: [300, 380] },
  { name: "RX 7600", brand: "Gigabyte", manufacturer: "AMD", family: "RX 7000", priceRange: [240, 320] },
  // AMD RX 6000
  { name: "RX 6950 XT", brand: "Sapphire", manufacturer: "AMD", family: "RX 6000", priceRange: [420, 550] },
  { name: "RX 6900 XT", brand: "PowerColor", manufacturer: "AMD", family: "RX 6000", priceRange: [380, 500] },
  { name: "RX 6800 XT", brand: "XFX", manufacturer: "AMD", family: "RX 6000", priceRange: [320, 430] },
  { name: "RX 6800", brand: "Sapphire", manufacturer: "AMD", family: "RX 6000", priceRange: [280, 380] },
  { name: "RX 6750 XT", brand: "ASUS", manufacturer: "AMD", family: "RX 6000", priceRange: [240, 320] },
  { name: "RX 6700 XT", brand: "MSI", manufacturer: "AMD", family: "RX 6000", priceRange: [220, 300] },
  { name: "RX 6650 XT", brand: "Gigabyte", manufacturer: "AMD", family: "RX 6000", priceRange: [180, 250] },
  { name: "RX 6600 XT", brand: "PowerColor", manufacturer: "AMD", family: "RX 6000", priceRange: [160, 230] },
  { name: "RX 6600", brand: "XFX", manufacturer: "AMD", family: "RX 6000", priceRange: [140, 200] },
  // Intel Arc
  { name: "Arc A770 16GB", brand: "ASUS", manufacturer: "Intel", family: "Arc", priceRange: [280, 360] },
  { name: "Arc A770 8GB", brand: "MSI", manufacturer: "Intel", family: "Arc", priceRange: [240, 320] },
  { name: "Arc A750", brand: "Gigabyte", manufacturer: "Intel", family: "Arc", priceRange: [200, 280] },
  { name: "Arc A580", brand: "ASUS", manufacturer: "Intel", family: "Arc", priceRange: [160, 220] },
];

const CPU_MODELS: BaseModel[] = [
  // AMD Ryzen 9000
  { name: "Ryzen 9 9950X", brand: "AMD", family: "Ryzen 9000", priceRange: [550, 700] },
  { name: "Ryzen 9 9900X", brand: "AMD", family: "Ryzen 9000", priceRange: [450, 580] },
  { name: "Ryzen 7 9700X", brand: "AMD", family: "Ryzen 9000", priceRange: [350, 450] },
  { name: "Ryzen 5 9600X", brand: "AMD", family: "Ryzen 9000", priceRange: [270, 350] },
  // AMD Ryzen 7000
  { name: "Ryzen 9 7950X3D", brand: "AMD", family: "Ryzen 7000", priceRange: [550, 700] },
  { name: "Ryzen 9 7950X", brand: "AMD", family: "Ryzen 7000", priceRange: [480, 620] },
  { name: "Ryzen 9 7900X3D", brand: "AMD", family: "Ryzen 7000", priceRange: [450, 580] },
  { name: "Ryzen 9 7900X", brand: "AMD", family: "Ryzen 7000", priceRange: [380, 500] },
  { name: "Ryzen 9 7900", brand: "AMD", family: "Ryzen 7000", priceRange: [350, 450] },
  { name: "Ryzen 7 7800X3D", brand: "AMD", family: "Ryzen 7000", priceRange: [370, 450] },
  { name: "Ryzen 7 7700X", brand: "AMD", family: "Ryzen 7000", priceRange: [280, 360] },
  { name: "Ryzen 7 7700", brand: "AMD", family: "Ryzen 7000", priceRange: [250, 330] },
  { name: "Ryzen 5 7600X", brand: "AMD", family: "Ryzen 7000", priceRange: [200, 280] },
  { name: "Ryzen 5 7600", brand: "AMD", family: "Ryzen 7000", priceRange: [180, 250] },
  // AMD Ryzen 5000
  { name: "Ryzen 9 5950X", brand: "AMD", family: "Ryzen 5000", priceRange: [320, 420] },
  { name: "Ryzen 9 5900X", brand: "AMD", family: "Ryzen 5000", priceRange: [260, 350] },
  { name: "Ryzen 7 5800X3D", brand: "AMD", family: "Ryzen 5000", priceRange: [260, 340] },
  { name: "Ryzen 7 5800X", brand: "AMD", family: "Ryzen 5000", priceRange: [170, 240] },
  { name: "Ryzen 7 5700X", brand: "AMD", family: "Ryzen 5000", priceRange: [150, 210] },
  { name: "Ryzen 5 5600X", brand: "AMD", family: "Ryzen 5000", priceRange: [110, 160] },
  { name: "Ryzen 5 5600", brand: "AMD", family: "Ryzen 5000", priceRange: [100, 145] },
  { name: "Ryzen 5 5500", brand: "AMD", family: "Ryzen 5000", priceRange: [85, 130] },
  // Intel Core Ultra
  { name: "Core Ultra 9 285K", brand: "Intel", family: "Core Ultra", priceRange: [580, 720] },
  { name: "Core Ultra 7 265K", brand: "Intel", family: "Core Ultra", priceRange: [380, 480] },
  { name: "Core Ultra 5 245K", brand: "Intel", family: "Core Ultra", priceRange: [280, 360] },
  // Intel 14th Gen
  { name: "i9-14900KS", brand: "Intel", family: "Intel 14th", priceRange: [580, 720] },
  { name: "i9-14900K", brand: "Intel", family: "Intel 14th", priceRange: [500, 640] },
  { name: "i9-14900KF", brand: "Intel", family: "Intel 14th", priceRange: [460, 590] },
  { name: "i7-14700K", brand: "Intel", family: "Intel 14th", priceRange: [360, 460] },
  { name: "i7-14700KF", brand: "Intel", family: "Intel 14th", priceRange: [330, 420] },
  { name: "i5-14600K", brand: "Intel", family: "Intel 14th", priceRange: [260, 340] },
  { name: "i5-14600KF", brand: "Intel", family: "Intel 14th", priceRange: [240, 310] },
  { name: "i5-14400F", brand: "Intel", family: "Intel 14th", priceRange: [170, 230] },
  // Intel 13th Gen
  { name: "i9-13900KS", brand: "Intel", family: "Intel 13th", priceRange: [520, 670] },
  { name: "i9-13900K", brand: "Intel", family: "Intel 13th", priceRange: [450, 580] },
  { name: "i9-13900KF", brand: "Intel", family: "Intel 13th", priceRange: [420, 540] },
  { name: "i7-13700K", brand: "Intel", family: "Intel 13th", priceRange: [320, 420] },
  { name: "i7-13700KF", brand: "Intel", family: "Intel 13th", priceRange: [290, 380] },
  { name: "i5-13600K", brand: "Intel", family: "Intel 13th", priceRange: [230, 310] },
  { name: "i5-13600KF", brand: "Intel", family: "Intel 13th", priceRange: [210, 280] },
  { name: "i5-13400F", brand: "Intel", family: "Intel 13th", priceRange: [150, 210] },
  // Intel 12th Gen
  { name: "i9-12900K", brand: "Intel", family: "Intel 12th", priceRange: [280, 380] },
  { name: "i7-12700K", brand: "Intel", family: "Intel 12th", priceRange: [220, 300] },
  { name: "i5-12600K", brand: "Intel", family: "Intel 12th", priceRange: [170, 240] },
  { name: "i5-12400F", brand: "Intel", family: "Intel 12th", priceRange: [110, 160] },
];

const RAM_MODELS: BaseModel[] = [
  // DDR5 High-end
  { name: "DDR5 64GB 7200MHz", brand: "G.Skill", family: "DDR5", priceRange: [350, 480] },
  { name: "DDR5 64GB 6400MHz", brand: "G.Skill", family: "DDR5", priceRange: [280, 380] },
  { name: "DDR5 48GB 8000MHz", brand: "G.Skill", family: "DDR5", priceRange: [320, 420] },
  { name: "DDR5 32GB 8000MHz", brand: "G.Skill", family: "DDR5", priceRange: [220, 300] },
  { name: "DDR5 32GB 7200MHz", brand: "G.Skill", family: "DDR5", priceRange: [180, 250] },
  { name: "DDR5 32GB 6400MHz", brand: "Corsair", family: "DDR5", priceRange: [140, 200] },
  { name: "DDR5 32GB 6000MHz", brand: "Corsair", family: "DDR5", priceRange: [110, 160] },
  { name: "DDR5 32GB 5600MHz", brand: "Kingston", family: "DDR5", priceRange: [90, 130] },
  { name: "DDR5 32GB 4800MHz", brand: "Kingston", family: "DDR5", priceRange: [75, 110] },
  { name: "DDR5 16GB 6400MHz", brand: "G.Skill", family: "DDR5", priceRange: [80, 120] },
  { name: "DDR5 16GB 6000MHz", brand: "Corsair", family: "DDR5", priceRange: [65, 95] },
  { name: "DDR5 16GB 5600MHz", brand: "Kingston", family: "DDR5", priceRange: [55, 80] },
  // DDR4
  { name: "DDR4 64GB 3600MHz", brand: "G.Skill", family: "DDR4", priceRange: [130, 190] },
  { name: "DDR4 64GB 3200MHz", brand: "Corsair", family: "DDR4", priceRange: [110, 160] },
  { name: "DDR4 32GB 3600MHz", brand: "G.Skill", family: "DDR4", priceRange: [60, 90] },
  { name: "DDR4 32GB 3200MHz", brand: "Corsair", family: "DDR4", priceRange: [50, 75] },
  { name: "DDR4 32GB 3000MHz", brand: "Kingston", family: "DDR4", priceRange: [45, 70] },
  { name: "DDR4 16GB 3600MHz", brand: "G.Skill", family: "DDR4", priceRange: [35, 55] },
  { name: "DDR4 16GB 3200MHz", brand: "Corsair", family: "DDR4", priceRange: [30, 48] },
  { name: "DDR4 16GB 2666MHz", brand: "Crucial", family: "DDR4", priceRange: [25, 40] },
];

const SSD_MODELS: BaseModel[] = [
  // Gen5 NVMe
  { name: "T700 4TB", brand: "Crucial", family: "NVMe Gen5", priceRange: [480, 620] },
  { name: "T700 2TB", brand: "Crucial", family: "NVMe Gen5", priceRange: [280, 380] },
  { name: "T700 1TB", brand: "Crucial", family: "NVMe Gen5", priceRange: [160, 220] },
  { name: "990 Pro 4TB", brand: "Samsung", family: "NVMe Gen4", priceRange: [320, 420] },
  { name: "990 Pro 2TB", brand: "Samsung", family: "NVMe Gen4", priceRange: [170, 230] },
  { name: "990 Pro 1TB", brand: "Samsung", family: "NVMe Gen4", priceRange: [95, 135] },
  { name: "980 Pro 2TB", brand: "Samsung", family: "NVMe Gen4", priceRange: [140, 190] },
  { name: "980 Pro 1TB", brand: "Samsung", family: "NVMe Gen4", priceRange: [80, 115] },
  { name: "SN850X 4TB", brand: "WD", family: "NVMe Gen4", priceRange: [280, 380] },
  { name: "SN850X 2TB", brand: "WD", family: "NVMe Gen4", priceRange: [140, 190] },
  { name: "SN850X 1TB", brand: "WD", family: "NVMe Gen4", priceRange: [75, 110] },
  { name: "SN770 2TB", brand: "WD", family: "NVMe Gen4", priceRange: [100, 145] },
  { name: "SN770 1TB", brand: "WD", family: "NVMe Gen4", priceRange: [55, 85] },
  { name: "P5 Plus 2TB", brand: "Crucial", family: "NVMe Gen4", priceRange: [110, 160] },
  { name: "P5 Plus 1TB", brand: "Crucial", family: "NVMe Gen4", priceRange: [65, 95] },
  { name: "KC3000 4TB", brand: "Kingston", family: "NVMe Gen4", priceRange: [300, 400] },
  { name: "KC3000 2TB", brand: "Kingston", family: "NVMe Gen4", priceRange: [130, 180] },
  { name: "KC3000 1TB", brand: "Kingston", family: "NVMe Gen4", priceRange: [75, 110] },
  { name: "FireCuda 530 4TB", brand: "Seagate", family: "NVMe Gen4", priceRange: [380, 500] },
  { name: "FireCuda 530 2TB", brand: "Seagate", family: "NVMe Gen4", priceRange: [160, 220] },
  { name: "FireCuda 530 1TB", brand: "Seagate", family: "NVMe Gen4", priceRange: [95, 135] },
  // SATA
  { name: "870 EVO 4TB", brand: "Samsung", family: "SATA", priceRange: [240, 330] },
  { name: "870 EVO 2TB", brand: "Samsung", family: "SATA", priceRange: [120, 170] },
  { name: "870 EVO 1TB", brand: "Samsung", family: "SATA", priceRange: [70, 100] },
  { name: "MX500 4TB", brand: "Crucial", family: "SATA", priceRange: [220, 300] },
  { name: "MX500 2TB", brand: "Crucial", family: "SATA", priceRange: [95, 140] },
  { name: "MX500 1TB", brand: "Crucial", family: "SATA", priceRange: [55, 80] },
];

const MOTHERBOARD_MODELS: BaseModel[] = [
  // AM5 (AMD)
  { name: "ROG Crosshair X870E Hero", brand: "ASUS", family: "AM5", priceRange: [650, 800] },
  { name: "ROG Crosshair X670E Hero", brand: "ASUS", family: "AM5", priceRange: [500, 650] },
  { name: "MEG X670E ACE", brand: "MSI", family: "AM5", priceRange: [550, 700] },
  { name: "X670E AORUS Master", brand: "Gigabyte", family: "AM5", priceRange: [450, 580] },
  { name: "B650E Taichi", brand: "ASRock", family: "AM5", priceRange: [350, 450] },
  { name: "ROG Strix B650E-F", brand: "ASUS", family: "AM5", priceRange: [280, 360] },
  { name: "B650 Tomahawk WiFi", brand: "MSI", family: "AM5", priceRange: [200, 270] },
  { name: "B650M AORUS Elite", brand: "Gigabyte", family: "AM5", priceRange: [160, 220] },
  { name: "B650M Pro RS", brand: "ASRock", family: "AM5", priceRange: [130, 180] },
  // LGA1700 (Intel)
  { name: "ROG Maximus Z790 Hero", brand: "ASUS", family: "LGA1700", priceRange: [520, 680] },
  { name: "Z790 AORUS Master", brand: "Gigabyte", family: "LGA1700", priceRange: [450, 580] },
  { name: "MEG Z790 ACE", brand: "MSI", family: "LGA1700", priceRange: [480, 620] },
  { name: "ROG Strix Z790-E", brand: "ASUS", family: "LGA1700", priceRange: [380, 480] },
  { name: "MAG Z790 Tomahawk", brand: "MSI", family: "LGA1700", priceRange: [280, 360] },
  { name: "Z790 AORUS Elite", brand: "Gigabyte", family: "LGA1700", priceRange: [240, 320] },
  { name: "B760 Tomahawk WiFi", brand: "MSI", family: "LGA1700", priceRange: [180, 250] },
  { name: "B760M AORUS Elite", brand: "Gigabyte", family: "LGA1700", priceRange: [150, 200] },
  { name: "ROG Strix B760-F", brand: "ASUS", family: "LGA1700", priceRange: [200, 270] },
  // AM4 (Legacy)
  { name: "ROG Crosshair VIII Hero", brand: "ASUS", family: "AM4", priceRange: [250, 340] },
  { name: "X570 AORUS Master", brand: "Gigabyte", family: "AM4", priceRange: [200, 280] },
  { name: "B550 AORUS Pro", brand: "Gigabyte", family: "AM4", priceRange: [120, 170] },
  { name: "B550 Tomahawk", brand: "MSI", family: "AM4", priceRange: [100, 150] },
  { name: "B550M Pro-VDH", brand: "MSI", family: "AM4", priceRange: [70, 110] },
];

// ============= Internal Model Type (extends for catalog) =============
export interface InternalModel {
  id: number;
  name: string;
  /** Card/product brand (MSI, ASUS, Gigabyte, etc.) */
  brand: string;
  /** Chipset manufacturer (NVIDIA, AMD, Intel) - mainly for GPUs */
  manufacturer: string | null;
  family: string;
  category: string;
  median_price: number;
  fair_value_30d: number;
  price_median_30d: number;
  var_7d_pct: number;
  var_30d_pct: number;
  volume: number;
  liquidity: number;
  ads_count: number;
  last_scan_at: string;
  aliases: string[];
  image_url?: string | null;
}

// ============= Generate Models =============
function generateModels(): InternalModel[] {
  const models: InternalModel[] = [];
  let id = 1;

  const allBase = [
    ...GPU_MODELS.map(m => ({ ...m, category: 'GPU' })),
    ...CPU_MODELS.map(m => ({ ...m, category: 'CPU' })),
    ...RAM_MODELS.map(m => ({ ...m, category: 'RAM' })),
    ...SSD_MODELS.map(m => ({ ...m, category: 'SSD' })),
    ...MOTHERBOARD_MODELS.map(m => ({ ...m, category: 'Motherboard' })),
  ];

  for (const base of allBase) {
    const medianPrice = Math.round(base.priceRange[0] + random() * (base.priceRange[1] - base.priceRange[0]));
    const var7d = -8 + random() * 16;
    const var30d = -15 + random() * 30;
    const volume = Math.floor(15 + random() * 250);
    const daysAgo = Math.floor(random() * 7);
    
    // Calculate realistic liquidity (0-1) based on volume + random factor for variety
    // High volume = tends to high liquidity, but with some variance
    const volumeFactor = Math.min(1, volume / 200); // 0-1 based on volume (max at 200)
    const randomVariance = -0.2 + random() * 0.4; // -0.2 to +0.2
    const liquidity = Math.max(0.05, Math.min(0.98, volumeFactor * 0.7 + random() * 0.3 + randomVariance));

    models.push({
      id: id++,
      name: base.name,
      brand: base.brand,
      manufacturer: base.manufacturer || null,
      family: base.family,
      category: base.category,
      median_price: medianPrice,
      fair_value_30d: Math.round(medianPrice * (0.95 + random() * 0.1)),
      price_median_30d: Math.round(medianPrice * (0.92 + random() * 0.16)),
      var_7d_pct: Math.round(var7d * 10) / 10,
      var_30d_pct: Math.round(var30d * 10) / 10,
      volume,
      liquidity: Math.round(liquidity * 100) / 100, // Round to 2 decimals (0.05 to 0.98)
      ads_count: Math.floor(volume * (1.2 + random() * 0.8)),
      last_scan_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      aliases: [],
    });
  }

  return models;
}

// ============= Internal Ad Type (Full Detail) =============
export interface InternalAd {
  id: number;
  ad_id: number;
  title: string;
  description: string;
  price: number;
  fair_value: number;
  deviation_pct: number;
  score: number;
  platform: string;
  city: string;
  region: string;
  postal_code: string;
  condition: string;
  category: string;
  model_name: string;
  model_id: number | null;
  item_type: 'component' | 'pc' | 'lot';
  delivery_possible: boolean;
  secured_payment: boolean;
  published_at: string;
  first_seen_at: string;
  last_seen_at: string;
  status: string;
  seller_type: string;
  url: string;
}

// ============= Internal Deal Type (List View) =============
export interface InternalDeal {
  id: number;
  ad_id: number;
  title: string;
  price: number;
  fair_value: number;
  deviation_pct: number;
  score: number;
  platform: string;
  city: string;
  region: string;
  condition: string;
  category: string;
  model_name: string;
  model_id: number | null;
  item_type: 'component' | 'pc' | 'lot';
  delivery_possible: boolean;
  published_at: string;
  publication_date: string;
  url: string;
  /** Ad-specific image URL (from the listing) */
  image_url: string | null;
  /** Generic model image URL (from our database) */
  model_image_url: string | null;
}

// ============= Price History Point =============
export interface InternalPricePoint {
  date: string;
  price: number;
}

// ============= PC Configurations for "PC complet" item type =============
interface PCConfig {
  name: string;
  tier: 'budget' | 'midrange' | 'highend' | 'enthusiast';
  priceRange: [number, number];
  components: string[];
}

const PC_CONFIGS: PCConfig[] = [
  // Budget PCs
  { name: "PC Gaming Budget RTX 3060", tier: 'budget', priceRange: [550, 750], components: ["Ryzen 5 5600", "RTX 3060", "16GB DDR4", "500GB NVMe"] },
  { name: "PC Bureautique i5", tier: 'budget', priceRange: [300, 450], components: ["i5-12400F", "GTX 1650", "16GB DDR4", "256GB SSD"] },
  { name: "PC Gaming Entry RX 6600", tier: 'budget', priceRange: [480, 650], components: ["Ryzen 5 5500", "RX 6600", "16GB DDR4", "512GB NVMe"] },
  // Midrange PCs
  { name: "PC Gaming RTX 4060 Ti", tier: 'midrange', priceRange: [850, 1100], components: ["Ryzen 5 7600", "RTX 4060 Ti", "32GB DDR5", "1TB NVMe"] },
  { name: "PC Workstation Ryzen 7", tier: 'midrange', priceRange: [900, 1200], components: ["Ryzen 7 7700X", "RTX 4060", "32GB DDR5", "2TB NVMe"] },
  { name: "PC Gaming RX 7700 XT", tier: 'midrange', priceRange: [800, 1050], components: ["Ryzen 5 7600X", "RX 7700 XT", "32GB DDR5", "1TB NVMe"] },
  { name: "PC Gaming RTX 4070", tier: 'midrange', priceRange: [1000, 1300], components: ["i5-14600K", "RTX 4070", "32GB DDR5", "1TB NVMe"] },
  // High-end PCs
  { name: "PC Gaming RTX 4080 Super", tier: 'highend', priceRange: [1600, 2100], components: ["Ryzen 7 7800X3D", "RTX 4080 Super", "32GB DDR5", "2TB NVMe"] },
  { name: "PC Ultra Gaming RTX 4070 Ti Super", tier: 'highend', priceRange: [1400, 1800], components: ["i7-14700K", "RTX 4070 Ti Super", "32GB DDR5", "2TB NVMe"] },
  { name: "PC Streaming RX 7900 XT", tier: 'highend', priceRange: [1300, 1700], components: ["Ryzen 9 7900X", "RX 7900 XT", "64GB DDR5", "2TB NVMe"] },
  // Enthusiast PCs
  { name: "PC Ultime RTX 4090", tier: 'enthusiast', priceRange: [2500, 3500], components: ["Ryzen 9 7950X3D", "RTX 4090", "64GB DDR5", "4TB NVMe"] },
  { name: "PC Workstation Pro i9", tier: 'enthusiast', priceRange: [2200, 3000], components: ["i9-14900K", "RTX 4080 Super", "128GB DDR5", "4TB NVMe"] },
  { name: "PC Gaming RTX 5080", tier: 'enthusiast', priceRange: [2000, 2800], components: ["Ryzen 9 9900X", "RTX 5080", "64GB DDR5", "2TB NVMe"] },
];

// ============= Lot Configurations =============
interface LotConfig {
  name: string;
  priceRange: [number, number];
  itemCount: number;
}

const LOT_CONFIGS: LotConfig[] = [
  { name: "Lot 2x RTX 3070", priceRange: [500, 700], itemCount: 2 },
  { name: "Lot GPU mining (3x RX 580)", priceRange: [180, 280], itemCount: 3 },
  { name: "Lot composants PC complet", priceRange: [400, 600], itemCount: 5 },
  { name: "Lot RAM DDR4 4x16GB", priceRange: [80, 140], itemCount: 4 },
  { name: "Lot SSD NVMe 2TB + 1TB", priceRange: [150, 220], itemCount: 2 },
  { name: "Lot watercooling AIO 360mm + ventilateurs", priceRange: [120, 200], itemCount: 4 },
];

// ============= Generate Ads (Full Detail, 50+ items) =============
function generateAds(count: number, models: InternalModel[]): InternalAd[] {
  const ads: InternalAd[] = [];
  const sellerTypes = ['Particulier', 'Professionnel', 'Boutique'];
  const statusOptions = ['active', 'active', 'active', 'active', 'sold'];

  // Calculate distribution: 75% components, 18% PCs, 7% lots
  const pcCount = Math.floor(count * 0.18);
  const lotCount = Math.floor(count * 0.07);
  const componentCount = count - pcCount - lotCount;

  // Generate PC ads first
  for (let i = 0; i < pcCount; i++) {
    const pcConfig = PC_CONFIGS[Math.floor(random() * PC_CONFIGS.length)];
    const region = pick(REGIONS);
    const cities = CITIES_BY_REGION[region] || ["Ville"];
    const city = pick(cities);
    const condition = pick(CONDITIONS);
    const platform = pick(PLATFORMS);

    const basePrice = pcConfig.priceRange[0] + random() * (pcConfig.priceRange[1] - pcConfig.priceRange[0]);
    const fairValue = Math.round(basePrice * (1.1 + random() * 0.2));
    const discountFactor = 0.70 + random() * 0.25;
    const price = Math.round(fairValue * discountFactor);
    const deviationPct = Math.round((1 - price / fairValue) * 100);
    const score = Math.min(100, Math.max(40, 50 + deviationPct * 1.5 + random() * 10));

    const daysAgo = Math.floor(random() * 60);
    const pubDate = new Date(Date.now() - daysAgo * 86400000);
    const firstSeen = new Date(pubDate.getTime() - Math.floor(random() * 7) * 86400000);
    const postalCode = String(10000 + Math.floor(random() * 90000));

    const adId = 40000000 + i;
    ads.push({
      id: ads.length + 1,
      ad_id: adId,
      title: `${pcConfig.name} - ${condition}`,
      description: `PC complet gaming/bureautique. Config: ${pcConfig.components.join(', ')}. ${condition}.`,
      price,
      fair_value: fairValue,
      deviation_pct: deviationPct,
      score: Math.round(score),
      platform,
      city,
      region,
      postal_code: postalCode,
      condition,
      category: 'PC',
      model_name: pcConfig.name,
      model_id: null,
      item_type: 'pc',
      delivery_possible: random() > 0.4,
      secured_payment: random() > 0.3,
      published_at: pubDate.toISOString(),
      first_seen_at: firstSeen.toISOString(),
      last_seen_at: new Date(Date.now() - Math.floor(random() * 2) * 86400000).toISOString(),
      status: pick(statusOptions),
      seller_type: pick(sellerTypes),
      url: `https://www.${platform}.fr/ad/${adId}`,
    });
  }

  // Generate Lot ads
  for (let i = 0; i < lotCount; i++) {
    const lotConfig = LOT_CONFIGS[Math.floor(random() * LOT_CONFIGS.length)];
    const region = pick(REGIONS);
    const cities = CITIES_BY_REGION[region] || ["Ville"];
    const city = pick(cities);
    const condition = pick(CONDITIONS);
    const platform = pick(PLATFORMS);

    const basePrice = lotConfig.priceRange[0] + random() * (lotConfig.priceRange[1] - lotConfig.priceRange[0]);
    const fairValue = Math.round(basePrice * (1.15 + random() * 0.25));
    const discountFactor = 0.65 + random() * 0.30;
    const price = Math.round(fairValue * discountFactor);
    const deviationPct = Math.round((1 - price / fairValue) * 100);
    const score = Math.min(100, Math.max(40, 50 + deviationPct * 1.5 + random() * 10));

    const daysAgo = Math.floor(random() * 60);
    const pubDate = new Date(Date.now() - daysAgo * 86400000);
    const firstSeen = new Date(pubDate.getTime() - Math.floor(random() * 7) * 86400000);
    const postalCode = String(10000 + Math.floor(random() * 90000));

    const adId = 50000000 + i;
    ads.push({
      id: ads.length + 1,
      ad_id: adId,
      title: lotConfig.name,
      description: `Lot de ${lotConfig.itemCount} articles. ${condition}. Vente groupée uniquement.`,
      price,
      fair_value: fairValue,
      deviation_pct: deviationPct,
      score: Math.round(score),
      platform,
      city,
      region,
      postal_code: postalCode,
      condition,
      category: 'Lot',
      model_name: lotConfig.name,
      model_id: null,
      item_type: 'lot',
      delivery_possible: random() > 0.5,
      secured_payment: random() > 0.4,
      published_at: pubDate.toISOString(),
      first_seen_at: firstSeen.toISOString(),
      last_seen_at: new Date(Date.now() - Math.floor(random() * 2) * 86400000).toISOString(),
      status: pick(statusOptions),
      seller_type: pick(sellerTypes),
      url: `https://www.${platform}.fr/ad/${adId}`,
    });
  }

  // Generate Component ads
  for (let i = 0; i < componentCount; i++) {
    const model = models[Math.floor(random() * models.length)];
    const region = pick(REGIONS);
    const cities = CITIES_BY_REGION[region] || ["Ville"];
    const city = pick(cities);
    const condition = pick(CONDITIONS);
    const platform = pick(PLATFORMS);
    const cardBrand = model.category === 'GPU' || model.category === 'Motherboard' ? pick(CARD_BRANDS) : '';
    const suffix = model.category === 'GPU' ? pick(SUFFIXES) : '';

    // Calculate price with realistic discount
    const discountFactor = 0.68 + random() * 0.40;
    const price = Math.round(model.fair_value_30d * discountFactor);
    const deviationPct = Math.round((1 - price / model.fair_value_30d) * 100);
    const score = Math.min(100, Math.max(35, 45 + deviationPct * 1.8 + random() * 10));

    // Random date in last 60 days
    const daysAgo = Math.floor(random() * 60);
    const pubDate = new Date(Date.now() - daysAgo * 86400000);
    const firstSeen = new Date(pubDate.getTime() - Math.floor(random() * 7) * 86400000);

    const title = cardBrand && suffix
      ? `${cardBrand} ${model.name} ${suffix}`.trim()
      : cardBrand
        ? `${cardBrand} ${model.name}`.trim()
        : model.name;

    const postalCode = String(10000 + Math.floor(random() * 90000));
    const adId = 30000000 + i;

    ads.push({
      id: ads.length + 1,
      ad_id: adId,
      title,
      description: `${title} en ${condition.toLowerCase()}. ${model.category} ${model.brand}. Prix négociable.`,
      price,
      fair_value: model.fair_value_30d,
      deviation_pct: deviationPct,
      score: Math.round(score),
      platform,
      city,
      region,
      postal_code: postalCode,
      condition,
      category: model.category,
      model_name: model.name,
      model_id: model.id,
      item_type: 'component',
      delivery_possible: random() > 0.25,
      secured_payment: random() > 0.3,
      published_at: pubDate.toISOString(),
      first_seen_at: firstSeen.toISOString(),
      last_seen_at: new Date(Date.now() - Math.floor(random() * 2) * 86400000).toISOString(),
      status: pick(statusOptions),
      seller_type: pick(sellerTypes),
      url: `https://www.${platform}.fr/ad/${adId}`,
    });
  }

  return ads;
}

// ============= Generate Deals from Ads =============
function generateDeals(ads: InternalAd[]): InternalDeal[] {
  return ads
    .filter(ad => ad.score >= 60) // Only good deals
    .sort((a, b) => b.score - a.score)
    .map(ad => ({
      id: ad.id,
      ad_id: ad.ad_id,
      title: ad.title,
      price: ad.price,
      fair_value: ad.fair_value,
      deviation_pct: ad.deviation_pct,
      score: ad.score,
      platform: ad.platform,
      city: ad.city,
      region: ad.region,
      condition: ad.condition,
      category: ad.category,
      model_name: ad.model_name,
      model_id: ad.model_id,
      item_type: ad.item_type,
      delivery_possible: ad.delivery_possible,
      published_at: ad.published_at,
      publication_date: ad.published_at,
      url: ad.url,
      // Image fields - null for now to test placeholder rendering
      // In production: image_url comes from ad scraping, model_image_url from our database
      image_url: null,
      model_image_url: null,
    }));
}

// ============= Generate Price History for an Ad =============
export function generateAdPriceHistory(adId: number, basePrice: number): InternalPricePoint[] {
  const seedRandom = createSeededRandom(adId * 31);
  const numPoints = 10 + Math.floor(seedRandom() * 20); // 10-30 points
  const points: InternalPricePoint[] = [];
  
  let currentPrice = basePrice * (1.05 + seedRandom() * 0.15); // Start slightly higher
  
  for (let i = numPoints - 1; i >= 0; i--) {
    const daysAgo = Math.floor(i * (30 / numPoints));
    const date = new Date(Date.now() - daysAgo * 86400000);
    
    points.push({
      date: date.toISOString(),
      price: Math.round(currentPrice),
    });
    
    // Random price change (mostly decreasing)
    if (seedRandom() > 0.3) {
      currentPrice = currentPrice * (0.96 + seedRandom() * 0.05);
    }
  }
  
  // Ensure last price matches basePrice approximately
  if (points.length > 0) {
    points[points.length - 1].price = basePrice;
  }
  
  return points;
}

// ============= Generate Price History for a Model =============
export function generateModelPriceHistory(modelId: number, days: number): { date: string; price_median: number; price_p25: number; price_p75: number; volume: number }[] {
  const seedRandom = createSeededRandom(modelId * 17);
  const basePrice = 200 + seedRandom() * 800;
  const points: { date: string; price_median: number; price_p25: number; price_p75: number; volume: number }[] = [];
  
  let price = basePrice;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    const variance = seedRandom() * 0.08 - 0.04;
    price = price * (1 + variance);
    
    const p25 = Math.round(price * 0.85);
    const p75 = Math.round(price * 1.15);
    
    points.push({
      date: date.toISOString().split('T')[0],
      price_median: Math.round(price),
      price_p25: p25,
      price_p75: p75,
      volume: Math.floor(20 + seedRandom() * 80),
    });
  }
  
  return points;
}

// ============= Generate Community Tasks =============
export interface InternalCommunityTask {
  id: number;
  model_id: number;
  model_name: string;
  platform: string;
  type: 'list_only' | 'open_on_new';
  region: string | null;
  pages_from: number;
  pages_to: number;
  priority: 'high' | 'medium' | 'low';
  context: string;
  estimated_time_min: number;
  reward_credits: number;
  expires_at: string;
}

function generateCommunityTasks(count: number, models: InternalModel[]): InternalCommunityTask[] {
  const priorityModels = models.filter(m => m.volume > 100 || m.category === 'GPU');
  const contexts = [
    "Besoin de nouvelles annonces des derniers jours",
    "Zone prioritaire, scan approfondi nécessaire",
    "Mise à jour hebdomadaire",
    "Couverture régionale à compléter",
    "Scan périodique planifié",
    "Données obsolètes à rafraîchir",
    "Forte demande, nécessite actualisation"
  ];
  const regionCodes = [null, null, "Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur", "Occitanie", null];
  const priorities: ('high' | 'medium' | 'low')[] = ['high', 'high', 'medium', 'medium', 'medium', 'low', 'low'];

  const tasks: InternalCommunityTask[] = [];
  for (let i = 0; i < count; i++) {
    const model = priorityModels.length > 0 ? priorityModels[i % priorityModels.length] : models[i % models.length];
    const type = random() > 0.6 ? 'open_on_new' : 'list_only';
    const pagesFrom = Math.floor(random() * 20) + 1;
    const pagesTo = pagesFrom + Math.floor(random() * 15) + 5;
    const expiresAt = new Date(Date.now() + (2 + Math.floor(random() * 22)) * 3600000);

    tasks.push({
      id: i + 1,
      model_id: model.id,
      model_name: model.name,
      platform: 'leboncoin',
      type,
      region: regionCodes[i % regionCodes.length],
      pages_from: pagesFrom,
      pages_to: pagesTo,
      priority: priorities[i % priorities.length],
      context: contexts[i % contexts.length],
      estimated_time_min: type === 'open_on_new' ? 7 + Math.floor(random() * 5) : 4 + Math.floor(random() * 4),
      reward_credits: type === 'open_on_new' ? 2 : 1,
      expires_at: expiresAt.toISOString(),
    });
  }

  return tasks;
}

// ============= Pre-generated Deterministic Datasets =============
export const MOCK_MODELS = generateModels();
export const MOCK_ADS = generateAds(80, MOCK_MODELS); // 80 ads for detail views
export const MOCK_DEALS = generateDeals(MOCK_ADS); // Deals derived from ads
export const MOCK_COMMUNITY_TASKS = generateCommunityTasks(12, MOCK_MODELS);

// ============= Derived Category/Brand Data =============
export const MOCK_CATEGORIES = [
  { id: 1, name: 'GPU', count: GPU_MODELS.length },
  { id: 2, name: 'CPU', count: CPU_MODELS.length },
  { id: 3, name: 'RAM', count: RAM_MODELS.length },
  { id: 4, name: 'SSD', count: SSD_MODELS.length },
  { id: 5, name: 'Motherboard', count: MOTHERBOARD_MODELS.length },
];

export const MOCK_BRANDS_BY_CATEGORY: Record<string, string[]> = {
  GPU: ['ASUS', 'MSI', 'Gigabyte', 'EVGA', 'Sapphire', 'XFX', 'Zotac', 'PowerColor', 'Palit', 'PNY', 'Gainward', 'Inno3D', 'KFA2', 'Colorful'],
  CPU: ['AMD', 'Intel'],
  RAM: ['G.Skill', 'Corsair', 'Kingston', 'Crucial', 'TeamGroup'],
  SSD: ['Samsung', 'WD', 'Crucial', 'Kingston', 'Seagate'],
  Motherboard: ['ASUS', 'MSI', 'Gigabyte', 'ASRock'],
};

export const MOCK_FAMILIES_BY_BRAND: Record<string, string[]> = {
  NVIDIA: ['RTX 50', 'RTX 40', 'RTX 30', 'RTX 20'],
  AMD: ['RX 9000', 'RX 7000', 'RX 6000', 'Ryzen 9000', 'Ryzen 7000', 'Ryzen 5000'],
  Intel: ['Arc', 'Core Ultra', 'Intel 14th', 'Intel 13th', 'Intel 12th'],
  'G.Skill': ['DDR5', 'DDR4'],
  Corsair: ['DDR5', 'DDR4'],
  Kingston: ['DDR5', 'DDR4', 'NVMe Gen4'],
  Crucial: ['DDR4', 'NVMe Gen5', 'NVMe Gen4', 'SATA'],
  Samsung: ['NVMe Gen4', 'SATA'],
  WD: ['NVMe Gen4'],
  Seagate: ['NVMe Gen4'],
  ASUS: ['AM5', 'LGA1700', 'AM4'],
  MSI: ['AM5', 'LGA1700', 'AM4'],
  Gigabyte: ['AM5', 'LGA1700', 'AM4'],
  ASRock: ['AM5', 'AM4'],
};

// ============= Debug Stats Export =============
export function getMockDataStats() {
  return {
    modelsCount: MOCK_MODELS.length,
    dealsCount: MOCK_DEALS.length,
    communityTasksCount: MOCK_COMMUNITY_TASKS.length,
    categoriesCount: MOCK_CATEGORIES.length,
  };
}

// ============= Debug Samples Export =============
export function getMockDataSamples() {
  return {
    deals: MOCK_DEALS.slice(0, 3).map(d => ({
      id: d.id,
      title: d.title,
      price: d.price,
      platform: d.platform,
      region: d.region,
      condition: d.condition,
      category: d.category,
      score: d.score,
    })),
    models: MOCK_MODELS.slice(0, 3).map(m => ({
      id: m.id,
      name: m.name,
      brand: m.brand,
      category: m.category,
      median_price: m.median_price,
      fair_value_30d: m.fair_value_30d,
    })),
  };
}
