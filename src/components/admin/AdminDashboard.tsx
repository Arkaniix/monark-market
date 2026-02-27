import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Briefcase, Package, AlertTriangle, CheckCircle2, XCircle, AlertCircle, TrendingUp, FileX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApiGet } from "@/lib/api/adminApi";

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalJobs: number | null;
  totalAds: number | null;
}

interface AlertStats {
  criticalErrors: number | null;
  failedJobs: number | null;
  unreviewedRejects: number | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, activeSubscriptions: 0, totalJobs: null, totalAds: null });
  const [alertStats, setAlertStats] = useState<AlertStats>({ criticalErrors: null, failedJobs: null, unreviewedRejects: null });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      // Supabase data (users + subscriptions)
      const [usersCount, subsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      let totalJobs: number | null = null;
      let totalAds: number | null = null;
      let failedJobs: number | null = null;
      let unreviewedRejects: number | null = null;
      let criticalErrors: number | null = null;

      // API data (pipeline) — graceful failures
      try {
        const sysData = await adminApiGet<any>('/v1/admin/system');
        totalAds = sysData?.total_ads ?? null;
      } catch {}

      try {
        const jobsData = await adminApiGet<any>('/v1/admin/jobs?page_size=1');
        totalJobs = jobsData?.total ?? null;
      } catch {}

      try {
        const failedData = await adminApiGet<any>('/v1/admin/jobs?status=failed&page_size=1');
        failedJobs = failedData?.total ?? null;
      } catch {}

      try {
        const rejectsData = await adminApiGet<any>('/v1/admin/rejects/stats');
        unreviewedRejects = rejectsData?.unreviewed ?? null;
      } catch {}

      try {
        const logsData = await adminApiGet<any>('/v1/admin/logs?level=error&page_size=1');
        criticalErrors = logsData?.total ?? null;
      } catch {}

      setStats({
        totalUsers: usersCount.count || 0,
        activeSubscriptions: subsCount.count || 0,
        totalJobs,
        totalAds,
      });

      setAlertStats({ criticalErrors, failedJobs, unreviewedRejects });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({ title: "Erreur", description: "Impossible de charger les statistiques", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const StatValue = ({ value }: { value: number | null }) => {
    if (loading) return <Skeleton className="h-8 w-16" />;
    if (value === null) return <span className="text-sm text-muted-foreground">API indisponible</span>;
    return <div className="text-2xl font-bold">{value}</div>;
  };

  const AlertValue = ({ value, variant }: { value: number | null; variant: string }) => {
    if (value === null) return <Badge variant="outline">—</Badge>;
    return <Badge variant={value > 0 ? (variant as any) : 'outline'}>{value}</Badge>;
  };

  // Determine system status
  const hasAlerts = (alertStats.criticalErrors ?? 0) > 0 || (alertStats.failedJobs ?? 0) > 0;
  const systemStatus = hasAlerts ? 'degraded' : 'healthy';

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
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.totalUsers}</div>}
            <p className="text-xs text-muted-foreground">Total des comptes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>}
            <p className="text-xs text-muted-foreground">Plans actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <StatValue value={stats.totalJobs} />
            <p className="text-xs text-muted-foreground">Scraps lancés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <StatValue value={stats.totalAds} />
            <p className="text-xs text-muted-foreground">Dans la base</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={`border-2 ${
          systemStatus === 'healthy' ? 'border-green-500/30' : 'border-yellow-500/30'
        }`}>
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
                <AlertValue value={alertStats.criticalErrors} variant="destructive" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Jobs échoués</span>
                <AlertValue value={alertStats.failedJobs} variant="destructive" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rejets non reviewés</span>
                <AlertValue value={alertStats.unreviewedRejects} variant="secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts placeholder */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Jobs par jour</CardTitle>
            <CardDescription>Derniers 7 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center">
                <FileX className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Données indisponibles</p>
                <p className="text-xs text-muted-foreground">Endpoint à implémenter</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Annonces ingérées</CardTitle>
            <CardDescription>Derniers 7 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center">
                <FileX className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Données indisponibles</p>
                <p className="text-xs text-muted-foreground">Endpoint à implémenter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
