import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Briefcase, Package, AlertTriangle, CheckCircle2, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalJobs: number;
  totalAds: number;
}

interface AlertStats {
  criticalErrors: number;
  failedJobs: number;
  emptyBatches: number;
}

interface SystemStatus {
  status: 'healthy' | 'degraded' | 'down';
  message: string;
}

interface DailyData {
  date: string;
  jobs: number;
  ads: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalJobs: 0,
    totalAds: 0
  });
  const [alertStats, setAlertStats] = useState<AlertStats>({
    criticalErrors: 0,
    failedJobs: 0,
    emptyBatches: 0
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'healthy',
    message: 'Tous les systèmes opérationnels'
  });
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch basic counts
      const [usersCount, subsCount, jobsCount, adsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('ads').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        activeSubscriptions: subsCount.count || 0,
        totalJobs: jobsCount.count || 0,
        totalAds: adsCount.count || 0
      });

      // Fetch alert stats
      const [errorsCount, failedJobsCount, emptyBatchesCount] = await Promise.all([
        supabase.from('system_logs').select('*', { count: 'exact', head: true })
          .eq('level', 'error')
          .gte('created_at', subDays(new Date(), 1).toISOString()),
        supabase.from('jobs').select('*', { count: 'exact', head: true })
          .eq('status', 'failed')
          .gte('created_at', subDays(new Date(), 7).toISOString()),
        supabase.from('ingest_batches').select('*', { count: 'exact', head: true })
          .eq('items_count', 0)
          .gte('received_at', subDays(new Date(), 7).toISOString())
      ]);

      const criticalErrors = errorsCount.count || 0;
      const failedJobs = failedJobsCount.count || 0;
      const emptyBatches = emptyBatchesCount.count || 0;

      setAlertStats({
        criticalErrors,
        failedJobs,
        emptyBatches
      });

      // Determine system status
      if (criticalErrors > 10 || failedJobs > 5) {
        setSystemStatus({
          status: 'down',
          message: 'Incident en cours - Vérifier les logs'
        });
      } else if (criticalErrors > 3 || failedJobs > 2 || emptyBatches > 5) {
        setSystemStatus({
          status: 'degraded',
          message: 'Performance dégradée'
        });
      } else {
        setSystemStatus({
          status: 'healthy',
          message: 'Tous les systèmes opérationnels'
        });
      }

      // Generate daily data for charts (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'yyyy-MM-dd');
      });

      // Fetch jobs per day
      const { data: jobsPerDay } = await supabase
        .from('jobs')
        .select('created_at')
        .gte('created_at', subDays(new Date(), 7).toISOString());

      // Fetch ads ingested per day
      const { data: adsPerDay } = await supabase
        .from('ads')
        .select('first_seen_at')
        .gte('first_seen_at', subDays(new Date(), 7).toISOString());

      const dailyStats = last7Days.map(date => {
        const jobsOnDate = jobsPerDay?.filter(j => 
          format(new Date(j.created_at), 'yyyy-MM-dd') === date
        ).length || 0;
        
        const adsOnDate = adsPerDay?.filter(a => 
          format(new Date(a.first_seen_at), 'yyyy-MM-dd') === date
        ).length || 0;

        return {
          date: format(new Date(date), 'dd/MM', { locale: fr }),
          jobs: jobsOnDate,
          ads: adsOnDate
        };
      });

      setDailyData(dailyStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  const getStatusIcon = () => {
    switch (systemStatus.status) {
      case 'healthy':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-8 w-8 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-8 w-8 text-destructive" />;
    }
  };

  const getStatusBadge = () => {
    switch (systemStatus.status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">OK</Badge>;
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-500 text-black">Dégradé</Badge>;
      case 'down':
        return <Badge variant="destructive">Erreur</Badge>;
    }
  };

  const totalAlerts = alertStats.criticalErrors + alertStats.failedJobs + alertStats.emptyBatches;

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
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total des comptes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Plans actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">Scraps lancés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAds}</div>
            <p className="text-xs text-muted-foreground">Dans la base</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={`border-2 ${
          systemStatus.status === 'healthy' ? 'border-green-500/30' :
          systemStatus.status === 'degraded' ? 'border-yellow-500/30' :
          'border-destructive/30'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              État du système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">{systemStatus.message}</span>
              {getStatusBadge()}
            </div>
          </CardContent>
        </Card>

        <Card className={totalAlerts > 0 ? 'border-2 border-destructive/30' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${totalAlerts > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              Alertes actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Erreurs critiques (24h)</span>
                <Badge variant={alertStats.criticalErrors > 0 ? 'destructive' : 'outline'}>
                  {alertStats.criticalErrors}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Jobs échoués (7j)</span>
                <Badge variant={alertStats.failedJobs > 0 ? 'destructive' : 'outline'}>
                  {alertStats.failedJobs}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Batchs vides (7j)</span>
                <Badge variant={alertStats.emptyBatches > 0 ? 'secondary' : 'outline'}>
                  {alertStats.emptyBatches}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Jobs par jour
            </CardTitle>
            <CardDescription>Derniers 7 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Bar dataKey="jobs" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Annonces ingérées par jour
            </CardTitle>
            <CardDescription>Derniers 7 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ads" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
