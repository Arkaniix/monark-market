import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Crown, AlertTriangle } from "lucide-react";
import type { PlanType } from "@/hooks/useEntitlements";

const PLAN_LABELS: Record<PlanType, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  elite: "Élite",
};

const NEXT_PLAN: Record<PlanType, PlanType> = {
  free: "starter",
  starter: "pro",
  pro: "elite",
  elite: "elite",
};

const PLAN_LIMITS: Record<PlanType, number> = {
  free: 0,
  starter: 3,
  pro: 20,
  elite: 500,
};

interface AlertLimitModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan: PlanType;
  activeAlerts: number;
  maxAlerts: number;
}

export function AlertLimitModal({
  open,
  onClose,
  currentPlan,
  activeAlerts,
  maxAlerts,
}: AlertLimitModalProps) {
  const nextPlan = NEXT_PLAN[currentPlan];
  const nextPlanLimit = PLAN_LIMITS[nextPlan];
  const isMaxPlan = currentPlan === "elite";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Limite d'alertes atteinte
          </DialogTitle>
          <DialogDescription>
            Vous avez atteint la limite de votre plan actuel.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Current usage display */}
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Alertes actives</span>
              <span className="font-bold text-lg">
                {activeAlerts} / {maxAlerts}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all" 
                style={{ width: `${Math.min(100, (activeAlerts / maxAlerts) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Plan {PLAN_LABELS[currentPlan]} : maximum {maxAlerts} alertes actives
            </p>
          </div>

          {/* Upgrade benefits */}
          {!isMaxPlan && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                Passez au plan {PLAN_LABELS[nextPlan]} pour bénéficier de :
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span>Jusqu'à <strong>{nextPlanLimit}</strong> alertes actives</span>
                </li>
                {nextPlan === "pro" && (
                  <>
                    <li className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span>Scrap fort pour analyses approfondies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span>Export de données</span>
                    </li>
                  </>
                )}
                {nextPlan === "elite" && (
                  <>
                    <li className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span>Support prioritaire</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span>Accès API</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}

          {isMaxPlan && (
            <p className="text-sm text-muted-foreground">
              Vous êtes sur le plan maximum. Désactivez des alertes existantes pour en activer de nouvelles.
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Gérer mes alertes
          </Button>
          {!isMaxPlan && (
            <Button asChild className="w-full sm:w-auto gap-2">
              <Link to="/account?tab=subscription">
                <Crown className="h-4 w-4" />
                Passer au plan {PLAN_LABELS[nextPlan]}
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
