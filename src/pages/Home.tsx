import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { PersonalStats } from "@/components/dashboard/PersonalStats";
import { MarketOpportunities } from "@/components/dashboard/MarketOpportunities";
import { RecommendedActions } from "@/components/dashboard/RecommendedActions";

export default function Home() {
  const [userName, setUserName] = useState<string>("Utilisateur");
  const [lastScrapDate, setLastScrapDate] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Données mockées
  const userStats = {
    creditsRemaining: 50,
    planName: "Pro",
    totalScraps: 847,
    watchlistCount: 12,
    estimatedGains: 2450
  };

  const recentActivity = [
    {
      id: 1,
      type: "scrap",
      description: "Scrap fort RTX 4060 – 28 pages scannées",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      type: "credit",
      description: "1 crédit gagné via scrap communautaire",
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      type: "alert",
      description: "Nouvelle alerte : RTX 3070 passée sous 280 €",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      type: "scrap",
      description: "Scrap faible AMD Ryzen – 15 pages scannées",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      type: "credit",
      description: "2 crédits gagnés via contribution",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const performanceData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    scraps: Math.floor(10 + Math.random() * 15 + Math.sin(i / 3) * 5),
    margin: Math.floor(50 + Math.random() * 100),
    credits: Math.floor(1 + Math.random() * 3)
  }));

  const topDeals = [
    {
      id: 1,
      title: "NVIDIA RTX 4080 SUPER - Excellente condition",
      price: 920,
      fairValue: 1150,
      deviationPct: -20,
      city: "Paris (75)",
      condition: "Très bon état",
      category: "GPU"
    },
    {
      id: 2,
      title: "AMD Ryzen 9 7950X - Neuf, jamais utilisé",
      price: 480,
      fairValue: 590,
      deviationPct: -18.6,
      city: "Lyon (69)",
      condition: "Neuf",
      category: "CPU"
    },
    {
      id: 3,
      title: "RTX 4070 Ti ASUS TUF - Garantie 2 ans restante",
      price: 620,
      fairValue: 750,
      deviationPct: -17.3,
      city: "Marseille (13)",
      condition: "Bon état",
      category: "GPU"
    },
    {
      id: 4,
      title: "Intel Core i7-13700K - Comme neuf",
      price: 340,
      fairValue: 410,
      deviationPct: -17.1,
      city: "Toulouse (31)",
      condition: "Très bon état",
      category: "CPU"
    },
    {
      id: 5,
      title: "AMD RX 7900 XTX Sapphire Nitro+",
      price: 780,
      fairValue: 920,
      deviationPct: -15.2,
      city: "Bordeaux (33)",
      condition: "Bon état",
      category: "GPU"
    },
    {
      id: 6,
      title: "RTX 4060 Ti MSI Gaming X",
      price: 280,
      fairValue: 380,
      deviationPct: -26.3,
      city: "Nantes (44)",
      condition: "Très bon état",
      category: "GPU"
    }
  ];

  const risingTrends = [
    { name: "RTX 4090", change: 12.5, category: "GPU" },
    { name: "Ryzen 9 7950X3D", change: 8.3, category: "CPU" },
    { name: "DDR5 6000MHz", change: 6.7, category: "RAM" }
  ];

  const fallingTrends = [
    { name: "RTX 3060 Ti", change: -15.2, category: "GPU" },
    { name: "Intel i5-12400F", change: -11.8, category: "CPU" },
    { name: "Samsung 980 Pro", change: -9.4, category: "SSD" }
  ];

  const watchlistItems = [
    { name: "RTX 4070", category: "GPU" },
    { name: "Ryzen 7 7800X3D", category: "CPU" }
  ];

  const alerts = [
    { message: "RTX 3060 Ti sous 250 € en Auvergne-Rhône-Alpes", type: "price" },
    { message: "Nouveau stock disponible : DDR5 32GB", type: "stock" }
  ];

  const trainingProgress = {
    completed: 4,
    total: 6,
    lastModule: "Analyse des tendances GPU"
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Charger le profil utilisateur
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      if (profile?.display_name) {
        setUserName(profile.display_name);
      }

      // Charger le dernier scrap
      const { data: lastJob } = await supabase
        .from("jobs")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lastJob) {
        setLastScrapDate(lastJob.created_at);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen">
      {/* Header de bienvenue */}
      <WelcomeHeader
        userName={userName}
        lastScrapDate={lastScrapDate}
        planName={userStats.planName}
        creditsRemaining={userStats.creditsRemaining}
      />

      {/* Vue globale personnelle */}
      <PersonalStats
        totalScraps={userStats.totalScraps}
        creditsRemaining={userStats.creditsRemaining}
        watchlistCount={userStats.watchlistCount}
        estimatedGains={userStats.estimatedGains}
        recentActivity={recentActivity}
        performanceData={performanceData}
      />

      {/* Opportunités & Marché */}
      <MarketOpportunities
        topDeals={topDeals}
        risingTrends={risingTrends}
        fallingTrends={fallingTrends}
        dailyVolume={1247}
      />

      {/* Actions recommandées */}
      <RecommendedActions
        watchlistItems={watchlistItems}
        alerts={alerts}
        trainingProgress={trainingProgress}
        userRank={245}
        userPercentile={10}
      />
    </div>
  );
}
