import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  RefreshCw, Download, AlertTriangle, Search, Zap, TrendingUp, TrendingDown,
  Loader2, ChevronDown, ChevronRight, Settings2, X, Eye, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { adminApiFetch, adminApiGet, adminApiDownload } from "@/lib/api/adminApi";
import { ADMIN } from "@/lib/api/endpoints";
import type { ObservatoryResponse, ObservatoryModel, PriceHistoryResponse } from "@/types/admin";
import { VariantsPanel } from "./VariantsPanel";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from "recharts";

// ============= Helpers =============

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

function isStale(dateStr: string | null): boolean {
  if (!dateStr) return true;
  return Date.now() - new Date(dateStr).getTime() > 30 * 24 * 60 * 60 * 1000;
}

function formatEur(v: number | null) {
  if (v == null) return "—";
  return `${Math.round(v).toLocaleString("fr-FR")} €`;
}

const CATEGORY_COLORS: Record<string, string> = {
  GPU: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CPU: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  RAM: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  SSD: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const REGIME_BADGE: Record<string, { label: string; cls: string; icon?: React.ReactNode }> = {
  stable: { label: "Stable", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  uptrend: { label: "Hausse", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <TrendingUp className="h-3 w-3" /> },
  downtrend: { label: "Baisse", cls: "bg-red-500/20 text-red-400 border-red-500/30", icon: <TrendingDown className="h-3 w-3" /> },
  shock: { label: "Shock", cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse", icon: <Zap className="h-3 w-3" /> },
};

const SOURCE_COLORS: Record<string, string> = {
  ebay_sold: "#3b82f6", ebay_active: "#22c55e", leboncoin: "#f97316", vinted: "#06b6d4", default: "#a855f7",
};

type QuickFilter = "all" | "no_ads" | "no_data" | "shock" | "stale" | "has_diag";

// ============= Flag severity config =============
const FLAG_SEVERITY: Record<string, "high" | "medium" | "low"> = {
  RESULTS_NOT_MATCHED: "high", RESULTS_NOT_MATCHED_LDLC: "high", RESULTS_NOT_MATCHED_MATERIEL: "high",
  MAINSTREAM_NOT_FOUND: "high", MATCHING_ERROR: "high", FETCH_FAILED: "high",
  ZERO_MATCHED: "medium", LOW_MATCH_RATE: "medium", SOFT_BLOCK: "medium", SEARCH_TERM_TOO_LONG: "medium",
  NEAR_MISS_LDLC: "medium", NEAR_MISS_MATERIEL: "medium", NEAR_MISS_AMAZON: "medium",
  ZERO_RESULTS: "low", HTTP_503_AMAZON: "low", ZERO_RESULTS_ALL_SOURCES: "low",
};

const FLAG_SEVERITY_STYLES: Record<string, string> = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

function getFlagSeverityClass(flag: string): string {
  const severity = FLAG_SEVERITY[flag] ?? (flag.startsWith("NEAR_MISS") ? "medium" : "low");
  return FLAG_SEVERITY_STYLES[severity] ?? FLAG_SEVERITY_STYLES.low;
}

interface ModelDiagnostic {
  flags: string[];
  category?: string;
  sources?: Record<string, { status?: number; results?: number; near_misses?: number }>;
}

interface DiagnosticsData {
  globalFlags: [string, number][];
  byModel: Map<string, ModelDiagnostic>;
}

const OPTIONAL_COLUMNS = [
  { key: "p25_p75", label: "P25–P75" },
  { key: "trend_30d", label: "Tendance 30j" },
  { key: "outliers", label: "Outliers" },
  { key: "confidence", label: "Confiance" },
  { key: "regime", label: "Régime" },
  { key: "volume_30d", label: "Volume 30j" },
  { key: "variants_count", label: "Variantes" },
  { key: "diagnostic", label: "Diagnostic" },
] as const;

type OptColKey = typeof OPTIONAL_COLUMNS[number]["key"];

const ITEMS_PER_PAGE = 50;

// ============= Detail Sheet =============

function ModelDetailSheet({
  model,
  open,
  onClose,
  diagnostic,
}: {
  model: ObservatoryModel | null;
  open: boolean;
  onClose: () => void;
  diagnostic?: ModelDiagnostic | null;
}) {
  const [priceData, setPriceData] = useState<PriceHistoryResponse | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    if (!model || !open) { setPriceData(null); return; }
    let cancelled = false;
    (async () => {
      setPriceLoading(true);
      try {
        const res = await adminApiGet<PriceHistoryResponse>(`${ADMIN.ANALYTICS_PRICE_HISTORY(model.model_id)}?days=90`);
        if (!cancelled) setPriceData(res);
      } catch { /* silent */ }
      finally { if (!cancelled) setPriceLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [model, open]);

  if (!model) return null;

  const regime = model.regime ? REGIME_BADGE[model.regime] : null;
  const chartData = priceData ? (() => {
    const byDate: Record<string, Record<string, any>> = {};
    for (const pt of priceData.data_points) {
      if (!byDate[pt.date]) byDate[pt.date] = { date: pt.date };
      byDate[pt.date][pt.source] = pt.median_price;
    }
    return Object.values(byDate).sort((a, b) => (a.date > b.date ? 1 : -1));
  })() : [];
  const sources = priceData?.summary?.sources || [];

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))",
  };

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {model.manufacturer} {model.model_name}
            <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[model.category] || "bg-muted"}`}>{model.category}</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* All info rows */}
          <div className="space-y-0">
            <InfoRow label="Annonces actives" value={`${model.ads_active} / ${model.ads_total}`} />
            <Separator />
            <InfoRow label="Prix médian" value={formatEur(model.price_median)} />
            <Separator />
            <InfoRow label="P25 – P75" value={model.price_p25 != null && model.price_p75 != null ? `${Math.round(model.price_p25)} – ${Math.round(model.price_p75)} €` : "—"} />
            <Separator />
            <InfoRow label="Tendance 7j" value={
              model.trend_7d_pct != null ? (
                <span className={model.trend_7d_pct >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {model.trend_7d_pct >= 0 ? "↑" : "↓"}{Math.abs(model.trend_7d_pct).toFixed(1)}%
                </span>
              ) : "—"
            } />
            <Separator />
            <InfoRow label="Tendance 30j" value={
              model.trend_30d_pct != null ? (
                <span className={model.trend_30d_pct >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {model.trend_30d_pct >= 0 ? "↑" : "↓"}{Math.abs(model.trend_30d_pct).toFixed(1)}%
                </span>
              ) : "—"
            } />
            <Separator />
            <InfoRow label="Volume 30j" value={model.volume_30d ?? "—"} />
            <Separator />
            <InfoRow label="Outliers" value={model.ads_outlier_count} />
            <Separator />
            <InfoRow label="Confiance" value={model.avg_model_confidence != null ? `${(model.avg_model_confidence * 100).toFixed(0)}%` : "—"} />
            <Separator />
            <InfoRow label="Régime" value={regime ? <Badge variant="outline" className={`text-[10px] gap-1 ${regime.cls}`}>{regime.icon}{regime.label}</Badge> : "—"} />
            <Separator />
            <InfoRow label="Prix neuf" value={
              model.new_price_eur != null ? (
                <span>{formatEur(model.new_price_eur)} <span className="text-xs text-muted-foreground">{model.new_price_source || ""}</span></span>
              ) : "—"
            } />
            <Separator />
            <InfoRow label="Qualité données" value={model.data_quality_score != null ? `${model.data_quality_score}%` : "—"} />
            <Separator />
            <InfoRow label="Dernière activité" value={timeAgo(model.last_ad_seen_at)} />
            <Separator />
            <InfoRow label="Dernier scan" value={timeAgo(model.last_job_at)} />
            <Separator />
            <InfoRow label="Variantes" value={`${model.variants_count} (${model.variants_with_data} actives)`} />
          </div>

          {/* Diagnostic flags */}
          {diagnostic && diagnostic.flags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-muted-foreground" /> Diagnostic scraper
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {diagnostic.flags.map((f) => (
                  <Badge key={f} variant="outline" className={`text-[10px] ${getFlagSeverityClass(f)}`}>{f}</Badge>
                ))}
              </div>
              {diagnostic.category && (
                <p className="text-xs text-muted-foreground">
                  Catégorie : <span className="font-medium text-foreground">
                    {diagnostic.category === "not_found_unknown" ? "À investiguer" : diagnostic.category === "not_found_brand" ? "Marque niche" : diagnostic.category === "not_found_discontinued" ? "Discontinué" : diagnostic.category}
                  </span>
                </p>
              )}
              {diagnostic.sources && Object.keys(diagnostic.sources).length > 0 && (
                <div className="text-[11px] text-muted-foreground space-y-0.5">
                  {Object.entries(diagnostic.sources).map(([src, info]) => (
                    <p key={src}>
                      <span className="font-medium text-foreground">{src}</span>: status {info.status ?? "?"}{info.results != null && <>, {info.results} résultats → {info.near_misses ?? 0} proches</>}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price chart */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Historique des prix (90j)</h4>
            {priceLoading ? <Skeleton className="h-[200px] w-full" /> : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}€`} />
                  <RTooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${Math.round(value)} €`, name]} />
                  <Legend />
                  {sources.map((src) => (
                    <Area key={src} type="monotone" dataKey={src} stroke={SOURCE_COLORS[src] || SOURCE_COLORS.default} fill={SOURCE_COLORS[src] || SOURCE_COLORS.default} fillOpacity={0.15} strokeWidth={2} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Pas de données d'historique</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============= Main Component =============

export default function AdminObservatory() {
  const [data, setData] = useState<ObservatoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("ads_active");
  const [quickFilters, setQuickFilters] = useState<Set<QuickFilter>>(new Set(["all"]));
  const [showAllVariants, setShowAllVariants] = useState(false);

  // Column visibility
  const [visibleOptCols, setVisibleOptCols] = useState<Set<OptColKey>>(new Set());

  // Pagination
  const [page, setPage] = useState(1);

  // Expansion
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Detail sheet
  const [detailModel, setDetailModel] = useState<ObservatoryModel | null>(null);

  // Mission modal
  const [missionModal, setMissionModal] = useState<ObservatoryModel | null>(null);
  const [missionPlatform, setMissionPlatform] = useState("leboncoin");
  const [missionPages, setMissionPages] = useState(3);
  const [missionKeyword, setMissionKeyword] = useState("");
  const [missionLoading, setMissionLoading] = useState(false);

  // Diagnostics
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);

  const { toast } = useToast();

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [debouncedSearch, category, sortBy, quickFilters]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiFetch<ObservatoryResponse>(`${ADMIN.OBSERVATORY}?limit=2000&sort_by=${sortBy}&sort_order=desc`);
      setData(res);
      setLastRefresh(Date.now());
    } catch (e: any) {
      setError(e.message || "Erreur API");
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Fetch diagnostics from scraper reports
  useEffect(() => {
    (async () => {
      try {
        const scrapers = await adminApiGet<{ scrapers: { name: string; status: string }[] }>(ADMIN.SCRAPERS_LIST);
        const completedScrapers = scrapers.scrapers?.filter((s) => s.status === "completed" || s.status === "error") ?? [];
        const globalFlagMap: Record<string, number> = {};
        const modelMap = new Map<string, ModelDiagnostic>();

        await Promise.all(completedScrapers.map(async (s) => {
          try {
            const report = await adminApiGet<{
              report: {
                flag_summary?: Record<string, number>;
                diagnostic_summary?: { flag_summary: Record<string, number> };
                not_found_details?: { name: string; category?: string; flags: string[]; sources?: Record<string, { status?: number; results?: number; near_misses?: number }> }[];
              };
            }>(ADMIN.SCRAPER_REPORT(s.name));
            const fs = report.report?.flag_summary ?? report.report?.diagnostic_summary?.flag_summary;
            if (fs) {
              for (const [flag, count] of Object.entries(fs)) {
                globalFlagMap[flag] = (globalFlagMap[flag] ?? 0) + count;
              }
            }
            for (const d of report.report?.not_found_details ?? []) {
              const key = d.name.toLowerCase();
              if (!modelMap.has(key)) {
                modelMap.set(key, { flags: d.flags, category: d.category, sources: d.sources });
              } else {
                const existing = modelMap.get(key)!;
                const mergedFlags = [...new Set([...existing.flags, ...d.flags])];
                modelMap.set(key, { ...existing, flags: mergedFlags, category: d.category ?? existing.category, sources: { ...existing.sources, ...d.sources } });
              }
            }
          } catch { /* silent */ }
        }));

        const globalFlags = Object.entries(globalFlagMap).sort((a, b) => b[1] - a[1]);
        setDiagnostics({ globalFlags, byModel: modelMap });
      } catch { /* silent */ }
    })();
  }, [lastRefresh]);

  // Quick filter toggle
  const toggleQuickFilter = (f: QuickFilter) => {
    setQuickFilters((prev) => {
      const next = new Set(prev);
      if (f === "all") return new Set(["all"]);
      next.delete("all");
      if (next.has(f)) next.delete(f);
      else next.add(f);
      if (next.size === 0) return new Set(["all"]);
      return next;
    });
  };

  // Filter & sort
  const filteredModels = useMemo(() => {
    if (!data) return [];
    let models = [...data.models];

    // Category
    if (category !== "all") models = models.filter((m) => m.category === category);

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      models = models.filter((m) =>
        `${m.manufacturer} ${m.model_name}`.toLowerCase().includes(q)
      );
    }

    // Quick filters
    if (!quickFilters.has("all")) {
      models = models.filter((m) => {
        if (quickFilters.has("no_ads") && m.ads_active === 0) return true;
        if (quickFilters.has("no_data") && (m.price_median == null || m.data_quality_score == null)) return true;
        if (quickFilters.has("shock") && m.regime === "shock") return true;
        if (quickFilters.has("stale") && isStale(m.last_ad_seen_at)) return true;
        if (quickFilters.has("has_diag") && diagnostics) {
          const diag = diagnostics.byModel.get(m.model_name.toLowerCase());
          if (diag && diag.flags.length > 0) return true;
        }
        return false;
      });
    }

    // Sort (client-side re-sort for additional sort options)
    const sortFns: Record<string, (a: ObservatoryModel, b: ObservatoryModel) => number> = {
      ads_active: (a, b) => (b.ads_active ?? 0) - (a.ads_active ?? 0),
      price_median: (a, b) => (b.price_median ?? 0) - (a.price_median ?? 0),
      trend_7d_pct: (a, b) => Math.abs(b.trend_7d_pct ?? 0) - Math.abs(a.trend_7d_pct ?? 0),
      data_quality_score: (a, b) => (b.data_quality_score ?? 0) - (a.data_quality_score ?? 0),
      name: (a, b) => `${a.manufacturer} ${a.model_name}`.localeCompare(`${b.manufacturer} ${b.model_name}`),
      observations: (a, b) => (b.ads_total ?? 0) - (a.ads_total ?? 0),
      last_scan: (a, b) => new Date(b.last_ad_seen_at || 0).getTime() - new Date(a.last_ad_seen_at || 0).getTime(),
    };
    if (sortFns[sortBy]) models.sort(sortFns[sortBy]);

    return models;
  }, [data, category, debouncedSearch, quickFilters, sortBy, diagnostics]);

  // Dynamic KPIs
  const dynamicSummary = useMemo(() => {
    const models = filteredModels;
    const total = models.length;
    const withMarket = models.filter((m) => m.price_median != null).length;
    const noAds = models.filter((m) => m.ads_active === 0).length;
    const totalAds = models.reduce((s, m) => s + m.ads_active, 0);
    const shock = models.filter((m) => m.regime === "shock").length;
    const qualityArr = models.filter((m) => m.data_quality_score != null);
    const avgQuality = qualityArr.length > 0 ? Math.round(qualityArr.reduce((s, m) => s + (m.data_quality_score ?? 0), 0) / qualityArr.length) : 0;
    return { total, withMarket, noAds, totalAds, shock, avgQuality };
  }, [filteredModels]);

  // Pagination
  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  const paginatedModels = filteredModels.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Max ads for bar
  const maxAds = useMemo(() => Math.max(...filteredModels.map((m) => m.ads_active), 1), [filteredModels]);

  // Toggle expansion
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Show all variants effect
  useEffect(() => {
    if (showAllVariants) {
      const ids = new Set(paginatedModels.filter((m) => m.variants_count > 0).map((m) => m.model_id));
      setExpandedIds(ids);
    } else {
      setExpandedIds(new Set());
    }
  }, [showAllVariants, page]);

  // Col toggle
  const toggleCol = (key: OptColKey) => {
    setVisibleOptCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Mission
  const openMission = (m: ObservatoryModel) => {
    setMissionModal(m);
    setMissionKeyword(`${m.manufacturer || ""} ${m.model_name}`.trim());
    setMissionPlatform("leboncoin");
    setMissionPages(3);
  };

  const launchMission = async () => {
    if (!missionModal) return;
    setMissionLoading(true);
    try {
      const res = await adminApiFetch<{ job_id: number }>(ADMIN.OBSERVATORY_MISSION, {
        method: "POST",
        body: JSON.stringify({ model_id: missionModal.model_id, platform: missionPlatform, keyword: missionKeyword, pages_target: missionPages }),
      });
      toast({ title: "Mission lancée", description: `Job #${res.job_id} créé` });
      setMissionModal(null);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setMissionLoading(false);
    }
  };

  // Export CSV with current filters
  const handleExport = () => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    // For filtered export we pass IDs
    const url = params.toString() ? `${ADMIN.OBSERVATORY_EXPORT}?${params}` : ADMIN.OBSERVATORY_EXPORT;
    adminApiDownload(url, "observatory.csv");
  };

  // Helper to get diagnostic for a model
  const getModelDiag = useCallback((m: ObservatoryModel): ModelDiagnostic | null => {
    if (!diagnostics) return null;
    const key = m.model_name.toLowerCase();
    return diagnostics.byModel.get(key) ?? null;
  }, [diagnostics]);

  const colCount = 7
    + (visibleOptCols.has("p25_p75") ? 1 : 0)
    + (visibleOptCols.has("trend_30d") ? 1 : 0)
    + (visibleOptCols.has("outliers") ? 1 : 0)
    + (visibleOptCols.has("confidence") ? 1 : 0)
    + (visibleOptCols.has("regime") ? 1 : 0)
    + (visibleOptCols.has("volume_30d") ? 1 : 0)
    + (visibleOptCols.has("variants_count") ? 1 : 0)
    + (visibleOptCols.has("diagnostic") ? 1 : 0)
    + 1; // actions

  // ============= Render =============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Observatoire des composants</h2>
          <p className="text-sm text-muted-foreground">Vue temps réel de la couverture et qualité des données · MAJ {timeAgo(new Date(lastRefresh).toISOString())}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Rafraîchir
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error} <Button variant="link" size="sm" onClick={fetchData}>Réessayer</Button></AlertDescription>
        </Alert>
      )}

      {/* KPIs */}
      {loading && !data ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Modèles</p><p className="text-2xl font-bold">{dynamicSummary.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Avec données marché</p><p className="text-2xl font-bold">{dynamicSummary.withMarket}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Sans annonces</p><p className="text-2xl font-bold flex items-center gap-2">{dynamicSummary.noAds}{dynamicSummary.noAds > dynamicSummary.total * 0.1 && <Badge variant="destructive" className="text-[10px]">⚠</Badge>}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Annonces actives</p><p className="text-2xl font-bold">{dynamicSummary.totalAds.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Régimes SHOCK</p><p className="text-2xl font-bold flex items-center gap-2">{dynamicSummary.shock}{dynamicSummary.shock > 0 && <Badge variant="destructive" className="text-[10px]">!</Badge>}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Qualité moyenne</p><Progress value={dynamicSummary.avgQuality} className="mt-2 h-2" /><p className="text-sm font-bold mt-1">{dynamicSummary.avgQuality}%</p></CardContent></Card>
        </div>
      )}

      {/* Global Diagnostics Summary */}
      {diagnostics && diagnostics.globalFlags.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Diagnostic scrapers
              <span className="text-xs font-normal text-muted-foreground ml-1">
                ({diagnostics.globalFlags.reduce((s, [, c]) => s + c, 0)} flags · {diagnostics.byModel.size} modèles avec problèmes)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {diagnostics.globalFlags.map(([flag, count]) => (
                <Badge key={flag} variant="outline" className={`text-[11px] gap-1 ${getFlagSeverityClass(flag)}`}>
                  {flag} <span className="font-bold">{count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-3 flex-wrap items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un modèle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery("")}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Category */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="GPU">GPU</SelectItem>
                <SelectItem value="CPU">CPU</SelectItem>
                <SelectItem value="RAM">RAM</SelectItem>
                <SelectItem value="SSD">SSD</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Trier par" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ads_active">Annonces actives</SelectItem>
                <SelectItem value="price_median">Prix médian</SelectItem>
                <SelectItem value="trend_7d_pct">Tendance 7j</SelectItem>
                <SelectItem value="data_quality_score">Qualité données</SelectItem>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="observations">Nombre d'observations</SelectItem>
                <SelectItem value="last_scan">Date dernier scan</SelectItem>
              </SelectContent>
            </Select>

            {/* Column toggle */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-1" /> Colonnes
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">Colonnes optionnelles</p>
                {OPTIONAL_COLUMNS.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 py-1 cursor-pointer text-sm">
                    <Checkbox checked={visibleOptCols.has(col.key)} onCheckedChange={() => toggleCol(col.key)} />
                    {col.label}
                  </label>
                ))}
              </PopoverContent>
            </Popover>

            {/* Variants toggle */}
            <div className="flex items-center gap-2">
              <Switch checked={showAllVariants} onCheckedChange={setShowAllVariants} id="variants-toggle" />
              <Label htmlFor="variants-toggle" className="text-xs cursor-pointer">Variantes</Label>
            </div>
          </div>

          {/* Quick filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-muted-foreground mr-1">Filtres rapides :</span>
            {([
              { key: "all" as QuickFilter, label: "Tous" },
              { key: "no_ads" as QuickFilter, label: "Sans annonces" },
              { key: "no_data" as QuickFilter, label: "Sans données" },
              { key: "shock" as QuickFilter, label: "En shock" },
              { key: "stale" as QuickFilter, label: "Données périmées" },
              { key: "has_diag" as QuickFilter, label: "Avec diagnostic", icon: <Activity className="h-3 w-3 mr-1" /> },
            ] as { key: QuickFilter; label: string; icon?: React.ReactNode }[]).map((f) => (
              <Button
                key={f.key}
                size="sm"
                variant={quickFilters.has(f.key) ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => toggleQuickFilter(f.key)}
              >
                {f.icon}{f.label}
              </Button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredModels.length}</span> modèles affichés
            {data && ` sur ${data.models.length}`}
          </p>
        </CardContent>
      </Card>

      {/* Table */}
      {loading && !data ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : filteredModels.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Aucun composant trouvé</CardContent></Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Modèle</TableHead>
                  <TableHead className="text-right">Annonces</TableHead>
                  <TableHead className="text-right">Prix médian</TableHead>
                  <TableHead className="text-right">Tendance 7j</TableHead>
                  <TableHead className="w-[100px]">Qualité</TableHead>
                  <TableHead className="text-right">Prix neuf</TableHead>
                  {visibleOptCols.has("p25_p75") && <TableHead className="text-right">P25–P75</TableHead>}
                  {visibleOptCols.has("trend_30d") && <TableHead className="text-right">30j</TableHead>}
                  {visibleOptCols.has("outliers") && <TableHead className="text-right">Outliers</TableHead>}
                  {visibleOptCols.has("confidence") && <TableHead>Confiance</TableHead>}
                  {visibleOptCols.has("regime") && <TableHead>Régime</TableHead>}
                  {visibleOptCols.has("volume_30d") && <TableHead className="text-right">Vol. 30j</TableHead>}
                  {visibleOptCols.has("variants_count") && <TableHead className="text-right">Var.</TableHead>}
                  {visibleOptCols.has("diagnostic") && <TableHead>Diagnostic</TableHead>}
                  <TableHead>Activité</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedModels.map((m) => {
                  const catCls = CATEGORY_COLORS[m.category] || "bg-muted text-muted-foreground";
                  const regime = m.regime ? REGIME_BADGE[m.regime] : null;
                  const rowCls = m.ads_active === 0
                    ? "bg-red-500/5"
                    : m.regime === "shock"
                      ? "bg-yellow-500/5"
                      : isStale(m.last_ad_seen_at)
                        ? "opacity-60"
                        : "";
                  const isExpanded = expandedIds.has(m.model_id);

                  return (
                    <React.Fragment key={m.model_id}>
                      <TableRow className={rowCls}>
                        {/* Expand */}
                        <TableCell className="w-8 px-2">
                          {m.variants_count > 0 ? (
                            <button onClick={() => toggleExpand(m.model_id)} className="p-1 hover:bg-accent rounded">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          ) : <span className="w-6 inline-block" />}
                        </TableCell>

                        {/* Model name */}
                        <TableCell>
                          <button
                            className="text-left hover:text-primary transition-colors"
                            onClick={() => setDetailModel(m)}
                          >
                            <span className="font-medium">{m.manufacturer} {m.model_name}</span>
                          </button>
                          <Badge variant="outline" className={`text-[9px] ml-2 ${catCls}`}>{m.category}</Badge>
                        </TableCell>

                        {/* Ads */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min((m.ads_active / maxAds) * 100, 100)}%` }} />
                            </div>
                            <span className={`text-sm tabular-nums ${m.ads_active === 0 ? "text-red-400 font-bold" : ""}`}>
                              {m.ads_active}
                            </span>
                          </div>
                        </TableCell>

                        {/* Price median */}
                        <TableCell className="text-right text-sm">{m.price_median != null ? `${m.price_median.toFixed(0)}€` : "—"}</TableCell>

                        {/* Trend 7d */}
                        <TableCell className="text-right">
                          {m.trend_7d_pct != null ? (
                            <span className={`text-sm font-medium ${m.trend_7d_pct > 0 ? "text-emerald-400" : m.trend_7d_pct < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                              {m.trend_7d_pct > 0 ? "↑" : m.trend_7d_pct < 0 ? "↓" : "—"}{m.trend_7d_pct !== 0 ? `${Math.abs(m.trend_7d_pct).toFixed(1)}%` : ""}
                            </span>
                          ) : <span className="text-muted-foreground">—</span>}
                        </TableCell>

                        {/* Quality */}
                        <TableCell>
                          {m.data_quality_score != null ? (
                            <div className="flex items-center gap-2">
                              <Progress value={m.data_quality_score} className="h-1.5 flex-1" />
                              <span className="text-xs tabular-nums text-muted-foreground">{m.data_quality_score}%</span>
                            </div>
                          ) : <span className="text-muted-foreground text-sm">—</span>}
                        </TableCell>

                        {/* New price */}
                        <TableCell className="text-right text-sm">
                          {m.new_price_eur != null ? (
                            m.new_price_source ? (
                              <Tooltip>
                                <TooltipTrigger asChild><span className="cursor-help">{formatEur(m.new_price_eur)}</span></TooltipTrigger>
                                <TooltipContent>{m.new_price_source}</TooltipContent>
                              </Tooltip>
                            ) : formatEur(m.new_price_eur)
                          ) : "—"}
                        </TableCell>

                        {/* Optional columns */}
                        {visibleOptCols.has("p25_p75") && (
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {m.price_p25 != null && m.price_p75 != null ? `${Math.round(m.price_p25)}–${Math.round(m.price_p75)}€` : "—"}
                          </TableCell>
                        )}
                        {visibleOptCols.has("trend_30d") && (
                          <TableCell className="text-right">
                            {m.trend_30d_pct != null ? (
                              <span className={m.trend_30d_pct >= 0 ? "text-emerald-400" : "text-red-400"}>
                                {m.trend_30d_pct >= 0 ? "↑" : "↓"}{Math.abs(m.trend_30d_pct).toFixed(1)}%
                              </span>
                            ) : "—"}
                          </TableCell>
                        )}
                        {visibleOptCols.has("outliers") && (
                          <TableCell className="text-right">
                            {m.ads_outlier_count > 0 ? <Badge variant="destructive" className="text-[10px]">{m.ads_outlier_count}</Badge> : "—"}
                          </TableCell>
                        )}
                        {visibleOptCols.has("confidence") && (
                          <TableCell>
                            {m.avg_model_confidence != null ? (
                              <Progress value={m.avg_model_confidence * 100} className="h-1.5 w-16" />
                            ) : "—"}
                          </TableCell>
                        )}
                        {visibleOptCols.has("regime") && (
                          <TableCell>
                            {regime ? <Badge variant="outline" className={`text-[10px] gap-1 ${regime.cls}`}>{regime.icon}{regime.label}</Badge> : "—"}
                          </TableCell>
                        )}
                        {visibleOptCols.has("volume_30d") && (
                          <TableCell className="text-right text-sm">{m.volume_30d ?? "—"}</TableCell>
                        )}
                        {visibleOptCols.has("variants_count") && (
                          <TableCell className="text-right text-sm">
                            {m.variants_count > 0 ? `${m.variants_count} (${m.variants_with_data})` : "—"}
                          </TableCell>
                        )}
                        {visibleOptCols.has("diagnostic") && (
                          <TableCell>
                            {(() => {
                              const diag = getModelDiag(m);
                              if (!diag || diag.flags.length === 0) return <span className="text-muted-foreground text-sm">—</span>;
                              const topFlag = diag.flags[0];
                              const severity = FLAG_SEVERITY[topFlag] ?? "low";
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" className={`text-[10px] ${getFlagSeverityClass(topFlag)}`}>{topFlag}</Badge>
                                      {diag.flags.length > 1 && <span className="text-[10px] text-muted-foreground">+{diag.flags.length - 1}</span>}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <div className="flex flex-wrap gap-1">
                                      {diag.flags.map((f) => (
                                        <Badge key={f} variant="outline" className={`text-[10px] ${getFlagSeverityClass(f)}`}>{f}</Badge>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })()}
                          </TableCell>
                        )}

                        {/* Activity */}
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(m.last_ad_seen_at)}</TableCell>

                        {/* Actions */}
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openMission(m)} title="Scanner">
                            <Search className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Variants sub-rows */}
                      {isExpanded && (
                        <VariantsPanel modelId={m.model_id} modelName={`${m.manufacturer} ${m.model_name}`} colSpan={colCount + 1} diagnosticsByName={diagnostics?.byModel} />
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} / {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Précédent</Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) p = i + 1;
              else if (page <= 4) p = i + 1;
              else if (page >= totalPages - 3) p = totalPages - 6 + i;
              else p = page - 3 + i;
              return (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="w-8" onClick={() => setPage(p)}>
                  {p}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Suivant →</Button>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      <ModelDetailSheet model={detailModel} open={!!detailModel} onClose={() => setDetailModel(null)} diagnostic={detailModel ? getModelDiag(detailModel) : null} />

      {/* Mission Modal */}
      <Dialog open={!!missionModal} onOpenChange={() => setMissionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lancer un scan — {missionModal?.manufacturer} {missionModal?.model_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Plateforme</Label>
              <Select value={missionPlatform} onValueChange={setMissionPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="leboncoin">Leboncoin</SelectItem>
                  <SelectItem value="ebay">eBay</SelectItem>
                  <SelectItem value="vinted">Vinted</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Keyword</Label>
              <Input value={missionKeyword} onChange={(e) => setMissionKeyword(e.target.value)} />
            </div>
            <div>
              <Label>Pages à scanner</Label>
              <Input type="number" value={missionPages} onChange={(e) => setMissionPages(Number(e.target.value))} min={1} max={20} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMissionModal(null)}>Annuler</Button>
            <Button onClick={launchMission} disabled={missionLoading}>
              {missionLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Lancer la mission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
