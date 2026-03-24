import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertTriangle, TrendingDown, TrendingUp, Info, Search, ArrowUp, ArrowDown, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { adminApiGet } from "@/lib/api/adminApi";
import { ADMIN } from "@/lib/api/endpoints";
import { qualityBadge } from "./adminHelpers";
import type { DecoteResponse, PriceHistoryResponse } from "@/types/admin";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Legend, ComposedChart,
} from "recharts";

// ============= Constants =============

const CATEGORY_COLORS: Record<string, string> = {
  GPU: "hsl(152, 69%, 41%)",
  CPU: "hsl(217, 91%, 60%)",
  RAM: "hsl(270, 67%, 58%)",
  SSD: "hsl(25, 95%, 53%)",
};

const CATEGORY_BADGE: Record<string, string> = {
  GPU: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  CPU: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  RAM: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  SSD: "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

const SOURCE_COLORS: Record<string, string> = {
  ebay_sold: "#3b82f6",
  ebay_active: "#22c55e",
  leboncoin: "#f97316",
  vinted: "#06b6d4",
  default: "#a855f7",
};

function catBadgeClass(cat: string) {
  return CATEGORY_BADGE[cat?.toUpperCase()] || "bg-muted text-muted-foreground";
}

function decoteColor(pct: number) {
  if (pct > 40) return "bg-emerald-500";
  if (pct >= 20) return "bg-orange-500";
  return "bg-destructive";
}

function formatEur(v: number | null) {
  if (v == null) return "—";
  return `${Math.round(v).toLocaleString("fr-FR")} €`;
}

const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
};

// ============= Section wrapper with independent loading =============

function SectionCard({ title, children, loading, error, onRetry }: {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {onRetry && <Button variant="link" size="sm" onClick={onRetry} className="ml-2">Réessayer</Button>}
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : children}
      </CardContent>
    </Card>
  );
}

// ============= Section 1: Price Trends =============

function PriceTrendsSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30");
  const [visibleCats, setVisibleCats] = useState<Record<string, boolean>>({ GPU: true, CPU: true, RAM: true, SSD: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiGet<any>(`${ADMIN.ANALYTICS_PRICE_TRENDS}?period=${period}&category=all`);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const categories = ["GPU", "CPU", "RAM", "SSD"];

  const chartData = data?.data_points || data?.trends || [];

  return (
    <SectionCard title="📈 Tendances de prix par catégorie" loading={loading} error={error} onRetry={fetchData}>
      {data && (
        <>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-1.5 cursor-pointer text-sm">
                  <Checkbox
                    checked={visibleCats[cat]}
                    onCheckedChange={(checked) => setVisibleCats((prev) => ({ ...prev, [cat]: !!checked }))}
                  />
                  <span style={{ color: CATEGORY_COLORS[cat] }}>{cat}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-1">
              {["30", "90", "180"].map((p) => (
                <Button key={p} size="sm" variant={period === p ? "default" : "outline"} onClick={() => setPeriod(p)}>
                  {p}j
                </Button>
              ))}
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Pas encore de données de tendances</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Les données s'accumuleront au fil des jours.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}€`} />
                <RTooltip contentStyle={chartTooltipStyle} formatter={(value: number, name: string) => [`${Math.round(value)} €`, name]} />
                <Legend />
                {categories.filter((c) => visibleCats[c]).map((cat) => (
                  <Line key={cat} type="monotone" dataKey={cat} stroke={CATEGORY_COLORS[cat]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </SectionCard>
  );
}

// ============= Section 2: Top Movers =============

function TopMoversSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiGet<any>(ADMIN.ANALYTICS_TOP_MOVERS);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const movers = data?.movers || data?.top_movers || [];
  const gainers = movers.filter((m: any) => m.change_pct > 0).sort((a: any, b: any) => b.change_pct - a.change_pct).slice(0, 10);
  const losers = movers.filter((m: any) => m.change_pct < 0).sort((a: any, b: any) => a.change_pct - b.change_pct).slice(0, 10);

  const MoverRow = ({ m }: { m: any }) => (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium text-sm truncate">{m.model_name || m.name}</span>
        <Badge variant="outline" className={`text-[9px] uppercase shrink-0 ${catBadgeClass(m.category)}`}>{m.category}</Badge>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm text-muted-foreground">{formatEur(m.current_price || m.price)}</span>
        <span className={`text-sm font-semibold flex items-center gap-0.5 ${m.change_pct > 0 ? "text-emerald-400" : "text-red-400"}`}>
          {m.change_pct > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(m.change_pct).toFixed(1)}%
        </span>
      </div>
    </div>
  );

  return (
    <SectionCard title="🔄 Top movers de la semaine" loading={loading} error={error} onRetry={fetchData}>
      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Plus fortes hausses
            </h4>
            <div className="space-y-0.5">
              {gainers.length === 0 ? <p className="text-sm text-muted-foreground py-4">Aucune hausse cette semaine</p> :
                gainers.map((m: any, i: number) => <MoverRow key={i} m={m} />)}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-1">
              <TrendingDown className="h-4 w-4" /> Plus fortes baisses
            </h4>
            <div className="space-y-0.5">
              {losers.length === 0 ? <p className="text-sm text-muted-foreground py-4">Aucune baisse cette semaine</p> :
                losers.map((m: any, i: number) => <MoverRow key={i} m={m} />)}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ============= Section 3: Data Freshness =============

function DataFreshnessSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiGet<any>(ADMIN.ANALYTICS_DATA_FRESHNESS);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const categories = data?.categories || data?.freshness || [];
  const globalFresh = data?.global_fresh_pct ?? (categories.length > 0
    ? Math.round(categories.reduce((s: number, c: any) => s + (c.fresh || 0), 0) / Math.max(categories.reduce((s: number, c: any) => s + (c.fresh || 0) + (c.recent || 0) + (c.stale || 0) + (c.none || 0), 0), 1) * 100)
    : 0);

  const freshnessColors = {
    fresh: "hsl(152, 69%, 41%)",
    recent: "hsl(48, 96%, 53%)",
    stale: "hsl(25, 95%, 53%)",
    none: "hsl(0, 84%, 60%)",
  };

  return (
    <SectionCard title="🕐 Fraîcheur des données" loading={loading} error={error} onRetry={fetchData}>
      {data && (
        <div className="flex gap-8 items-start">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categories} layout="vertical" barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={50} />
                <RTooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="fresh" stackId="a" fill={freshnessColors.fresh} name="< 7j" />
                <Bar dataKey="recent" stackId="a" fill={freshnessColors.recent} name="7-30j" />
                <Bar dataKey="stale" stackId="a" fill={freshnessColors.stale} name="> 30j" />
                <Bar dataKey="none" stackId="a" fill={freshnessColors.none} name="Aucune" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center px-6">
            <div className="text-5xl font-bold text-emerald-400">{globalFresh}%</div>
            <p className="text-sm text-muted-foreground mt-1">couverture fraîche (&lt;7j)</p>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ============= Section 4: Scraper History =============

function ScraperHistorySection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scraper, setScraper] = useState("all");
  const [days, setDays] = useState("30");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiGet<any>(`${ADMIN.ANALYTICS_SCRAPER_HISTORY}?days=${days}&scraper=${scraper}`);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }, [scraper, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const runs = data?.runs || data?.history || [];
  const scrapers = data?.available_scrapers || [];
  const summary = data?.summary;

  return (
    <SectionCard title="⚙️ Performances scrapers (historique)" loading={loading} error={error} onRetry={fetchData}>
      {data && (
        <>
          <div className="flex gap-3 mb-4 flex-wrap">
            <Select value={scraper} onValueChange={setScraper}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Scraper" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {scrapers.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              {["7", "30", "90"].map((d) => (
                <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>{d}j</Button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={runs}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <RTooltip contentStyle={chartTooltipStyle} />
              <Legend />
              <Bar yAxisId="left" dataKey="items_inserted" fill="hsl(217, 91%, 60%)" name="Items insérés" opacity={0.7} />
              <Line yAxisId="right" type="monotone" dataKey="duration_min" stroke="hsl(152, 69%, 41%)" strokeWidth={2} name="Durée (min)" dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="blocks" stroke="hsl(0, 84%, 60%)" strokeWidth={2} name="Blocks" dot={{ fill: "hsl(0, 84%, 60%)", r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>

          {summary && (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Métrique</TableHead>
                    <TableHead className="text-right">Dernier run</TableHead>
                    <TableHead className="text-right">Moy. 5 derniers</TableHead>
                    <TableHead>Tendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Durée</TableCell>
                    <TableCell className="text-right">{summary.last?.duration_min ?? "—"} min</TableCell>
                    <TableCell className="text-right">{summary.avg_5?.duration_min ?? "—"} min</TableCell>
                    <TableCell>{summary.trend_duration === "up" ? "📈" : summary.trend_duration === "down" ? "📉" : "➡️"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Items insérés</TableCell>
                    <TableCell className="text-right">{summary.last?.items_inserted?.toLocaleString("fr-FR") ?? "—"}</TableCell>
                    <TableCell className="text-right">{summary.avg_5?.items_inserted?.toLocaleString("fr-FR") ?? "—"}</TableCell>
                    <TableCell>{summary.trend_items === "up" ? "📈" : summary.trend_items === "down" ? "📉" : "➡️"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Blocks</TableCell>
                    <TableCell className="text-right">{summary.last?.blocks ?? "—"}</TableCell>
                    <TableCell className="text-right">{summary.avg_5?.blocks ?? "—"}</TableCell>
                    <TableCell>{summary.trend_blocks === "up" ? "📈" : summary.trend_blocks === "down" ? "📉" : "➡️"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}

// ============= Section 5: Extension Usage =============

function ExtensionUsageSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiGet<any>(ADMIN.ANALYTICS_EXTENSION_USAGE);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const signalsDaily = data?.signals_daily || [];
  const topComponents = (data?.top_components || []).slice(0, 15);

  return (
    <SectionCard title="🔌 Utilisation de l'extension" loading={loading} error={error} onRetry={fetchData}>
      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">Signaux & utilisateurs actifs / jour</h4>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={signalsDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <RTooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="signals" fill="hsl(217, 91%, 60%)" fillOpacity={0.2} stroke="hsl(217, 91%, 60%)" strokeWidth={2} name="Signaux" />
                <Line yAxisId="right" type="monotone" dataKey="active_users" stroke="hsl(270, 67%, 58%)" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Users actifs" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Top composants analysés</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topComponents} layout="vertical" barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={120} />
                <RTooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="hsl(152, 69%, 41%)" name="Analyses" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ============= Section 6: Market Liquidity =============

function MarketLiquiditySection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiGet<any>(ADMIN.ANALYTICS_MARKET_LIQUIDITY);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const categories = data?.categories || data?.liquidity || [];

  function liquidityLevel(ads: number) {
    if (ads >= 500) return { label: "Haute", className: "text-emerald-400" };
    if (ads >= 100) return { label: "Moyenne", className: "text-yellow-400" };
    return { label: "Faible", className: "text-orange-400" };
  }

  return (
    <SectionCard title="💧 Liquidité du marché" loading={loading} error={error} onRetry={fetchData}>
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat: any) => {
            const liq = liquidityLevel(cat.active_ads || 0);
            return (
              <Card key={cat.category} className="border" style={{ borderLeftColor: CATEGORY_COLORS[cat.category] || "hsl(var(--border))", borderLeftWidth: 3 }}>
                <CardContent className="pt-4 pb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{cat.category}</span>
                    <span className={`text-xs font-medium ${liq.className}`}>{liq.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{(cat.active_ads || 0).toLocaleString("fr-FR")}</div>
                  <p className="text-xs text-muted-foreground">annonces actives</p>
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>{cat.models_with_ads || 0} modèles</span>
                    <span>{formatEur(cat.avg_price || null)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ============= Section 7: Décote (existing) =============

function DecoteSection() {
  const [data, setData] = useState<DecoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("decote");
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ sort_by: sortBy, sort_order: "desc", limit: "200" });
      if (category !== "all") params.set("category", category);
      const res = await adminApiGet<DecoteResponse>(`${ADMIN.ANALYTICS_DECOTE}?${params}`);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Erreur API");
      toast({ title: "Erreur", description: "Impossible de charger les données de décote", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const summary = data?.summary;

  return (
    <SectionCard title="🏷️ Décote neuf / occasion" loading={loading && !data} error={error} onRetry={fetchData}>
      <>
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{summary?.total_models_with_both_prices ?? "—"}</div>
            <p className="text-xs text-muted-foreground">Modèles comparables</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary?.avg_decote_pct?.toFixed(1) ?? "—"}%</div>
            <p className="text-xs text-muted-foreground">Décote moyenne</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold truncate">{summary?.best_deal_model ?? "—"}</div>
            <span className="text-emerald-400 text-sm font-semibold">{summary?.best_deal_decote?.toFixed(0)}%</span>
            <p className="text-xs text-muted-foreground">Meilleure affaire</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary?.models_over_50pct ?? "—"}</div>
            <p className="text-xs text-muted-foreground">Modèles &gt; 50%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap mb-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="GPU">GPU</SelectItem>
              <SelectItem value="CPU">CPU</SelectItem>
              <SelectItem value="RAM">RAM</SelectItem>
              <SelectItem value="SSD">SSD</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Trier par" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="decote">Décote (%)</SelectItem>
              <SelectItem value="new_price">Prix neuf</SelectItem>
              <SelectItem value="median">Médiane occasion</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Rafraîchir
          </Button>
        </div>

        {/* Table */}
        {data && data.models.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun modèle avec prix neuf et médiane occasion</p>
        ) : data && (
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modèle</TableHead>
                  <TableHead>Cat.</TableHead>
                  <TableHead className="text-right">Prix neuf</TableHead>
                  <TableHead className="text-right">Médiane occ.</TableHead>
                  <TableHead className="text-right">P25–P75</TableHead>
                  <TableHead className="w-[140px]">Décote</TableHead>
                  <TableHead className="text-right">Économie</TableHead>
                  <TableHead>Qualité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.models.map((m) => (
                  <TableRow key={m.model_id}>
                    <TableCell className="font-medium">{m.model_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] uppercase ${catBadgeClass(m.category)}`}>{m.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {m.new_price_source ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{formatEur(m.new_price_eur)}</span>
                          </TooltipTrigger>
                          <TooltipContent>{m.new_price_source}</TooltipContent>
                        </Tooltip>
                      ) : formatEur(m.new_price_eur)}
                    </TableCell>
                    <TableCell className="text-right">{formatEur(m.median_price)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {m.p25 != null && m.p75 != null ? `${Math.round(m.p25)}–${Math.round(m.p75)} €` : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(m.decote_pct, 100)} className={`h-2 flex-1 [&>div]:${decoteColor(m.decote_pct)}`} />
                        <span className="text-sm font-semibold whitespace-nowrap">{m.decote_pct.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-emerald-400 font-semibold">{formatEur(m.economy_eur)}</TableCell>
                    <TableCell>{m.data_quality ? qualityBadge(m.data_quality) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        )}
      </>
    </SectionCard>
  );
}

// ============= Section 8: Price History (existing) =============

function PriceHistorySection() {
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [data, setData] = useState<PriceHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (modelId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiGet<PriceHistoryResponse>(`${ADMIN.ANALYTICS_PRICE_HISTORY(modelId)}?days=90`);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Erreur API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedModelId) fetchHistory(selectedModelId);
  }, [selectedModelId, fetchHistory]);

  const chartData = data ? (() => {
    const byDate: Record<string, Record<string, number>> = {};
    for (const pt of data.data_points) {
      if (!byDate[pt.date]) byDate[pt.date] = { date: pt.date as any };
      byDate[pt.date][pt.source] = pt.median_price;
    }
    return Object.values(byDate).sort((a, b) => ((a as any).date > (b as any).date ? 1 : -1));
  })() : [];

  const sources = data?.summary?.sources || [];

  return (
    <SectionCard title="📊 Historique prix par modèle" loading={false} error={null}>
      <>
        <div className="flex gap-3 items-end mb-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">ID du modèle</label>
            <div className="flex gap-2">
              <Input placeholder="Ex: 42" value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} type="number" className="w-40" />
              <Button onClick={() => { const id = parseInt(modelSearch); if (!isNaN(id) && id > 0) setSelectedModelId(id); }} disabled={loading}>
                <Search className="h-4 w-4 mr-1" /> Charger
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
        )}

        {loading && <Skeleton className="h-[300px] w-full" />}

        {data && !loading && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-semibold">{data.model_name}</h3>
              <Badge variant="outline" className={`text-[10px] uppercase ${catBadgeClass(data.category)}`}>{data.category}</Badge>
              <span className="text-xs text-muted-foreground">{data.summary.total_observations} observations</span>
            </div>
            {chartData.length < 7 && (
              <Alert className="mb-4"><Info className="h-4 w-4" /><AlertDescription>Les données s'enrichissent au fil du temps.</AlertDescription></Alert>
            )}
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}€`} />
                <RTooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} formatter={(value: number, name: string) => [`${Math.round(value)} €`, name]} />
                <Legend />
                {sources.map((src) => (
                  <Area key={src} type="monotone" dataKey={src} stroke={SOURCE_COLORS[src] || SOURCE_COLORS.default} fill={SOURCE_COLORS[src] || SOURCE_COLORS.default} fillOpacity={0.15} strokeWidth={2} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}

        {!data && !loading && !error && (
          <div className="text-center text-muted-foreground py-8">
            <TrendingDown className="h-8 w-8 mx-auto mb-3 opacity-40" />
            Entrez un ID de modèle pour afficher l'historique de prix
          </div>
        )}
      </>
    </SectionCard>
  );
}

// ============= Main =============

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Analytics & Intelligence Marché</h2>
        <p className="text-muted-foreground">Tendances, qualité des données, performances</p>
      </div>

      <PriceTrendsSection />
      <TopMoversSection />
      <DataFreshnessSection />
      <ScraperHistorySection />
      <ExtensionUsageSection />
      <MarketLiquiditySection />
      <DecoteSection />
      <PriceHistorySection />
    </div>
  );
}
