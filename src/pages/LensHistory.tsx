import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, RotateCcw, Bookmark, Bell, Zap, FlaskConical, Loader2,
  ExternalLink, TrendingUp, TrendingDown, BarChart3, Droplets,
  ScanSearch, Award, Clock, MapPin, ChevronDown, ChevronUp, Eye, Target,
  RefreshCw, Calculator, X, AlertTriangle, Check, Trash2,
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
import { apiFetch } from "@/lib/api/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useEnhancedEstimationHistory } from "@/hooks";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useLensHistory } from "@/hooks/useLensHistory";
import type { LensHistoryItem, Insight } from "@/hooks/useLensHistory";
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

// ── Constants ──
const VERDICT_CONFIG: Record<string, { label: string; emoji: string; class: string }> = {
  excellente_affaire: { label: "Excellente affaire", emoji: "🔥", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  bonne_affaire: { label: "Bonne affaire", emoji: "✅", class: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  prix_correct: { label: "Prix correct", emoji: "➡️", class: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  au_dessus_marche: { label: "Surévalué", emoji: "⚠️", class: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  trop_cher: { label: "Trop cher", emoji: "🚫", class: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const PLATFORM_COLORS: Record<string, { label: string; class: string }> = {
  leboncoin: { label: "Leboncoin", class: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  ebay: { label: "eBay", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  vinted: { label: "Vinted", class: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  facebook: { label: "Facebook", class: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
};

const CATEGORY_COLORS: Record<string, string> = {
  gpu: "text-red-400",
  cpu: "text-blue-400",
  ram: "text-purple-400",
  ssd: "text-cyan-400",
  psu: "text-yellow-400",
  motherboard: "text-orange-400",
  cooler: "text-teal-400",
  case: "text-muted-foreground",
};

const REGION_LABELS: Record<string, string> = {
  "ile-de-france": "Île-de-France",
  "grand-est": "Grand Est",
  "auvergne-rhone-alpes": "Auvergne-Rhône-Alpes",
  "nouvelle-aquitaine": "Nouvelle-Aquitaine",
  "occitanie": "Occitanie",
  "hauts-de-france": "Hauts-de-France",
  "provence-alpes-cote-d-azur": "PACA",
  "pays-de-la-loire": "Pays de la Loire",
  "bretagne": "Bretagne",
  "normandie": "Normandie",
  "bourgogne-franche-comte": "Bourgogne-Franche-Comté",
  "centre-val-de-loire": "Centre-Val de Loire",
  "corse": "Corse",
  "grand-ouest": "Grand Ouest",
  "alsace": "Alsace",
  "lorraine": "Lorraine",
  "champagne-ardenne": "Champagne-Ardenne",
  "picardie": "Picardie",
  "nord-pas-de-calais": "Nord-Pas-de-Calais",
  "aquitaine": "Aquitaine",
  "midi-pyrenees": "Midi-Pyrénées",
  "languedoc-roussillon": "Languedoc-Roussillon",
  "rhone-alpes": "Rhône-Alpes",
  "poitou-charentes": "Poitou-Charentes",
  "limousin": "Limousin",
  "auvergne": "Auvergne",
  "franche-comte": "Franche-Comté",
  "basse-normandie": "Basse-Normandie",
  "haute-normandie": "Haute-Normandie",
  "bourgogne": "Bourgogne",
};

function getRegionLabel(slug: string): string {
  return REGION_LABELS[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  "neuf": { label: "Neuf", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  "tresbonetat": { label: "Très bon état", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  "bonetat": { label: "Bon état", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  "etatcorrect": { label: "État correct", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  "pourpieces": { label: "Pour pièces", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  "like_new": { label: "Comme neuf", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  "good": { label: "Bon état", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  "fair": { label: "État correct", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  "broken": { label: "Pour pièces", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

function getConditionBadge(condition: string | null): { label: string; color: string } | null {
  if (!condition) return null;
  const normalized = condition.toLowerCase().replace(/[\s_-]/g, '');
  return CONDITION_LABELS[normalized] || CONDITION_LABELS[condition] || { label: condition, color: "bg-muted/50 text-muted-foreground border-border" };
}

const INSIGHT_COLORS: Record<string, string> = {
  positive: "bg-green-500/20 text-green-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  negative: "bg-red-500/20 text-red-400",
  info: "bg-blue-500/20 text-blue-400",
};

function relativeDate(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "date inconnue";
    return formatDistanceToNow(d, { addSuffix: true, locale: fr });
  } catch {
    return "date inconnue";
  }
}

function getPlatformDisplay(raw: string) {
  const key = raw.toLowerCase();
  return PLATFORM_COLORS[key] || { label: raw, class: "bg-muted/50 text-muted-foreground border-border" };
}

function getVerdictDisplay(verdict: string | null) {
  if (!verdict) return null;
  return VERDICT_CONFIG[verdict] || null;
}

function getGapColor(gap: number): string {
  if (gap < 0) return "bg-green-500/10 text-green-400 border-green-500/20";
  if (gap <= 10) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (gap <= 30) return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  return "bg-red-500/10 text-red-400 border-red-500/20";
}

function getVolumeLabel(dp: number): string {
  if (dp < 5) return "Faible";
  if (dp <= 20) return "Modéré";
  return "Élevé";
}

function buildTitle(item: LensHistoryItem): string {
  if (item.is_bundle) {
    if (item.bundle_components && item.bundle_components.length > 0) {
      const names = item.bundle_components
        .slice(0, 3)
        .map(c => c.component_name || (c as any).name || `Composant #${c.component_id}`)
        .filter(Boolean);
      if (names.length > 0) return `PC complet — ${names.join(" / ")}`;
    }
    return `PC complet — ${item.component_name || "Composants inconnus"}`;
  }
  if (item.listing_intent === "multiple") {
    return `Lot de ${item.component_name || "Composant inconnu"}`;
  }
  return item.component_name || "Composant inconnu";
}

// ── Scan Card ──
function ScanCard({ item, onQualified, onDelete }: { item: LensHistoryItem; onQualified?: (id: number, level: string, deepData: any) => void; onDelete?: (id: number) => void }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [qualifying, setQualifying] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);
  const [alertActive, setAlertActive] = useState(false);

  const platform = getPlatformDisplay(item.platform);
  const verdictDisplay = getVerdictDisplay(item.verdict);
  const bundleVerdictDisplay = item.is_bundle ? getVerdictDisplay(item.bundle_verdict) : null;
  const activeVerdict = item.is_bundle ? (bundleVerdictDisplay || verdictDisplay) : verdictDisplay;
  const hasMarketData = item.market_median != null && item.market_median > 0;
  const gap = item.price_vs_market ?? (hasMarketData ? ((item.price - item.market_median!) / item.market_median!) * 100 : 0);
  const title = buildTitle(item);
  const regionLabel = item.region ? (REGION_LABELS[item.region] || item.region) : null;


  const handleQualify = async (level: 'quick' | 'full') => {
    if (!item.ad_hash || qualifying) return;
    setQualifying(true);
    try {
      const result = await apiFetch<any>('/v1/lens/analyze/deep', {
        method: 'POST',
        body: { ad_hash: item.ad_hash, analysis_level: level },
      });
      onQualified?.(item.id, level, result);
      setExpanded(true);
    } catch (err) {
      console.error('Qualification failed:', err);
    } finally {
      setQualifying(false);
    }
  };

  const handleDeepAnalysis = () => {
    const params = new URLSearchParams({
      model_name: item.component_name || title,
      price: item.price.toString(),
      platform: item.platform,
      source: "lens",
      scan_id: item.id.toString(),
    });
    if (item.category) params.set("category", item.category);
    navigate(`/estimator?${params.toString()}`);
  };

  return (
    <Card className="hover:border-primary/30 transition-colors group">
      <CardContent className="p-4">
        {/* Row 1: Badges */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", platform.class)}>
            {platform.label}
          </Badge>
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0",
            item.is_bundle
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : item.listing_intent === "multiple"
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
          )}>
            {item.is_bundle ? "PC complet" : item.listing_intent === "multiple" ? "Lot" : "Composant"}
          </Badge>
          {activeVerdict && (
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 font-medium", activeVerdict.class)}>
              {activeVerdict.emoji} {activeVerdict.label}
            </Badge>
          )}
          {!activeVerdict && !hasMarketData && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-border">
              Signal collecté
            </Badge>
          )}
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0",
            item.is_qualified
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-muted/50 text-muted-foreground border-border"
          )}>
            {item.is_qualified ? "Qualifié" : "Signal"}
          </Badge>
          {item.cache_stale && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
              ⚠️ Données périmées
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            {item.condition && (() => {
              const cb = getConditionBadge(item.condition);
              return cb ? (
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 font-medium", cb.color)}>
                  {cb.label}
                </Badge>
              ) : null;
            })()}
            {item.region && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {getRegionLabel(item.region)}
                </span>
              </>
            )}
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {relativeDate(item.created_at)}
            </span>
          </div>
        </div>

        {/* Row 2: Title */}
        {!item.is_bundle ? (
          <p
            className="text-sm font-semibold truncate mb-2 cursor-pointer hover:text-primary transition-colors"
            onClick={(e) => { e.stopPropagation(); navigate(`/catalog?component=${item.component_id}`); }}
          >
            {title}
          </p>
        ) : (
          <p className="text-sm font-semibold truncate mb-2">{title}</p>
        )}

        {/* Row 3: Price + Market + Region */}
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span className="text-xl font-bold text-primary tabular-nums">{item.price}€</span>
          {hasMarketData ? (
            <>
              <span className="text-xs text-muted-foreground">
                Marché : {item.market_median}€
              </span>
              <Badge variant="outline" className={cn("text-[11px] font-semibold", getGapColor(gap))}>
                {gap > 0 ? "+" : ""}{gap.toFixed(1)}%
              </Badge>
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic">Pas de données marché</span>
          )}
        </div>

        {/* Row 4: Bundle components */}
        {item.is_bundle && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
            {item.bundle_components && item.bundle_components.length > 0 ? (
              item.bundle_components.map((c, i) => {
                const cat = (c.category || "").toLowerCase();
                const catColorClass = ({
                  gpu: "bg-red-500/20 text-red-400 border border-red-500/20",
                  cpu: "bg-blue-500/20 text-blue-400 border border-blue-500/20",
                  ram: "bg-purple-500/20 text-purple-400 border border-purple-500/20",
                  ssd: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20",
                })[cat] || "bg-muted/50 text-muted-foreground border border-border";
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs">
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", catColorClass)}>
                      {cat || "?"}
                    </span>
                    <span
                      className="cursor-pointer hover:text-primary hover:underline transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (c.catalog_slug) navigate(`/catalog/${c.catalog_slug}`);
                        else navigate(`/catalog?component=${c.component_id}`);
                      }}
                    >
                      {c.component_name || (c as any).name || `Composant #${c.component_id}`}
                    </span>
                    {c.market_median != null ? (
                      <span className="text-muted-foreground">{Math.round(c.market_median)}€</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </span>
                );
              })
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs">
                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", ({
                  gpu: "bg-red-500/20 text-red-400 border border-red-500/20",
                  cpu: "bg-blue-500/20 text-blue-400 border border-blue-500/20",
                  ram: "bg-purple-500/20 text-purple-400 border border-purple-500/20",
                  ssd: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20",
                })[(item.category || "").toLowerCase()] || "bg-muted/50 text-muted-foreground border border-border")}>
                  {(item.category || "?").toUpperCase()}
                </span>
                <span>{item.component_name}</span>
                {item.market_median != null && (
                  <span className="text-muted-foreground">{Math.round(item.market_median)}€</span>
                )}
                <span className="text-muted-foreground/50 italic ml-2">+ composants non détaillés</span>
              </span>
            )}
          </div>
        )}

        {/* Non-bundle: single component chip */}
        {!item.is_bundle && (
          <div className="flex gap-1.5 mb-2">
            <div
              className="shrink-0 flex items-center gap-1 bg-muted/50 rounded px-2 py-0.5 text-[11px] cursor-pointer hover:bg-muted transition-colors"
              onClick={(e) => { e.stopPropagation(); navigate(`/catalog?component=${item.component_id}`); }}
            >
              <span className={cn("font-medium uppercase", CATEGORY_COLORS[(item.category || "").toLowerCase()] || "text-muted-foreground")}>
                {(item.category || "?").toUpperCase()}
              </span>
              <span>{item.component_name}</span>
            </div>
          </div>
        )}

        {/* Row 5: Insights */}
        {item.insights && item.insights.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2" style={{ scrollbarWidth: "none" }}>
            {item.insights.map((ins, i) => (
              <span
                key={i}
                className={cn("shrink-0 text-[10px] px-2 py-0.5 rounded-full", INSIGHT_COLORS[ins.type] || "bg-muted/50 text-muted-foreground")}
              >
                {ins.icon} {ins.text}
              </span>
            ))}
          </div>
        )}

        {/* Row 6: Actions */}
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWatchlisted(!watchlisted)}>
            <Bookmark className={cn("h-3.5 w-3.5", watchlisted ? "fill-primary text-primary" : "text-muted-foreground")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAlertActive(!alertActive)}>
            <Bell className={cn("h-3.5 w-3.5", alertActive ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Supprimer cette analyse"
            onClick={() => onDelete?.(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          {item.cache_stale && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-yellow-400">
              <RefreshCw className="h-3 w-3" />
              Rescanner
            </Button>
          )}

          <div className="ml-auto flex gap-1.5">
            {/* Bouton Qualifier / Résultats */}
            {item.has_deep_analysis ? (
              <Button
                size="sm"
                variant="outline"
                className={cn("h-7 text-xs gap-1", "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25")}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                <Check className="h-3 w-3" /> Résultats
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                disabled={qualifying}
                onClick={() => handleQualify('quick')}
              >
                {qualifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                {qualifying ? "Analyse…" : "Qualifier · 5 cr."}
              </Button>
            )}
            {/* Bouton Décision complète — visible si pas d'analyse ou seulement quick */}
            {(!item.has_deep_analysis || item.deep_analysis_level === "quick") && (
              <Button
                size="sm" variant="outline"
                className="h-7 text-xs gap-1 hidden sm:inline-flex border-primary/40 text-primary hover:bg-primary/10"
                onClick={handleDeepAnalysis}
              >
                <FlaskConical className="h-3 w-3" />
                Décision complète · 20 cr. →
              </Button>
            )}
          </div>
        </div>

        {/* Expandable results */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-3 border-t border-border space-y-3">
                {/* Metrics grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1 text-muted-foreground text-[11px] mb-0.5">
                      <TrendingDown className="h-3 w-3" /> Écart marché
                    </div>
                    <p className="font-semibold text-sm">
                      {hasMarketData ? `${gap > 0 ? "+" : ""}${gap.toFixed(1)}%` : "—"}
                    </p>
                  </div>
                  <div className="p-2.5 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1 text-muted-foreground text-[11px] mb-0.5">
                      <TrendingUp className="h-3 w-3" /> Tendance 30j
                    </div>
                    <p className="font-semibold text-sm">
                      {item.has_deep_analysis && item.deep_data?.trend_30d != null
                        ? `${item.deep_data.trend_30d > 0 ? "+" : ""}${item.deep_data.trend_30d.toFixed(1)}%`
                        : "—"}
                    </p>
                  </div>
                  <div className="p-2.5 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1 text-muted-foreground text-[11px] mb-0.5">
                      <BarChart3 className="h-3 w-3" /> Volume
                    </div>
                    <p className="font-semibold text-sm">
                      {item.data_points > 0
                        ? `${item.data_points} obs. · ${getVolumeLabel(item.data_points)}`
                        : "0 obs."}
                    </p>
                  </div>
                  <div className="p-2.5 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1 text-muted-foreground text-[11px] mb-0.5">
                      <Droplets className="h-3 w-3" /> Liquidité
                    </div>
                    <p className="font-semibold text-sm">
                      {item.has_deep_analysis && item.deep_data?.liquidity
                        ? item.deep_data.liquidity
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Details section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-muted/50 rounded-lg">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Détails</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Médiane 30j</span>
                        <span className="font-medium">{hasMarketData ? `${item.market_median}€` : "Pas de données"}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Prix annonce</span>
                        <span className="font-medium">{item.price}€</span>
                      </div>
                      {hasMarketData && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Écart</span>
                          <span className={cn("font-medium", gap < 0 ? "text-green-400" : gap > 10 ? "text-red-400" : "text-blue-400")}>
                            {gap > 0 ? "+" : ""}{gap.toFixed(1)}% {gap < 0 ? "sous le marché" : "au-dessus du marché"}
                          </span>
                        </div>
                      )}
                      {item.has_deep_analysis && item.deep_data?.p25 != null && item.deep_data?.p75 != null && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">P25 — P75</span>
                          <span className="font-medium">{item.deep_data.p25}€ — {item.deep_data.p75}€</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-2.5 bg-muted/50 rounded-lg">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Insights</p>
                    {item.insights && item.insights.length > 0 ? (
                      <ul className="space-y-0.5">
                        {item.insights.map((ins, i) => (
                          <li key={i} className="text-xs text-muted-foreground">{ins.icon} {ins.text}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Aucun insight disponible</p>
                    )}
                    {item.has_deep_analysis && item.deep_data?.negotiation_range && (
                      <p className="text-xs text-muted-foreground mt-1">
                        💬 Marge de négociation estimée : {item.deep_data.negotiation_range}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
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
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.category} · {item.condition || "État inconnu"}
        </p>
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
function EstimationDetailDialog({ item, onClose, plan, onReEstimate }: {
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
          {result.hypotheses?.length > 0 && <HypothesesBanner hypotheses={result.hypotheses} />}
          <div className="grid md:grid-cols-2 gap-6">
            <SynthesisBanner result={result as any} />
            <OpportunityScoreCard opportunity={result.opportunity} confidence={result.confidence} tags={result.tags} plan={historyPlan as any} />
          </div>
          <EnhancedMarketCard market={result.market} adPrice={result.inputs.ad_price} plan={historyPlan as any} />
          <EnhancedDecisionBlock decision={result.decision} actionablePrices={result.actionable_prices} adPrice={result.inputs.ad_price} plan={historyPlan as any} />
          {result.negotiation && <EnhancedNegotiationSection negotiation={result.negotiation} adPrice={result.inputs.ad_price} plan={historyPlan as any} withoutCondition={item.options?.withoutCondition} />}
          {result.platforms && <EnhancedPlatformsSection platforms={result.platforms} plan={historyPlan as any} sourcePlatform={result.inputs.platform} />}
          {result.scenarios && <EnhancedScenariosSection scenarios={result.scenarios} adPrice={result.inputs.ad_price} plan={historyPlan as any} />}
          {result.what_if && <WhatIfSimulator whatIf={result.what_if} adPrice={result.inputs.ad_price} actionablePrices={result.actionable_prices} plan={historyPlan as any} />}
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
  const [depthFilter, setDepthFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"scans" | "estimations">("scans");
  const [historyPage, setHistoryPage] = useState(1);
  const [viewHistoryItem, setViewHistoryItem] = useState<EnhancedEstimationHistoryItem | null>(null);

  const { plan } = useEntitlements();

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
    platform: platformFilter !== "all" ? platformFilter : undefined,
    enabled: activeTab === "scans",
  });

  const useDevMock = import.meta.env.DEV && (isLensError || apiItems.length === 0);

  // Local state overrides for qualification updates
  const [qualifiedOverrides, setQualifiedOverrides] = useState<Record<number, { has_deep_analysis: boolean; deep_analysis_level: string; deep_data: any }>>({});

  const handleSignalQualified = (id: number, level: string, deepData: any) => {
    setQualifiedOverrides(prev => ({
      ...prev,
      [id]: { has_deep_analysis: true, deep_analysis_level: level, deep_data: deepData },
    }));
  };

  const lensScans: LensHistoryItem[] = useMemo(() => {
    const base = apiItems.length > 0 ? apiItems : (import.meta.env.DEV ? DEV_MOCK_HISTORY as unknown as LensHistoryItem[] : []);
    // Apply local qualification overrides
    if (Object.keys(qualifiedOverrides).length === 0) return base;
    return base.map(item => {
      const override = qualifiedOverrides[item.id];
      if (!override) return item;
      return { ...item, ...override };
    });
  }, [apiItems, isLensError, qualifiedOverrides]);

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

  const hasActiveFilters = search || platformFilter !== "all" || typeFilter !== "all" || verdictFilter !== "all" || depthFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setPlatformFilter("all");
    setTypeFilter("all");
    setVerdictFilter("all");
    setDepthFilter("all");
  };

  const filtered = useMemo(() => {
    return lensScans.filter((item) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesName = item.component_name?.toLowerCase().includes(q);
        const matchesBundle = item.bundle_components?.some(c => (c.component_name || (c as any).name || "").toLowerCase().includes(q));
        if (!matchesName && !matchesBundle) return false;
      }
      if (typeFilter === "PC_COMPLET" && !item.is_bundle) return false;
      if (typeFilter === "LOT" && item.listing_intent !== "multiple") return false;
      if (typeFilter === "COMPOSANT" && (item.is_bundle || item.listing_intent === "multiple")) return false;
      if (verdictFilter !== "all" && item.verdict !== verdictFilter) return false;
      if (depthFilter === "qualified" && !item.is_qualified) return false;
      if (depthFilter === "deep" && !item.has_deep_analysis) return false;
      if (depthFilter === "signal" && (item.is_qualified || item.has_deep_analysis)) return false;
      return true;
    });
  }, [lensScans, search, typeFilter, verdictFilter, depthFilter]);

  // Stats from API
  const signalCount = lensStats?.total_signals ?? lensScans.length;
  const qualifiedCount = lensStats?.qualified ?? lensScans.filter(s => s.is_qualified).length;
  const decisionCount = lensScans.filter(s => s.has_deep_analysis).length;
  const totalCredits = lensStats?.credits_earned ?? 0;
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-muted"><ScanSearch className="h-4 w-4 text-muted-foreground" /></div>
                  <div>
                    <p className="text-xl font-bold tabular-nums">{signalCount}</p>
                    <p className="text-[11px] text-muted-foreground">Signal</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-primary/10"><Zap className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="text-xl font-bold tabular-nums">{qualifiedCount}</p>
                    <p className="text-[11px] text-muted-foreground">Qualifiées</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-green-500/10"><Target className="h-4 w-4 text-green-400" /></div>
                  <div>
                    <p className="text-xl font-bold tabular-nums">{decisionCount}</p>
                    <p className="text-[11px] text-muted-foreground">Décisions</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-green-500/10"><Award className="h-4 w-4 text-green-400" /></div>
                  <div>
                    <p className="text-xl font-bold tabular-nums text-green-400">+{totalCredits}</p>
                    <p className="text-[11px] text-muted-foreground">Crédits gagnés</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }} className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-8 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Plateforme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="leboncoin">Leboncoin</SelectItem>
                  <SelectItem value="ebay">eBay</SelectItem>
                  <SelectItem value="vinted">Vinted</SelectItem>
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
              <Select value={verdictFilter} onValueChange={setVerdictFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Verdict" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="excellente_affaire">🔥 Excellente affaire</SelectItem>
                  <SelectItem value="bonne_affaire">✅ Bonne affaire</SelectItem>
                  <SelectItem value="prix_correct">➡️ Prix correct</SelectItem>
                  <SelectItem value="au_dessus_marche">⚠️ Surévalué</SelectItem>
                  <SelectItem value="trop_cher">🚫 Trop cher</SelectItem>
                </SelectContent>
              </Select>
              <Select value={depthFilter} onValueChange={setDepthFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Analyse" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="signal">Signal</SelectItem>
                  <SelectItem value="qualified">Qualifiées</SelectItem>
                  <SelectItem value="deep">Avec analyse</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground gap-1" onClick={resetFilters}>
                  <RotateCcw className="h-3 w-3" /> Reset
                </Button>
              )}
            </motion.div>

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
                    <div className="flex gap-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-16" /></div>
                  </Card>
                ))}
              </div>
            ) : isLensError && !useDevMock ? (
              <div className="flex flex-col items-center py-10">
                <RefreshCw className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">Erreur de chargement</p>
                <Button variant="outline" size="sm" onClick={() => refreshLens()}>Réessayer</Button>
              </div>
            ) : (
              <motion.div
                initial="hidden" animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
                className="space-y-2.5"
              >
                {filtered.length === 0 ? (
                  <EmptyState />
                ) : (
                  filtered.map((item) => (
                    <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
                      <ScanCard item={item} onQualified={handleSignalQualified} />
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
                        <div className="flex gap-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-16" /></div>
                      </Card>
                    ))}
                  </div>
                )}

                {historyState === "error" && (
                  <div className="flex flex-col items-center py-10">
                    <RefreshCw className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">Erreur de chargement</p>
                    <Button variant="outline" size="sm" onClick={() => refreshHistory()}>Réessayer</Button>
                  </div>
                )}

                {historyState === "empty" && (
                  <div className="flex flex-col items-center py-10">
                    <Calculator className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-1">Aucune estimation complète</p>
                    <p className="text-xs text-muted-foreground mb-4 text-center max-w-xs">
                      Lancez une décision complète depuis un scan Lens ou via l'Estimator.
                    </p>
                    <Button size="sm" onClick={() => navigate("/estimator")}>Ouvrir l'Estimator</Button>
                  </div>
                )}

                {historyState === "success" && historyData?.items?.map((item) => (
                  <EstimationHistoryCard key={item.id} item={item} onReEstimate={handleReEstimate} onView={setViewHistoryItem} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <EstimationDetailDialog item={viewHistoryItem} onClose={() => setViewHistoryItem(null)} plan={plan} onReEstimate={handleReEstimate} />
      </div>
    </div>
  );
}
