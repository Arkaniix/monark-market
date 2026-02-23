import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Search, RotateCcw, Bookmark, Bell, Zap, FlaskConical, Loader2, ExternalLink, TrendingUp, TrendingDown, BarChart3, Droplets, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// ── Types ──
interface LensComponent {
  type: string;
  name: string;
  score: number;
}

interface QuickAnalysis {
  gap: string;
  trend30d: string;
  volume: string;
  liquidity: string;
  details: { label: string; value: string; positive?: boolean }[];
  insights: string[];
}

interface LensEntry {
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
  components: LensComponent[];
  analysisQuick: QuickAnalysis | null;
  analysisDeep: null;
  watchlisted: boolean;
  alertActive: boolean;
}

// ── Mock Data ──
const MOCK_HISTORY: LensEntry[] = [
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
        "🟢 Vendeur noté (234 ventes)",
        "🟡 Marge de négociation estimée : 20-30€",
      ],
    },
    analysisDeep: null, watchlisted: false, alertActive: true,
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
  },
  {
    id: 4, platform: "Leboncoin", type: "COMPOSANT",
    title: "AMD Ryzen 9 5900X — Boîte d'origine, facture disponible",
    price: 180, marketValue: 175, gap: -2.9, verdict: "PRIX_CORRECT",
    location: "Toulouse", date: "2026-02-23T09:20:00", creditsEarned: 2,
    components: [{ type: "CPU", name: "Ryzen 9 5900X", score: 7.2 }],
    analysisQuick: null, analysisDeep: null, watchlisted: false, alertActive: false,
  },
];

// ── Helpers ──
const PLATFORM_COLORS: Record<string, string> = {
  Leboncoin: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  eBay: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Vinted: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "Facebook Marketplace": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

const TYPE_LABELS: Record<string, string> = {
  PC_COMPLET: "PC COMPLET",
  COMPOSANT: "COMPOSANT",
  LOT: "LOT",
};

const VERDICT_STYLES: Record<string, string> = {
  BONNE_AFFAIRE: "bg-green-500/15 text-green-400 border-green-500/30",
  PRIX_CORRECT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  SUREVALUE: "bg-red-500/15 text-red-400 border-red-500/30",
};

const VERDICT_LABELS: Record<string, string> = {
  BONNE_AFFAIRE: "BONNE AFFAIRE",
  PRIX_CORRECT: "PRIX CORRECT",
  SUREVALUE: "SURÉVALUÉ",
};

function relativeDate(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });
}

// ── Sub-components ──

