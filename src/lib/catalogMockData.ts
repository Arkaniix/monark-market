// Données mockées pour le catalogue des composants
import { subDays, format } from "date-fns";

export interface ModelCard {
  id: number;
  category: "GPU" | "CPU" | "RAM" | "SSD" | "Motherboard" | "PSU" | "Case" | "Cooling";
  brand: string;
  family: string;
  name: string;
  aliases: string[];
  stats: {
    price_median_30d: number;
    var_30d_pct: number;
    ads_volume: number;
    rarity_index: number; // 0 = rare, 1 = commun
    last_scan_at: string;
  };
  sparkline_30d: number[];
  region_snapshot: Record<string, { median: number; volume: number }>;
  tech?: {
    vram_gb?: number;
    tdp_w?: number;
    cores?: number;
    threads?: number;
    capacity_gb?: number;
    speed_mhz?: number;
    socket?: string;
  };
}

const brands = {
  GPU: ["NVIDIA", "AMD", "Intel"],
  CPU: ["AMD", "Intel"],
  RAM: ["Corsair", "G.Skill", "Kingston", "Crucial", "TeamGroup"],
  SSD: ["Samsung", "WD", "Crucial", "Kingston", "Seagate"],
  Motherboard: ["ASUS", "MSI", "Gigabyte", "ASRock"],
  PSU: ["Corsair", "Seasonic", "EVGA", "be quiet!"],
  Case: ["NZXT", "Corsair", "Fractal Design", "Lian Li"],
  Cooling: ["Noctua", "be quiet!", "Arctic", "Corsair"]
};

const families = {
  GPU: ["RTX 40", "RTX 30", "RTX 20", "RX 7000", "RX 6000", "Arc"],
  CPU: ["Ryzen 7000", "Ryzen 5000", "Intel 14th", "Intel 13th", "Intel 12th"],
  RAM: ["DDR5", "DDR4", "DDR3"],
  SSD: ["980 Pro", "SN850X", "P3 Plus", "KC3000", "FireCuda"],
  Motherboard: ["Z790", "B760", "X670E", "B650", "Z690"],
  PSU: ["Modular", "Semi-modular", "Non-modular"],
  Case: ["ATX", "mATX", "ITX"],
  Cooling: ["AIO", "Air", "Tower"]
};

const gpuModels = [
  { name: "RTX 4090", family: "RTX 40", vram: 24, tdp: 450, priceRange: [1500, 2000] },
  { name: "RTX 4080", family: "RTX 40", vram: 16, tdp: 320, priceRange: [1100, 1400] },
  { name: "RTX 4070 Ti", family: "RTX 40", vram: 12, tdp: 285, priceRange: [750, 900] },
  { name: "RTX 4070", family: "RTX 40", vram: 12, tdp: 200, priceRange: [550, 700] },
  { name: "RTX 4060 Ti", family: "RTX 40", vram: 8, tdp: 160, priceRange: [350, 450] },
  { name: "RTX 4060", family: "RTX 40", vram: 8, tdp: 115, priceRange: [270, 350] },
  { name: "RTX 3090", family: "RTX 30", vram: 24, tdp: 350, priceRange: [900, 1200] },
  { name: "RTX 3080", family: "RTX 30", vram: 10, tdp: 320, priceRange: [500, 700] },
  { name: "RTX 3070", family: "RTX 30", vram: 8, tdp: 220, priceRange: [400, 550] },
  { name: "RTX 3060 Ti", family: "RTX 30", vram: 8, tdp: 200, priceRange: [300, 400] },
  { name: "RTX 3060", family: "RTX 30", vram: 12, tdp: 170, priceRange: [250, 350] },
  { name: "RX 7900 XTX", family: "RX 7000", vram: 24, tdp: 355, priceRange: [900, 1150] },
  { name: "RX 7900 XT", family: "RX 7000", vram: 20, tdp: 300, priceRange: [750, 950] },
  { name: "RX 7800 XT", family: "RX 7000", vram: 16, tdp: 263, priceRange: [500, 650] },
  { name: "RX 7700 XT", family: "RX 7000", vram: 12, tdp: 245, priceRange: [400, 550] },
  { name: "RX 7600", family: "RX 7000", vram: 8, tdp: 165, priceRange: [250, 350] },
];

