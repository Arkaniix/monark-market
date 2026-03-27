import { useState, useEffect, useCallback } from "react";
import { Eye, TrendingDown, ArrowUpDown, Plus, Clock, Loader2, AlertTriangle, ArrowUp, ArrowDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { adminApiGet } from "@/lib/api/adminApi";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// ── Types ────────────────────────────────────────────────────────────
interface MonitoringOverview {
  listing_monitor: {
    total: number;
    by_source: Record<string, number>;
    by_status: Record<string, number>;
    last_health_check: string | null;
    last_incremental: string | null;
  };
  liquidity_top5: {
    model_id: number;
    model_name: string;
    median_days: number;
    active: number;
    sell_rate_7d: number;
  }[];
  price_changes_24h: number;
  new_listings_24h: number;
  disappeared_24h: number;
}

interface ModelMonitoring {
  model_id: number;
  model_name: string;
  liquidity: {
    median_days_to_sell: number;
    sell_rate_7d: number;
    sell_rate_30d: number;
    active_count: number;
    stock_trend: string;
    price_drop_rate: number;
    republish_rate: number;
  };
  by_source: Record<string, { active: number; median_days: number }>;
  recent_activity: {
    new_24h: number;
    disappeared_24h: number;
    price_changes_24h: number;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────
const fmt = (v: number | null | undefined, decimals = 1) => (v ?? 0).toFixed(decimals);

const STATUS_COLORS: Record<string, string> = {
  active: "hsl(142, 71%, 45%)",
  disappeared: "hsl(0, 72%, 51%)",
  price_changed: "hsl(38, 92%, 50%)",
  republished: "hsl(270, 60%, 55%)",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actives",
  disappeared: "Disparues",
  price_changed: "Prix modifié",
  republished: "Republications",
};

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });
  } catch {
    return "—";
  }
}

function medianBadge(days: number | null | undefined) {
  const d = days ?? 0;
  if (d < 3) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{fmt(d)}j</Badge>;
  if (d < 7) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{fmt(d)}j</Badge>;
  return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{fmt(d)}j</Badge>;
}

function trendIcon(trend: string | null | undefined) {
  switch (trend) {
    case "increasing": return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1"><ArrowUp className="h-3 w-3" />Stock en hausse</Badge>;
    case "decreasing": return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1"><ArrowDown className="h-3 w-3" />Stock en baisse</Badge>;
    default: return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1"><Minus className="h-3 w-3" />Stable</Badge>;
  }
}