function StatsBar() {
  const stats = [
    { label: "Annonces analysées", value: "47", color: "text-foreground" },
    { label: "Crédits gagnés (Lens)", value: "+127 cr.", color: "text-accent-lime" },
    { label: "Bonnes affaires détectées", value: "8", color: "text-green-400" },
    { label: "Temps moyen économisé", value: "2h30", color: "text-muted-foreground" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={cn("text-2xl font-bold font-mono", s.color)}>{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuickAnalysisPanel({ analysis }: { analysis: QuickAnalysis }) {
  const metricIcons = [
    { label: "Écart marché", value: analysis.gap, icon: TrendingDown },
    { label: "Tendance 30j", value: analysis.trend30d, icon: TrendingUp },
    { label: "Volume ventes", value: analysis.volume, icon: BarChart3 },
    { label: "Liquidité", value: analysis.liquidity, icon: Droplets },
  ];
  return (
    <div className="mt-4 pt-4 border-t border-border space-y-4 animate-in slide-in-from-top-2 duration-300">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricIcons.map((m) => (
          <div key={m.label} className="bg-background rounded-lg p-3 border border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <m.icon className="h-3.5 w-3.5" />
              {m.label}
            </div>
            <p className="font-mono font-bold text-sm text-foreground">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-background rounded-lg border border-border p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Détails du marché</p>
        <div className="space-y-1.5">
          {analysis.details.map((d, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{d.label}</span>
              <span className={cn("font-mono font-medium", d.positive === false ? "text-red-400" : "text-foreground")}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-background rounded-lg border border-border p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Insights</p>
        <ul className="space-y-1">
          {analysis.insights.map((ins, i) => (
            <li key={i} className="text-xs text-muted-foreground">{ins}</li>
          ))}
        </ul>
      </div>
      <Button className="w-full bg-accent-violet hover:bg-accent-violet/90 text-white text-xs">
        🔬 Analyse approfondie — 20 cr.
      </Button>
    </div>
  );
}

function LensCard({ entry }: { entry: LensEntry }) {
  const navigate = useNavigate();
  const [watchlisted, setWatchlisted] = useState(entry.watchlisted);
  const [alertActive, setAlertActive] = useState(entry.alertActive);
  const [quickResult, setQuickResult] = useState<QuickAnalysis | null>(entry.analysisQuick);
  const [loading, setLoading] = useState(false);

  const handleQuickAnalysis = () => {
    if (quickResult) return;
    setLoading(true);
    setTimeout(() => {
      setQuickResult({
        gap: `${entry.gap > 0 ? "+" : ""}${entry.gap}%`,
        trend30d: entry.gap > 0 ? "+2.1%" : "-4.2%",
        volume: "Modéré",
        liquidity: "6.3/10",
        details: [
          { label: "Valeur médiane 30j", value: `${entry.marketValue}€` },
          { label: "Prix annonce", value: `${entry.price}€` },
          { label: "Écart", value: `${entry.gap > 0 ? "+" : ""}${entry.gap}% ${entry.gap > 0 ? "sous-évalué" : "surévalué"}`, positive: entry.gap > 0 },
        ],
        insights: entry.gap > 0
          ? ["🟢 Prix inférieur au marché", "🟢 Composant populaire, revente facile", "🟡 Vérifier l'état réel"]
          : ["🔴 Prix au-dessus du marché", "🟡 Marge de négociation possible", "🟢 Vendeur fiable"],
      });
      setLoading(false);
    }, 1500);
  };

  const handleDeepAnalysis = () => {
    const comp = entry.components[0];
    navigate(`/estimator?component=${encodeURIComponent(comp?.name || "")}&price=${entry.price}&source=lens`);
  };

  return (
    <Card className="bg-card border-border hover:border-muted-foreground/30 transition-colors">
      <CardContent className="p-4 space-y-2.5">
        {/* Line 1 - Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn("text-[10px] border", PLATFORM_COLORS[entry.platform] || "")}>
            {entry.platform}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
            {TYPE_LABELS[entry.type] || entry.type}
          </Badge>
          <Badge variant="outline" className={cn("text-[10px] border", VERDICT_STYLES[entry.verdict] || "")}>
            {VERDICT_LABELS[entry.verdict] || entry.verdict}
          </Badge>
          <span className="ml-auto text-[11px] text-muted-foreground/60 shrink-0">
            {relativeDate(entry.date)}
          </span>
        </div>

        {/* Line 2 - Title */}
        <p className="text-sm font-semibold text-foreground truncate">{entry.title}</p>

        {/* Line 3 - Key info */}
        <div className="flex items-baseline gap-2 flex-wrap text-xs">
          <span className="text-lg font-extrabold font-mono text-accent-lime">{entry.price}€</span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-muted-foreground">Valeur marché : {entry.marketValue}€</span>
          <span className="text-muted-foreground/50">·</span>
          <span className={cn("font-mono font-semibold", entry.gap > 0 ? "text-green-400" : entry.gap < -5 ? "text-red-400" : "text-amber-400")}>
            {entry.gap > 0 ? "+" : ""}{entry.gap}% {entry.gap > 0 ? "sous-évalué" : "surévalué"}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-muted-foreground/60">{entry.location}</span>
        </div>

        {/* Line 4 - Components chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {entry.components.slice(0, 4).map((c, i) => (
            <div key={i} className="shrink-0 flex items-center gap-1.5 bg-background border border-border rounded-md px-2 py-1 text-[11px]">
              <span className="text-muted-foreground font-medium">{c.type}</span>
              <span className="text-foreground">{c.name}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="font-mono font-bold text-accent-lime">{c.score}</span>
              <span className="text-muted-foreground/50">/10</span>
            </div>
          ))}
          {entry.components.length > 4 && (
            <span className="shrink-0 text-[11px] text-muted-foreground self-center">+{entry.components.length - 4} autres</span>
          )}
        </div>

        {/* Line 5 - Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWatchlisted(!watchlisted)}>
            <Bookmark className={cn("h-4 w-4", watchlisted ? "fill-accent-lime text-accent-lime" : "text-muted-foreground")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAlertActive(!alertActive)}>
            <Bell className={cn("h-4 w-4", alertActive ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </Button>
          <div className="ml-auto flex gap-2">
            {quickResult ? (
              <Button size="sm" className="h-8 text-xs bg-accent-lime text-background hover:bg-accent-lime/90">
                Résultats →
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-8 text-xs border-accent-lime/50 text-accent-lime hover:bg-accent-lime/10" onClick={handleQuickAnalysis} disabled={loading}>
                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
                Analyse rapide · 5 cr.
              </Button>
            )}
            <Button size="sm" className="h-8 text-xs bg-accent-violet hover:bg-accent-violet/90 text-white hidden sm:inline-flex" onClick={handleDeepAnalysis}>
              <FlaskConical className="h-3 w-3 mr-1" />
              Approfon. · 20 cr.
            </Button>
          </div>
        </div>

        {/* Expanded quick analysis */}
        {quickResult && <QuickAnalysisPanel analysis={quickResult} />}
      </CardContent>
    </Card>
  );
}

function SessionSidebar() {
  return (
    <div className="space-y-4 w-full">
      {/* Session card */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-medium text-green-400">Collecte active</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Crédits cette session</p>
            <p className="text-2xl font-bold font-mono text-accent-lime">+7 cr.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-muted-foreground">Annonces vues</span><p className="font-semibold text-foreground">12</p></div>
            <div><span className="text-muted-foreground">Durée</span><p className="font-semibold text-foreground">38 min</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Missions */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground">Missions actives</p>
          <div className="space-y-3">
            {[
              { label: "Naviguer 20 annonces GPU", progress: 12, total: 20, reward: 15 },
              { label: "Analyser 5 PC complets", progress: 2, total: 5, reward: 25 },
            ].map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-mono text-accent-lime">+{m.reward} cr.</span>
                </div>
                <div className="h-1.5 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-accent-lime rounded-full transition-all" style={{ width: `${(m.progress / m.total) * 100}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground/60 text-right">{m.progress}/{m.total}</p>
              </div>
            ))}
          </div>
          <Button variant="link" className="text-xs text-accent-lime p-0 h-auto">
            Voir toutes les missions →
          </Button>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <p className="text-xs font-semibold text-foreground">Leaderboard semaine</p>
          </div>
          <div className="space-y-2">
            {[
              { rank: 1, name: "GPUHunter42", credits: 342 },
              { rank: 2, name: "DealSniper", credits: 298 },
              { rank: 3, name: "TechScout", credits: 271 },
            ].map((u) => (
              <div key={u.rank} className="flex items-center gap-2 text-xs">
                <span className={cn("font-bold font-mono w-5", u.rank === 1 ? "text-amber-400" : u.rank === 2 ? "text-zinc-400" : "text-orange-400")}>
                  #{u.rank}
                </span>
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-foreground flex-1">{u.name}</span>
                <span className="font-mono text-accent-lime">{u.credits} cr.</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-border text-xs text-muted-foreground">
            Votre rang : <span className="font-mono font-semibold text-foreground">#47</span>
          </div>
          <Button variant="link" className="text-xs text-accent-lime p-0 h-auto">
            Voir le classement →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6">
        <Eye className="h-16 w-16 text-border" strokeWidth={1} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Aucune annonce analysée</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Installez Monark Lens et naviguez sur Leboncoin, eBay ou Vinted pour voir apparaître vos analyses ici.
      </p>
      <div className="flex gap-3">
        <Button className="bg-accent-lime text-background hover:bg-accent-lime/90">
          <ExternalLink className="h-4 w-4 mr-2" />
          Installer Monark Lens →
        </Button>
        <Button variant="outline">Voir le catalogue →</Button>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function LensHistory() {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const resetFilters = () => {
    setSearch("");
    setPlatformFilter("all");
    setTypeFilter("all");
    setVerdictFilter("all");
    setDateFilter("all");
  };

  const filtered = useMemo(() => {
    return MOCK_HISTORY.filter((e) => {
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.components.some((c) => c.name.toLowerCase().includes(search.toLowerCase()))) return false;
      if (platformFilter !== "all" && e.platform !== platformFilter) return false;
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (verdictFilter !== "all" && e.verdict !== verdictFilter) return false;
      if (dateFilter === "today") {
        const today = new Date().toISOString().slice(0, 10);
        if (!e.date.startsWith(today)) return false;
      }
      return true;
    });
  }, [search, platformFilter, typeFilter, verdictFilter, dateFilter]);

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Eye className="h-6 w-6" />
            Historique Lens
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Annonces analysées via Monark Lens</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs text-green-400">Extension active</span>
          </div>
          <Button variant="outline" size="sm" className="text-xs border-accent-lime/50 text-accent-lime hover:bg-accent-lime/10">
            <ExternalLink className="h-3 w-3 mr-1" />
            Installer Monark Lens
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une annonce, un composant..."
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border text-xs"><SelectValue placeholder="Plateforme" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="Leboncoin">Leboncoin</SelectItem>
            <SelectItem value="eBay">eBay</SelectItem>
            <SelectItem value="Vinted">Vinted</SelectItem>
            <SelectItem value="Facebook Marketplace">Facebook</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes annonces</SelectItem>
            <SelectItem value="PC_COMPLET">PC complet</SelectItem>
            <SelectItem value="COMPOSANT">Composant seul</SelectItem>
            <SelectItem value="LOT">Lot</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verdictFilter} onValueChange={setVerdictFilter}>
          <SelectTrigger className="w-[130px] bg-card border-border text-xs"><SelectValue placeholder="Verdict" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="BONNE_AFFAIRE">Bonne affaire</SelectItem>
            <SelectItem value="PRIX_CORRECT">Prix correct</SelectItem>
            <SelectItem value="SUREVALUE">Surévalué</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border text-xs"><SelectValue placeholder="Date" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={resetFilters}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex gap-6">
        {/* Feed */}
        <div className="flex-1 min-w-0 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((entry) => <LensCard key={entry.id} entry={entry} />)
          )}
          {filtered.length > 0 && (
            <Button variant="outline" className="w-full border-border text-muted-foreground">
              Charger plus
            </Button>
          )}
        </div>

        {/* Sidebar - desktop only */}
        <div className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-20">
            <SessionSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
