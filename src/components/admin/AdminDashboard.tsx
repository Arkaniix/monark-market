import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Radio, Package, AlertTriangle, CheckCircle2, AlertCircle, TrendingUp, FileX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApiGet } from "@/lib/api/adminApi";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface DashboardResponse {
  users: { total: number; active_subscribers: number };
  data: {
    total_observations: number;
    observations_7d: number;
    total_signals: number;
    signals_7d: number;
    total_models: number;
    models_with_stats: number;
  };
  cache: { basic_entries: number; expired_entries: number; deep_entries: number };
  pipeline: { last_stats_run: string | null; scraper_status: string };
  charts: {
    observations_7d: { date: string; count: number }[];
    signals_7d: { date: string; count: number }[];
  };
  alerts: {
    critical_errors: number;
    failed_scrapers: number;
    stale_stats: boolean;
    recent_errors?: { message: string; time: string }[];
  };
  coverage?: {
    category: string;
    total_models: number;
    models_with_stats: number;
    total_observations: number;
  }[];
  top_movers?: {
    model_name: string;
    category: string;
    median_price: number;
    trend_7d_pct: number;
    trend_30d_pct: number | null;
  }[];
  scrapers_summary?: {
    name: string;
    schedule: string;
    last_run_at: string | null;
  }[];
}

function formatCount(value: unknown): string {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num.toLocaleString("fr-FR") : "0";
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

const CATEGORY_BADGE: Record<string, string> = {
  GPU: "bg-red-500/10 text-red-400 border-red-500/30",
  CPU: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  RAM: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  SSD: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
};
function categoryBadgeClass(cat: string) {
  return CATEGORY_BADGE[cat.toUpperCase()] || "bg-muted text-muted-foreground";
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const data = await adminApiGet<DashboardResponse>('/v1/admin/dashboard');
      setDashboard(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({ title: "Erreur", description: "Impossible de charger le dashboard", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hasAlerts = (dashboard?.alerts.critical_errors ?? 0) > 0
    || (dashboard?.alerts.failed_scrapers ?? 0) > 0
    || (dashboard?.alerts.stale_stats === true);
  const systemStatus = hasAlerts ? 'degraded' : 'healthy';

  const AlertValue = ({ value, variant }: { value: number | boolean | null | undefined; variant: string }) => {
    if (value === null || value === undefined) return <Badge variant="outline">—</Badge>;
    if (typeof value === "boolean") {
      return <Badge variant={value ? (variant as any) : 'outline'}>{value ? "Oui" : "Non"}</Badge>;
    }
    return <Badge variant={value > 0 ? (variant as any) : 'outline'}>{formatCount(value)}</Badge>;
  };

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Vue d'ensemble</h2>
        <p className="text-muted-foreground">KPI et alertes en temps réel</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{formatCount(dashboard?.users.total)}</div>}
            <p className="text-xs text-muted-foreground">Total des comptes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Observations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{formatCount(dashboard?.data.total_observations)}</div>}
            <p className="text-xs text-muted-foreground">+{formatCount(dashboard?.data.observations_7d)} cette semaine</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signaux</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{formatCount(dashboard?.data.total_signals)}</div>}
            <p className="text-xs text-muted-foreground">+{formatCount(dashboard?.data.signals_7d)} cette semaine</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modèles couverts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">
                {formatCount(dashboard?.data.models_with_stats)}<span className="text-base font-normal text-muted-foreground"> / {formatCount(dashboard?.data.total_models)}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">avec stats marché</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={`border-2 ${systemStatus === 'healthy' ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {systemStatus === 'healthy' ? <CheckCircle2 className="h-8 w-8 text-green-500" /> : <AlertCircle className="h-8 w-8 text-yellow-500" />}
              État du système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">
                {systemStatus === 'healthy' ? 'Tous les systèmes opérationnels' : 'Alertes détectées'}
              </span>
              <Badge variant={systemStatus === 'healthy' ? 'default' : 'secondary'}>
                {systemStatus === 'healthy' ? 'OK' : 'Attention'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertes actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Erreurs critiques</span>
                <AlertValue value={dashboard?.alerts.critical_errors} variant="destructive" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Scrapers en échec</span>
                <AlertValue value={dashboard?.alerts.failed_scrapers} variant="destructive" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stats obsolètes</span>
                <AlertValue value={dashboard?.alerts.stale_stats} variant="secondary" />
              </div>
            </div>
            {dashboard?.alerts.recent_errors && dashboard.alerts.recent_errors.length > 0 && (
              <div className="border-t pt-3 mt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Dernières erreurs</p>
                {dashboard.alerts.recent_errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <span className="text-foreground">{err.message}</span>
                      <span className="text-muted-foreground ml-2">{timeAgo(err.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Observations par jour</CardTitle>
            <CardDescription>Derniers 7 jours</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (dashboard?.charts.observations_7d?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={192}>
                <BarChart data={dashboard!.charts.observations_7d}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="hsl(152, 69%, 41%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <FileX className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune donnée</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Signaux par jour</CardTitle>
            <CardDescription>Derniers 7 jours</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (dashboard?.charts.signals_7d?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={192}>
                <BarChart data={dashboard!.charts.signals_7d}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <FileX className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune donnée</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Couverture données */}
      {dashboard?.coverage && dashboard.coverage.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Package className="h-5 w-5" /> Couverture des données
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboard.coverage.map((cat) => {
              const pct = cat.total_models > 0
                ? Math.round((cat.models_with_stats / cat.total_models) * 100)
                : 0;
              return (
                <Card key={cat.category}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={categoryBadgeClass(cat.category)}>
                        {cat.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {cat.models_with_stats}/{cat.total_models}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2 mb-1" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{pct}% couverts</span>
                      <span>{cat.total_observations.toLocaleString("fr-FR")} obs</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Top mouvements + Scrapers */}
      {(dashboard?.top_movers?.length || dashboard?.scrapers_summary) && (
        <div className="grid gap-6 md:grid-cols-2">
          {dashboard?.top_movers && dashboard.top_movers.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Top mouvements de prix (7 jours)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modèle</TableHead>
                      <TableHead>Cat.</TableHead>
                      <TableHead className="text-right">Médiane</TableHead>
                      <TableHead className="text-right">7j</TableHead>
                      <TableHead className="text-right">30j</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.top_movers.map((m, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-sm">{m.model_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${categoryBadgeClass(m.category)}`}>
                            {m.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {m.median_price ? `${m.median_price.toLocaleString("fr-FR")} €` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`text-sm font-medium ${m.trend_7d_pct >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                            {m.trend_7d_pct >= 0 ? "↑" : "↓"}{Math.abs(m.trend_7d_pct).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {m.trend_30d_pct != null
                            ? `${m.trend_30d_pct >= 0 ? "+" : ""}${m.trend_30d_pct.toFixed(1)}%`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {dashboard?.scrapers_summary && dashboard.scrapers_summary.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary" />
                  Scrapers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Dernière exécution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.scrapers_summary.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-sm">{s.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.schedule}</TableCell>
                        <TableCell className="text-sm">{s.last_run_at ? timeAgo(s.last_run_at) : "Jamais"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