// ── Component ────────────────────────────────────────────────────────
export default function MonitoringSection() {
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(true);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [modelDetail, setModelDetail] = useState<ModelMonitoring | null>(null);
  const [modelLoading, setModelLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const data = await adminApiGet<MonitoringOverview>("/v1/admin/monitoring/overview");
      setOverview(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 60_000);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  const openModel = async (modelId: number) => {
    setSelectedModelId(modelId);
    setModelLoading(true);
    setModelDetail(null);
    try {
      const data = await adminApiGet<ModelMonitoring>(`/v1/admin/monitoring/model/${modelId}`);
      setModelDetail(data);
    } catch {
      setModelDetail(null);
    } finally {
      setModelLoading(false);
    }
  };

  // Empty / error state
  const isEmpty = loaded && (error || !overview || overview.listing_monitor.total === 0);

  if (!loaded) return null; // Don't show anything until first fetch

  const lm = overview?.listing_monitor;

  // Status bar data
  const statusEntries = lm ? Object.entries(lm.by_status).filter(([, v]) => v > 0) : [];
  const statusTotal = statusEntries.reduce((sum, [, v]) => sum + v, 0);

  const kpis = lm ? [
    { label: "Surveillées", value: lm.total, sub: `${lm.by_source.leboncoin ?? 0} LBC · ${lm.by_source.vinted ?? 0} Vinted`, icon: Eye, color: "text-blue-400" },
    { label: "Disparitions 24h", value: overview!.disappeared_24h, icon: TrendingDown, color: "text-red-400" },
    { label: "Prix modifiés 24h", value: overview!.price_changes_24h, icon: ArrowUpDown, color: "text-orange-400" },
    { label: "Nouvelles 24h", value: overview!.new_listings_24h, icon: Plus, color: "text-green-400" },
  ] : [];

  return (
    <>
      <Separator />
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Monitoring des annonces</h3>
            <p className="text-xs text-muted-foreground">Health check, prix, liquidité — mis à jour automatiquement</p>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-4 mt-4">
          {isEmpty ? (
            <div className="rounded-lg border bg-muted/30 p-6 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aucune donnée de monitoring. Les scrapers monitor-lbc et monitor-vinted doivent effectuer leur premier run.
              </p>
            </div>
          ) : (
            <>
              {/* KPIs + timestamps row */}
              <div className="flex flex-wrap items-start gap-3">
                {kpis.map(kpi => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.label} className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 min-w-[150px]">
                      <Icon className={`h-4 w-4 shrink-0 ${kpi.color}`} />
                      <div>
                        <p className="text-lg font-bold leading-none">{kpi.value.toLocaleString("fr-FR")}</p>
                        <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                        {kpi.sub && <p className="text-[9px] text-muted-foreground">{kpi.sub}</p>}
                      </div>
                    </div>
                  );
                })}
                {/* Timestamp pills */}
                <div className="ml-auto flex flex-col gap-1 text-[10px]">
                  <Badge variant="outline" className="gap-1 font-normal">
                    <Clock className="h-3 w-3" /> Health check : {relativeTime(lm!.last_health_check)}
                  </Badge>
                  <Badge variant="outline" className="gap-1 font-normal">
                    <Clock className="h-3 w-3" /> Scraping : {relativeTime(lm!.last_incremental)}
                  </Badge>
                </div>
              </div>

              {/* Status stacked bar */}
              {statusTotal > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">Répartition par statut</p>
                  <div className="flex h-5 rounded-full overflow-hidden border">
                    {statusEntries.map(([key, val]) => {
                      const pct = (val / statusTotal) * 100;
                      return (
                        <div
                          key={key}
                          className="relative group"
                          style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[key] || "hsl(var(--muted))" }}
                          title={`${STATUS_LABELS[key] || key}: ${val} (${pct.toFixed(1)}%)`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                    {statusEntries.map(([key, val]) => (
                      <span key={key} className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[key] }} />
                        {STATUS_LABELS[key] || key} {val} ({((val / statusTotal) * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top 5 Liquidité */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Top 5 — Liquidité</CardTitle>
                </CardHeader>
                <CardContent>
                  {(overview!.liquidity_top5?.length ?? 0) === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Pas encore de données — le calcul s'effectue après le premier cycle complet de monitoring
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Modèle</TableHead>
                          <TableHead className="text-xs">Temps médian</TableHead>
                          <TableHead className="text-xs">Actives</TableHead>
                          <TableHead className="text-xs">Taux de vente 7j</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {overview!.liquidity_top5.map(m => (
                          <TableRow key={m.model_id} className="cursor-pointer hover:bg-muted/50" onClick={() => openModel(m.model_id)}>
                            <TableCell className="font-medium text-xs">{m.model_name}</TableCell>
                            <TableCell>{medianBadge(m.median_days)}</TableCell>
                            <TableCell className="text-xs">{m.active}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={Math.min(m.sell_rate_7d ?? 0, 100)} className="h-1.5 w-16" />
                                <span className="text-[11px] text-muted-foreground">{fmt(m.sell_rate_7d)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Model detail drawer */}
      <Sheet open={selectedModelId !== null} onOpenChange={(o) => { if (!o) setSelectedModelId(null); }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {modelLoading ? (
            <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !modelDetail ? (
            <div className="text-center py-8 text-muted-foreground">Données indisponibles</div>
          ) : (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl">{modelDetail.model_name}</SheetTitle>
                <div className="mt-2">{trendIcon(modelDetail.liquidity.stock_trend)}</div>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Temps médian de vente", value: `${fmt(modelDetail.liquidity.median_days_to_sell)} jours` },
                  { label: "Taux de vente 7j", value: `${fmt(modelDetail.liquidity.sell_rate_7d)}%` },
                  { label: "Taux de vente 30j", value: `${fmt(modelDetail.liquidity.sell_rate_30d)}%` },
                  { label: "Annonces actives", value: String(modelDetail.liquidity.active_count ?? 0) },
                  { label: "Baisses de prix", value: `${fmt(modelDetail.liquidity.price_drop_rate)}%` },
                  { label: "Republications", value: `${fmt(modelDetail.liquidity.republish_rate)}%` },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{m.label}</p>
                    <p className="text-lg font-semibold">{m.value}</p>
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-semibold mb-3">Par source</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(modelDetail.by_source).map(([source, data]) => (
                  <div key={source} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs font-medium mb-2 capitalize">{source}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Actives : <span className="text-foreground font-medium">{data.active}</span></p>
                      <p>Temps médian : <span className="text-foreground font-medium">{fmt(data.median_days)}j</span></p>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-semibold mb-3">Activité 24h</h4>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{modelDetail.recent_activity.new_24h} nouvelles</Badge>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{modelDetail.recent_activity.disappeared_24h} disparues</Badge>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">{modelDetail.recent_activity.price_changes_24h} prix modifiés</Badge>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
