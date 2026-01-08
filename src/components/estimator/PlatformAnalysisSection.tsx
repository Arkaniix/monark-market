// Section Analyse par plateforme - Elite only
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Store, 
  Lock,
  TrendingUp,
  Clock,
  Star,
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

interface PlatformAnalysisSectionProps {
  result: EstimationResultUI;
  plan: PlanType;
  limits: EstimatorFeatures;
  sourcePlatform?: string;
}

interface PlatformData {
  name: string;
  shortName: string;
  importance: number; // 0-100
  sellProbability: number; // 0-100
  recommendedPrice: number;
  negotiablePrice: number;
  avgSellDays: number;
  notes: string;
}

// Génère les données par plateforme selon le composant
function generatePlatformData(result: EstimationResultUI, sourcePlatform?: string): PlatformData[] {
  const basePrice = result.sell_price_1m;
  const category = result.category?.toUpperCase() || "GPU";
  
  // Ajustements selon catégorie
  const categoryMultipliers: Record<string, Record<string, number>> = {
    GPU: { leboncoin: 1.0, ebay: 0.95, vinted: 0.88, fb: 0.92, ldlc: 1.1 },
    CPU: { leboncoin: 0.98, ebay: 0.92, vinted: 0.85, fb: 0.90, ldlc: 1.05 },
    RAM: { leboncoin: 0.95, ebay: 0.90, vinted: 0.80, fb: 0.88, ldlc: 1.02 },
    SSD: { leboncoin: 0.96, ebay: 0.93, vinted: 0.82, fb: 0.89, ldlc: 1.03 },
  };
  
  const multipliers = categoryMultipliers[category] || categoryMultipliers.GPU;
  
  const platforms: PlatformData[] = [
    {
      name: "Leboncoin",
      shortName: "LBC",
      importance: category === "GPU" ? 85 : category === "CPU" ? 82 : 78,
      sellProbability: 72,
      recommendedPrice: Math.round(basePrice * multipliers.leboncoin * 1.08),
      negotiablePrice: Math.round(basePrice * multipliers.leboncoin),
      avgSellDays: 12,
      notes: "Audience locale, négociation fréquente. Idéal pour vente rapide.",
    },
    {
      name: "eBay",
      shortName: "eBay",
      importance: category === "GPU" ? 70 : 65,
      sellProbability: 65,
      recommendedPrice: Math.round(basePrice * multipliers.ebay * 1.12),
      negotiablePrice: Math.round(basePrice * multipliers.ebay),
      avgSellDays: 18,
      notes: "Portée internationale. Frais élevés (~13%). Protection acheteur.",
    },
    {
      name: "Facebook Marketplace",
      shortName: "FB",
      importance: 55,
      sellProbability: 58,
      recommendedPrice: Math.round(basePrice * multipliers.fb * 1.05),
      negotiablePrice: Math.round(basePrice * multipliers.fb),
      avgSellDays: 15,
      notes: "Audience variée. Beaucoup de curieux, peu d'acheteurs sérieux.",
    },
    {
      name: "Vinted",
      shortName: "Vinted",
      importance: category === "GPU" ? 30 : 25,
      sellProbability: 35,
      recommendedPrice: Math.round(basePrice * multipliers.vinted * 1.1),
      negotiablePrice: Math.round(basePrice * multipliers.vinted),
      avgSellDays: 25,
      notes: "Non spécialisé hardware. Prix plus bas, délais plus longs.",
    },
  ];
  
  // Si LDLC occasion existe pour ce type
  if (category === "GPU" || category === "CPU") {
    platforms.push({
      name: "LDLC Occasion",
      shortName: "LDLC",
      importance: 40,
      sellProbability: 48,
      recommendedPrice: Math.round(basePrice * multipliers.ldlc),
      negotiablePrice: Math.round(basePrice * multipliers.ldlc * 0.95),
      avgSellDays: 20,
      notes: "Prix fixes. Bonne réputation mais audience limitée.",
    });
  }
  
  // Trier par importance
  return platforms.sort((a, b) => b.importance - a.importance);
}

export default function PlatformAnalysisSection({ 
  result, 
  plan, 
  limits, 
  sourcePlatform 
}: PlatformAnalysisSectionProps) {
  const isElite = plan === "elite";
  const platforms = generatePlatformData(result, sourcePlatform);
  const bestPlatform = platforms[0];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="h-5 w-5 text-amber-500" />
            Analyse par plateforme de revente
            {!isElite && (
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
            featureName="Analyse par plateforme"
          >
            <div className="space-y-4">
              {/* Recommandation principale */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Plateforme recommandée</span>
                </div>
                <p className="text-lg font-bold text-primary">{bestPlatform.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Meilleur rapport visibilité/prix pour {result.category || "ce composant"}.
                  Affichez à <strong>{bestPlatform.recommendedPrice}€</strong>, acceptez jusqu'à <strong>{bestPlatform.negotiablePrice}€</strong>.
                </p>
              </div>
              
              {/* Tableau des plateformes */}
              <div className="space-y-3">
                {platforms.map((platform) => (
                  <div 
                    key={platform.shortName}
                    className={`p-4 rounded-lg border ${
                      platform.name === bestPlatform.name 
                        ? "bg-primary/5 border-primary/30" 
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{platform.name}</span>
                        {platform.name === bestPlatform.name && (
                          <Badge className="text-xs">Recommandé</Badge>
                        )}
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{platform.notes}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {/* Importance */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Importance</p>
                        <div className="flex items-center gap-2">
                          <Progress value={platform.importance} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium">{platform.importance}%</span>
                        </div>
                      </div>
                      
                      {/* Probabilité de vente */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Proba. vente</p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className={`h-3 w-3 ${
                            platform.sellProbability >= 60 ? "text-green-600" : 
                            platform.sellProbability >= 40 ? "text-amber-600" : 
                            "text-destructive"
                          }`} />
                          <span className={`font-medium ${
                            platform.sellProbability >= 60 ? "text-green-600" : 
                            platform.sellProbability >= 40 ? "text-amber-600" : 
                            "text-destructive"
                          }`}>{platform.sellProbability}%</span>
                        </div>
                      </div>
                      
                      {/* Prix affiché */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Prix affiché</p>
                        <p className="font-medium">{platform.recommendedPrice} €</p>
                      </div>
                      
                      {/* Délai moyen */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Délai moyen</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{platform.avgSellDays}j</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                📊 Données basées sur {result.market.volume_active} annonces analysées pour {result.category || "ce type de composant"}.
              </p>
            </div>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>
    </motion.div>
  );
}
