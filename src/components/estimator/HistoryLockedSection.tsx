import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, RotateCcw, Crown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/hooks/useEntitlements";

const PLAN_LABELS: Record<PlanType, string> = {
  starter: "Starter",
  pro: "Pro",
  elite: "Élite",
};

interface HistoryLockedSectionProps {
  title: string;
  icon?: ReactNode;
  planAtCreation: PlanType;
  currentPlan: PlanType;
  onReEstimate: () => void;
  children?: ReactNode;
  className?: string;
}

/**
 * Component for displaying locked historical data with personalized messaging
 * and a re-estimate button. Used when viewing estimations made with a different plan.
 */
export default function HistoryLockedSection({
  title,
  icon,
  planAtCreation,
  currentPlan,
  onReEstimate,
  children,
  className,
}: HistoryLockedSectionProps) {
  const isDowngrade = planAtCreation === 'elite' && currentPlan !== 'elite' ||
                       planAtCreation === 'pro' && currentPlan === 'starter';
  const isUpgrade = currentPlan === 'elite' && planAtCreation !== 'elite' ||
                    currentPlan === 'pro' && planAtCreation === 'starter';

  return (
    <Card className={cn("border-dashed border-muted-foreground/30 bg-muted/10", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span>{title}</span>
          <Lock className="h-4 w-4 ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center py-4 space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <div className="space-y-2 max-w-md">
            {isDowngrade ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  Données générées avec un plan {PLAN_LABELS[planAtCreation]}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cette section a été générée lorsque vous aviez un plan{" "}
                  <Badge variant="outline" className="mx-1">{PLAN_LABELS[planAtCreation]}</Badge>.
                  Votre plan actuel ({PLAN_LABELS[currentPlan]}) ne permet pas d'accéder à ces données historiques.
                </p>
              </>
            ) : isUpgrade ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  Données non disponibles dans l'estimation d'origine
                </p>
                <p className="text-sm text-muted-foreground">
                  Cette estimation a été faite avec un plan{" "}
                  <Badge variant="outline" className="mx-1">{PLAN_LABELS[planAtCreation]}</Badge>.
                  Vous avez maintenant un plan {PLAN_LABELS[currentPlan]} mais ces données n'ont pas été générées à l'époque.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">
                  Section non incluse dans votre plan
                </p>
                <p className="text-sm text-muted-foreground">
                  Cette donnée nécessite un plan supérieur à {PLAN_LABELS[planAtCreation]}.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={onReEstimate}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Ré-estimer avec mon plan actuel
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/pricing">
                <Crown className="h-4 w-4" />
                Voir les plans
              </Link>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            La ré-estimation coûtera des crédits et fournira des données actualisées selon votre plan {PLAN_LABELS[currentPlan]}.
          </p>
        </div>
        
        {/* Optional blurred preview of children */}
        {children && (
          <div className="pointer-events-none select-none blur-[6px] opacity-30 mt-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============= Helper functions =============

/**
 * Check if a feature is accessible based on plan at creation
 */
export function isFeatureAccessible(
  feature: 'scenarios' | 'whatIf' | 'negotiation' | 'platforms' | 'decision' | 'advancedMarket',
  planAtCreation: PlanType
): boolean {
  const featureMap: Record<string, PlanType[]> = {
    scenarios: ['elite'],
    whatIf: ['elite'],
    negotiation: ['pro', 'elite'],
    platforms: ['pro', 'elite'],
    decision: ['pro', 'elite'],
    advancedMarket: ['pro', 'elite'],
  };

  return featureMap[feature]?.includes(planAtCreation) ?? false;
}

/**
 * Get plan hierarchy level (for comparison)
 */
export function getPlanLevel(plan: PlanType): number {
  const levels: Record<PlanType, number> = { starter: 0, pro: 1, elite: 2 };
  return levels[plan] ?? 0;
}

/**
 * Check if current plan can access historical data from plan at creation
 */
export function canAccessHistoricalData(
  feature: 'scenarios' | 'whatIf' | 'negotiation' | 'platforms' | 'decision' | 'advancedMarket',
  planAtCreation: PlanType,
  _currentPlan: PlanType // Not used for historical access - only planAtCreation matters
): boolean {
  // For historical data, only planAtCreation matters
  // The data was generated with that plan, so it's either there or not
  return isFeatureAccessible(feature, planAtCreation);
}

/**
 * Determine if we should show a locked section for a feature
 * This is true when:
 * 1. The feature requires a higher plan than what was used at creation (data doesn't exist)
 * 2. OR the feature was available at creation but user can't see it (shouldn't happen for history)
 */
export function shouldShowLockedInHistory(
  feature: 'scenarios' | 'whatIf' | 'negotiation' | 'platforms' | 'decision' | 'advancedMarket',
  planAtCreation: PlanType,
  currentPlan: PlanType
): { show: boolean; reason: 'not_generated' | 'accessible' | 'downgraded' } {
  const wasGenerated = isFeatureAccessible(feature, planAtCreation);
  
  if (wasGenerated) {
    // Data exists - always show it (historical access)
    return { show: false, reason: 'accessible' };
  }
  
  // Data wasn't generated - check if current plan would have it
  const wouldHaveWithCurrentPlan = isFeatureAccessible(feature, currentPlan);
  
  if (wouldHaveWithCurrentPlan) {
    // User upgraded but this estimation didn't have the data
    return { show: true, reason: 'not_generated' };
  }
  
  // User doesn't have access with current plan either
  return { show: true, reason: 'not_generated' };
}
