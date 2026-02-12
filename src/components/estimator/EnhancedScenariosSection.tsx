// Scénarios de revente enrichis (Elite)
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Target, 
  Clock, 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  Calendar 
} from "lucide-react";
import type { ScenariosData, ResaleScenario, MarketTiming, MarketSaturation } from "@/types/estimator";
import { getTimingLabelFr, getSaturationLabelFr } from "@/types/estimator";
import type { PlanType } from "@/hooks/useEntitlements";
import LockedFeatureOverlay, { PlanBadge } from "@/components/LockedFeatureOverlay";

interface EnhancedScenariosSectionProps {
  scenarios: ScenariosData;
  adPrice: number;
  plan: PlanType;
}

function getScenarioIcon(id: string) {
  switch (id) {
    case "quick": return Zap;
    case "optimal": return Target;
    case "long": return Clock;
    default: return Target;
  }
}

function getScenarioColor(id: string) {
  switch (id) {
    case "quick": return "text-amber-600 bg-amber-500/10 border-amber-500/30";
    case "optimal": return "text-green-600 bg-green-500/10 border-green-500/30";
    case "long": return "text-primary bg-primary/10 border-primary/30";
    default: return "text-muted-foreground bg-muted border-muted";
  }
}

function getTimingIcon(status: string) {
  switch (status) {
    case "favorable": return TrendingUp;
    case "unfavorable": return TrendingDown;
    default: return Minus;
  }
}

function getTimingColor(status: string) {
  switch (status) {
    case "favorable": return "text-green-600 bg-green-500/10";
    case "unfavorable": return "text-destructive bg-destructive/10";
    default: return "text-amber-600 bg-amber-500/10";
  }
}

function getSaturationColor(level: string) {
  switch (level) {
    case "low": return "text-green-600 bg-green-500/10";
    case "saturated": return "text-destructive bg-destructive/10";
    default: return "text-amber-600 bg-amber-500/10";
  }
}

export default function EnhancedScenariosSection({ 
  scenarios, 
  adPrice,
  plan 
}: EnhancedScenariosSectionProps) {
  const isElite = plan === "pro";
  const TimingIcon = getTimingIcon(scenarios.timing.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Scénarios de revente
            <PlanBadge plan="pro" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            isLocked={!isElite}
            requiredPlan="pro"
            featureName="Scénarios de revente"
          >
            {/* Timing & Saturation */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg border ${getTimingColor(scenarios.timing.status)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <TimingIcon className="h-4 w-4" />
                  <span className="font-medium text-sm">Timing d'achat</span>
                </div>
                <Badge variant="secondary" className="mb-2">
                  {getTimingLabelFr(scenarios.timing.status)}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {scenarios.timing.justification}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border ${getSaturationColor(scenarios.saturation.level)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium text-sm">Saturation du marché</span>
                </div>
                <Badge variant="secondary" className="mb-2">
                  {getSaturationLabelFr(scenarios.saturation.level)}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {scenarios.saturation.justification}
                </p>
              </div>
            </div>

            {/* Scenarios */}
            <div className="grid md:grid-cols-3 gap-4">
              {scenarios.scenarios.map((scenario) => {
                const Icon = getScenarioIcon(scenario.id);
                const colorClass = getScenarioColor(scenario.id);
                const marginFromAd = scenario.price - adPrice;
                
                return (
                  <div 
                    key={scenario.id}
                    className={`p-4 rounded-lg border-2 ${colorClass}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{scenario.label}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Prix de vente</p>
                        <p className="text-xl font-bold">{scenario.price} €</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Marge</p>
                          <p className={`font-medium ${scenario.margin_pct >= 0 ? "text-green-600" : "text-destructive"}`}>
                            {scenario.margin_euro > 0 ? "+" : ""}{scenario.margin_euro}€
                          </p>
                          <p className="text-xs text-muted-foreground">({scenario.margin_pct}%)</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Délai</p>
                          <p className="font-medium">
                            {scenario.days_estimate.min}-{scenario.days_estimate.max}j
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Probabilité</span>
                          <span className="font-medium">{scenario.probability_pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              scenario.probability_pct >= 70 ? 'bg-green-500' : 
                              scenario.probability_pct >= 50 ? 'bg-amber-500' : 'bg-destructive'
                            }`}
                            style={{ width: `${scenario.probability_pct}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground text-center pt-2">
                        💰 Capital immobilisé ~{scenario.immobilization_days} jours
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>
    </motion.div>
  );
}
