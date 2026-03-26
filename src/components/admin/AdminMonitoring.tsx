import { useState, useEffect, useCallback } from "react";
import { Eye, TrendingDown, ArrowUpDown, Plus, Clock, Loader2, AlertTriangle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
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

function medianBadge(days: number) {
  if (days < 3) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{days.toFixed(1)}j</Badge>;
  if (days < 7) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{days.toFixed(1)}j</Badge>;
  return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{days.toFixed(1)}j</Badge>;
}

function trendIcon(trend: string) {
  switch (trend) {
    case "increasing": return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1"><ArrowUp className="h-3 w-3" />Stock en hausse</Badge>;
    case "decreasing": return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1"><ArrowDown className="h-3 w-3" />Stock en baisse</Badge>;
    default: return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1"><Minus className="h-3 w-3" />Stable</Badge>;
  }
}

// ── Component ────────────────────────────────────────────────────────
export default function AdminMonitoring() {
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [modelDetail, setModelDetail] = useState<ModelMonitoring | null>(null);
  const [modelLoading, setModelLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const data = await adminApiGet<MonitoringOverview>("/v1/admin/monitoring/overview");
      setOverview(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
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

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-8 w-24 mb-2" /><Skeleton className="h-4 w-32" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !overview) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune donnée de monitoring. Lancez un premier scan depuis la page Cron.</p>
        </CardContent>
      </Card>
    );
  }

  const lm = overview.listing_monitor;
  const statusData = Object.entries(lm.by_status).map(([key, value]) => ({
    name: STATUS_LABELS[key] || key,
    value,
    fill: STATUS_COLORS[key] || "hsl(var(--muted))",
  }));

  const kpis = [
    { label: "Annonces surveillées", value: lm.total, sub: `${lm.by_source.leboncoin ?? 0} LBC · ${lm.by_source.vinted ?? 0} Vinted`, icon: Eye, color: "text-blue-400" },
    { label: "Disparitions 24h", value: overview.disappeared_24h, sub: "Indicateur de ventes potentielles", icon: TrendingDown, color: "text-red-400" },
    { label: "Changements de prix 24h", value: overview.price_changes_24h, sub: "Baisses / hausses détectées", icon: ArrowUpDown, color: "text-orange-400" },
    { label: "Nouvelles annonces 24h", value: overview.new_listings_24h, sub: "Ajoutées au monitoring", icon: Plus, color: "text-green-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Section 1 – KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{kpi.label}</span>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <p className="text-3xl font-bold">{kpi.value.toLocaleString("fr-FR")}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 2 – Répartition statuts */}
        <Card>
          <CardHeader><CardTitle className="text-base">Répartition par statut</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={2} strokeWidth={0}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 – Dernières activités */}
        <Card>
          <CardHeader><CardTitle className="text-base">Activité système</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Dernier health check</p>
                <p className="text-xs text-muted-foreground">{relativeTime(lm.last_health_check)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Dernier scraping incrémental</p>
                <p className="text-xs text-muted-foreground">{relativeTime(lm.last_incremental)}</p>
              </div>
            </div>
            <div className="pt-2 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-lg font-bold text-green-400">{overview.new_listings_24h}</p>
                <p className="text-[10px] text-muted-foreground">Nouvelles</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-lg font-bold text-red-400">{overview.disappeared_24h}</p>
                <p className="text-[10px] text-muted-foreground">Disparues</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-lg font-bold text-orange-400">{overview.price_changes_24h}</p>
                <p className="text-[10px] text-muted-foreground">Prix modifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3 – Top Liquidité */}
      <Card>
        <CardHeader><CardTitle className="text-base">Top 5 — Liquidité</CardTitle></CardHeader>
        <CardContent>
          {overview.liquidity_top5.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Pas encore de données de liquidité</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modèle</TableHead>
                  <TableHead>Temps médian</TableHead>
                  <TableHead>Actives</TableHead>
                  <TableHead>Taux de vente 7j</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.liquidity_top5.map(m => (
                  <TableRow key={m.model_id} className="cursor-pointer hover:bg-muted/50" onClick={() => openModel(m.model_id)}>
                    <TableCell className="font-medium">{m.model_name}</TableCell>
                    <TableCell>{medianBadge(m.median_days)}</TableCell>
                    <TableCell>{m.active}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(m.sell_rate_7d, 100)} className="h-2 w-20" />
                        <span className="text-xs text-muted-foreground">{m.sell_rate_7d.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Drawer détail modèle */}
      <Sheet open={selectedModelId !== null} onOpenChange={(open) => { if (!open) setSelectedModelId(null); }}>
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

              {/* Métriques principales */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Temps médian de vente", value: `${modelDetail.liquidity.median_days_to_sell.toFixed(1)} jours` },
                  { label: "Taux de vente 7j", value: `${modelDetail.liquidity.sell_rate_7d.toFixed(1)}%` },
                  { label: "Taux de vente 30j", value: `${modelDetail.liquidity.sell_rate_30d.toFixed(1)}%` },
                  { label: "Annonces actives", value: String(modelDetail.liquidity.active_count) },
                  { label: "Baisses de prix", value: `${modelDetail.liquidity.price_drop_rate.toFixed(1)}%` },
                  { label: "Republications", value: `${modelDetail.liquidity.republish_rate.toFixed(1)}%` },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{m.label}</p>
                    <p className="text-lg font-semibold">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Par source */}
              <h4 className="text-sm font-semibold mb-3">Par source</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(modelDetail.by_source).map(([source, data]) => (
                  <div key={source} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs font-medium mb-2 capitalize">{source}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Actives : <span className="text-foreground font-medium">{data.active}</span></p>
                      <p>Temps médian : <span className="text-foreground font-medium">{data.median_days.toFixed(1)}j</span></p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Activité récente */}
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
    </div>
  );
}
