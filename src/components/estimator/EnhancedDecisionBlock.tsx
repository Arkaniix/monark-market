// Bloc de décision enrichi avec justifications structurées
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
  Lock,
  Crown,
  MessageCircle,
  Ban
} from "lucide-react";
import type { DecisionRecommendation, ActionablePrices } from "@/types/estimator";
import { getRiskLabelFr } from "@/types/estimator";
import type { PlanType } from "@/hooks/useEntitlements";
import LockedFeatureOverlay, { PlanBadge } from "@/components/LockedFeatureOverlay";

interface EnhancedDecisionBlockProps {
  decision: DecisionRecommendation;
  actionablePrices: ActionablePrices;
  adPrice: number;
  plan: PlanType;
}

function getDecisionConfig(action: string) {
  switch (action) {
    case "buy":
      return {
        icon: CheckCircle2,
        color: "text-green-600",
        bgClass: "bg-green-500/10 border-green-500/30",
      };
    case "negotiate":
      return {
        icon: MessageCircle,
        color: "text-primary",
        bgClass: "bg-primary/10 border-primary/30",
      };
    case "wait":
      return {
        icon: Clock,
        color: "text-amber-600",
        bgClass: "bg-amber-500/10 border-amber-500/30",
      };
    case "pass":
      return {
        icon: Ban,
        color: "text-destructive",
        bgClass: "bg-destructive/10 border-destructive/30",
      };
    default:
      return {
        icon: Target,
        color: "text-muted-foreground",
        bgClass: "bg-muted/30 border-muted",
      };
  }
}

export default function EnhancedDecisionBlock({ 
  decision, 
  actionablePrices, 
  adPrice,
  plan 
}: EnhancedDecisionBlockProps) {
  const config = getDecisionConfig(decision.action);
  const DecisionIcon = config.icon;
  const isStarter = plan === "starter";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className={`border-2 ${config.bgClass} shadow-lg`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Décision recommandée
            <PlanBadge plan="pro" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            isLocked={isStarter}
            requiredPlan="pro"
            featureName="Décision recommandée"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main decision */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`h-16 w-16 rounded-xl ${config.bgClass} border flex items-center justify-center`}>
                    <DecisionIcon className={`h-8 w-8 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recommandation</p>
                    <p className={`text-2xl font-bold ${config.color}`}>
                      {decision.label}
                    </p>
                  </div>
                </div>

                {/* Reasons */}
                <div className="space-y-2 mb-4">
                  {decision.reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`text-sm ${config.color}`}>✓</span>
                      <p className="text-sm text-muted-foreground">{reason}</p>
                    </div>
                  ))}
                </div>

                {/* Main risk */}
                <div className="flex items-start gap-2 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-destructive">
                      Risque principal : {getRiskLabelFr(decision.main_risk.type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {decision.main_risk.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Target profile */}
              <div className="lg:w-56 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Profil adapté</span>
                </div>
                <Badge variant="outline" className="mb-2">{decision.target_profile.label}</Badge>
                <p className="text-xs text-muted-foreground">
                  {decision.target_profile.description}
                </p>
              </div>
            </div>

            {/* Price summary */}
            <div className="mt-6 pt-4 border-t grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Prix annonce</p>
                <p className="font-semibold">{adPrice} €</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plafond achat</p>
                <p className="font-semibold text-accent">{actionablePrices.buy_ceiling} €</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revente cible</p>
                <p className="font-semibold text-primary">{actionablePrices.sell_target} €</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revente plancher</p>
                <p className="font-semibold text-amber-600">{actionablePrices.sell_floor} €</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Marge potentielle</p>
                <p className={`font-semibold ${actionablePrices.margin_pct >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {actionablePrices.margin_euro > 0 ? "+" : ""}{actionablePrices.margin_euro}€ ({actionablePrices.margin_pct}%)
                </p>
              </div>
            </div>

            {/* Ranges by condition if available */}
            {actionablePrices.ranges_by_condition && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-3">📦 Prix selon l'état (état inconnu)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {actionablePrices.ranges_by_condition.map((range) => (
                    <div key={range.condition} className="p-3 bg-muted/30 rounded-lg border">
                      <p className="text-xs font-medium mb-1">{range.condition_label}</p>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Achat max : <span className="text-foreground">{range.buy_ceiling}€</span></p>
                        <p>Revente : <span className="text-foreground">{range.sell_target}€</span></p>
                        <p>Marge : <span className={range.margin_pct >= 0 ? "text-green-600" : "text-destructive"}>
                          {range.margin_pct}%
                        </span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </LockedFeatureOverlay>
        </CardContent>
      </Card>
    </motion.div>
  );
}
