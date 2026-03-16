import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { adminApiGet, adminApiFetch } from "@/lib/api/adminApi";
import { ADMIN } from "@/lib/api/endpoints";
import { qualityBadge } from "./adminHelpers";
import {
  BarChart3, Database, HardDrive, Loader2, RefreshCw, Trash2,
  TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Play, AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

interface ObservationTimelinePoint {
  date: string;
  ebay_sold: number;
  ebay_active: number;
  scraper_disappear: number;
  crowdsource: number;
  newprice: number;
  total: number;
}

interface ObservationTimelineResponse {
  points: ObservationTimelinePoint[];
}

interface CronScraper {
  id: string;
  name: string;
  description: string;
  schedule: string;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  last_7d_count: number;
  last_run_status: "success" | "error" | "running" | null;
  last_run_duration_s: number | null;
}

// ---- Helpers ----

const SOURCE_COLORS: Record<string, string> = {
  ebay_sold: "bg-emerald-500",
  ebay_active: "bg-yellow-500",
  scraper_disappear: "bg-muted-foreground",
  crowdsource: "bg-purple-500",
  newprice: "bg-teal-500",
};

const SOURCE_LABELS: Record<string, string> = {
  ebay_sold: "eBay Sold",
  ebay_active: "eBay Active",
  scraper_disappear: "Disparues",
  crowdsource: "Communauté",
  newprice: "Prix Neufs",
};

const CHART_SOURCE_COLORS: Record<string, string> = {
  ebay_sold: "hsl(152, 69%, 41%)",
  ebay_active: "hsl(45, 93%, 58%)",
  scraper_disappear: "hsl(215, 14%, 50%)",
  crowdsource: "hsl(270, 67%, 58%)",
  newprice: "hsl(175, 70%, 41%)",
};

const CHART_SOURCES = Object.keys(CHART_SOURCE_COLORS);



function relativeDate(d: string | null) {
  if (!d) return "—";

  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return "—";

  try {
    return formatDistanceToNow(parsed, { addSuffix: true, locale: fr });
  } catch {
    return "—";
  }
}

function formatCount(value: unknown) {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num.toLocaleString("fr-FR") : "0";
}

function cronStatusBadge(status: CronScraper["last_run_status"]) {
  switch (status) {
    case "success":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Succès</Badge>;
    case "error":
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Erreur</Badge>;
    case "running":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse">En cours</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground">—</Badge>;
  }
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
      <AlertCircle className="h-4 w-4 text-destructive" />
      <span>{message}</span>
    </div>
  );
}

// ---- Component ----