const cpuModels = [
  { name: "Ryzen 9 7950X", family: "Ryzen 7000", cores: 16, threads: 32, tdp: 170, priceRange: [550, 700] },
  { name: "Ryzen 9 7900X", family: "Ryzen 7000", cores: 12, threads: 24, tdp: 170, priceRange: [450, 600] },
  { name: "Ryzen 7 7800X3D", family: "Ryzen 7000", cores: 8, threads: 16, tdp: 120, priceRange: [370, 450] },
  { name: "Ryzen 7 7700X", family: "Ryzen 7000", cores: 8, threads: 16, tdp: 105, priceRange: [300, 400] },
  { name: "Ryzen 5 7600X", family: "Ryzen 7000", cores: 6, threads: 12, tdp: 105, priceRange: [250, 330] },
  { name: "Ryzen 9 5950X", family: "Ryzen 5000", cores: 16, threads: 32, tdp: 105, priceRange: [400, 550] },
  { name: "Ryzen 7 5800X3D", family: "Ryzen 5000", cores: 8, threads: 16, tdp: 105, priceRange: [300, 400] },
  { name: "Ryzen 5 5600X", family: "Ryzen 5000", cores: 6, threads: 12, tdp: 65, priceRange: [130, 180] },
  { name: "i9-14900K", family: "Intel 14th", cores: 24, threads: 32, tdp: 253, priceRange: [550, 700] },
  { name: "i7-14700K", family: "Intel 14th", cores: 20, threads: 28, tdp: 253, priceRange: [400, 550] },
  { name: "i5-14600K", family: "Intel 14th", cores: 14, threads: 20, tdp: 181, priceRange: [300, 400] },
  { name: "i9-13900K", family: "Intel 13th", cores: 24, threads: 32, tdp: 253, priceRange: [500, 650] },
  { name: "i7-13700K", family: "Intel 13th", cores: 16, threads: 24, tdp: 253, priceRange: [350, 480] },
  { name: "i5-13600K", family: "Intel 13th", cores: 14, threads: 20, tdp: 181, priceRange: [280, 370] },
];

function generateSparkline(basePrice: number, variance: number): number[] {
  const sparkline: number[] = [];
  let price = basePrice * (1 + variance / 100);
  for (let i = 0; i < 30; i++) {
    sparkline.push(Math.round(price));
    price = price * (1 + (Math.random() - 0.5) * 0.03);
  }
  return sparkline.slice(-7);
}

