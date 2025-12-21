import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Award, Rocket, Info, RefreshCw, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    price: 0,
    creditsPerMonth: 30,
    description: "Pour découvrir l'outil",
    icon: Zap,
  },
  {
    id: "pro",
    name: "Pro",
    displayName: "Pro",
    price: 19,
    creditsPerMonth: 200,
    description: "Pour les utilisateurs réguliers",
    popular: true,
    icon: Award,
  },
  {
    id: "elite",
    name: "Elite",
    displayName: "Élite",
    price: 49,
    creditsPerMonth: 600,
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
    tooltip: "Crédits remis à zéro chaque mois",
    starter: "30",
    pro: "200",
    elite: "600",
  },
  {
    name: "Alertes actives",
    tooltip: "Nombre d'alertes pouvant être actives simultanément",
    starter: "3",
    pro: "20",
    elite: "500",
  },
  {
    name: "Watchlist",
    tooltip: "Nombre d'éléments dans votre liste de suivi",
    starter: "10",
    pro: "50",
    elite: "200",
  },
  {
    name: "Scrap pages / job",
    tooltip: "Nombre max de pages par scan",
    starter: "10",
    pro: "50",
    elite: "100",
  },
  {
    name: "Jobs / jour",
    tooltip: "Nombre de scans par jour",
    starter: "3",
    pro: "10",
    elite: "Illimité",
  },
  {
    name: "Scrap fort",
    tooltip: "Scan approfondi avec plus de données",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Export de données",
    tooltip: "Télécharger vos données en CSV/Excel",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Stats avancées",
    tooltip: "Accès aux statistiques détaillées du marché",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Estimator - Prix achat/vente",
    tooltip: "Voir les estimations de prix d'achat et de revente",
    starter: false,
    pro: true,
    elite: true,
  },
  {
    name: "Estimator - Scénarios",
    tooltip: "Simuler différents scénarios de revente",
    starter: false,
    pro: false,
    elite: true,
  },
  {
    name: "Support prioritaire",
    tooltip: "Réponse garantie sous 24h",
    starter: false,
    pro: false,
    elite: true,
  },
  {
    name: "Accès API",
    tooltip: "Intégration avec vos propres outils",
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
}

export function PricingTable({ 
  currentPlan, 
  showCTA = true, 
  variant = "both",
  className 
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
        <PricingCards currentPlan={currentPlan} showCTA={showCTA} />
      )}
      
      {(variant === "table" || variant === "both") && (
        <PricingComparisonTable currentPlan={currentPlan} />
      )}
    </div>
  );
}

function PricingCards({ currentPlan, showCTA }: { currentPlan?: string; showCTA: boolean }) {
  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {PLANS.map((plan) => {
        const isCurrentPlan = currentPlan === plan.id;
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
                  disabled={isCurrentPlan}
                  asChild={!isCurrentPlan}
                >
                  {isCurrentPlan ? (
                    <span>Plan actuel</span>
                  ) : (
                    <Link to="/auth">
                      {plan.price === 0 ? "Commencer gratuitement" : "Choisir ce plan"}
                    </Link>
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
                  {currentPlan === plan.id && (
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
      <Check className={cn("h-5 w-5 mx-auto", highlight ? "text-primary" : "text-green-500")} />
    ) : (
      <X className="h-5 w-5 mx-auto text-muted-foreground/50" />
    );
  }
  
  return (
    <span className={cn("font-medium", highlight && "text-primary")}>
      {value}
    </span>
  );
}

function getHighlightedFeatures(planId: string): string[] {
  switch (planId) {
    case "starter":
      return [
        "30 crédits/mois",
        "3 alertes actives",
        "10 éléments watchlist",
        "Estimations basiques",
        "Support par email",
      ];
    case "pro":
      return [
        "200 crédits/mois",
        "20 alertes actives",
        "Scrap fort inclus",
        "Export de données",
        "Stats avancées",
        "Support prioritaire",
      ];
    case "elite":
      return [
        "600 crédits/mois",
        "500 alertes actives",
        "Jobs illimités/jour",
        "Scénarios estimator",
        "Accès API",
        "Support dédié 24/7",
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
