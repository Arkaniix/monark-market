// Section négociation enrichie
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ArrowDown, ArrowUp, Target, Lightbulb, Crown } from "lucide-react";
import type { NegotiationData } from "@/types/estimator";
import type { PlanType } from "@/hooks/useEntitlements";
import LockedFeatureOverlay, { PlanBadge } from "@/components/LockedFeatureOverlay";

interface EnhancedNegotiationSectionProps {
  negotiation: NegotiationData;
  adPrice: number;
  plan: PlanType;
  withoutCondition?: boolean;
}

export default function EnhancedNegotiationSection({ 
  negotiation, 
  adPrice,
  plan,
  withoutCondition 
}: EnhancedNegotiationSectionProps) {
  const isPro = plan === "pro";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Négociation
            <PlanBadge plan="pro" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            isLocked={!isPro}
            requiredPlan="pro"
            featureName="Conseils de négociation"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Buy negotiation */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowDown className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Négociation à l'achat</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Première offre</p>
                      <p className="text-sm">Offre agressive</p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {negotiation.buy.first_offer} €
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Compromis</p>
                      <p className="text-sm">Offre raisonnable</p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {negotiation.buy.compromise} €
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Maximum</p>
                      <p className="text-sm">Ne pas dépasser</p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold text-amber-600">
                      {negotiation.buy.max_offer} €
                    </Badge>
                  </div>
                </div>

                {/* Discount from ad price */}
                <div className="text-center text-sm text-muted-foreground pt-2">
                  <span>💰 Économie potentielle : </span>
                  <span className="text-green-600 font-medium">
                    {adPrice - negotiation.buy.compromise}€
                  </span>
                  <span> ({Math.round((1 - negotiation.buy.compromise / adPrice) * 100)}%)</span>
                </div>
              </div>

              {/* Sell negotiation */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUp className="h-4 w-4 text-primary" />
                  <span className="font-medium">Revente</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Prix d'affichage</p>
                      <p className="text-sm">Prix de départ recommandé</p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold text-primary">
                      {negotiation.sell.listing_price} €
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Prix premium</p>
                      <p className="text-sm">Si état parfait</p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {negotiation.sell.premium} €
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Plancher</p>
                      <p className="text-sm">Minimum acceptable</p>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold text-amber-600">
                      {negotiation.sell.floor} €
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips section */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-2">💡 {negotiation.tip}</p>
                  {negotiation.arguments.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Arguments à utiliser :</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {negotiation.arguments.map((arg, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{arg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {withoutCondition && (
                    <p className="text-xs text-amber-600 mt-3">
                      ⚠️ État inconnu : demandez des photos détaillées, facture, accessoires avant de négocier.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>
    </motion.div>
  );
}