function generateModels(): ModelCard[] {
  const models: ModelCard[] = [];
  let id = 1;

  // GPUs
  gpuModels.forEach((model) => {
    const brand = model.family.startsWith("RX") ? "AMD" : "NVIDIA";
    const basePrice = model.priceRange[0] + Math.random() * (model.priceRange[1] - model.priceRange[0]);
    const variance = -15 + Math.random() * 30;
    const volume = Math.floor(50 + Math.random() * 300);
    const rarity = Math.random();
    const daysAgo = Math.floor(Math.random() * 10);

    models.push({
      id: id++,
      category: "GPU",
      brand,
      family: model.family,
      name: model.name,
      aliases: [`GeForce ${model.name}`, model.name],
      stats: {
        price_median_30d: Math.round(basePrice),
        var_30d_pct: parseFloat(variance.toFixed(1)),
        ads_volume: volume,
        rarity_index: parseFloat(rarity.toFixed(2)),
        last_scan_at: format(subDays(new Date(), daysAgo), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      },
      sparkline_30d: generateSparkline(basePrice, variance),
      region_snapshot: {
        "IDF": { median: Math.round(basePrice * 1.05), volume: Math.floor(volume * 0.3) },
        "ARA": { median: Math.round(basePrice * 0.98), volume: Math.floor(volume * 0.25) }
      },
      tech: {
        vram_gb: model.vram,
        tdp_w: model.tdp
      }
    });
  });

  // CPUs
  cpuModels.forEach((model) => {
    const brand = model.family.includes("Ryzen") ? "AMD" : "Intel";
    const basePrice = model.priceRange[0] + Math.random() * (model.priceRange[1] - model.priceRange[0]);
    const variance = -12 + Math.random() * 25;
    const volume = Math.floor(40 + Math.random() * 250);
    const rarity = Math.random();
    const daysAgo = Math.floor(Math.random() * 10);

    models.push({
      id: id++,
      category: "CPU",
      brand,
      family: model.family,
      name: model.name,
      aliases: [model.name],
      stats: {
        price_median_30d: Math.round(basePrice),
        var_30d_pct: parseFloat(variance.toFixed(1)),
        ads_volume: volume,
        rarity_index: parseFloat(rarity.toFixed(2)),
        last_scan_at: format(subDays(new Date(), daysAgo), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      },
      sparkline_30d: generateSparkline(basePrice, variance),
      region_snapshot: {
        "IDF": { median: Math.round(basePrice * 1.04), volume: Math.floor(volume * 0.28) },
        "ARA": { median: Math.round(basePrice * 0.97), volume: Math.floor(volume * 0.23) }
      },
      tech: {
        cores: model.cores,
        threads: model.threads,
        tdp_w: model.tdp
      }
    });
  });

  // RAM (50 modèles)
  const ramTypes = ["DDR5", "DDR4"];
  const ramCapacities = [8, 16, 32, 64];
  const ramSpeeds = { DDR5: [4800, 5200, 5600, 6000, 6400], DDR4: [2666, 3000, 3200, 3600] };
  
  for (let i = 0; i < 50; i++) {
    const ramType = ramTypes[Math.floor(Math.random() * ramTypes.length)];
    const capacity = ramCapacities[Math.floor(Math.random() * ramCapacities.length)];
    const speed = ramSpeeds[ramType as keyof typeof ramSpeeds][Math.floor(Math.random() * ramSpeeds[ramType as keyof typeof ramSpeeds].length)];
    const brand = brands.RAM[Math.floor(Math.random() * brands.RAM.length)];
    const basePrice = capacity * (ramType === "DDR5" ? 3.5 : 2.5);
    const variance = -10 + Math.random() * 20;
    const volume = Math.floor(60 + Math.random() * 200);
    const rarity = Math.random();
    const daysAgo = Math.floor(Math.random() * 10);

    models.push({
      id: id++,
      category: "RAM",
      brand,
      family: ramType,
      name: `${ramType} ${capacity}GB ${speed}MHz`,
      aliases: [`${capacity}GB ${ramType}`],
      stats: {
        price_median_30d: Math.round(basePrice),
        var_30d_pct: parseFloat(variance.toFixed(1)),
        ads_volume: volume,
        rarity_index: parseFloat(rarity.toFixed(2)),
        last_scan_at: format(subDays(new Date(), daysAgo), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      },
      sparkline_30d: generateSparkline(basePrice, variance),
      region_snapshot: {
        "IDF": { median: Math.round(basePrice * 1.03), volume: Math.floor(volume * 0.27) },
        "ARA": { median: Math.round(basePrice * 0.96), volume: Math.floor(volume * 0.22) }
      },
      tech: {
        capacity_gb: capacity,
        speed_mhz: speed
      }
    });
  }

  // SSDs (40 modèles)
  const ssdTypes = ["NVMe", "SATA"];
  const ssdCapacities = [256, 500, 1000, 2000, 4000];
  
  for (let i = 0; i < 40; i++) {
    const ssdType = ssdTypes[Math.floor(Math.random() * ssdTypes.length)];
    const capacity = ssdCapacities[Math.floor(Math.random() * ssdCapacities.length)];
    const brand = brands.SSD[Math.floor(Math.random() * brands.SSD.length)];
    const family = families.SSD[Math.floor(Math.random() * families.SSD.length)];
    const basePrice = capacity * (ssdType === "NVMe" ? 0.08 : 0.06);
    const variance = -8 + Math.random() * 18;
    const volume = Math.floor(50 + Math.random() * 180);
    const rarity = Math.random();
    const daysAgo = Math.floor(Math.random() * 10);

    models.push({
      id: id++,
      category: "SSD",
      brand,
      family,
      name: `${family} ${capacity}GB ${ssdType}`,
      aliases: [`${capacity}GB ${ssdType}`],
      stats: {
        price_median_30d: Math.round(basePrice),
        var_30d_pct: parseFloat(variance.toFixed(1)),
        ads_volume: volume,
        rarity_index: parseFloat(rarity.toFixed(2)),
        last_scan_at: format(subDays(new Date(), daysAgo), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      },
      sparkline_30d: generateSparkline(basePrice, variance),
      region_snapshot: {
        "IDF": { median: Math.round(basePrice * 1.04), volume: Math.floor(volume * 0.26) },
        "ARA": { median: Math.round(basePrice * 0.97), volume: Math.floor(volume * 0.21) }
      },
      tech: {
        capacity_gb: capacity
      }
    });
  }

  // Motherboards (30 modèles)
  const mbSockets = ["AM5", "AM4", "LGA1700", "LGA1200"];
  const mbFormats = ["ATX", "mATX", "ITX"];
  
  for (let i = 0; i < 30; i++) {
    const socket = mbSockets[Math.floor(Math.random() * mbSockets.length)];
    const formFactor = mbFormats[Math.floor(Math.random() * mbFormats.length)];
    const brand = brands.Motherboard[Math.floor(Math.random() * brands.Motherboard.length)];
    const family = families.Motherboard[Math.floor(Math.random() * families.Motherboard.length)];
    const basePrice = 120 + Math.random() * 300;
    const variance = -7 + Math.random() * 15;
    const volume = Math.floor(30 + Math.random() * 120);
    const rarity = Math.random();
    const daysAgo = Math.floor(Math.random() * 10);

    models.push({
      id: id++,
      category: "Motherboard",
      brand,
      family,
      name: `${family} ${formFactor}`,
      aliases: [family],
      stats: {
        price_median_30d: Math.round(basePrice),
        var_30d_pct: parseFloat(variance.toFixed(1)),
        ads_volume: volume,
        rarity_index: parseFloat(rarity.toFixed(2)),
        last_scan_at: format(subDays(new Date(), daysAgo), "yyyy-MM-dd'T'HH:mm:ss'Z'")
      },
      sparkline_30d: generateSparkline(basePrice, variance),
      region_snapshot: {
        "IDF": { median: Math.round(basePrice * 1.05), volume: Math.floor(volume * 0.29) },
        "ARA": { median: Math.round(basePrice * 0.98), volume: Math.floor(volume * 0.24) }
      },
      tech: {
        socket
      }
    });
  }

  return models;
}

export const catalogModels = generateModels();

export const catalogSummary = {
  total_models: catalogModels.length,
  median_price_global: Math.round(
    catalogModels.reduce((sum, m) => sum + m.stats.price_median_30d, 0) / catalogModels.length
  ),
  avg_variation: parseFloat(
    (catalogModels.reduce((sum, m) => sum + m.stats.var_30d_pct, 0) / catalogModels.length).toFixed(1)
  ),
  total_ads: catalogModels.reduce((sum, m) => sum + m.stats.ads_volume, 0),
  last_scan: catalogModels[0].stats.last_scan_at
};

export const facetOptions = {
  categories: ["GPU", "CPU", "RAM", "SSD", "Motherboard"],
  brands: Array.from(new Set(Object.values(brands).flat())),
  families: Object.values(families).flat(),
  regions: ["IDF", "ARA", "PACA", "Occitanie", "Nouvelle-Aquitaine"]
};
