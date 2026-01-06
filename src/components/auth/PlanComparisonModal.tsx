import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanComparisonModalProps {
  trigger: React.ReactNode;
  selectedPlan: string;
  onSelectPlan: (planId: string) => void;
}

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "9,99€",
    recommended: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "29€",
    recommended: true,
  },
  {
    id: "elite",
    name: "Élite",
    price: "79€",
    recommended: false,
  },
];

const FEATURES = [
  {
    name: "Crédits / mois",
    starter: "120",
    pro: "500",
    elite: "1 500",
  },
  {
    name: "Alertes actives",
    starter: "3",
    pro: "20",
    elite: "500",
  },
  {
    name: "Base annonces + Catalogue",
    starter: true,
    pro: true,
    elite: true,
  },
  {
    name: "Estimator (prix achat/revente)",
    starter: "Basique",
    pro: true,
    elite: true,
  },
  {
    name: "Scrap avancé (fort)",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Formation complète",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Export données",
    starter: false,
    pro: false,
    elite: true,
  },
  {
    name: "Support prioritaire",
    starter: false,
    pro: false,
    elite: true,
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-primary mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
}

export function PlanComparisonModal({
  trigger,
  selectedPlan,
  onSelectPlan,
}: PlanComparisonModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Comparer les plans</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Header row with plan names */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-sm font-medium text-muted-foreground flex items-center">
              <Info className="h-4 w-4 mr-1.5" />
              Fonctionnalités
            </div>
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "text-center p-3 rounded-lg border-2 transition-all",
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent"
                )}
              >
                <div className="relative">
                  {plan.recommended && (
                    <Badge className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0">
                      Recommandé
                    </Badge>
                  )}
                  <div className="font-semibold">{plan.name}</div>
                  <div className="text-lg font-bold text-primary">
                    {plan.price}
                    <span className="text-xs font-normal text-muted-foreground">
                      /mois
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature rows */}
          <div className="space-y-1">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.name}
                className={cn(
                  "grid grid-cols-4 gap-2 py-3 px-2 rounded-lg",
                  index % 2 === 0 ? "bg-muted/30" : ""
                )}
              >
                <div className="text-sm text-muted-foreground flex items-center">
                  {feature.name}
                </div>
                <div className="text-center">
                  <FeatureValue value={feature.starter} />
                </div>
                <div className="text-center">
                  <FeatureValue value={feature.pro} />
                </div>
                <div className="text-center">
                  <FeatureValue value={feature.elite} />
                </div>
              </div>
            ))}
          </div>

          {/* Selection buttons */}
          <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t">
            <div />
            {PLANS.map((plan) => (
              <Button
                key={plan.id}
                variant={selectedPlan === plan.id ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectPlan(plan.id)}
                className="w-full"
              >
                {selectedPlan === plan.id ? "Sélectionné" : "Choisir"}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
