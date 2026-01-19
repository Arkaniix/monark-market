// Section Prix de négociation - Elite only
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HandCoins, 
  ArrowDown, 
  ArrowUp, 
  Lock,
  Info
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

interface NegotiationSectionProps {
  result: EstimationResultUI;
  plan: PlanType;
  limits: EstimatorFeatures;
}

// Calcul des prix de négociation
function calculateNegotiationPrices(result: EstimationResultUI) {
  const medianPrice = result.market.median_price;
  const buyRecommended = result.buy_price_recommended;
  
  // Prix négociable à l'achat : -8 à -12% sous le prix annonce typique
  const buyNegotiable = Math.round(buyRecommended * 0.92);
  const buyAggressive = Math.round(buyRecommended * 0.85);
  
  // Prix négociable à la revente : +3 à +8% au-dessus du prix optimal
  const sellOptimal = result.sell_price_1m;
  const sellNegotiable = Math.round(sellOptimal * 1.05);
  const sellPremium = Math.round(sellOptimal * 1.12);
  
  return {
    buy: {
      aggressive: buyAggressive,
      negotiable: buyNegotiable,
      max: buyRecommended,
    },
    sell: {
      min: sellOptimal,
      negotiable: sellNegotiable,
      premium: sellPremium,
    }
  };
}

export default function NegotiationSection({ result, plan, limits }: NegotiationSectionProps) {
  const prices = calculateNegotiationPrices(result);
  const isElite = plan === "elite";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-amber-500" />
            Prix de négociation
            <Badge variant="outline" className="ml-2 gap-1 text-xs border-amber-500/50 text-amber-600">
              <Lock className="h-3 w-3" /> Élite
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            isLocked={!limits.canSeeScenarios}
            requiredPlan="elite"
            featureName="Prix de négociation"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prix d'achat négociables */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">À l'achat (proposer au vendeur)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Prix à proposer lors de la négociation pour maximiser votre marge.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Offre agressive</p>
                      <p className="font-bold text-lg text-green-600">{prices.buy.aggressive} €</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Première offre</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                    <div>
                      <p className="text-xs text-muted-foreground">Offre négociée</p>
                      <p className="font-bold text-lg">{prices.buy.negotiable} €</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Compromis</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Prix maximum</p>
                      <p className="font-bold text-lg text-amber-600">{prices.buy.max} €</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-amber-500/50">Ne pas dépasser</Badge>
                  </div>
                </div>
              </div>
              
              {/* Prix de revente négociables */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">À la revente (afficher dans l'annonce)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Prix à afficher pour laisser une marge de négociation tout en sécurisant votre profit.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                    <div>
                      <p className="text-xs text-muted-foreground">Prix plancher</p>
                      <p className="font-bold text-lg">{prices.sell.min} €</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Ne pas descendre</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Prix affiché recommandé</p>
                      <p className="font-bold text-lg text-primary">{prices.sell.negotiable} €</p>
                    </div>
                    <Badge className="text-xs">Optimal</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                    <div>
                      <p className="text-xs text-muted-foreground">Prix premium</p>
                      <p className="font-bold text-lg">{prices.sell.premium} €</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Si état parfait</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4 text-center">
              💡 Affichez le prix "négociable" et acceptez de descendre jusqu'au "plancher" pour conclure rapidement.
            </p>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>
    </motion.div>
  );
}
