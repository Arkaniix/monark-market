import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/context/AuthContext";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { PersonalStats } from "@/components/dashboard/PersonalStats";
import { MarketOpportunities } from "@/components/dashboard/MarketOpportunities";
import { RecommendedActions } from "@/components/dashboard/RecommendedActions";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="container py-12">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              Impossible de charger les données du tableau de bord.
              {error instanceof Error && ` (${error.message})`}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Transform API data for components (with fallbacks for missing data)
  const userName = data?.user?.display_name || user?.display_name || "Utilisateur";
  const lastScrapDate = data?.last_scrap_date || undefined;
  
  const userStats = {
    creditsRemaining: data?.stats?.credits_remaining ?? 0,
    planName: data?.stats?.plan_name ?? "Free",
    totalScraps: data?.stats?.total_scraps ?? 0,
    watchlistCount: data?.stats?.watchlist_count ?? 0,
    estimatedGains: data?.stats?.estimated_gains ?? 0,
  };

  const recentActivity = (data?.recent_activity ?? []).map((item) => ({
    id: item.id,
    type: item.type,
    description: item.description,
    date: item.date,
  }));

  const performanceData = data?.performance_data ?? [];

  const topDeals = (data?.top_deals ?? []).map((deal) => ({
    id: deal.id,
    title: deal.title,
    price: deal.price,
    fairValue: deal.fair_value,
    deviationPct: deal.deviation_pct,
    city: deal.city,
    condition: deal.condition,
    category: deal.category,
  }));

  const risingTrends = data?.trends?.rising ?? [];
  const fallingTrends = data?.trends?.falling ?? [];
  const dailyVolume = data?.market?.daily_volume ?? 0;

  const watchlistItems = data?.watchlist ?? [];
  const alerts = data?.alerts ?? [];

  const trainingProgress = {
    completed: data?.training?.completed ?? 0,
    total: data?.training?.total ?? 6,
    lastModule: data?.training?.last_module ?? "Aucun module commencé",
  };

  const community = data?.community ?? {
    user_rank: 0,
    user_percentile: 100,
    total_contributions: 0,
    credits_earned: 0,
  };

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
        dailyVolume={dailyVolume}
      />

      {/* Actions recommandées */}
      <RecommendedActions
        watchlistItems={watchlistItems}
        alerts={alerts}
        trainingProgress={{
          completed: trainingProgress.completed,
          total: trainingProgress.total,
          lastModule: trainingProgress.lastModule,
        }}
        userRank={community.user_rank}
        userPercentile={community.user_percentile}
      />
    </div>
  );
}
