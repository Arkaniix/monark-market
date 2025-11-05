import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Zap,
  Search,
  Target,
  BarChart3,
  CreditCard,
  Flame,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface UserStats {
  creditsRemaining: number;
  planName: string;
  jobsToday: number;
  commJobsToday: number;
  totalContributions: number;
  creditsEarned: number;
}

interface RecentJob {
  id: number;
  keyword: string;
  status: string;
  created_at: string;
  pages_scanned: number;
  ads_found: number;
}

interface TopDeal {
  id: number;
  title: string;
  price: number;
  score: number;
  fair_value: number;
  city: string;
  published_at: string;
}

export default function Home() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [topDeals, setTopDeals] = useState<TopDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger les stats utilisateur
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select(`
          credits_remaining,
          subscription_plans (name)
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      const { data: dailyLimits } = await supabase
        .from("user_daily_limits")
        .select("jobs_used, comm_jobs_used")
        .eq("user_id", user.id)
        .eq("date", new Date().toISOString().split('T')[0])
        .single();

      const { data: contributions } = await supabase
        .from("user_contributions")
        .select("id, credits_earned")
        .eq("user_id", user.id);

      setUserStats({
        creditsRemaining: subscription?.credits_remaining || 0,
        planName: subscription?.subscription_plans?.name || "Basic",
        jobsToday: dailyLimits?.jobs_used || 0,
        commJobsToday: dailyLimits?.comm_jobs_used || 0,
        totalContributions: contributions?.length || 0,
        creditsEarned: contributions?.reduce((sum, c) => sum + (c.credits_earned || 0), 0) || 0,
      });

      // Charger les jobs récents
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, keyword, status, created_at, pages_scanned, ads_found")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentJobs(jobs || []);

      // Charger les meilleurs deals
      const { data: deals } = await supabase
        .from("ads")
        .select(`
          id,
          title,
          ad_prices (price),
          ad_deal_scores (score, fair_value),
          city,
          published_at
        `)
        .eq("status", "active")
        .not("ad_deal_scores", "is", null)
        .order("ad_deal_scores(score)", { ascending: false })
        .limit(6);

      const formattedDeals = deals?.map(deal => ({
        id: deal.id,
        title: deal.title,
        price: deal.ad_prices?.[0]?.price || 0,
        score: deal.ad_deal_scores?.[0]?.score || 0,
        fair_value: deal.ad_deal_scores?.[0]?.fair_value || 0,
        city: deal.city || "Non spécifié",
        published_at: deal.published_at || new Date().toISOString(),
      })) || [];

      setTopDeals(formattedDeals);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "running":
        return <Clock className="h-4 w-4 text-primary" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "En attente",
      running: "En cours",
      completed: "Terminé",
      failed: "Échoué",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* En-tête Dashboard */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-8 border-b">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
              <p className="text-muted-foreground">
                Bienvenue ! Voici un aperçu de votre activité
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              Plan {userStats?.planName}
            </Badge>
          </div>
        </div>
      </section>

      {/* Stats principales */}
      <section className="py-8">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-4 gap-6"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      Crédits restants
                    </CardTitle>
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {userStats?.creditsRemaining}
                  </div>
                  <Progress 
                    value={(userStats?.creditsRemaining || 0) / 3} 
                    className="mt-3 h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Renouvellement mensuel
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      Jobs aujourd'hui
                    </CardTitle>
                    <Search className="h-5 w-5 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{userStats?.jobsToday}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {userStats?.commJobsToday} jobs communautaires
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      Contributions
                    </CardTitle>
                    <BarChart3 className="h-5 w-5 text-success" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{userStats?.totalContributions}</div>
                  <p className="text-xs text-success mt-2">
                    +{userStats?.creditsEarned} crédits gagnés
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      Actions rapides
                    </CardTitle>
                    <Zap className="h-5 w-5 text-warning" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/community">
                    <Button variant="outline" size="sm" className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Nouveau scan
                    </Button>
                  </Link>
                  <Link to="/deals">
                    <Button variant="outline" size="sm" className="w-full">
                      <Flame className="h-4 w-4 mr-2" />
                      Voir les deals
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mes jobs récents */}
      <section className="py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Mes scans récents</h2>
              <p className="text-sm text-muted-foreground">
                Historique de vos dernières recherches
              </p>
            </div>
            <Link to="/community">
              <Button variant="outline">Voir tout</Button>
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Aucun scan pour le moment</h3>
                <p className="text-muted-foreground mb-4">
                  Lancez votre premier scan pour commencer à trouver des opportunités
                </p>
                <Link to="/community">
                  <Button>
                    <Zap className="h-4 w-4 mr-2" />
                    Lancer un scan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentJobs.map((job) => (
                <Card key={job.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{job.keyword}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(job.status)}
                          <span className="text-sm text-muted-foreground">
                            {getStatusText(job.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pages scannées</span>
                        <span className="font-medium">{job.pages_scanned}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annonces trouvées</span>
                        <span className="font-medium">{job.ads_found}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground pt-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(job.created_at).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Meilleurs deals */}
      <section className="py-8 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Meilleures opportunités</h2>
              <p className="text-sm text-muted-foreground">
                Les deals les plus intéressants en ce moment
              </p>
            </div>
            <Link to="/deals">
              <Button>
                <Flame className="h-4 w-4 mr-2" />
                Tous les deals
              </Button>
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {topDeals.slice(0, 6).map((deal) => (
              <motion.div key={deal.id} variants={itemVariants}>
                <Link to={`/ad/${deal.id}`}>
                  <Card className="hover:border-primary transition-all hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={deal.score > 85 ? "default" : "secondary"}>
                          {deal.score > 85 && <Flame className="h-3 w-3 mr-1" />}
                          Score: {deal.score}/100
                        </Badge>
                        <span className="text-xl font-bold text-primary">{deal.price}€</span>
                      </div>
                      <CardTitle className="text-base line-clamp-2">{deal.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {deal.city}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(deal.published_at).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="pt-2 flex items-center justify-between border-t">
                          <span className="text-xs text-muted-foreground">
                            Fair Value: {deal.fair_value}€
                          </span>
                          <span className="text-xs font-semibold text-success">
                            -{Math.round(((deal.fair_value - deal.price) / deal.fair_value) * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-12">
        <div className="container">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Prêt à trouver votre prochain deal ?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Lancez un nouveau scan pour découvrir les meilleures opportunités du marché
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/community">
                  <Button size="lg">
                    <Zap className="h-5 w-5 mr-2" />
                    Lancer un scan
                  </Button>
                </Link>
                <Link to="/catalog">
                  <Button size="lg" variant="outline">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Explorer le catalogue
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
