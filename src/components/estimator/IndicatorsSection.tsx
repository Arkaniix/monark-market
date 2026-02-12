// Section indicateurs principaux - Avec interprétations textuelles
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  BarChart3, 
  Target,
  Clock,
  AlertTriangle,
  Info,
  Lock
} from "lucide-react";
import LockedFeatureOverlay from "@/components/LockedFeatureOverlay";
import type { EstimationResultUI } from "@/hooks/useEstimator";
import type { PlanType, EstimatorFeatures } from "@/hooks/useEntitlements";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IndicatorsSectionProps {
  result: EstimationResultUI;
  plan: PlanType;
  limits: EstimatorFeatures;
}

// Helper pour formater les prix
function formatPrice(value: number): string {
  return value.toLocaleString("fr-FR") + " €";
}

// Liquidité label
function getLiquidityLabel(probability: number): { label: string; color: string } {
  if (probability >= 0.7) return { label: "Élevée", color: "text-green-600" };
  if (probability >= 0.4) return { label: "Moyenne", color: "text-amber-600" };
  return { label: "Faible", color: "text-destructive" };
}

// Risk explanation
function getRiskExplanation(riskLevel: string): string {
  switch (riskLevel) {
    case "low":
      return "Faible risque de perte. Le prix demandé est cohérent avec le marché.";
    case "medium":
      return "Risque modéré. La marge est correcte mais le marché peut fluctuer.";
    case "high":
      return "Risque élevé. Prix au-dessus du marché, revente difficile.";
    default:
      return "Évaluation du risque non disponible.";
  }
}

