import { useDashboard, useTrends } from "@/hooks/useProviderData";
import { useAuth } from "@/context/AuthContext";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { PersonalStats } from "@/components/dashboard/PersonalStats";
import { MarketOpportunities } from "@/components/dashboard/MarketOpportunities";
import { MarketTrends } from "@/components/dashboard/MarketTrends";
import { RecommendedActions } from "@/components/dashboard/RecommendedActions";
import { NotificationsWidget } from "@/components/dashboard/NotificationsWidget";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const { data: trendsData, isLoading: trendsLoading } = useTrends("30");

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

  const userName = data?.user?.display_name || user?.display_name || "Utilisateur";
  const lastAnalysisDate = data?.last_scrap_date || undefined;

  const userStats = {
    creditsRemaining: data?.stats?.credits_remaining ?? 0,
    creditsResetDate: data?.stats?.credits_reset_date ?? null,
    planName: data?.stats?.plan_name ?? "Free",
    totalAnalyses: data?.stats?.total_scraps ?? 0,
    averageScore: (data?.stats as any)?.average_score ?? 6.4,
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

  const risingTrends = data?.trends?.rising ?? [];
  const fallingTrends = data?.trends?.falling ?? [];
  const dailyVolume = data?.market?.daily_volume ?? 0;

  const recentAnalyses = (data?.top_deals ?? []).slice(0, 6).map((deal) => ({
    id: deal.id,
    title: deal.title,
    score: Math.min(10, Math.max(0, Math.round((1 + (deal.deviation_pct || 0) / 100) * 10) / 1)),
    verdict: (deal.deviation_pct || 0) < -10 ? "Bonne affaire" : (deal.deviation_pct || 0) > 5 ? "Au-dessus du marché" : "Prix correct",
    date: "Récemment",
  }));

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
      <WelcomeModal />

      <WelcomeHeader
        userName={userName}
        lastAnalysisDate={lastAnalysisDate}
        planName={userStats.planName}
        creditsRemaining={userStats.creditsRemaining}
      />

      <NotificationsWidget />

      <PersonalStats
        totalAnalyses={userStats.totalAnalyses}
        averageScore={userStats.averageScore}
        creditsRemaining={userStats.creditsRemaining}
        creditsResetDate={userStats.creditsResetDate}
        opportunitiesDetected={recentAnalyses.length}
        alertsTriggered={alerts.length}
        potentialSavings={userStats.estimatedGains}
        recentActivity={recentActivity}
        performanceData={performanceData}
      />

      <MarketTrends data={trendsData} isLoading={trendsLoading} />

      <MarketOpportunities
        risingTrends={risingTrends}
        fallingTrends={fallingTrends}
        dailyVolume={dailyVolume}
        recentAnalyses={recentAnalyses}
      />

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
