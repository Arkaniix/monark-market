import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, RotateCcw, Bookmark, Bell, Zap, FlaskConical, Loader2,
  ExternalLink, TrendingUp, TrendingDown, BarChart3, Droplets,
  ScanSearch, Award, Clock, MapPin, ChevronDown, ChevronUp, Eye, Target,
  RefreshCw, Calculator, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useEnhancedEstimationHistory } from "@/hooks";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useLensHistory } from "@/hooks/useLensHistory";
import type { LensHistoryItem } from "@/hooks/useLensHistory";
import { DEV_MOCK_HISTORY } from "@/data/mockLensHistory";
import type { EnhancedEstimationHistoryItem, EnhancedEstimationResult } from "@/types/estimator";

// Import result display components
import SynthesisBanner from "@/components/estimator/SynthesisBanner";
import OpportunityScoreCard from "@/components/estimator/OpportunityScoreCard";
import HypothesesBanner from "@/components/estimator/HypothesesBanner";
import EnhancedDecisionBlock from "@/components/estimator/EnhancedDecisionBlock";
import EnhancedMarketCard from "@/components/estimator/EnhancedMarketCard";
import EnhancedNegotiationSection from "@/components/estimator/EnhancedNegotiationSection";
import EnhancedScenariosSection from "@/components/estimator/EnhancedScenariosSection";
import EnhancedPlatformsSection from "@/components/estimator/EnhancedPlatformsSection";
import WhatIfSimulator from "@/components/estimator/WhatIfSimulator";
import InputSummaryChips from "@/components/estimator/InputSummaryChips";

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
  depth: "signal" | "qualified" | "decision";
}

// Platform display name helper
function displayPlatform(raw: string): string {
  const map: Record<string, string> = {
    leboncoin: "Leboncoin",
    ebay: "eBay",
    vinted: "Vinted",
    facebook: "Facebook Marketplace",
    ldlc: "LDLC Occasion",
  };
  return map[raw.toLowerCase()] || raw;
}

// Map API verdict string to internal verdict key
function mapVerdict(apiVerdict: string | null | undefined, gap: number): string {
  if (apiVerdict) {
    const v = apiVerdict.toLowerCase();
    if (v.includes("bonne") || v === "bonne_affaire") return "BONNE_AFFAIRE";
    if (v.includes("sur") || v === "surevalue" || v === "surévalué") return "SUREVALUE";
    if (v.includes("correct") || v === "prix_correct") return "PRIX_CORRECT";
  }
  // Derive from gap if no API verdict
  if (gap > 5) return "BONNE_AFFAIRE";
  if (gap < -5) return "SUREVALUE";
  return "PRIX_CORRECT";
}

// Determine depth from API data
function deriveDepth(item: LensHistoryItem): "signal" | "qualified" | "decision" {
  if (item.signal_type === "decision" || item.signal_type === "estimation") return "decision";
  if (item.market_median && item.market_median > 0 && item.gap_percent != null) return "qualified";
  return "signal";
}

// Convert API item to LensEntry for display
function apiItemToLensEntry(item: LensHistoryItem): LensEntry {
  const isBundle = item.is_bundle || item.listing_intent === "bundle";
  const marketValue = item.market_median ?? 0;
  const gap = item.gap_percent ?? 0;
  const hasMarketData = marketValue > 0;
  const verdict = hasMarketData ? mapVerdict(item.verdict, gap) : "NO_DATA";
  const depth = deriveDepth(item);

  // Build components list
  let components: LensComponent[] = [];
  if (isBundle && item.bundle_components && item.bundle_components.length > 0) {
    components = item.bundle_components.map((c) => ({
      type: c.category?.toUpperCase() || "?",
      name: c.name,
      score: c.score ?? 0,
    }));
  } else {
    components = [{ type: "GPU", name: item.component_name || "?", score: 0 }];
  }

  return {
    id: item.id,
    platform: displayPlatform(item.platform),
    type: isBundle ? "PC_COMPLET" : "COMPOSANT",
    title: item.ad_title || item.component_name || "Composant inconnu",
    price: item.price,
    marketValue,
    gap,
    verdict,
    location: item.region || "",
    date: item.created_at,
    creditsEarned: item.credits_earned ?? 0,
    components,
    analysisQuick: null,
    analysisDeep: null,
    watchlisted: false,
    alertActive: false,
    depth,
  };
}