export default function IndicatorsSection({ result, plan, limits }: IndicatorsSectionProps) {
  const liquidity = getLiquidityLabel(result.resell_probability);
  const trendIcon = result.market.trend === "up" ? TrendingUp : result.market.trend === "down" ? TrendingDown : Minus;
  const TrendIcon = trendIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="space-y-6"
    >
      {/* Indicateurs Starter (tous les plans) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Prix médian */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Prix médian du marché</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(result.market.median_price)}</p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Prix moyen observé pour ce modèle dans cet état sur les 30 derniers jours.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              C'est le prix de référence du marché pour ce composant.
            </p>
          </CardContent>
        </Card>

        {/* Variation 30j */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Évolution sur 30 jours</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${result.market.var_30d_pct >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {result.market.var_30d_pct > 0 ? "+" : ""}{result.market.var_30d_pct}%
                  </p>
                  <TrendIcon className={`h-5 w-5 ${result.market.var_30d_pct >= 0 ? "text-green-600" : "text-destructive"}`} />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {result.market.var_30d_pct > 3 
                ? "Prix en hausse, moment favorable pour vendre."
                : result.market.var_30d_pct < -3
                ? "Prix en baisse, attendez ou négociez à la baisse."
                : "Marché stable, prix cohérents avec la tendance."
              }
            </p>
          </CardContent>
        </Card>

        {/* Volume */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Annonces actives</p>
                <p className="text-2xl font-bold">{result.market.volume_active}</p>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {result.market.volume_active > 300 
                ? "Marché très actif, forte concurrence entre vendeurs."
                : result.market.volume_active > 100
                ? "Activité normale, demande régulière."
                : "Peu d'offres, peut être plus difficile à trouver."
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Indicateurs Pro (prix conseillés) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Prix recommandés pour l'achat-revente
            {plan === "standard" && (
              <Badge variant="outline" className="ml-2 gap-1 text-xs">
                <Lock className="h-3 w-3" /> Pro
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            isLocked={!limits.canSeeBuyPrice}
            requiredPlan="pro"
            featureName="Prix conseillés"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Prix d'achat conseillé */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Prix d'achat conseillé</span>
                </div>
                <p className="text-2xl font-bold text-accent">{formatPrice(result.buy_price_recommended)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Acheter au-dessus de ce prix réduit fortement la marge potentielle.
                </p>
                {result.buy_price_input > result.buy_price_recommended && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Votre prix ({formatPrice(result.buy_price_input)}) dépasse le conseillé</span>
                  </div>
                )}
              </div>

              {/* Prix de revente estimé */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Prix de revente (30j)</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatPrice(result.sell_price_1m)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Prix moyen observé après un délai de revente standard.
                </p>
              </div>

              {/* Marge estimée */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Marge estimée</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold ${result.margin_pct >= 10 ? "text-green-600" : result.margin_pct >= 0 ? "text-amber-600" : "text-destructive"}`}>
                    {result.margin_pct > 0 ? "+" : ""}{result.margin_pct}%
                  </p>
                  <span className="text-sm text-muted-foreground">
                    ({result.margin_pct > 0 ? "+" : ""}{Math.round((result.sell_price_1m - result.buy_price_input))} €)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {result.margin_pct >= 15 
                    ? "Excellente marge pour l'achat-revente."
                    : result.margin_pct >= 8
                    ? "Marge correcte, opération rentable."
                    : result.margin_pct >= 0
                    ? "Marge faible, attention aux frais cachés."
                    : "Marge négative, vous perdrez de l'argent."
                  }
                </p>
              </div>
            </div>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>

      {/* Probabilité & Liquidité - Pro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Probabilité de revente */}
        <Card>
          <CardContent className="pt-6">
            <LockedFeatureOverlay
              isLocked={!limits.canSeeProbability}
              requiredPlan="pro"
              featureName="Probabilité de revente"
              variant="inline"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Probabilité de revente</span>
                  <Badge variant={result.resell_probability >= 0.6 ? "default" : "secondary"}>
                    {result.resell_probability >= 0.7 ? "Élevée" : result.resell_probability >= 0.4 ? "Moyenne" : "Faible"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {result.resell_probability >= 0.7 
                    ? `Environ ${Math.round(result.resell_probability * 10)} annonces sur 10 se revendent dans un délai raisonnable.`
                    : result.resell_probability >= 0.4
                    ? `Environ ${Math.round(result.resell_probability * 10)} annonces sur 10 trouvent preneur sous 30 jours.`
                    : "Ce type de produit se vend lentement. Prévoyez un délai plus long."
                  }
                </p>
                <Progress 
                  value={result.resell_probability * 100} 
                  className="h-2"
                />
              </div>
            </LockedFeatureOverlay>
          </CardContent>
        </Card>

        {/* Liquidité */}
        <Card>
          <CardContent className="pt-6">
            <LockedFeatureOverlay
              isLocked={!limits.canSeeProbability}
              requiredPlan="pro"
              featureName="Indicateur de liquidité"
              variant="inline"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Liquidité du marché</span>
                  <span className={`font-semibold ${liquidity.color}`}>{liquidity.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {liquidity.label === "Élevée"
                    ? "Marché dynamique avec rotation rapide. Revente facile."
                    : liquidity.label === "Moyenne"
                    ? "Flux d'offres régulier. Délai de revente standard."
                    : "Faible activité. Prévoir un délai de vente plus long."
                  }
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Délai moyen estimé : {result.resell_probability >= 0.7 ? "7-14 jours" : result.resell_probability >= 0.4 ? "14-30 jours" : "30+ jours"}
                  </span>
                </div>
              </div>
            </LockedFeatureOverlay>
          </CardContent>
        </Card>
      </div>

      {/* Message pédagogique Starter */}
      {plan === "standard" && (
        <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            💡 Les données affichées donnent une vision globale du marché mais ne suffisent pas pour optimiser une opération d'achat-revente. 
            <a href="/pricing" className="text-primary hover:underline ml-1">Passez au plan Pro</a> pour débloquer les prix conseillés et les indicateurs de rentabilité.
          </p>
        </div>
      )}

      {/* Message Pro */}
      {plan === "pro" && (
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground text-center">
            ✅ Avec ces données, vous pouvez acheter et revendre sans être à l'aveugle. 
            <a href="/pricing" className="text-primary hover:underline ml-1">Passez au plan Élite</a> pour accéder aux scénarios de revente et à l'analyse stratégique.
          </p>
        </div>
      )}
    </motion.div>
  );
}
