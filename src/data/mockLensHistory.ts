// Mock data preserved for Lovable editor mock mode
export interface MockLensEntry {
  id: number;
  platform: string;
  type: string;
  title: string;
  price: number;
  marketValue: number;
  gap: number;
  verdict: string;
  location: string;
  date: string;
  creditsEarned: number;
  components: { type: string; name: string; score: number }[];
  analysisQuick: null | {
    gap: string;
    trend30d: string;
    volume: string;
    liquidity: string;
    details: { label: string; value: string; positive?: boolean }[];
    insights: string[];
  };
  analysisDeep: null;
  watchlisted: boolean;
  alertActive: boolean;
  depth: "signal" | "qualified" | "decision";
}

export const DEV_MOCK_HISTORY: MockLensEntry[] = [
  {
    id: 1, platform: "Leboncoin", type: "PC_COMPLET",
    title: "PC Gamer RTX 4070 Ti Super / Ryzen 7 7800X3D / 32Go DDR5",
    price: 1350, marketValue: 1420, gap: 5.2, verdict: "BONNE_AFFAIRE",
    location: "Lyon 3ème", date: "2026-02-24T14:32:00", creditsEarned: 3,
    components: [
      { type: "GPU", name: "RTX 4070 Ti Super", score: 8.2 },
      { type: "CPU", name: "Ryzen 7 7800X3D", score: 7.8 },
      { type: "RAM", name: "32Go DDR5", score: 7.1 },
      { type: "SSD", name: "990 Pro 1To", score: 6.9 },
    ],
    analysisQuick: null, analysisDeep: null, watchlisted: true, alertActive: false,
    depth: "signal",
  },
  {
    id: 2, platform: "eBay", type: "COMPOSANT",
    title: "NVIDIA RTX 3080 10Go ASUS TUF Gaming — Excellent état",
    price: 320, marketValue: 295, gap: -8.5, verdict: "SUREVALUE",
    location: "Paris 11ème", date: "2026-02-24T11:15:00", creditsEarned: 2,
    components: [{ type: "GPU", name: "RTX 3080 10Go", score: 5.9 }],
    analysisQuick: {
      gap: "-8.5%", trend30d: "-4.2%", volume: "Modéré", liquidity: "6.3/10",
      details: [
        { label: "Valeur médiane eBay sold 30j", value: "295€" },
        { label: "Prix annonce", value: "320€" },
        { label: "Écart", value: "-8.5% surévalué", positive: false },
      ],
      insights: [
        "🔴 Prix au-dessus du marché",
        "🟡 Tendance baissière sur 30j",
        "🟡 Volume de ventes modéré",
        "🟡 Marge de négociation estimée : 20-30€",
      ],
    },
    analysisDeep: null, watchlisted: false, alertActive: true,
    depth: "qualified",
  },
  {
    id: 3, platform: "Vinted", type: "LOT",
    title: "Lot RAM DDR4 64Go (4x16Go) Corsair 3200MHz + SSD 2To",
    price: 95, marketValue: 110, gap: 13.6, verdict: "BONNE_AFFAIRE",
    location: "Bordeaux", date: "2026-02-23T18:45:00", creditsEarned: 2,
    components: [
      { type: "RAM", name: "64Go DDR4 3200MHz", score: 7.4 },
      { type: "SSD", name: "SSD 2To", score: 7.1 },
    ],
    analysisQuick: null, analysisDeep: null, watchlisted: false, alertActive: false,
    depth: "signal",
  },
  {
    id: 4, platform: "Leboncoin", type: "COMPOSANT",
    title: "AMD Ryzen 9 5900X — Boîte d'origine, facture disponible",
    price: 180, marketValue: 175, gap: -2.9, verdict: "PRIX_CORRECT",
    location: "Toulouse", date: "2026-02-23T09:20:00", creditsEarned: 2,
    components: [{ type: "CPU", name: "Ryzen 9 5900X", score: 7.2 }],
    analysisQuick: null, analysisDeep: null, watchlisted: false, alertActive: false,
    depth: "signal",
  },
];
