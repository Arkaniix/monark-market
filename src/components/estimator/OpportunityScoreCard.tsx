// Score d'opportunité avec décomposition
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown, Minus, Lock, Crown } from "lucide-react";
import type { OpportunityScoreDetails, ConfidenceAssessment } from "@/types/estimator";
import { getOpportunityLabelFr, getConfidenceLabelFr } from "@/types/estimator";
import type { PlanType } from "@/hooks/useEntitlements";
import LockedFeatureOverlay from "@/components/LockedFeatureOverlay";

interface OpportunityScoreCardProps {
  opportunity: OpportunityScoreDetails;
  confidence: ConfidenceAssessment;
  tags: string[];
  plan: PlanType;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-500";
  if (score >= 55) return "text-primary";
  if (score >= 35) return "text-amber-500";
  return "text-destructive";
}

function getScoreBgClass(score: number): string {
  if (score >= 75) return "bg-green-500/10 border-green-500/30";
  if (score >= 55) return "bg-primary/10 border-primary/30";
  if (score >= 35) return "bg-amber-500/10 border-amber-500/30";
  return "bg-destructive/10 border-destructive/30";
}

function getConfidenceColor(level: string): string {
  if (level === "high") return "text-green-600 bg-green-500/10";
  if (level === "medium") return "text-amber-600 bg-amber-500/10";
  return "text-destructive bg-destructive/10";
}

function getComponentIcon(id: string) {
  switch (id) {
    case "price":
      return "💰";
    case "trend":
      return "📈";
    case "liquidity":
      return "💧";
    case "competition":
      return "🎯";
    case "risk":
      return "⚠️";
    default:
      return "📊";
  }
}

export default function OpportunityScoreCard({ 
  opportunity, 
  confidence, 
  tags, 
  plan 
}: OpportunityScoreCardProps) {
  const isElite = plan === "elite";
  const showDecomposition = isElite && opportunity.components.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className={`border-2 ${getScoreBgClass(opportunity.score)} shadow-lg`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Score d'opportunité
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getConfidenceColor(confidence.level)} text-xs`}>
                Confiance : {getConfidenceLabelFr(confidence.level)}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Score */}
            <div className="flex items-center gap-4">
              <div className={`h-20 w-20 rounded-2xl border-2 ${getScoreBgClass(opportunity.score)} flex flex-col items-center justify-center`}>
                <span className={`text-3xl font-bold ${getScoreColor(opportunity.score)}`}>
                  {opportunity.score}
                </span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
              <div>
                <p className={`text-xl font-semibold ${getScoreColor(opportunity.score)}`}>
                  {getOpportunityLabelFr(opportunity.label)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {opportunity.score >= 75 ? "Excellente opportunité d'achat" :
                   opportunity.score >= 55 ? "Bonne opportunité avec négociation" :
                   opportunity.score >= 35 ? "Opportunité limitée - prudence" :
                   "À éviter à ce prix"}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 5).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Decomposition (Elite only) */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">Décomposition du score</span>
              {!isElite && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Crown className="h-3 w-3" /> Élite
                </Badge>
              )}
            </div>
            
            <LockedFeatureOverlay
              isLocked={!isElite}
              requiredPlan="elite"
              featureName="Décomposition du score"
            >
              <div className="grid gap-3">
                {(showDecomposition ? opportunity.components : [
                  { id: "price", label: "Prix vs Marché", value: 65, weight: 0.35, description: "Indicateur de prix" },
                  { id: "trend", label: "Tendance", value: 55, weight: 0.20, description: "Tendance du marché" },
                  { id: "liquidity", label: "Liquidité", value: 70, weight: 0.20, description: "Facilité de vente" },
                  { id: "competition", label: "Concurrence", value: 50, weight: 0.15, description: "Niveau de concurrence" },
                  { id: "risk", label: "Risque", value: 60, weight: 0.10, description: "Évaluation du risque" },
                ]).map((component) => (
                  <div key={component.id} className="flex items-center gap-3">
                    <span className="text-lg">{getComponentIcon(component.id)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{component.label}</span>
                        <span className="text-sm text-muted-foreground">{component.value}/100</span>
                      </div>
                      <Progress value={component.value} className="h-2" />
                      {showDecomposition && (
                        <p className="text-xs text-muted-foreground mt-1">{component.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </LockedFeatureOverlay>
          </div>

          {/* Confidence factors */}
          {confidence.factors.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Facteurs de confiance :</p>
              <div className="flex flex-wrap gap-2">
                {confidence.factors.slice(0, 4).map((f, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className={`text-xs ${f.impact === 'positive' ? 'border-green-500/50 text-green-600' : 'border-amber-500/50 text-amber-600'}`}
                  >
                    {f.impact === 'positive' ? '✓' : '!'} {f.description}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
