import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Package, TrendingUp, Database, Activity, CreditCard, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
interface Stats {
  totalUsers: number;
  totalJobs: number;
  totalAds: number;
  activeSubscriptions: number;
  totalCreditsUsed: number;
  recentJobs: any[];
  recentUsers: any[];
}
export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalJobs: 0,
    totalAds: 0,
    activeSubscriptions: 0,
    totalCreditsUsed: 0,
    recentJobs: [],
    recentUsers: []
  });
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    checkAdminStatus();
  }, []);
  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);
  const loadStats = async () => {
    try {
      // Get total users count
      const {
        count: usersCount
      } = await supabase.from('profiles').select('*', {
        count: 'exact',
        head: true
      });

      // Get total jobs count
      const {
        count: jobsCount
      } = await supabase.from('jobs').select('*', {
        count: 'exact',
        head: true
      });

      // Get total ads count
      const {
        count: adsCount
      } = await supabase.from('ads').select('*', {
        count: 'exact',
        head: true
      });

      // Get active subscriptions count
      const {
        count: subsCount
      } = await supabase.from('user_subscriptions').select('*', {
        count: 'exact',
        head: true
      }).eq('status', 'active');

      // Get total credits used from credit_logs
      const {
        data: creditsData
      } = await supabase.from('credit_logs').select('delta');
      const totalCreditsUsed = creditsData?.reduce((sum, log) => sum + Math.abs(log.delta), 0) || 0;

      // Get recent jobs
      const {
        data: recentJobsData
      } = await supabase.from('jobs').select('id, keyword, status, created_at, pages_scanned, ads_found, profiles(display_name)').order('created_at', {
        ascending: false
      }).limit(5);

      // Get recent users
      const {
        data: recentUsersData
      } = await supabase.from('profiles').select('user_id, display_name, created_at').order('created_at', {
        ascending: false
      }).limit(5);
      setStats({
        totalUsers: usersCount || 0,
        totalJobs: jobsCount || 0,
        totalAds: adsCount || 0,
        activeSubscriptions: subsCount || 0,
        totalCreditsUsed,
        recentJobs: recentJobsData || [],
        recentUsers: recentUsersData || []
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    }
  };
  const checkAdminStatus = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const {
        data,
        error
      } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      if (error) throw error;
      if (!data) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions nécessaires",
          variant: "destructive"
        });
        navigate("/");
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>;
  }
  if (!isAdmin) {
    return null;
  }
  return <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">Panneau de contrôle administrateur</p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Comptes créés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Plans actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">Scrapings lancés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces Trouvées</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAds}</div>
            <p className="text-xs text-muted-foreground">Dans la base</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Jobs Récents
          </CardTitle>
          <CardDescription>Les 5 derniers jobs de scraping lancés</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Mot-clé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Annonces</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentJobs.map(job => <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    {job.profiles?.display_name || 'Utilisateur'}
                  </TableCell>
                  <TableCell>{job.keyword}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === 'completed' ? 'default' : job.status === 'running' ? 'secondary' : job.status === 'failed' ? 'destructive' : 'outline'}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{job.pages_scanned || 0}</TableCell>
                  <TableCell>{job.ads_found || 0}</TableCell>
                  <TableCell>
                    {new Date(job.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                </TableRow>)}
              {stats.recentJobs.length === 0 && <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Aucun job trouvé
                  </TableCell>
                </TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Nouveaux Utilisateurs
          </CardTitle>
          <CardDescription>Les 5 dernières inscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Date d'inscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentUsers.map(user => <TableRow key={user.user_id}>
                  <TableCell className="font-medium">
                    {user.display_name || 'Utilisateur sans nom'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                  </TableCell>
                </TableRow>)}
              {stats.recentUsers.length === 0 && <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      
    </div>;
}