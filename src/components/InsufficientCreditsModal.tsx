import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Crown, Zap, AlertCircle } from "lucide-react";
import type { PlanType } from "@/hooks/useEntitlements";

export type CreditActionType = "scrap_faible" | "scrap_fort" | "estimator" | "alert" | "export";

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: CreditActionType;
  requiredCredits: number;
  currentCredits: number;
  currentPlan: PlanType;
}

const ACTION_LABELS: Record<CreditActionType, string> = {
  scrap_faible: "Scrap léger",
  scrap_fort: "Scrap intensif",
  estimator: "Estimation",
  alert: "Création d'alerte",
  export: "Export de données",
};

const ACTION_ICONS: Record<CreditActionType, typeof Zap> = {
  scrap_faible: Zap,
  scrap_fort: Zap,
  estimator: Coins,
  alert: AlertCircle,
  export: Coins,
};

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  actionType,
  requiredCredits,
  currentCredits,
  currentPlan,
}: InsufficientCreditsModalProps) {
  const ActionIcon = ACTION_ICONS[actionType];
  const deficit = requiredCredits - currentCredits;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10">
            <Coins className="h-8 w-8 text-destructive" />
          </div>
          <DialogTitle className="text-center text-xl">
            Crédits insuffisants
          </DialogTitle>
          <DialogDescription className="text-center">
            Vous n'avez pas assez de crédits pour effectuer cette action.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Action details */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ActionIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{ACTION_LABELS[actionType]}</p>
                <p className="text-sm text-muted-foreground">Action demandée</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {requiredCredits} crédits
            </Badge>
          </div>

          {/* Credits breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground mb-1">Vous avez</p>
              <p className="text-2xl font-bold text-primary">{currentCredits}</p>
              <p className="text-xs text-muted-foreground">crédits</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 text-center">
              <p className="text-sm text-muted-foreground mb-1">Il vous manque</p>
              <p className="text-2xl font-bold text-destructive">{deficit}</p>
              <p className="text-xs text-muted-foreground">crédits</p>
            </div>
          </div>

          {/* Current plan info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Votre plan actuel :{" "}
              <span className="font-medium text-foreground capitalize">{currentPlan}</span>
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {/* Primary CTA - Upgrade */}
          <Button asChild className="w-full gap-2" size="lg">
            <Link to="/account?tab=subscription">
              <Crown className="h-4 w-4" />
              Passer au plan supérieur
            </Link>
          </Button>

          {/* Secondary CTA - Buy credits */}
          <Button asChild variant="outline" className="w-full gap-2">
            <Link to="/account?tab=credits">
              <Coins className="h-4 w-4" />
              Acheter des crédits
            </Link>
          </Button>

          {/* Cancel */}
          <Button variant="ghost" onClick={onClose} className="w-full">
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Compact inline version for embedded use
interface CreditCostBadgeProps {
  cost: number;
  currentCredits: number;
  className?: string;
}

export function CreditCostBadge({ cost, currentCredits, className }: CreditCostBadgeProps) {
  const hasEnough = currentCredits >= cost;

  return (
    <Badge
      variant={hasEnough ? "secondary" : "destructive"}
      className={className}
    >
      <Coins className="h-3 w-3 mr-1" />
      {cost} crédits
      {!hasEnough && (
        <span className="ml-1 text-xs opacity-75">
          (manque {cost - currentCredits})
        </span>
      )}
    </Badge>
  );
}