export default function AdminPipelineCron() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("observations");
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({});

  // --- Section 1: KPIs ---
  const { data: status, isLoading: statusLoading, isError: statusError } = useQuery({
    queryKey: ["admin-pipeline-status"],
    queryFn: () => adminApiGet<PipelineStatus>("/v1/admin/jobs/status"),
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Recompute mutation
  const recompute = useMutation({
    mutationFn: () => adminApiFetch<{ models_computed: number; duration_s: number }>("/v1/admin/jobs/recompute-stats", { method: "POST" }),
    onSuccess: (data) => {
      toast({ title: "Recalcul terminé", description: `${data.models_computed} modèles recalculés en ${data.duration_s}s` });
      qc.invalidateQueries({ queryKey: ["admin-pipeline-status"] });
      qc.invalidateQueries({ queryKey: ["admin-market-stats"] });
    },
    onError: () => toast({ title: "Erreur", description: "Le recalcul a échoué", variant: "destructive" }),
  });

  // Purge mutation
  const purge = useMutation({
    mutationFn: () => adminApiFetch<{ purged: number }>("/v1/admin/jobs/purge-cache", { method: "POST" }),
    onSuccess: (data) => {
      toast({ title: "Cache purgé", description: `${data.purged} entrées supprimées` });
      qc.invalidateQueries({ queryKey: ["admin-pipeline-status"] });
    },
    onError: () => toast({ title: "Erreur", description: "La purge a échoué", variant: "destructive" }),
  });

  // --- Section 2: CRON ---
  const { data: cronData, isLoading: cronLoading, isError: cronError } = useQuery({
    queryKey: ["admin-cron"],
    queryFn: () => adminApiGet<{ scrapers: CronScraper[] }>(ADMIN.CRON),
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const runCron = useMutation({
    mutationFn: (id: string) => adminApiFetch(ADMIN.CRON_RUN(id), { method: "POST" }),
    onSuccess: () => {
      toast({ title: "Scraper lancé", description: "Le scraper a été lancé en arrière-plan" });
      qc.invalidateQueries({ queryKey: ["admin-cron"] });
    },
    onError: () => toast({ title: "Erreur", description: "Impossible de lancer le scraper", variant: "destructive" }),
  });

  const handleRunCron = useCallback((id: string) => {
    runCron.mutate(id);
    setCooldowns(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCooldowns(prev => ({ ...prev, [id]: false }));
    }, 30000);
  }, [runCron]);

  // --- Section 3: Timeline ---
  const { data: timeline, isLoading: timelineLoading, isError: timelineError } = useQuery({
    queryKey: ["admin-observations-timeline"],
    queryFn: () => adminApiGet<ObservationTimelineResponse>(ADMIN.OBSERVATIONS_TIMELINE),
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // --- Section 4: Model Stats ---
  const { data: modelStats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["admin-market-stats", category, sortBy],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "50", sort_by: sortBy });
      if (category !== "all") params.set("category", category);
      return adminApiGet<ModelStatsResponse>(`/v1/admin/jobs/market-stats?${params}`);
    },
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const ms = status?.market_stats;
  const po = status?.price_observations;
  const ca = status?.cache;
  const totalObs = po?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pipeline & CRON</h2>
        <p className="text-muted-foreground text-sm mt-1">Scrapers, statistiques de marché, observations et cache</p>
      </div>

      {/* Section 1: KPI Cards */}
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
            ) : statusError ? (
              <ErrorMessage message="Données indisponibles" />
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Dernière MAJ : {relativeDate(ms?.last_run_at ?? null)}
                </div>
                <div className="text-sm">Modèles calculés : <span className="font-semibold text-foreground">{formatCount(ms?.models_computed)}</span></div>
                <div className="text-sm">Planification : <span className="font-semibold text-foreground">{String(ms?.schedule ?? "—")}</span></div>
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
            ) : statusError ? (
              <ErrorMessage message="Données indisponibles" />
            ) : (
              <>
                <div className="text-sm">Total : <span className="font-semibold text-foreground">{totalObs.toLocaleString("fr-FR")} observations</span></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Dernière import : {relativeDate(po?.last_import_at ?? null)}
                </div>
                <div className="space-y-1.5 pt-1">
                  {Object.entries(po?.by_source ?? {})
                    .map(([src, raw]) => [src, typeof raw === "number" ? raw : (typeof raw === "object" && raw !== null ? (raw as any).count ?? 0 : Number(raw) || 0)] as [string, number])
                    .sort((a, b) => b[1] - a[1])
                    .map(([src, count]) => (
                    <div key={src} className="flex items-center gap-2 text-xs">
                      <span className="w-24 truncate text-muted-foreground">{SOURCE_LABELS[src] ?? src}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${SOURCE_COLORS[src] ?? "bg-primary"}`}
                          style={{ width: `${totalObs ? (count / totalObs) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-medium text-foreground">{formatCount(count)}</span>
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
            ) : statusError ? (
              <ErrorMessage message="Données indisponibles" />
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

      {/* Section 2: Scrapers & CRON */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            Scrapers & tâches planifiées
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cronLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />Chargement…
            </div>
          ) : cronError ? (
            <ErrorMessage message="Impossible de charger les scrapers" />
          ) : !cronData?.scrapers?.length ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Aucun scraper configuré</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nom</TableHead>
                    <TableHead className="text-xs">Schedule</TableHead>
                    <TableHead className="text-xs">Dernière exécution</TableHead>
                    <TableHead className="text-xs">Prochaine exécution</TableHead>
                    <TableHead className="text-xs text-right">Résultats (7j)</TableHead>
                    <TableHead className="text-xs">Statut</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cronData.scrapers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div>
                          <span className="text-sm font-medium">{s.name}</span>
                          {s.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{s.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.schedule}</TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <span>{relativeDate(s.last_run_at)}</span>
                          {s.last_run_duration_s != null && (
                            <span className="text-xs text-muted-foreground ml-1">({s.last_run_duration_s}s)</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{relativeDate(s.next_run_at)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCount(s.last_7d_count)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {s.is_active ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Actif</Badge>
                          ) : (
                            <Badge className="bg-destructive/20 text-destructive border-destructive/30">Inactif</Badge>
                          )}
                          {cronStatusBadge(s.last_run_status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunCron(s.id)}
                          disabled={cooldowns[s.id] || runCron.isPending}
                        >
                          {cooldowns[s.id] ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" />Lancé</>
                          ) : (
                            <><Play className="h-3.5 w-3.5" />Lancer</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Observations Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Évolution des observations (30 derniers jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />Chargement…
            </div>
          ) : timelineError ? (
            <ErrorMessage message="Données indisponibles" />
          ) : !timeline?.points?.length ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Aucune donnée disponible</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeline.points} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  {CHART_SOURCES.map((key) => (
                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_SOURCE_COLORS[key]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_SOURCE_COLORS[key]} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  formatter={(value: string) => SOURCE_LABELS[value] ?? value}
                />
                {CHART_SOURCES.map((key) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stackId="1"
                    stroke={CHART_SOURCE_COLORS[key]}
                    fill={`url(#grad-${key})`}
                    strokeWidth={1.5}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Stats par Modèle */}
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
          ) : statsError ? (
            <ErrorMessage message="Données indisponibles" />
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
