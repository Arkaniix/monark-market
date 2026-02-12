// Section Scénarios de revente - Elite only
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Target, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Lock,
  AlertCircle
} from "lucide-react";
import LockedFeatureOverlay from "@/components/LockedFeatureOverlay";
import type { EstimationResultUI } from "@/hooks/useEstimator";
import type { PlanType, EstimatorFeatures } from "@/hooks/useEntitlements";

interface ScenariosSectionProps {
  result: EstimationResultUI;
  plan: PlanType;
  limits: EstimatorFeatures;
}

// Calcul des scénarios
function calculateScenarios(result: EstimationResultUI) {
  const buyPrice = result.buy_price_input;
  const baseMarket = result.market.median_price;
  
  // Scénario rapide : -8% du marché, vente sous 7 jours
  const quickSellPrice = Math.round(baseMarket * 0.92);
  const quickMargin = Math.round(((quickSellPrice - buyPrice) / buyPrice) * 100);
  
  // Scénario optimal : prix marché, vente 14-21 jours
  const optimalSellPrice = result.sell_price_1m;
  const optimalMargin = result.margin_pct;
  
  // Scénario long : +5% du marché, vente 30+ jours (risque)
  const longSellPrice = Math.round(baseMarket * 1.05);
  const longMargin = Math.round(((longSellPrice - buyPrice) / buyPrice) * 100);
  
  return {
    quick: { price: quickSellPrice, margin: quickMargin, days: "5-7 jours" },
    optimal: { price: optimalSellPrice, margin: optimalMargin, days: "14-21 jours" },
    long: { price: longSellPrice, margin: longMargin, days: "30+ jours" },
  };
}

// Analyse du timing
function getTimingAnalysis(result: EstimationResultUI): { status: string; color: string; explanation: string } {
  const var30d = result.market.var_30d_pct;
  const volume = result.market.volume_active;
  
  if (var30d < -3 && volume > 200) {
    return {
      status: "Défavorable",
      color: "text-destructive",
      explanation: "Le marché est en baisse avec une offre abondante. Attendez une stabilisation avant d'acheter."
    };
  }
  if (var30d > 3) {
    return {
      status: "Favorable",
      color: "text-green-600",
      explanation: "Les prix sont en hausse. Achetez maintenant avant une nouvelle augmentation."
    };
  }
  if (volume < 100) {
    return {
      status: "Favorable",
      color: "text-green-600",
      explanation: "Peu d'offres disponibles. Les acheteurs sont prêts à payer le prix demandé."
    };
  }
  return {
    status: "Neutre",
    color: "text-amber-600",
    explanation: "Conditions de marché normales. Pas d'urgence particulière à acheter ou attendre."
  };
}

// Saturation du marché
function getMarketSaturation(result: EstimationResultUI): { level: string; color: string; explanation: string } {
  const volume = result.market.volume_active;
  const rarity = result.market.rarity_index;
  
  // Score de saturation basé sur volume et rareté
  const saturationScore = (volume / 500) + (1 - rarity);
  
  if (saturationScore > 1.2) {
    return {
      level: "Saturé",
      color: "text-destructive",
      explanation: "Trop d'offres similaires sur le marché. La concurrence réduit les prix et allonge les délais de vente."
    };
  }
  if (saturationScore > 0.7) {
    return {
      level: "Modéré",
      color: "text-amber-600",
      explanation: "Offre et demande équilibrées. Délais de vente standards."
    };
  }
  return {
    level: "Faible",
    color: "text-green-600",
    explanation: "Peu d'offres pour une demande soutenue. Vente rapide probable."
  };
}

export default function ScenariosSection({ result, plan, limits }: ScenariosSectionProps) {
  const scenarios = calculateScenarios(result);
  const timing = getTimingAnalysis(result);
  const saturation = getMarketSaturation(result);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-500" />
            Scénarios de revente & Timing
            <Badge variant="outline" className="ml-2 gap-1 text-xs border-amber-500/50 text-amber-600">
              <Lock className="h-3 w-3" /> Élite
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            isLocked={!limits.canSeeScenarios}
            requiredPlan="pro"
            featureName="Scénarios de revente"
          >
            <div className="space-y-6">
              {/* Scénarios de revente */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Revente rapide */}
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-sm">Revente rapide</span>
                  </div>
                  <p className="text-2xl font-bold">{scenarios.quick.price} €</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={scenarios.quick.margin > 0 ? "default" : "destructive"} className="text-xs">
                      {scenarios.quick.margin > 0 ? "+" : ""}{scenarios.quick.margin}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">{scenarios.quick.days}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Prix bas pour vendre vite. Moins de marge, moins de risque.
                  </p>
                </div>

                {/* Revente optimale */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Revente optimale</span>
                    <Badge variant="outline" className="text-xs bg-primary/10">Recommandé</Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">{scenarios.optimal.price} €</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={scenarios.optimal.margin > 0 ? "default" : "destructive"} className="text-xs">
                      {scenarios.optimal.margin > 0 ? "+" : ""}{scenarios.optimal.margin}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">{scenarios.optimal.days}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Équilibre marge / délai. Stratégie standard recommandée.
                  </p>
                </div>

                {/* Revente longue */}
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Revente longue</span>
                  </div>
                  <p className="text-2xl font-bold">{scenarios.long.price} €</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={scenarios.long.margin > 0 ? "secondary" : "destructive"} className="text-xs">
                      {scenarios.long.margin > 0 ? "+" : ""}{scenarios.long.margin}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">{scenarios.long.days}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Prix haut, délai long. Risque de baisse du marché.
                  </p>
                </div>
              </div>

              {/* Analyse timing & saturation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Timing */}
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Timing d'achat</span>
                    <span className={`font-semibold ${timing.color}`}>{timing.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {timing.explanation}
                  </p>
                </div>

                {/* Saturation */}
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Saturation du marché</span>
                    <span className={`font-semibold ${saturation.color}`}>{saturation.level}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {saturation.explanation}
                  </p>
                </div>
              </div>
            </div>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>
    </motion.div>
  );
}
