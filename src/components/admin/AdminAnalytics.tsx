import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertTriangle, TrendingDown, Info, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { adminApiGet } from "@/lib/api/adminApi";
import { ADMIN } from "@/lib/api/endpoints";
import { qualityBadge } from "./adminHelpers";
import type { DecoteResponse, PriceHistoryResponse } from "@/types/admin";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend } from "recharts";

const CATEGORY_BADGE: Record<string, string> = {
  GPU: "bg-red-500/10 text-red-400 border-red-500/30",
  CPU: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  RAM: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  SSD: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
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

const SOURCE_COLORS: Record<string, string> = {
  ebay_sold: "#3b82f6",
  ebay_active: "#22c55e",
  leboncoin: "#f97316",
  vinted: "#06b6d4",
  default: "#a855f7",
};

// ==================== Décote Tab ====================

function DecoteTab() {
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
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{summary?.total_models_with_both_prices ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Modèles comparables</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{summary?.avg_decote_pct?.toFixed(1) ?? 0}%</div>}
            <p className="text-xs text-muted-foreground">Décote moyenne</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-20" /> : (
              <div>
                <div className="text-lg font-bold truncate">{summary?.best_deal_model ?? "—"}</div>
                <span className="text-emerald-400 text-sm font-semibold">{summary?.best_deal_decote?.toFixed(0)}%</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Meilleure affaire</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{summary?.models_over_50pct ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Modèles &gt; 50% décote</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error} <Button variant="link" size="sm" onClick={fetchData}>Réessayer</Button></AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
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
      {loading && !data ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : data && data.models.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Aucun modèle avec prix neuf et médiane occasion</CardContent></Card>
      ) : data && (
        <Card>
          <CardContent className="p-0">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== Price History Tab ====================

function PriceHistoryTab() {
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

  // Transform data: pivot sources into columns per date
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
    <div className="space-y-6">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">ID du modèle</label>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: 42"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              type="number"
              className="w-40"
            />
            <Button
              onClick={() => {
                const id = parseInt(modelSearch);
                if (!isNaN(id) && id > 0) setSelectedModelId(id);
              }}
              disabled={loading}
            >
              <Search className="h-4 w-4 mr-1" /> Charger
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      )}

      {data && !loading && (
        <>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{data.model_name}</h3>
            <Badge variant="outline" className={`text-[10px] uppercase ${catBadgeClass(data.category)}`}>{data.category}</Badge>
            <span className="text-xs text-muted-foreground">{data.summary.total_observations} observations</span>
          </div>

          {chartData.length < 7 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Les données s'enrichissent au fil du temps — l'historique sera plus complet dans quelques semaines.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}€`} />
                  <RTooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number, name: string) => [`${Math.round(value)} €`, name]}
                  />
                  <Legend />
                  {sources.map((src) => (
                    <Area
                      key={src}
                      type="monotone"
                      dataKey={src}
                      stroke={SOURCE_COLORS[src] || SOURCE_COLORS.default}
                      fill={SOURCE_COLORS[src] || SOURCE_COLORS.default}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && !error && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <TrendingDown className="h-8 w-8 mx-auto mb-3 opacity-40" />
            Entrez un ID de modèle pour afficher l'historique de prix
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== Main ====================

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">Analyse de la décote et historique des prix</p>
      </div>

      <Tabs defaultValue="decote">
        <TabsList>
          <TabsTrigger value="decote">Décote neuf / occasion</TabsTrigger>
          <TabsTrigger value="history">Historique prix</TabsTrigger>
        </TabsList>
        <TabsContent value="decote" className="mt-6">
          <DecoteTab />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <PriceHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
