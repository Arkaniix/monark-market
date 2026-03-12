import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { adminApiGet, adminApiFetch } from "@/lib/api/adminApi";
import {
  BarChart3, Database, HardDrive, Loader2, RefreshCw, Trash2,
  TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// ---- Types ----

interface PipelineStatus {
  market_stats: {
    last_run_at: string | null;
    models_computed: number;
    schedule: string;
  };
  price_observations: {
    total: number;
    last_import_at: string | null;
    by_source: Record<string, number>;
  };
  cache: {
    basic_entries: number;
    expired_entries: number;
    deep_entries: number;
  };
}

interface ModelStat {
  model_id: number;
  model_name: string;
  category: string;
  observations: number;
  median_price: number | null;
  p25: number | null;
  p75: number | null;
  trend_30d_pct: number | null;
  liquidity: number | null;
  confidence: number | null;
  data_quality: string;
}

interface ModelStatsResponse {
  models: ModelStat[];
  total: number;
}

// ---- Helpers ----

const SOURCE_COLORS: Record<string, string> = {
  ebay_sold: "bg-emerald-500",
  leboncoin_scrape: "bg-blue-500",
  ebay_active: "bg-yellow-500",
  scraper_disappear: "bg-muted-foreground",
  crowdsource: "bg-purple-500",
};

const SOURCE_LABELS: Record<string, string> = {
  ebay_sold: "eBay Sold",
  leboncoin_scrape: "Leboncoin",
  ebay_active: "eBay Active",
  scraper_disappear: "Disparues",
  crowdsource: "Communauté",
};

function qualityBadge(q: string) {
  switch (q) {
    case "excellent":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">Excellent</Badge>;
    case "good":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">Bon</Badge>;
    case "limited":
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30">Limité</Badge>;
    case "insufficient":
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30">Insuffisant</Badge>;
    default:
      return <Badge variant="outline">{q}</Badge>;
  }
}

function relativeDate(d: string | null) {
  if (!d) return "—";
  return formatDistanceToNow(new Date(d), { addSuffix: true, locale: fr });
}

// ---- Mock Data (DEV fallback) ----

const MOCK_STATUS: PipelineStatus = {
  market_stats: {
    last_run_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    models_computed: 35,
    schedule: "Toutes les heures",
  },
  price_observations: {
    total: 1566,
    last_import_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    by_source: {
      ebay_sold: 912,
      leboncoin_scrape: 273,
      ebay_active: 262,
      scraper_disappear: 112,
      crowdsource: 7,
    },
  },
  cache: {
    basic_entries: 1248,
    expired_entries: 37,
    deep_entries: 89,
  },
};

const MOCK_MODELS: ModelStat[] = [
  { model_id: 1, model_name: "RTX 4090", category: "gpu", observations: 312, median_price: 1650, p25: 1500, p75: 1800, trend_30d_pct: -2.4, liquidity: 0.87, confidence: 0.94, data_quality: "excellent" },
  { model_id: 2, model_name: "RTX 4070 Ti", category: "gpu", observations: 245, median_price: 580, p25: 520, p75: 640, trend_30d_pct: -5.1, liquidity: 0.82, confidence: 0.91, data_quality: "excellent" },
  { model_id: 3, model_name: "RX 7900 XTX", category: "gpu", observations: 189, median_price: 780, p25: 720, p75: 850, trend_30d_pct: 1.3, liquidity: 0.73, confidence: 0.88, data_quality: "good" },
  { model_id: 4, model_name: "RTX 3080", category: "gpu", observations: 156, median_price: 420, p25: 380, p75: 470, trend_30d_pct: -8.2, liquidity: 0.91, confidence: 0.95, data_quality: "excellent" },
  { model_id: 5, model_name: "Ryzen 7 5800X", category: "cpu", observations: 134, median_price: 155, p25: 130, p75: 175, trend_30d_pct: -3.7, liquidity: 0.78, confidence: 0.85, data_quality: "good" },
  { model_id: 6, model_name: "i9-13900K", category: "cpu", observations: 98, median_price: 340, p25: 300, p75: 380, trend_30d_pct: -1.2, liquidity: 0.65, confidence: 0.79, data_quality: "good" },
  { model_id: 7, model_name: "RTX 3060 Ti", category: "gpu", observations: 87, median_price: 250, p25: 220, p75: 280, trend_30d_pct: -6.5, liquidity: 0.88, confidence: 0.82, data_quality: "good" },
  { model_id: 8, model_name: "Samsung 990 Pro 2TB", category: "ssd", observations: 64, median_price: 145, p25: 130, p75: 160, trend_30d_pct: -4.0, liquidity: 0.55, confidence: 0.72, data_quality: "limited" },
  { model_id: 9, model_name: "DDR5 6000 32GB", category: "ram", observations: 42, median_price: 95, p25: 80, p75: 110, trend_30d_pct: 2.1, liquidity: 0.48, confidence: 0.61, data_quality: "limited" },
  { model_id: 10, model_name: "RX 6600 XT", category: "gpu", observations: 31, median_price: 170, p25: 150, p75: 195, trend_30d_pct: -9.8, liquidity: 0.42, confidence: 0.54, data_quality: "limited" },
  { model_id: 11, model_name: "GTX 1660 Super", category: "gpu", observations: 18, median_price: 120, p25: 100, p75: 140, trend_30d_pct: -12.3, liquidity: 0.35, confidence: 0.41, data_quality: "insufficient" },
];

// ---- Component ----

export default function AdminPipeline() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("observations");

  // Fetch pipeline status (fallback to mock in dev)
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["admin-pipeline-status"],
    queryFn: async () => {
      try {
        return await adminApiGet<PipelineStatus>("/admin/jobs/status");
      } catch {
        if (import.meta.env.DEV) return MOCK_STATUS;
        throw new Error("API unavailable");
      }
    },
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch model stats (fallback to mock in dev)
  const { data: modelStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-market-stats", category, sortBy],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({ limit: "50", sort_by: sortBy });
        if (category !== "all") params.set("category", category);
        return await adminApiGet<ModelStatsResponse>(`/admin/market-stats?${params}`);
      } catch {
        if (import.meta.env.DEV) {
          let filtered = MOCK_MODELS;
          if (category !== "all") filtered = filtered.filter(m => m.category === category);
          filtered = [...filtered].sort((a, b) => {
            if (sortBy === "median") return (b.median_price ?? 0) - (a.median_price ?? 0);
            if (sortBy === "confidence") return (b.confidence ?? 0) - (a.confidence ?? 0);
            return b.observations - a.observations;
          });
          return { models: filtered, total: filtered.length };
        }
        throw new Error("API unavailable");
      }
    },
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Recompute mutation
  const recompute = useMutation({
    mutationFn: async () => {
      try {
        return await adminApiFetch<{ models_computed: number; duration_s: number }>("/admin/jobs/recompute-stats", { method: "POST" });
      } catch {
        if (import.meta.env.DEV) {
          await new Promise(r => setTimeout(r, 1500));
          return { models_computed: 35, duration_s: 2.3 };
        }
        throw new Error("API unavailable");
      }
    },
    onSuccess: (data) => {
      toast({ title: "Recalcul terminé", description: `${data.models_computed} modèles recalculés en ${data.duration_s}s` });
      qc.invalidateQueries({ queryKey: ["admin-pipeline-status"] });
      qc.invalidateQueries({ queryKey: ["admin-market-stats"] });
    },
    onError: () => toast({ title: "Erreur", description: "Le recalcul a échoué", variant: "destructive" }),
  });

  // Purge mutation
  const purge = useMutation({
    mutationFn: async () => {
      try {
        return await adminApiFetch<{ purged: number }>("/admin/jobs/purge-cache", { method: "POST" });
      } catch {
        if (import.meta.env.DEV) {
          await new Promise(r => setTimeout(r, 800));
          return { purged: 37 };
        }
        throw new Error("API unavailable");
      }
    },
    onSuccess: (data) => {
      toast({ title: "Cache purgé", description: `${data.purged} entrées supprimées` });
      qc.invalidateQueries({ queryKey: ["admin-pipeline-status"] });
    },
    onError: () => toast({ title: "Erreur", description: "La purge a échoué", variant: "destructive" }),
  });

  const ms = status?.market_stats;
  const po = status?.price_observations;
  const ca = status?.cache;
  const totalObs = po?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Jobs & Pipeline</h2>
        <p className="text-muted-foreground text-sm mt-1">Statistiques de marché, observations et cache</p>
      </div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 — Stats Marché */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Stats Marché
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Chargement…</div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Dernière MAJ : {relativeDate(ms?.last_run_at ?? null)}
                </div>
                <div className="text-sm">Modèles calculés : <span className="font-semibold text-foreground">{ms?.models_computed ?? 0}</span></div>
                <div className="text-sm">Planification : <span className="font-semibold text-foreground">{ms?.schedule ?? "—"}</span></div>
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => recompute.mutate()}
                  disabled={recompute.isPending}
                >
                  {recompute.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Calcul en cours…</>
                  ) : (
                    <><RefreshCw className="h-4 w-4" />Recalculer maintenant</>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 2 — Observations de Prix */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Observations de Prix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Chargement…</div>
            ) : (
              <>
                <div className="text-sm">Total : <span className="font-semibold text-foreground">{totalObs.toLocaleString("fr-FR")} observations</span></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Dernière import : {relativeDate(po?.last_import_at ?? null)}
                </div>
                <div className="space-y-1.5 pt-1">
                  {Object.entries(po?.by_source ?? {}).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
                    <div key={src} className="flex items-center gap-2 text-xs">
                      <span className="w-24 truncate text-muted-foreground">{SOURCE_LABELS[src] ?? src}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${SOURCE_COLORS[src] ?? "bg-primary"}`}
                          style={{ width: `${totalObs ? (count / totalObs) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-medium text-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 3 — Cache */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Chargement…</div>
            ) : (
              <>
                <div className="text-sm">Entrées basiques : <span className="font-semibold text-foreground">{ca?.basic_entries ?? 0}</span></div>
                <div className="text-sm">
                  Entrées expirées :{" "}
                  <span className={`font-semibold ${(ca?.expired_entries ?? 0) > 0 ? "text-orange-400" : "text-foreground"}`}>
                    {ca?.expired_entries ?? 0}
                  </span>
                </div>
                <div className="text-sm">Entrées deep : <span className="font-semibold text-foreground">{ca?.deep_entries ?? 0}</span></div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                  onClick={() => purge.mutate()}
                  disabled={purge.isPending}
                >
                  {purge.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Purge en cours…</>
                  ) : (
                    <><Trash2 className="h-4 w-4" />Purger cache expiré</>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table — Stats par Modèle */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base">Stats par Modèle</CardTitle>
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="gpu">GPU</SelectItem>
                  <SelectItem value="cpu">CPU</SelectItem>
                  <SelectItem value="ram">RAM</SelectItem>
                  <SelectItem value="ssd">SSD</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="observations">Observations</SelectItem>
                  <SelectItem value="median">Médiane</SelectItem>
                  <SelectItem value="confidence">Confiance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {statsLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />Chargement…
            </div>
          ) : !modelStats?.models?.length ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Aucune donnée disponible</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nom</TableHead>
                    <TableHead className="text-xs">Catégorie</TableHead>
                    <TableHead className="text-xs text-right">Obs.</TableHead>
                    <TableHead className="text-xs text-right">Médiane</TableHead>
                    <TableHead className="text-xs text-right">P25–P75</TableHead>
                    <TableHead className="text-xs text-right">Tendance 30j</TableHead>
                    <TableHead className="text-xs">Liquidité</TableHead>
                    <TableHead className="text-xs">Confiance</TableHead>
                    <TableHead className="text-xs">Qualité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelStats.models.map((m) => (
                    <TableRow key={m.model_id}>
                      <TableCell className="text-sm font-medium">{m.model_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase">{m.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{m.observations}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {m.median_price != null ? `${m.median_price.toLocaleString("fr-FR")} €` : "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {m.p25 != null && m.p75 != null
                          ? `${m.p25.toLocaleString("fr-FR")}–${m.p75.toLocaleString("fr-FR")} €`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {m.trend_30d_pct != null ? (
                          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${m.trend_30d_pct >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                            {m.trend_30d_pct >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(m.trend_30d_pct).toFixed(1)}%
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        {m.liquidity != null ? (
                          <div className="flex items-center gap-1.5">
                            <Progress value={m.liquidity * 100} className="h-1.5 w-16" />
                            <span className="text-[10px] text-muted-foreground">{Math.round(m.liquidity * 100)}%</span>
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        {m.confidence != null ? (
                          <div className="flex items-center gap-1.5">
                            <Progress value={m.confidence * 100} className="h-1.5 w-16" />
                            <span className="text-[10px] text-muted-foreground">{Math.round(m.confidence * 100)}%</span>
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell>{qualityBadge(m.data_quality)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
