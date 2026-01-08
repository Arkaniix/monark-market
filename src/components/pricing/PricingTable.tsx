import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Award, Rocket, Info, RefreshCw, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMockSubscription } from "@/hooks/useMockSubscription";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { PlanType } from "@/hooks/useEntitlements";

// Plan configuration matching useEntitlements
export interface PlanConfig {
  id: string;
  name: string;
  displayName: string;
  price: number;
  creditsPerMonth: number;
  description: string;
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export const PLANS: PlanConfig[] = [
  {
    id: "starter",
    name: "Starter",
    displayName: "Starter",
    price: 9.99,
    creditsPerMonth: 120,
    description: "Pour découvrir le marché",
    icon: Zap,
  },
  {
    id: "pro",
    name: "Pro",
    displayName: "Pro",
    price: 29,
    creditsPerMonth: 500,
    description: "Pour les revendeurs actifs",
    popular: true,
    icon: Award,
  },
  {
    id: "elite",
    name: "Elite",
    displayName: "Élite",
    price: 79,
    creditsPerMonth: 1500,
    description: "Pour les professionnels",
    icon: Rocket,
  },
];

export interface PlanFeature {
  name: string;
  tooltip?: string;
  starter: string | boolean | number;
  pro: string | boolean | number;
  elite: string | boolean | number;
}

export const PLAN_FEATURES: PlanFeature[] = [
  {
    name: "Crédits mensuels",
    tooltip: "Crédits remis à zéro chaque mois (non cumulables)",
    starter: "120",
    pro: "500",
    elite: "1500",
  },
  {
    name: "Accès base annonces",
    tooltip: "Consultez toutes les annonces scannées et leurs détails",
    starter: true,
    pro: true,
    elite: true,
  },
  {
    name: "Accès catalogue composants",
    tooltip: "Explorez la base de données des composants hardware",
    starter: true,
    pro: true,
    elite: true,
  },
  {
    name: "Scan rapide",
    tooltip: "Analyse rapide des premières pages (5 crédits)",
    starter: true,
    pro: true,
    elite: true,
  },
  {
    name: "Accès communauté",
    tooltip: "Participer à la collecte communautaire pour gagner des crédits",
    starter: true,
    pro: true,
    elite: true,
  },
  {
    name: "Estimator - Synthèse & Indicateurs",
    tooltip: "Voir le verdict global, prix médian et variation",
    starter: true,
    pro: true,
    elite: true,
  },
  {
    name: "Alertes actives",
    tooltip: "Nombre d'alertes pouvant être actives simultanément",
    starter: "3",
    pro: "20",
    elite: "500",
  },
  {
    name: "Scan approfondi",
    tooltip: "Analyse complète avec plus de données (20 crédits)",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Formation complète",
    tooltip: "Accès à tous les modules de formation",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Tendances avancées",
    tooltip: "Accès aux statistiques et tendances du marché",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Estimator - Analyse & Recommandation",
    tooltip: "Analyse interprétée, risques, et bloc décision final",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Estimator - Prix achat/revente",
    tooltip: "Voir les prix d'achat et revente conseillés avec marge",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Estimator - Graphiques interactifs",
    tooltip: "Graphiques 30j/90j complets et interactifs",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Estimator - Scénarios comparatifs",
    tooltip: "Comparaison prudent/équilibré/agressif",
    starter: false,
    pro: false,
    elite: true,
  },
  {
    name: "Estimator - Négociation & Plateformes",
    tooltip: "Prix cibles et probabilités par plateforme",
    starter: false,
    pro: false,
    elite: true,
  },
  {
    name: "Historique étendu",
    tooltip: "Accès à l'historique complet des prix",
    starter: false,
    pro: false,
    elite: true,
  },
  {
    name: "Export de données",
    tooltip: "Télécharger vos données en CSV/Excel",
    starter: false,
    pro: false,
    elite: true,
  },
  {
    name: "Priorité d'analyse",
    tooltip: "Vos scans sont traités en priorité",
    starter: false,
    pro: false,
    elite: true,
  },
];

interface PricingTableProps {
  currentPlan?: string;
  showCTA?: boolean;
  variant?: "cards" | "table" | "both";
  className?: string;
  onPlanChange?: (planId: PlanType) => Promise<void>;
}

export function PricingTable({ 
  currentPlan, 
  showCTA = true, 
  variant = "both",
  className,
  onPlanChange,
}: PricingTableProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Non-cumulative credits warning */}
      <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/50 border max-w-2xl mx-auto">
        <RefreshCw className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="text-center">
          <p className="font-medium">Crédits non cumulables</p>
          <p className="text-sm text-muted-foreground">
            Les crédits sont remis à zéro chaque mois. Les crédits non utilisés ne sont pas reportés.
          </p>
        </div>
      </div>

      {(variant === "cards" || variant === "both") && (
        <PricingCards currentPlan={currentPlan} showCTA={showCTA} onPlanChange={onPlanChange} />
      )}
      
      {(variant === "table" || variant === "both") && (
        <PricingComparisonTable currentPlan={currentPlan} />
      )}
    </div>
  );
}