// ── Helpers ──
const PLATFORM_COLORS: Record<string, string> = {
  Leboncoin: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  eBay: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Vinted: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Facebook Marketplace": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

const VERDICT_CONFIG: Record<string, { label: string; class: string }> = {
  BONNE_AFFAIRE: { label: "Bonne affaire", class: "bg-green-500/15 text-green-400 border-green-500/30" },
  PRIX_CORRECT: { label: "Prix correct", class: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  SUREVALUE: { label: "Surévalué", class: "bg-red-500/15 text-red-400 border-red-500/30" },
  NO_DATA: { label: "Signal collecté", class: "bg-muted/50 text-muted-foreground border-border" },
};

const DEPTH_CONFIG = {
  signal: { label: "Signal", class: "bg-muted/50 text-muted-foreground border-border" },
  qualified: { label: "Qualifié", class: "bg-primary/10 text-primary border-primary/20" },
  decision: { label: "Décision", class: "bg-green-500/15 text-green-400 border-green-500/30" },
};

const TYPE_LABELS: Record<string, string> = { PC_COMPLET: "PC complet", COMPOSANT: "Composant", LOT: "Lot" };

function relativeDate(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });
}

// ── Quick Analysis Panel ──
function QuickAnalysisPanel({ analysis, onDeepAnalysis }: { analysis: QuickAnalysis; onDeepAnalysis: () => void }) {
  // ... keep existing code (all metrics, details, insights)
  const metrics = [
    { label: "Écart marché", value: analysis.gap, icon: TrendingDown },
    { label: "Tendance 30j", value: analysis.trend30d, icon: TrendingUp },
    { label: "Volume", value: analysis.volume, icon: BarChart3 },
    { label: "Liquidité", value: analysis.liquidity, icon: Droplets },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="pt-3 mt-3 border-t border-border space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="p-2.5 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-1 text-muted-foreground text-[11px] mb-0.5">
                <m.icon className="h-3 w-3" />
                {m.label}
              </div>
              <p className="font-semibold text-sm">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-2.5 bg-muted/50 rounded-lg">
            <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Détails</p>
            <div className="space-y-1">
              {analysis.details.map((d, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className={cn("font-medium", d.positive === false ? "text-destructive" : "")}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-2.5 bg-muted/50 rounded-lg">
            <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Insights</p>
            <ul className="space-y-0.5">
              {analysis.insights.map((ins, i) => (
                <li key={i} className="text-xs text-muted-foreground">{ins}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Scan Card ──
function ScanCard({ entry }: { entry: LensEntry }) {
  // ... keep existing code (entire ScanCard component unchanged)
  const navigate = useNavigate();
  const [watchlisted, setWatchlisted] = useState(entry.watchlisted);
  const [alertActive, setAlertActive] = useState(entry.alertActive);
  const [quickResult, setQuickResult] = useState<QuickAnalysis | null>(entry.analysisQuick);
  const [expanded, setExpanded] = useState(!!entry.analysisQuick);
  const [loading, setLoading] = useState(false);
  const [depth, setDepth] = useState<"signal" | "qualified" | "decision">(entry.depth);

  const verdict = VERDICT_CONFIG[entry.verdict];
  const hasMarketData = entry.marketValue > 0;
  const gapPositive = entry.gap > 0;
  const depthConf = DEPTH_CONFIG[depth];
  const isBundle = entry.type === "PC_COMPLET" || entry.type === "LOT";

  const handleQuickAnalysis = () => {
    if (quickResult) {
      setExpanded(!expanded);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result: QuickAnalysis = {
        gap: `${gapPositive ? "+" : ""}${entry.gap}%`,
        trend30d: gapPositive ? "+2.1%" : "-4.2%",
        volume: "Modéré",
        liquidity: "6.3/10",
        details: [
          { label: "Valeur médiane 30j", value: `${entry.marketValue}€` },
          { label: "Prix annonce", value: `${entry.price}€` },
          { label: "Écart", value: `${gapPositive ? "+" : ""}${entry.gap}% ${gapPositive ? "sous-évalué" : "surévalué"}`, positive: gapPositive },
        ],
        insights: gapPositive
          ? ["🟢 Prix inférieur au marché", "🟢 Composant populaire, revente facile", "🟡 Vérifier l'état réel"]
          : ["🔴 Prix au-dessus du marché", "🟡 Marge de négociation possible", "🟡 Tendance baissière récente"],
      };
      setQuickResult(result);
      setExpanded(true);
      setDepth("qualified");
      setLoading(false);
    }, 1500);
  };

  const handleDeepAnalysis = () => {
    setDepth("decision");
    const comp = entry.components[0];
    const params = new URLSearchParams({
      model_name: comp?.name || entry.title,
      price: entry.price.toString(),
      platform: entry.platform.toLowerCase(),
      source: "lens",
      scan_id: entry.id.toString(),
    });
    if (comp?.type) params.set("category", comp.type);
    navigate(`/estimator?${params.toString()}`);
  };

  return (
    <Card className="hover:border-primary/30 transition-colors group">
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", PLATFORM_COLORS[entry.platform])}>
            {entry.platform}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {TYPE_LABELS[entry.type] || entry.type}
          </Badge>
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 font-medium", verdict?.class)}>
            {verdict?.label || entry.verdict}
          </Badge>
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", depthConf.class)}>
            {depthConf.label}
          </Badge>
          <span className="ml-auto text-[11px] text-muted-foreground shrink-0">
            {relativeDate(entry.date)}
          </span>
        </div>

        <p className="text-sm font-semibold truncate mb-2">{entry.title}</p>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl font-bold text-primary tabular-nums">{entry.price}€</span>
          <span className="text-xs text-muted-foreground">
            Marché : {entry.marketValue}€
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-semibold",
              gapPositive
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : entry.gap < -5
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}
          >
            {gapPositive ? "+" : ""}{entry.gap}%
          </Badge>
          <div className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {entry.location}
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3" style={{ scrollbarWidth: "none" }}>
          {entry.components.slice(0, 4).map((c, i) => (
            <div key={i} className="shrink-0 flex items-center gap-1 bg-muted/50 rounded px-2 py-0.5 text-[11px]">
              <span className="text-muted-foreground">{c.type}</span>
              <span>{c.name}</span>
              <span className="text-primary font-semibold">{c.score}</span>
            </div>
          ))}
          {entry.components.length > 4 && (
            <span className="shrink-0 text-[11px] text-muted-foreground self-center">+{entry.components.length - 4}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setWatchlisted(!watchlisted)}
          >
            <Bookmark className={cn("h-3.5 w-3.5", watchlisted ? "fill-primary text-primary" : "text-muted-foreground")} />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setAlertActive(!alertActive)}
          >
            <Bell className={cn("h-3.5 w-3.5", alertActive ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </Button>

          <div className="ml-auto flex gap-1.5">
            <Button
              size="sm" variant={quickResult ? "default" : "outline"}
              className="h-7 text-xs gap-1"
              onClick={handleQuickAnalysis}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : quickResult ? (
                expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
              ) : (
                <Zap className="h-3 w-3" />
              )}
              {quickResult ? "Résultats" : "Qualifier · 5 cr."}
            </Button>
            <Button
              size="sm" variant="outline"
              className="h-7 text-xs gap-1 hidden sm:inline-flex border-primary/40 text-primary hover:bg-primary/10"
              onClick={handleDeepAnalysis}
            >
              <FlaskConical className="h-3 w-3" />
              Décision complète · 20 cr. →
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {quickResult && expanded && (
            <QuickAnalysisPanel analysis={quickResult} onDeepAnalysis={handleDeepAnalysis} />
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ── Empty State ──
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 rounded-full bg-muted mb-6">
        <Eye className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold mb-2">Aucune analyse</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Installez Monark Lens et naviguez sur Leboncoin, eBay ou Vinted pour voir vos analyses ici.
      </p>
      <div className="flex gap-3">
        <Button className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Installer Monark Lens
        </Button>
        <Button variant="outline" asChild>
          <a href="/catalog">Voir le catalogue</a>
        </Button>
      </div>
    </div>
  );
}

// ── Estimation History Card ──
function EstimationHistoryCard({ item, onReEstimate, onView }: { item: EnhancedEstimationHistoryItem; onReEstimate: (item: EnhancedEstimationHistoryItem) => void; onView: (item: EnhancedEstimationHistoryItem) => void }) {
  const planColors: Record<string, string> = {
    free: "bg-muted/50 text-muted-foreground border-border",
    standard: "bg-primary/10 text-primary border-primary/20",
    pro: "bg-green-500/15 text-green-400 border-green-500/30",
  };

  const r = item.results;
  const score = r?.opportunity?.score;
  const scoreLabel = r?.opportunity?.label;
  const decision = r?.decision?.action;
  const median = r?.market?.median_price;
  const margin = r?.actionable_prices?.margin_pct;
  const confidence = r?.confidence?.level;

  const scoreColor = score != null
    ? score >= 75 ? "text-green-400" : score >= 55 ? "text-primary" : score >= 35 ? "text-yellow-400" : "text-red-400"
    : "text-muted-foreground";

  const decisionColors: Record<string, string> = {
    buy: "bg-green-500/15 text-green-400 border-green-500/30",
    negotiate: "bg-primary/10 text-primary border-primary/20",
    wait: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    pass: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  const decisionLabels: Record<string, string> = {
    buy: "Acheter", negotiate: "Négocier", wait: "Attendre", pass: "Passer",
  };

  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="px-3 py-2.5">
        {/* Row 1: Model name + badges + date */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <p className="text-sm font-semibold truncate">{item.model_name}</p>
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 leading-tight", planColors[item.plan_at_creation] || "")}>
              {item.plan_at_creation}
            </Badge>
            {item.platform && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-tight">
                {item.platform}
              </Badge>
            )}
            {decision && (
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 leading-tight", decisionColors[decision] || "")}>
                {decisionLabels[decision] || decision}
              </Badge>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {new Date(item.created_at).toLocaleDateString("fr-FR")}
          </span>
        </div>

        {/* Row 2: Category + condition */}
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.category} · {item.condition || "État inconnu"}
        </p>

        {/* Row 3: Key metrics */}
        <div className="flex items-center gap-3 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Prix :</span>
            <span className="font-semibold text-primary tabular-nums">{item.ad_price}€</span>
          </div>
          {median != null && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Médian :</span>
              <span className="font-medium tabular-nums">{median}€</span>
            </div>
          )}
          {score != null && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Score :</span>
              <span className={cn("font-semibold tabular-nums", scoreColor)}>{score}/100</span>
            </div>
          )}
          {margin != null && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Marge :</span>
              <span className={cn("font-medium tabular-nums", margin > 0 ? "text-green-400" : "text-red-400")}>
                {margin > 0 ? "+" : ""}{margin.toFixed(0)}%
              </span>
            </div>
          )}
          {confidence && (
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-muted-foreground">Confiance :</span>
              <span className="font-medium capitalize">{confidence === "high" ? "Élevée" : confidence === "medium" ? "Moyenne" : "Faible"}</span>
            </div>
          )}
        </div>

        {/* Row 4: Actions */}
        <div className="flex items-center gap-1.5 mt-2 justify-end">
          <Button size="sm" variant="outline" className="gap-1 h-6 text-xs px-2" onClick={() => onView(item)}>
            <Eye className="h-3 w-3" />
            Détail
          </Button>
          <Button size="sm" variant="outline" className="gap-1 h-6 text-xs px-2" onClick={() => onReEstimate(item)}>
            <RotateCcw className="h-3 w-3" />
            Ré-estimer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Estimation Detail Dialog ──
function EstimationDetailDialog({ 
  item, 
  onClose, 
  plan, 
  onReEstimate 
}: { 
  item: EnhancedEstimationHistoryItem | null; 
  onClose: () => void; 
  plan: string;
  onReEstimate: (item: EnhancedEstimationHistoryItem) => void;
}) {
  if (!item) return null;
  const result = item.results;
  const historyPlan = item.plan_at_creation || plan;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-3 sticky top-0 bg-background z-10 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-lg">{item.model_name}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {item.category} · {item.condition || "État inconnu"} · {item.ad_price}€ · {new Date(item.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-[10px]">{historyPlan}</Badge>
              <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => { onClose(); onReEstimate(item); }}>
                <RotateCcw className="h-3 w-3" />
                Ré-estimer
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Input summary */}
          {result.inputs && (
            <InputSummaryChips
              modelName={result.inputs.model_name}
              category={result.inputs.category}
              condition={result.inputs.condition || ""}
              platform={result.inputs.platform || ""}
              adPrice={String(result.inputs.ad_price)}
              withoutCondition={item.options?.withoutCondition}
              withoutPlatform={item.options?.withoutPlatform}
            />
          )}

          {/* Hypotheses */}
          {result.hypotheses?.length > 0 && (
            <HypothesesBanner hypotheses={result.hypotheses} />
          )}

          {/* Synthesis + Score */}
          <div className="grid md:grid-cols-2 gap-6">
            <SynthesisBanner result={result as any} />
            <OpportunityScoreCard 
              opportunity={result.opportunity}
              confidence={result.confidence}
              tags={result.tags}
              plan={historyPlan as any}
            />
          </div>

          {/* Market */}
          <EnhancedMarketCard
            market={result.market}
            adPrice={result.inputs.ad_price}
            plan={historyPlan as any}
          />

          {/* Decision */}
          <EnhancedDecisionBlock
            decision={result.decision}
            actionablePrices={result.actionable_prices}
            adPrice={result.inputs.ad_price}
            plan={historyPlan as any}
          />

          {/* Negotiation */}
          {result.negotiation && (
            <EnhancedNegotiationSection
              negotiation={result.negotiation}
              adPrice={result.inputs.ad_price}
              plan={historyPlan as any}
              withoutCondition={item.options?.withoutCondition}
            />
          )}

          {/* Platforms */}
          {result.platforms && (
            <EnhancedPlatformsSection
              platforms={result.platforms}
              plan={historyPlan as any}
              sourcePlatform={result.inputs.platform}
            />
          )}

          {/* Scenarios */}
          {result.scenarios && (
            <EnhancedScenariosSection
              scenarios={result.scenarios}
              adPrice={result.inputs.ad_price}
              plan={historyPlan as any}
            />
          )}

          {/* What-if */}
          {result.what_if && (
            <WhatIfSimulator
              whatIf={result.what_if}
              adPrice={result.inputs.ad_price}
              actionablePrices={result.actionable_prices}
              plan={historyPlan as any}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──
export default function LensHistory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [depthFilter, setDepthFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"scans" | "estimations">("scans");
  const [historyPage, setHistoryPage] = useState(1);
  const [viewHistoryItem, setViewHistoryItem] = useState<EnhancedEstimationHistoryItem | null>(null);

  const { plan } = useEntitlements();

  // Lens history from API
  const {
    items: apiItems,
    total: lensTotal,
    page: lensPage,
    setPage: setLensPage,
    stats: lensStats,
    isLoading: isLoadingLens,
    isError: isLensError,
    refresh: refreshLens,
  } = useLensHistory({
    platform: platformFilter !== "all" ? platformFilter.toLowerCase() : undefined,
    enabled: activeTab === "scans",
  });

  // In DEV mode, use mock data as fallback when API fails or returns empty
  const useDevMock = import.meta.env.DEV && (isLensError || apiItems.length === 0);

  // Convert API items to LensEntry format, fallback to mock in DEV mode
  const lensScans = useMemo(() => {
    if (apiItems.length > 0) return apiItems.map(apiItemToLensEntry);
    if (import.meta.env.DEV) return DEV_MOCK_HISTORY as LensEntry[];
    return [];
  }, [apiItems, isLensError]);

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isHistoryError,
    refetch: refreshHistory,
  } = useEnhancedEstimationHistory(historyPage, activeTab === "estimations");

  const historyState = isLoadingHistory ? "loading"
    : isHistoryError ? "error"
    : historyData?.items?.length === 0 ? "empty"
    : "success";

  const hasActiveFilters = search || platformFilter !== "all" || typeFilter !== "all" || verdictFilter !== "all" || dateFilter !== "all" || depthFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setPlatformFilter("all");
    setTypeFilter("all");
    setVerdictFilter("all");
    setDateFilter("all");
    setDepthFilter("all");
  };

  const filtered = useMemo(() => {
    return lensScans.filter((e) => {
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.components.some((c) => c.name.toLowerCase().includes(search.toLowerCase()))) return false;
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (verdictFilter !== "all" && e.verdict !== verdictFilter) return false;
      if (depthFilter !== "all" && e.depth !== depthFilter) return false;
      if (dateFilter === "today") {
        const today = new Date().toISOString().slice(0, 10);
        if (!e.date.startsWith(today)) return false;
      }
      return true;
    });
  }, [lensScans, search, typeFilter, verdictFilter, dateFilter, depthFilter]);

  // Stats from API, fallback to mock-derived stats in DEV
  const signalCount = lensStats?.total_signals ?? lensScans.length;
  const totalCredits = lensStats?.total_credits_earned ?? (import.meta.env.DEV ? lensScans.reduce((s, e) => s + e.creditsEarned, 0) : 0);
  const qualifiedCount = lensScans.filter((e) => e.depth === "qualified").length;
  const decisionCount = lensScans.filter((e) => e.depth === "decision").length;
  const hasMorePages = lensTotal > lensPage * 50;

  const handleReEstimate = (item: EnhancedEstimationHistoryItem) => {
    navigate(`/estimator?model_id=${item.model_id}&model_name=${encodeURIComponent(item.model_name)}&price=${item.ad_price}&platform=${item.platform || ""}&condition=${item.condition || ""}&source=history`);
  };

  return (
    <div className="min-h-screen py-6 md:py-8">
      <div className="container max-w-4xl space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ScanSearch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Mes Analyses</h1>
                <p className="text-sm text-muted-foreground">Toutes vos analyses — Scans Lens et Estimations complètes</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 gap-1.5 text-xs" asChild>
              <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Installer Lens
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "scans" | "estimations")}>
          <TabsList>
            <TabsTrigger value="scans" className="gap-1.5">
              <ScanSearch className="h-3.5 w-3.5" />
              Scans Lens
            </TabsTrigger>
            <TabsTrigger value="estimations" className="gap-1.5">
              <Calculator className="h-3.5 w-3.5" />
              Estimations complètes
            </TabsTrigger>
          </TabsList>

          {/* ── TAB: SCANS ── */}
          <TabsContent value="scans" className="space-y-5 mt-5">
            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              <Card className="p-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-muted">
                    <ScanSearch className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-bold tabular-nums">{signalCount}</p>
                    <p className="text-[11px] text-muted-foreground">Signal</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold tabular-nums">{qualifiedCount}</p>
                    <p className="text-[11px] text-muted-foreground">Qualifiées</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-green-500/10">
                    <Target className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold tabular-nums">{decisionCount}</p>
                    <p className="text-[11px] text-muted-foreground">Décisions</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-green-500/10">
                    <Award className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold tabular-nums text-green-400">+{totalCredits}</p>
                    <p className="text-[11px] text-muted-foreground">Crédits gagnés</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-wrap items-center gap-2"
            >
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8 h-8 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Plateforme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="Leboncoin">Leboncoin</SelectItem>
                  <SelectItem value="eBay">eBay</SelectItem>
                  <SelectItem value="Vinted">Vinted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={depthFilter} onValueChange={setDepthFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Profondeur" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="signal">Signal</SelectItem>
                  <SelectItem value="qualified">Qualifiées</SelectItem>
                  <SelectItem value="decision">Décisions</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verdictFilter} onValueChange={setVerdictFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Verdict" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="BONNE_AFFAIRE">Bonne affaire</SelectItem>
                  <SelectItem value="PRIX_CORRECT">Prix correct</SelectItem>
                  <SelectItem value="SUREVALUE">Surévalué</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="PC_COMPLET">PC complet</SelectItem>
                  <SelectItem value="COMPOSANT">Composant</SelectItem>
                  <SelectItem value="LOT">Lot</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground gap-1" onClick={resetFilters}>
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              )}
            </motion.div>

            {/* Results count */}
            <p className="text-xs text-muted-foreground">
              {filtered.length} analyse{filtered.length !== 1 ? "s" : ""}
              {hasActiveFilters ? " (filtrées)" : ""}
            </p>

            {/* Feed */}
            {isLoadingLens && !useDevMock ? (
              <div className="space-y-2.5">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : isLensError && !useDevMock ? (
              <div className="flex flex-col items-center py-10">
                <RefreshCw className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">Erreur de chargement</p>
                <Button variant="outline" size="sm" onClick={() => refreshLens()}>
                  Réessayer
                </Button>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
                className="space-y-2.5"
              >
                {filtered.length === 0 ? (
                  <EmptyState />
                ) : (
                  filtered.map((entry) => (
                    <motion.div key={entry.id} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
                      <ScanCard entry={entry} />
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {hasMorePages && !isLoadingLens && filtered.length > 0 && (
              <Button variant="outline" className="w-full text-xs h-9" onClick={() => setLensPage(lensPage + 1)}>
                Charger plus ({lensTotal - lensPage * 50} restants)
              </Button>
            )}
          </TabsContent>

          {/* ── TAB: ESTIMATIONS ── */}
          <TabsContent value="estimations" className="mt-5">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calculator className="h-4 w-4 text-primary" />
                    Historique des estimations complètes
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refreshHistory()} disabled={isLoadingHistory}>
                    <RefreshCw className={cn("h-4 w-4", isLoadingHistory && "animate-spin")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                  💡 Consultez vos estimations passées sans dépenser de crédits. Lancez une estimation depuis l'<a href="/estimator" className="text-primary hover:underline font-medium">Estimator</a>.
                </p>

                {historyState === "loading" && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="h-4 w-2/3 mb-2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {historyState === "error" && (
                  <div className="flex flex-col items-center py-10">
                    <RefreshCw className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">Erreur de chargement</p>
                    <Button variant="outline" size="sm" onClick={() => refreshHistory()}>
                      Réessayer
                    </Button>
                  </div>
                )}

                {historyState === "empty" && (
                  <div className="flex flex-col items-center py-10">
                    <Calculator className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-1">Aucune estimation complète</p>
                    <p className="text-xs text-muted-foreground mb-4 text-center max-w-xs">
                      Lancez une décision complète depuis un scan Lens ou via l'Estimator.
                    </p>
                    <Button size="sm" onClick={() => navigate("/estimator")}>
                      Ouvrir l'Estimator
                    </Button>
                  </div>
                )}

                {historyState === "success" && historyData?.items?.map((item) => (
                  <EstimationHistoryCard
                    key={item.id}
                    item={item}
                    onReEstimate={handleReEstimate}
                    onView={setViewHistoryItem}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Detail Dialog ── */}
        <EstimationDetailDialog
          item={viewHistoryItem}
          onClose={() => setViewHistoryItem(null)}
          plan={plan}
          onReEstimate={handleReEstimate}
        />
      </div>
    </div>
  );
}
