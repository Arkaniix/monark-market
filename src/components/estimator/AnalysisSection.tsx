// Section d'analyse textuelle interprétée
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquareText, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  TrendingUp,
  Lock
} from "lucide-react";
import LockedFeatureOverlay from "@/components/LockedFeatureOverlay";
import type { EstimationResultUI } from "@/hooks/useEstimator";
import type { PlanType, EstimatorFeatures } from "@/hooks/useEntitlements";

interface AnalysisSectionProps {
  result: EstimationResultUI;
  plan: PlanType;
  limits: EstimatorFeatures;
}

// Génère l'explication du prix d'achat conseillé
function generateBuyPriceExplanation(result: EstimationResultUI): string {
  const diff = result.buy_price_input - result.buy_price_recommended;
  const diffPct = Math.round((diff / result.buy_price_recommended) * 100);
  
  if (diff <= 0) {
    return `Votre prix de ${result.buy_price_input}€ est inférieur au seuil conseillé de ${result.buy_price_recommended}€. C'est une excellente opportunité car vous achetez sous le prix optimal, ce qui maximise votre marge de revente.`;
  } else if (diffPct <= 10) {
    return `Votre prix de ${result.buy_price_input}€ est légèrement au-dessus du seuil conseillé (${result.buy_price_recommended}€, soit +${diffPct}%). L'opération reste viable mais votre marge sera réduite.`;
  } else {
    return `Votre prix de ${result.buy_price_input}€ dépasse significativement le seuil conseillé (${result.buy_price_recommended}€, soit +${diffPct}%). À ce prix, le risque de perte est élevé. Négociez ou passez votre tour.`;
  }
}

// Génère le principal risque
function generateMainRisk(result: EstimationResultUI): string {
  if (result.market.var_30d_pct < -5) {
    return `Marché en baisse marquée (${result.market.var_30d_pct}% sur 30j). Les prix pourraient continuer à chuter, réduisant votre marge à la revente.`;
  }
  if (result.market.volume_active > 400) {
    return `Forte concurrence sur ce modèle (${result.market.volume_active} annonces actives). Il sera plus difficile de vendre rapidement au prix souhaité.`;
  }
  if (result.resell_probability < 0.5) {
    return `Probabilité de revente faible (${Math.round(result.resell_probability * 100)}%). Ce composant peut rester longtemps en stock.`;
  }
  if (result.margin_pct < 5) {
    return `Marge très faible (${result.margin_pct}%). Les frais de plateforme ou d'expédition peuvent absorber tout le bénéfice.`;
  }
  return "Aucun risque majeur identifié. Restez vigilant sur les délais de revente.";
}

export default function AnalysisSection({ result, plan, limits }: AnalysisSectionProps) {
  const isProOrHigher = plan === "pro" || plan === "elite";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="space-y-4"
    >
      {/* Bloc analyse Pro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" />
            Analyse de l'opportunité
            {plan === "starter" && (
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
            featureName="Analyse détaillée"
          >
            <div className="space-y-4">
              {/* Pourquoi ce prix d'achat */}
              <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-accent">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-accent" />
                  <span className="font-medium text-sm">Pourquoi ce prix d'achat est conseillé</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {generateBuyPriceExplanation(result)}
                </p>
              </div>

              {/* Principal risque */}
              <div className="p-4 bg-amber-500/5 rounded-lg border-l-4 border-amber-500">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-sm">Principal risque à prendre en compte</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {generateMainRisk(result)}
                </p>
              </div>
            </div>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>

      {/* Bloc Elite - Stratégie avancée */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Analyse stratégique avancée
            {plan !== "elite" && (
              <Badge variant="outline" className="ml-2 gap-1 text-xs border-amber-500/50 text-amber-600">
                <Lock className="h-3 w-3" /> Élite
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            isLocked={!limits.canSeeScenarios}
            requiredPlan="elite"
            featureName="Stratégie avancée"
          >
            <div className="space-y-4">
              {/* Stratégie recommandée */}
              <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Stratégie recommandée</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.margin_pct >= 15 
                    ? "Achat immédiat recommandé. Excellent rapport prix/marge. Revendez sous 14 jours pour maximiser le profit."
                    : result.margin_pct >= 8
                    ? "Achat possible si disponible rapidement. Visez une revente sous 30 jours pour sécuriser la marge."
                    : result.margin_pct >= 0
                    ? "Attendez une baisse de prix ou négociez. La marge actuelle ne couvre pas les aléas."
                    : "Évitez cet achat. Recherchez une meilleure offre ou un modèle alternatif plus rentable."
                  }
                </p>
              </div>

              {/* Erreur fréquente */}
              <div className="p-4 bg-destructive/5 rounded-lg border-l-4 border-destructive">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-sm">Erreur fréquente à éviter</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.category === "GPU"
                    ? "Ne pas vérifier les traces de minage (usure des pads thermiques, bruit anormal). Les GPU ex-mining se revendent moins bien."
                    : result.category === "CPU"
                    ? "Oublier de demander si le ventirad d'origine est inclus. Son absence réduit la valeur de revente de 10-15€."
                    : result.category === "RAM"
                    ? "Ignorer la compatibilité DDR4/DDR5. Une erreur coûte du temps et frustre l'acheteur."
                    : "Sous-estimer les frais d'expédition pour les composants lourds ou fragiles."
                  }
                </p>
              </div>

              {/* Alternative */}
              {result.margin_pct < 10 && (
                <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Alternative à considérer</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    La marge sur ce modèle étant limitée, considérez la gamme inférieure ou supérieure du même fabricant. 
                    Les modèles de transition générationnelle offrent souvent de meilleurs ratios prix/demande.
                  </p>
                </div>
              )}
            </div>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>

      {/* Message Elite */}
      {plan === "elite" && (
        <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
          <p className="text-sm text-muted-foreground text-center">
            🏆 Ce plan vous aide à prendre de meilleures décisions que la majorité du marché.
          </p>
        </div>
      )}
    </motion.div>
  );
}
