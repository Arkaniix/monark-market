import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, Crown, Building2, Calendar, Bell, Eye, 
  ArrowUpRight, RefreshCw, AlertTriangle, Info 
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useEntitlements, CREDIT_COSTS, type CreditActionType } from "@/hooks/useEntitlements";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CREDIT_RESET_EXPLANATION = 
  "Les crédits sont remis à zéro à chaque nouveau cycle mensuel. " +
  "Les crédits non utilisés ne sont pas reportés au mois suivant.";

interface AccountSummaryProps {
  onLaunchScrap?: () => void;
}

export function AccountSummary({ onLaunchScrap }: AccountSummaryProps) {
  const { 
    plan, 
    planDisplayName, 
    creditsRemaining, 
    creditsResetDate, 
    currentAlerts,
    currentWatchlistItems,
    limits,
    isLoading 
  } = useEntitlements();

  // Calculate credit percentage based on plan credits
  // Starter: 120, Pro: 500, Elite: 1500
  const maxCreditsForPlan = plan === "starter" ? 120 : plan === "pro" ? 500 : 1500;
  const creditPercentage = Math.min((creditsRemaining / maxCreditsForPlan) * 100, 100);
  const isCreditsLow = creditPercentage < 20;

  // Calculate reset info
  const resetDate = creditsResetDate ? new Date(creditsResetDate) : null;
  const daysUntilReset = resetDate ? differenceInDays(resetDate, new Date()) : null;
  const isResetSoon = daysUntilReset !== null && daysUntilReset <= 7 && daysUntilReset >= 0;

  // Alerts usage
  const alertsPercentage = limits.maxAlerts === -1 
    ? 0 
    : Math.min((currentAlerts / limits.maxAlerts) * 100, 100);
  const isAlertsNearLimit = limits.maxAlerts !== -1 && currentAlerts >= limits.maxAlerts * 0.8;

  // Watchlist usage
  const watchlistPercentage = limits.maxWatchlistItems === -1 
    ? 0 
    : Math.min((currentWatchlistItems / limits.maxWatchlistItems) * 100, 100);

  const getPlanIcon = () => {
    switch (plan) {
      case "starter": return <Zap className="h-5 w-5" />;
      case "pro": return <Crown className="h-5 w-5" />;
      case "elite": return <Building2 className="h-5 w-5" />;
    }
  };

  const getPlanColor = () => {
    switch (plan) {
      case "starter": return "bg-muted text-muted-foreground";
      case "pro": return "bg-primary text-primary-foreground";
      case "elite": return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
    }
  };

  // Action costs for display
  const actionCosts: { action: CreditActionType; label: string; cost: number }[] = [
    { action: "analysis_quick", label: "Analyse rapide", cost: CREDIT_COSTS.analysis_quick },
    { action: "analysis_deep", label: "Analyse approfondie", cost: CREDIT_COSTS.analysis_deep },
    { action: "estimator", label: "Estimation", cost: CREDIT_COSTS.estimator },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-4" />
              <div className="h-2 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Plan & Credits Header */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Plan Card */}
          <Card className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${getPlanColor()}`} />
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                {getPlanIcon()}
                Plan actuel
              </CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                {planDisplayName}
                <Badge variant="outline" className={getPlanColor()}>
                  Actif
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {plan === "starter" && "Accès aux fonctionnalités essentielles"}
                {plan === "pro" && "Scrap avancé, exports et statistiques"}
                {plan === "elite" && "Accès complet et illimité"}
              </p>
              {plan !== "elite" && (
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <Link to="/pricing">
                    <ArrowUpRight className="h-4 w-4" />
                    Passer au plan supérieur
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Credits Card */}
          <Card className={isCreditsLow ? "border-warning/50" : ""}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Crédits restants
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{CREDIT_RESET_EXPLANATION}</p>
                  </TooltipContent>
                </Tooltip>
              </CardDescription>
              <CardTitle className="text-3xl flex items-baseline gap-2">
                {creditsRemaining}
                <span className="text-lg text-muted-foreground font-normal">
                  / {maxCreditsForPlan}
                </span>
                {isCreditsLow && (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress 
                value={creditPercentage} 
                className={`h-2 ${isCreditsLow ? "[&>div]:bg-warning" : ""}`}
              />
              
              {/* Reset Date */}
              {resetDate && (
                <div className={`flex items-center gap-2 text-sm ${isResetSoon ? "text-warning" : "text-muted-foreground"}`}>
                  <RefreshCw className="h-4 w-4" />
                  <span>
                    Réinitialisation le {format(resetDate, "dd MMMM", { locale: fr })}
                    {daysUntilReset !== null && (
                      <span className="ml-1">
                        ({daysUntilReset === 0 ? "aujourd'hui" : `dans ${daysUntilReset} jour${daysUntilReset > 1 ? "s" : ""}`})
                      </span>
                    )}
                  </span>
                </div>
              )}

              {isResetSoon && creditsRemaining > 0 && (
                <p className="text-xs text-warning">
                  ⚠️ {creditsRemaining} crédit{creditsRemaining > 1 ? "s" : ""} sera{creditsRemaining > 1 ? "ont" : ""} perdu{creditsRemaining > 1 ? "s" : ""} après la réinitialisation
                </p>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2"
                asChild
              >
                <Link to="/billing">
                  <Zap className="h-4 w-4" />
                  Recharger des crédits
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Alerts Card */}
          <Card className={isAlertsNearLimit ? "border-warning/50" : ""}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Alertes actives
              </CardDescription>
              <CardTitle className="text-3xl flex items-baseline gap-2">
                {currentAlerts}
                <span className="text-lg text-muted-foreground font-normal">
                  / {limits.maxAlerts === -1 ? "∞" : limits.maxAlerts}
                </span>
                {isAlertsNearLimit && (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {limits.maxAlerts !== -1 && (
                <Progress 
                  value={alertsPercentage} 
                  className={`h-2 ${isAlertsNearLimit ? "[&>div]:bg-warning" : ""}`}
                />
              )}
              
              {/* Watchlist info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  Watchlist
                </span>
                <span>
                  {currentWatchlistItems} / {limits.maxWatchlistItems === -1 ? "∞" : limits.maxWatchlistItems}
                </span>
              </div>
              
              {limits.maxWatchlistItems !== -1 && (
                <Progress value={watchlistPercentage} className="h-1" />
              )}

              {isAlertsNearLimit && plan !== "elite" && (
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <Link to="/pricing">
                    <ArrowUpRight className="h-4 w-4" />
                    Plus d'alertes
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Credit Costs Reference */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Coût des actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {actionCosts.map(({ action, label, cost }) => (
                <div 
                  key={action} 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50"
                >
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <Badge variant="secondary" className="font-mono">
                    {cost} crédit{cost > 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {onLaunchScrap && (
            <Button onClick={onLaunchScrap} className="gap-2">
              <Zap className="h-4 w-4" />
              Lancer un scrap
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to="/my-account?tab=watchlist" className="gap-2">
              <Eye className="h-4 w-4" />
              Gérer ma watchlist
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/my-account?tab=notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Voir les notifications
            </Link>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
