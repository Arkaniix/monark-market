// Bannière d'hypothèses quand des inputs manquent
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowUp, Info } from "lucide-react";
import type { Hypothesis } from "@/types/estimator";

interface HypothesesBannerProps {
  hypotheses: Hypothesis[];
  onScrollToForm?: () => void;
}

export default function HypothesesBanner({ hypotheses, onScrollToForm }: HypothesesBannerProps) {
  if (hypotheses.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-700 dark:text-amber-400 mb-2">
                Hypothèses utilisées
              </p>
              <ul className="space-y-1">
                {hypotheses.map((h, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-amber-600">•</span>
                    <span className="capitalize">{h.field === 'platform' ? 'Plateforme' : 'État'}</span>
                    <span>:</span>
                    <span>{h.assumption}</span>
                    <span className="text-xs text-amber-600/70">
                      ({h.impact_on_confidence === 'minor' ? 'impact faible' : 
                        h.impact_on_confidence === 'moderate' ? 'impact modéré' : 'impact important'})
                    </span>
                  </li>
                ))}
              </ul>
              {onScrollToForm && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 gap-1 border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                  onClick={onScrollToForm}
                >
                  <ArrowUp className="h-3 w-3" />
                  Renseigner les infos manquantes
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
