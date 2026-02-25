import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Award, Rocket, Info, RefreshCw, Loader2, Eye } from "lucide-react";
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
    id: "free",
    name: "Free",
    displayName: "Free",
    price: 0,
    creditsPerMonth: 10,
    description: "Découvrir Monark — Market Score & prix médian gratuits",
    icon: Eye,
  },
  {
    id: "standard",
    name: "Standard",
    displayName: "Standard",
    price: 11.99,
    creditsPerMonth: 180,
    description: "Qualifier et décider — acheteurs et revendeurs occasionnels",
    popular: true,
    icon: Zap,
  },
  {
    id: "pro",
    name: "Pro",
    displayName: "Pro",
    price: 22.99,
    creditsPerMonth: 600,
    description: "Flux complet — revendeurs actifs et professionnels",
    icon: Award,
  },
];

export interface PlanFeature {
  name: string;
  tooltip?: string;
  free: string | boolean | number;
  standard: string | boolean | number;
  pro: string | boolean | number;
}

export const PLAN_FEATURES: PlanFeature[] = [
  { name: "Crédits mensuels", free: "10", standard: "180", pro: "600" },
  { name: "Report crédits (rollover)", tooltip: "Les crédits non utilisés sont partiellement reportés au mois suivant", free: false, standard: "40 cr max", pro: "120 cr max" },
  { name: "Market Score (via extension)", tooltip: "Score 0-10 sur chaque annonce consultée avec l'extension", free: "Score seul", standard: true, pro: true },
  { name: "Verdict + valeur marché", tooltip: "Verdict textuel et comparaison prix annonce vs marché", free: false, standard: true, pro: true },
  { name: "Estimator — Prix médian", tooltip: "Valeur médiane du composant sur le marché secondaire", free: true, standard: true, pro: true },
  { name: "Qualifier une annonce (5 cr.)", tooltip: "Analyse inline dans Mes Analyses : médiane, écart, tendance, volume, liquidité", free: false, standard: true, pro: true },
  { name: "Décision complète (20 cr.)", tooltip: "Ouvre l'Estimator avec les données de l'annonce pré-remplies pour un verdict buy/negotiate/wait/pass complet", free: false, standard: true, pro: true },
  { name: "Accès catalogue composants", tooltip: "Base de données de tous les composants référencés", free: true, standard: true, pro: true },
  { name: "Pages détail modèles", free: true, standard: true, pro: true },
  { name: "Alertes prix actives", free: false, standard: "10", pro: "100" },
  { name: "Watchlist", free: false, standard: "15 items", pro: "Illimité" },
  { name: "Mes Analyses (historique unifié)", tooltip: "Toutes vos analyses Lens (Signal, Qualifiées, Décisions) au même endroit", free: "5 dernières", standard: "30 jours", pro: "Illimité" },
  { name: "Collecte passive", tooltip: "Crédits gagnés automatiquement en naviguant avec l'extension. Plafond hebdomadaire anti-farming.", free: "1 cr/annonce — 8 cr/sem", standard: "1 cr/annonce — 30 cr/sem", pro: "2 cr/annonce — 80 cr/sem" },
  { name: "Missions communautaires", tooltip: "Récompenses pour l'enrichissement de la base de données. Multiplicateur selon le plan.", free: "×1 — 15 cr/mois max", standard: "×1.5 — 40 cr/mois max", pro: "×2 — 80 cr/mois max" },
  { name: "Estimator - Synthèse & Indicateurs", free: false, standard: true, pro: true },
  { name: "Estimator - Bloc décision final", free: false, standard: true, pro: true },
  { name: "Estimator - Prix achat/revente", free: false, standard: true, pro: true },
  { name: "Estimator - Graphiques interactifs", free: false, standard: true, pro: true },
  { name: "Introduction plateforme", tooltip: "Module de formation d'introduction", free: true, standard: true, pro: true },
  { name: "Formation avancée achat-revente", free: false, standard: true, pro: true },
  { name: "Tendances marché avancées", free: false, standard: true, pro: true },
  { name: "Estimator - Scénarios comparatifs", free: false, standard: false, pro: true },
  { name: "Estimator - Négociation & Plateformes", free: false, standard: false, pro: true },
  { name: "Export de données", free: false, standard: false, pro: true },
  { name: "Support prioritaire (< 24h)", free: false, standard: false, pro: true },
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
      {/* Launch price banner */}
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm font-medium max-w-xl mx-auto">
        <Zap className="h-4 w-4 flex-shrink-0" />
        <span>Prix de lancement — Monark est en développement actif, les tarifs évolueront. Les membres actuels ne seront jamais les premiers impactés.</span>
      </div>

      {/* Rollover info */}
      <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/50 border max-w-2xl mx-auto">
        <RefreshCw className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="text-center">
          <p className="font-medium">Rollover partiel des crédits</p>
          <p className="text-sm text-muted-foreground">
            Standard : jusqu'à 40 crédits non utilisés reportés au mois suivant. Pro : jusqu'à 120. Free : remise à zéro chaque mois.
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
                  <span className="text-4xl font-bold">{plan.price === 0 ? "Gratuit" : `${plan.price}€`}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/mois</span>}
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
            {PLANS.map((plan, idx) => (
              <th 
                key={plan.id} 
                className={cn(
                  "p-4 border-b text-center min-w-[120px]",
                  plan.popular && "bg-primary/5",
                  idx === PLANS.length - 1 && "rounded-tr-lg"
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-bold text-lg">{plan.displayName}</span>
                  <span className="text-2xl font-bold">{plan.price === 0 ? "0€" : `${plan.price}€`}</span>
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
                <FeatureValue value={feature.free} />
              </td>
              <td className={cn("p-4 text-center", "bg-primary/5")}>
                <FeatureValue value={feature.standard} highlight />
              </td>
              <td className="p-4 text-center">
                <FeatureValue value={feature.pro} />
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
    case "free":
      return [
        "10 crédits/mois",
        "Market Score (Signal) sur chaque annonce",
        "Estimator — prix médian gratuit",
        "Collecte passive : 1 cr/annonce (8 cr/sem max)",
        "Catalogue complet + intro plateforme",
      ];
    case "standard":
      return [
        "180 crédits/mois + rollover 40 cr",
        "Qualifier une annonce — analyse inline (5 cr.)",
        "Décision complète via Estimator (20 cr.)",
        "Collecte passive : 1 cr/annonce (30 cr/sem max)",
        "Missions ×1.5 — jusqu'à 40 cr/mois bonus",
        "Formation complète achat-revente",
      ];
    case "pro":
      return [
        "600 crédits/mois + rollover 120 cr",
        "Tout Standard inclus",
        "Collecte passive : 2 cr/annonce (80 cr/sem max)",
        "Missions ×2 — jusqu'à 80 cr/mois bonus",
        "Scénarios comparatifs + négociation (Estimator)",
        "Support prioritaire + export données",
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