function PricingCards({ 
  currentPlan, 
  showCTA,
  onPlanChange,
}: { 
  currentPlan?: string; 
  showCTA: boolean;
  onPlanChange?: (planId: PlanType) => Promise<void>;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { changePlan, isChangingPlan, plan: activePlan } = useMockSubscription();
  
  const effectiveCurrentPlan = currentPlan || activePlan;

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      // Not logged in, redirect to auth
      navigate("/auth");
      return;
    }
    
    if (planId === effectiveCurrentPlan) {
      return;
    }

    try {
      if (onPlanChange) {
        await onPlanChange(planId as PlanType);
      } else {
        await changePlan(planId as PlanType);
      }
      
      const planName = PLANS.find(p => p.id === planId)?.displayName || planId;
      toast({
        title: "Plan modifié",
        description: `Votre abonnement est maintenant ${planName}.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de changer de plan. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {PLANS.map((plan) => {
        const isCurrentPlan = effectiveCurrentPlan === plan.id;
        const PlanIcon = plan.icon;
        
        return (
          <Card 
            key={plan.id}
            className={cn(
              "relative flex flex-col transition-all hover:shadow-lg",
              plan.popular && "border-primary border-2 shadow-md",
              isCurrentPlan && "ring-2 ring-primary/50"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4">
                  Populaire
                </Badge>
              </div>
            )}
            
            {isCurrentPlan && (
              <div className="absolute -top-3 right-4">
                <Badge variant="secondary">
                  Votre plan
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10 w-fit">
                <PlanIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.creditsPerMonth} crédits/mois
                </p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {getHighlightedFeatures(plan.id).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {showCTA && (
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isCurrentPlan || isChangingPlan}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {isChangingPlan ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changement...
                    </>
                  ) : isCurrentPlan ? (
                    <span>Plan actuel</span>
                  ) : user ? (
                    <span>Choisir ce plan</span>
                  ) : (
                    <span>Commencer</span>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PricingComparisonTable({ currentPlan }: { currentPlan?: string }) {
  const { plan: activePlan } = useMockSubscription();
  const effectiveCurrentPlan = currentPlan || activePlan;

  return (
    <div className="overflow-x-auto">
      <table className="w-full max-w-5xl mx-auto border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 border-b bg-muted/30 rounded-tl-lg">
              <span className="font-semibold">Fonctionnalités</span>
            </th>
            {PLANS.map((plan) => (
              <th 
                key={plan.id} 
                className={cn(
                  "p-4 border-b text-center min-w-[140px]",
                  plan.popular && "bg-primary/5",
                  plan.id === "elite" && "rounded-tr-lg"
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold text-lg">{plan.displayName}</span>
                  <span className="text-2xl font-bold">{plan.price}€</span>
                  <span className="text-xs text-muted-foreground">/mois</span>
                  {effectiveCurrentPlan === plan.id && (
                    <Badge variant="secondary" className="mt-1 text-xs">Actuel</Badge>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PLAN_FEATURES.map((feature, idx) => (
            <tr 
              key={idx} 
              className={cn(
                "border-b border-border/50 hover:bg-muted/30 transition-colors",
                idx === PLAN_FEATURES.length - 1 && "border-b-0"
              )}
            >
              <td className="p-4 font-medium">
                <div className="flex items-center gap-2">
                  <span>{feature.name}</span>
                  {feature.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{feature.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </td>
              <td className="p-4 text-center">
                <FeatureValue value={feature.starter} />
              </td>
              <td className={cn("p-4 text-center", "bg-primary/5")}>
                <FeatureValue value={feature.pro} highlight />
              </td>
              <td className="p-4 text-center">
                <FeatureValue value={feature.elite} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureValue({ value, highlight }: { value: string | boolean | number; highlight?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 mx-auto text-green-500" />
    ) : (
      <X className="h-5 w-5 mx-auto text-muted-foreground/50" />
    );
  }
  
  return (
    <span className="font-medium text-foreground">
      {value}
    </span>
  );
}

function getHighlightedFeatures(planId: string): string[] {
  switch (planId) {
    case "starter":
      return [
        "120 crédits/mois",
        "Accès base annonces",
        "Accès catalogue composants",
        "3 alertes actives",
        "Scan rapide (5 cr)",
        "Estimator : Synthèse & Indicateurs",
        "Accès communauté",
      ];
    case "pro":
      return [
        "500 crédits/mois",
        "20 alertes actives",
        "Scan approfondi (20 cr)",
        "Estimator : Analyse complète",
        "Prix achat/revente & marge",
        "Graphiques interactifs",
        "Formation complète",
      ];
    case "elite":
      return [
        "1500 crédits/mois",
        "500 alertes actives",
        "Scénarios comparatifs",
        "Négociation & Plateformes",
        "Historique étendu",
        "Export des données",
        "Priorité d'analyse",
      ];
    default:
      return [];
  }
}

// Standalone pricing page component
export function PricingSection({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <div className="py-12">
      {showHeader && (
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            Tarifs
          </Badge>
          <h2 className="text-3xl font-bold mb-4">
            Choisissez le plan qui vous convient
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tous les plans incluent la formation complète et l'accès à la communauté
          </p>
        </div>
      )}
      
      <PricingTable showCTA={true} variant="both" />
    </div>
  );
}
