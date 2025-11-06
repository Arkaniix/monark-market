// Mock data for ad detail page

export interface AdDetail {
  ad_id: string;
  model_id: number;
  category: string;
  model_name: string;
  price: number;
  price_median_model: number;
  var_market_30d_pct: number;
  rarity_index: number;
  state: string;
  seller_type: string;
  city: string;
  postal_code: string;
  region: string;
  status: "active" | "reserved" | "deleted";
  delivery_possible: boolean;
  secured_payment: boolean;
  remise_main_propre: boolean;
  description_simplified: string;
  publication_date: string;
  last_seen: string;
  url: string;
  score_market: number;
  distance_km?: number;
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
  status: string;
  modification?: string;
}

export interface SimilarAd {
  ad_id: string;
  model_name: string;
  price: number;
  city: string;
  region: string;
  state: string;
  score: number;
  publication_date: string;
}

export interface MarketComparison {
  bucket: number;
  count: number;
  is_current?: boolean;
}

export interface ModelPriceSeries {
  date: string;
  median: number;
  ad_price?: number;
}

// Mock ad detail
export const mockAdDetail: AdDetail = {
  ad_id: "LBC-3084970823",
  model_id: 101,
  category: "GPU",
  model_name: "GeForce RTX 3060 Ti",
  price: 250,
  price_median_model: 279,
  var_market_30d_pct: -6.3,
  rarity_index: 0.35,
  state: "bon",
  seller_type: "particulier",
  city: "Lyon",
  postal_code: "69003",
  region: "ARA",
  status: "active",
  delivery_possible: true,
  secured_payment: true,
  remise_main_propre: true,
  description_simplified:
    "Carte graphique d'occasion RTX 3060 Ti, bon état, fonctionne parfaitement. Peu utilisée, idéale pour gaming en 1440p.",
  publication_date: "2025-11-01T12:13:26Z",
  last_seen: "2025-11-06T15:10:00Z",
  url: "https://www.leboncoin.fr/ad/ordinateurs/3084970823",
  score_market: 86,
  distance_km: 42,
};

// Mock price history
export const mockPriceHistory: PriceHistoryEntry[] = [
  {
    date: "2025-11-01",
    price: 270,
    status: "active",
    modification: "Publication",
  },
  {
    date: "2025-11-03",
    price: 260,
    status: "active",
    modification: "Baisse de prix -10 €",
  },
  {
    date: "2025-11-05",
    price: 250,
    status: "active",
    modification: "Baisse de prix -10 €",
  },
];

// Mock similar ads
export const mockSimilarAds: SimilarAd[] = [
  {
    ad_id: "LBC-3084979999",
    model_name: "GeForce RTX 3060 Ti",
    price: 255,
    city: "Grenoble",
    region: "ARA",
    state: "bon",
    score: 83,
    publication_date: "2025-11-02T10:00:00Z",
  },
  {
    ad_id: "LBC-3084977777",
    model_name: "GeForce RTX 3060 Ti",
    price: 260,
    city: "Saint-Étienne",
    region: "ARA",
    state: "comme_neuf",
    score: 79,
    publication_date: "2025-11-03T14:30:00Z",
  },
  {
    ad_id: "LBC-3084966666",
    model_name: "GeForce RTX 3060 Ti",
    price: 265,
    city: "Annecy",
    region: "ARA",
    state: "bon",
    score: 76,
    publication_date: "2025-11-04T09:15:00Z",
  },
  {
    ad_id: "LBC-3084955555",
    model_name: "GeForce RTX 3060 Ti",
    price: 270,
    city: "Chambéry",
    region: "ARA",
    state: "très_bon",
    score: 74,
    publication_date: "2025-11-01T16:45:00Z",
  },
];

// Mock market comparison (histogram data)
export const mockMarketComparison: MarketComparison[] = [
  { bucket: 220, count: 3 },
  { bucket: 230, count: 5 },
  { bucket: 240, count: 12 },
  { bucket: 250, count: 24, is_current: true },
  { bucket: 260, count: 31 },
  { bucket: 270, count: 28 },
  { bucket: 280, count: 19 },
  { bucket: 290, count: 14 },
  { bucket: 300, count: 8 },
  { bucket: 310, count: 4 },
];

// Mock model price series (30 days)
export const mockModelPriceSeries: ModelPriceSeries[] = [
  { date: "2025-10-07", median: 298, ad_price: undefined },
  { date: "2025-10-10", median: 295, ad_price: undefined },
  { date: "2025-10-13", median: 292, ad_price: undefined },
  { date: "2025-10-16", median: 289, ad_price: undefined },
  { date: "2025-10-19", median: 286, ad_price: undefined },
  { date: "2025-10-22", median: 284, ad_price: undefined },
  { date: "2025-10-25", median: 282, ad_price: undefined },
  { date: "2025-10-28", median: 281, ad_price: undefined },
  { date: "2025-10-31", median: 280, ad_price: undefined },
  { date: "2025-11-01", median: 279, ad_price: 270 },
  { date: "2025-11-03", median: 279, ad_price: 260 },
  { date: "2025-11-05", median: 279, ad_price: 250 },
];

// Status badge helper
export function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return { label: "Disponible", variant: "default" as const, color: "text-success" };
    case "reserved":
      return { label: "Réservée", variant: "secondary" as const, color: "text-warning" };
    case "deleted":
      return { label: "Supprimée", variant: "destructive" as const, color: "text-destructive" };
    default:
      return { label: "Inconnu", variant: "outline" as const, color: "text-muted-foreground" };
  }
}

// State label helper
export function getStateLabel(state: string): string {
  const states: Record<string, string> = {
    neuf: "Neuf",
    comme_neuf: "Comme neuf",
    très_bon: "Très bon état",
    bon: "Bon état",
    satisfaisant: "État satisfaisant",
    à_réparer: "À réparer",
  };
  return states[state] || state;
}

// Score color helper
export function getScoreColor(score: number): string {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-primary";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

// Price difference helper
export function getPriceDifference(price: number, median: number) {
  const diff = median - price;
  const diffPercent = ((diff / median) * 100).toFixed(1);
  const isGoodDeal = diff > 0;

  return {
    diff,
    diffPercent,
    isGoodDeal,
    label: isGoodDeal ? "Bon prix" : "Prix élevé",
    color: isGoodDeal ? "text-success" : "text-destructive",
  };
}

// Analysis text generator
export function generateAnalysis(ad: AdDetail): string {
  const priceDiff = getPriceDifference(ad.price, ad.price_median_model);
  const rarityText = ad.rarity_index < 0.3 ? "Rare" : ad.rarity_index < 0.6 ? "Disponible" : "Courant";

  let analysis = `Cette annonce est ${Math.abs(parseFloat(priceDiff.diffPercent))} % `;
  analysis += priceDiff.isGoodDeal ? "en dessous" : "au-dessus";
  analysis += ` du prix médian du marché. `;
  analysis += `${rarityText} pour ce modèle dans la région. `;

  if (priceDiff.isGoodDeal && ad.score_market >= 80) {
    analysis += "Si le produit correspond à tes critères, c'est une opportunité intéressante.";
  } else if (!priceDiff.isGoodDeal) {
    analysis += "Attention, d'autres annonces proposent de meilleurs prix.";
  } else {
    analysis += "Prix correct par rapport au marché actuel.";
  }

  return analysis;
}
