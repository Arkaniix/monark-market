// Bloc de synthèse décisionnelle finale
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Target,
  User,
  AlertTriangle,
  Lock
} from "lucide-react";
import LockedFeatureOverlay from "@/components/LockedFeatureOverlay";
import type { EstimationResultUI } from "@/hooks/useEstimator";
import type { PlanType, EstimatorFeatures } from "@/hooks/useEntitlements";

interface DecisionBlockProps {
  result: EstimationResultUI;
  plan: PlanType;
  limits: EstimatorFeatures;
}

// Décision basée sur les résultats
function getDecision(result: EstimationResultUI): {
  verdict: "buy" | "wait" | "avoid";
  label: string;
  icon: typeof CheckCircle2;
  color: string;
  bgClass: string;
} {
  if (result.badge === "good" && result.margin_pct >= 8) {
    return {
      verdict: "buy",
      label: "Acheter",
      icon: CheckCircle2,
      color: "text-green-600",
      bgClass: "bg-green-500/10 border-green-500/30",
    };
  }
  if (result.badge === "caution" || (result.margin_pct >= 0 && result.margin_pct < 8)) {
    return {
      verdict: "wait",
      label: "Attendre",
      icon: Clock,
      color: "text-amber-600",
      bgClass: "bg-amber-500/10 border-amber-500/30",
    };
  }
  return {
    verdict: "avoid",
    label: "Éviter",
    icon: XCircle,
    color: "text-destructive",
    bgClass: "bg-destructive/10 border-destructive/30",
  };
}

// Justification courte
function getJustification(result: EstimationResultUI, decision: string): string {
  if (decision === "buy") {
    if (result.buy_price_input <= result.buy_price_recommended) {
      return `Le prix de ${result.buy_price_input}€ est sous le seuil conseillé. Le marché est ${result.market.trend === "up" ? "en hausse" : result.market.trend === "down" ? "stable" : "équilibré"} avec une bonne liquidité.`;
    }
    return `Marge de ${result.margin_pct}% correcte. La probabilité de revente est favorable (${Math.round(result.resell_probability * 100)}%).`;
  }
  if (decision === "wait") {
    if (result.market.var_30d_pct < -3) {
      return "Le marché est en baisse. Attendez une stabilisation ou négociez un meilleur prix.";
    }
    return "La marge est limitée. Une légère baisse du prix d'achat rendrait l'opération plus rentable.";
  }
  return `Le prix de ${result.buy_price_input}€ est trop élevé. Risque de perte à la revente.`;
}

// Profil utilisateur
function getTargetProfile(result: EstimationResultUI): { label: string; description: string } {
  if (result.resell_probability >= 0.7 && result.margin_pct >= 10) {
    return {
      label: "Revente rapide",
      description: "Pour ceux qui veulent tourner leur stock vite. Vente sous 14 jours probable.",
    };
  }
  if (result.margin_pct >= 5 && result.margin_pct < 15) {
    return {
      label: "Revente prudente",
      description: "Équilibre entre marge et risque. Délai standard de 2-4 semaines.",
    };
  }
  if (result.market.rarity_index < 0.3) {
    return {
      label: "Long terme",
      description: "Produit rare. Peut nécessiter plus de temps mais prix de vente potentiellement plus élevé.",
    };
  }
  return {
    label: "Standard",
    description: "Opération classique d'achat-revente avec délai et marge moyens.",
  };
}

export default function DecisionBlock({ result, plan, limits }: DecisionBlockProps) {
  const decision = getDecision(result);
  const DecisionIcon = decision.icon;
  const justification = getJustification(result, decision.verdict);
  const profile = getTargetProfile(result);
  const isStarter = plan === "starter";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <Card className={`border-2 ${decision.bgClass} shadow-lg`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Décision recommandée
            {isStarter && (
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
            featureName="Décision recommandée"
          >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Verdict principal */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-14 w-14 rounded-xl ${decision.bgClass} border flex items-center justify-center`}>
                  <DecisionIcon className={`h-7 w-7 ${decision.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recommandation</p>
                  <p className={`text-2xl font-bold ${decision.color}`}>
                    {decision.label}
                  </p>
                </div>
              </div>
              
              {/* Justification */}
              <p className="text-sm text-muted-foreground mb-4">
                {justification}
              </p>

              {/* Condition d'achat si applicable */}
              {decision.verdict === "buy" && result.buy_price_input > result.buy_price_recommended && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 mb-4">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Condition :</strong> Négociez si possible pour descendre sous {result.buy_price_recommended}€. La marge serait meilleure.
                  </p>
                </div>
              )}

              {decision.verdict === "wait" && (
                <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <strong>Conseil :</strong> Revenez dans quelques jours ou cherchez le même modèle à un meilleur prix.
                  </p>
                </div>
              )}
            </div>

            {/* Profil cible */}
            <div className="md:w-64 p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Profil adapté</span>
              </div>
              <Badge variant="outline" className="mb-2">{profile.label}</Badge>
              <p className="text-xs text-muted-foreground">
                {profile.description}
              </p>
            </div>
          </div>

          {/* Résumé chiffré */}
          <div className="mt-6 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Votre prix</p>
              <p className="font-semibold">{result.buy_price_input} €</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prix conseillé</p>
              <p className="font-semibold text-accent">{result.buy_price_recommended} €</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revente estimée</p>
              <p className="font-semibold text-primary">{result.sell_price_1m} €</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Marge potentielle</p>
              <p className={`font-semibold ${result.margin_pct >= 0 ? "text-green-600" : "text-destructive"}`}>
                {result.margin_pct > 0 ? "+" : ""}{result.margin_pct}%
              </p>
            </div>
          </div>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>
    </motion.div>
  );
}
