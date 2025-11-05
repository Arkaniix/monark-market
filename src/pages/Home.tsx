import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Search,
  Target,
  BarChart3,
  CreditCard,
  Flame,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Award,
  Filter,
  Star,
  Package,
  Cpu,
  Activity,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

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
  deviation_pct: number;
  city: string;
  condition: string | undefined;
  category: string;
  published_at: string;
}

export default function Home() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [topDeals, setTopDeals] = useState<TopDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const { toast } = useToast();

  // Données mockées pour les graphiques de tendances
  const trendData = {
    gpu: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      price: 450 + Math.sin(i / 3) * 50 + Math.random() * 20,
    })),
    cpu: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      price: 280 + Math.cos(i / 4) * 30 + Math.random() * 15,
    })),
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedCategory, selectedFilter]);

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

      // Utiliser des données factices si pas d'abonnement
      const mockStats = {
        creditsRemaining: 50,
        planName: "Basic",
        jobsToday: 2,
        commJobsToday: 1,
        totalContributions: 8,
        creditsEarned: 15,
      };

      setUserStats({
        creditsRemaining: subscription?.credits_remaining ?? mockStats.creditsRemaining,
        planName: subscription?.subscription_plans?.name || mockStats.planName,
        jobsToday: dailyLimits?.jobs_used ?? mockStats.jobsToday,
        commJobsToday: dailyLimits?.comm_jobs_used ?? mockStats.commJobsToday,
        totalContributions: contributions?.length ?? mockStats.totalContributions,
        creditsEarned: contributions?.reduce((sum, c) => sum + (c.credits_earned || 0), 0) ?? mockStats.creditsEarned,
      });

      // Charger les jobs récents
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, keyword, status, created_at, pages_scanned, ads_found")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Données factices pour les jobs si vide
      const mockJobs: RecentJob[] = [
        {
          id: 1,
          keyword: "RTX 4090",
          status: "completed",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          pages_scanned: 45,
          ads_found: 23,
        },
        {
          id: 2,
          keyword: "Ryzen 7950X3D",
          status: "completed",
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          pages_scanned: 32,
          ads_found: 18,
        },
        {
          id: 3,
          keyword: "Intel i9-14900K",
          status: "running",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          pages_scanned: 12,
          ads_found: 7,
        },
      ];

      setRecentJobs(jobs && jobs.length > 0 ? jobs : mockJobs);

      // Charger les meilleurs deals avec filtres
      let dealsQuery = supabase
        .from("ads")
        .select(`
          id,
          title,
          ad_prices (price),
          ad_deal_scores (score, fair_value, deviation_pct),
          city,
          published_at,
          condition,
          hardware_models (name, category_id, hardware_categories (name))
        `)
        .eq("status", "active")
        .not("ad_deal_scores", "is", null);

      // Appliquer le filtre de catégorie
      if (selectedCategory !== "all") {
        dealsQuery = dealsQuery.eq("hardware_models.hardware_categories.name", selectedCategory);
      }

      // Appliquer les filtres spéciaux
      if (selectedFilter === "new") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        dealsQuery = dealsQuery.gte("published_at", yesterday.toISOString());
      } else if (selectedFilter === "undervalued") {
        dealsQuery = dealsQuery.lte("ad_deal_scores.deviation_pct", -15);
      }

      const { data: deals } = await dealsQuery
        .order("ad_deal_scores(score)", { ascending: false })
        .limit(6);

      const formattedDeals = deals?.map(deal => ({
        id: deal.id,
        title: deal.title,
        price: deal.ad_prices?.[0]?.price || 0,
        score: deal.ad_deal_scores?.[0]?.score || 0,
        fair_value: deal.ad_deal_scores?.[0]?.fair_value || 0,
        deviation_pct: deal.ad_deal_scores?.[0]?.deviation_pct || 0,
        city: deal.city || "Non spécifié",
        published_at: deal.published_at || new Date().toISOString(),
        condition: deal.condition,
        category: deal.hardware_models?.hardware_categories?.name || "Autre",
      })) || [];

      // Données factices pour les deals si vide
      const mockDeals: TopDeal[] = [
        {
          id: 1,
          title: "NVIDIA RTX 4080 SUPER - Excellente condition",
          price: 920,
          score: 92,
          fair_value: 1150,
          deviation_pct: -20,
          city: "Paris (75)",
          published_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          condition: "très bon état",
          category: "GPU",
        },
        {
          id: 2,
          title: "AMD Ryzen 9 7950X - Neuf, jamais utilisé",
          price: 480,
          score: 88,
          fair_value: 590,
          deviation_pct: -18.6,
          city: "Lyon (69)",
          published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          condition: "neuf",
          category: "CPU",
        },
        {
          id: 3,
          title: "RTX 4070 Ti ASUS TUF - Garantie 2 ans restante",
          price: 620,
          score: 85,
          fair_value: 750,
          deviation_pct: -17.3,
          city: "Marseille (13)",
          published_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
          condition: "bon état",
          category: "GPU",
        },
        {
          id: 4,
          title: "Intel Core i7-13700K - Comme neuf",
          price: 340,
          score: 83,
          fair_value: 410,
          deviation_pct: -17.1,
          city: "Toulouse (31)",
          published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          condition: "très bon état",
          category: "CPU",
        },
        {
          id: 5,
          title: "AMD RX 7900 XTX Sapphire Nitro+",
          price: 780,
          score: 81,
          fair_value: 920,
          deviation_pct: -15.2,
          city: "Bordeaux (33)",
          published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          condition: "bon état",
          category: "GPU",
        },
        {
          id: 6,
          title: "RTX 4060 Ti MSI Gaming X - Pour pièces (ventilateur HS)",
          price: 280,
          score: 78,
          fair_value: 380,
          deviation_pct: -26.3,
          city: "Nantes (44)",
          published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          condition: "pour pièces",
          category: "GPU",
        },
      ];

      setTopDeals(formattedDeals && formattedDeals.length > 0 ? formattedDeals : mockDeals);
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

  const getConditionBadge = (condition: string | undefined) => {
    switch (condition?.toLowerCase()) {
      case "neuf":
        return { label: "Neuf", variant: "default" as const };
      case "très bon état":
      case "bon état":
        return { label: "Bon état", variant: "secondary" as const };
      case "satisfaisant":
        return { label: "Satisfaisant", variant: "outline" as const };
      case "pour pièces":
        return { label: "À réparer", variant: "destructive" as const };
      default:
        return { label: "État non précisé", variant: "outline" as const };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "running":
        return <Clock className="h-4 w-4 text-primary" />;
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
              <p className="text-muted-foreground">
                Vue d'ensemble de votre activité et opportunités du marché
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-base px-4 py-2">
                <Award className="h-4 w-4 mr-2" />
                Plan {userStats?.planName}
              </Badge>
            </div>
          </div>

          {/* Filtres rapides */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtres rapides:</span>
            </div>
            
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList>
                <TabsTrigger value="all" className="text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  Tout
                </TabsTrigger>
                <TabsTrigger value="GPU" className="text-xs">
                  <Cpu className="h-3 w-3 mr-1" />
                  GPU
                </TabsTrigger>
                <TabsTrigger value="CPU" className="text-xs">
                  <Cpu className="h-3 w-3 mr-1" />
                  CPU
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
              <TabsList>
                <TabsTrigger value="all" className="text-xs">Tous</TabsTrigger>
                <TabsTrigger value="new" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Nouveautés &lt;24h
                </TabsTrigger>
                <TabsTrigger value="undervalued" className="text-xs">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Sous-évaluées &gt;15%
                </TabsTrigger>
              </TabsList>
            </Tabs>
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

      {/* Tendances du marché */}
      <section className="py-8 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Tendances du marché</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Évolution prix GPU (30 jours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData.gpu}>
                    <defs>
                      <linearGradient id="colorGpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" hide />
                    <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value.toFixed(0)}€`, 'Prix']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="url(#colorGpu)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Prix médian actuel</p>
                    <p className="text-2xl font-bold text-primary">452€</p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -5.2% vs 30j
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Évolution prix CPU (30 jours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData.cpu}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" hide />
                    <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value.toFixed(0)}€`, 'Prix']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      fill="url(#colorCpu)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Prix médian actuel</p>
                    <p className="text-2xl font-bold text-accent">287€</p>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +2.8% vs 30j
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top deals */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Meilleures opportunités</h2>
              <p className="text-sm text-muted-foreground">
                Deals les plus avantageux actuellement disponibles
              </p>
            </div>
            <Link to="/deals">
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                Voir tout
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
            {topDeals.slice(0, 6).map((deal) => {
              const conditionBadge = getConditionBadge(deal.condition);
              const discount = Math.abs(Math.round(deal.deviation_pct || 0));
              const isHotDeal = discount >= 15;
              
              return (
                <motion.div key={deal.id} variants={itemVariants}>
                  <Link to={`/ad/${deal.id}`}>
                    <Card className="hover:border-primary transition-all hover:shadow-lg group relative overflow-hidden">
                      {isHotDeal && (
                        <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold">
                          HOT DEAL
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {deal.category}
                          </Badge>
                          <Badge variant={conditionBadge.variant} className="text-xs">
                            {conditionBadge.label}
                          </Badge>
                          {discount >= 15 && (
                            <Badge variant="default" className="text-xs gap-1">
                              <TrendingDown className="h-3 w-3" />
                              -{discount}% vs Fair Value
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                          {deal.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Prix actuel</p>
                            <p className="text-2xl font-bold text-primary">{deal.price}€</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-1">Fair Value</p>
                            <p className="text-lg font-semibold line-through text-muted-foreground">
                              {deal.fair_value}€
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{deal.city}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            {new Date(deal.published_at).toLocaleDateString("fr-FR")}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <Badge variant={deal.score > 85 ? "default" : "secondary"} className="gap-1">
                              {deal.score > 85 && <Star className="h-3 w-3 fill-current" />}
                              Score {deal.score}/100
                            </Badge>
                            <span className="text-xs font-medium text-success">
                              Économie: {deal.fair_value - deal.price}€
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
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
