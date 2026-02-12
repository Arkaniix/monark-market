// Analyse par plateforme enrichie
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Star, 
  Clock, 
  TrendingUp, 
  Crown,
  CheckCircle2,
  Info,
  AlertTriangle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { PlatformsData, PlatformAnalysis } from "@/types/estimator";
import type { PlanType } from "@/hooks/useEntitlements";
import LockedFeatureOverlay, { PlanBadge } from "@/components/LockedFeatureOverlay";

interface EnhancedPlatformsSectionProps {
  platforms: PlatformsData;
  plan: PlanType;
  sourcePlatform?: string;
  withoutPlatform?: boolean;
}

function getPlatformLogo(platform: string): string {
  // Return emoji as fallback
  const logos: Record<string, string> = {
    leboncoin: "🟠",
    ebay: "🔵",
    ldlc: "🟢",
    facebook: "🔵",
    vinted: "🟣",
    rakuten: "🔴",
    backmarket: "🟢",
  };
  return logos[platform] || "🌐";
}

export default function EnhancedPlatformsSection({ 
  platforms, 
  plan,
  sourcePlatform,
  withoutPlatform 
}: EnhancedPlatformsSectionProps) {
  const isPro = plan === "pro";
  const isProPlan = plan === "pro";
  
  // Pro shows all platforms
  const displayPlatforms = platforms.platforms;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Où revendre ?
            <PlanBadge plan="pro" />
            {isProPlan && <Badge variant="outline" className="text-xs gap-1"><Crown className="h-3 w-3" /> Complet</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            isLocked={!isPro}
            requiredPlan="pro"
            featureName="Analyse par plateforme"
          >
            {/* Source platform note */}
            {withoutPlatform && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 mb-4">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Plateforme d'achat inconnue : pas d'ajustement spécifique sur le prix d'achat, 
                  mais l'analyse de revente reste pertinente.
                </p>
              </div>
            )}
            
            {platforms.source_platform_note && !withoutPlatform && (
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg mb-4">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {platforms.source_platform_note}
                </p>
              </div>
            )}

            {/* Recommended platform highlight */}
            <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getPlatformLogo(platforms.recommended.platform)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{platforms.recommended.platform_label}</span>
                    <Badge className="bg-green-600 text-white gap-1">
                      <Star className="h-3 w-3" /> Recommandée
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Meilleure combinaison prix/délai/probabilité
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xl font-bold text-green-600">{platforms.recommended.recommended_price} €</p>
                  <p className="text-xs text-muted-foreground">
                    ~{platforms.recommended.avg_days_to_sell}j • {platforms.recommended.sale_probability}% proba
                  </p>
                </div>
              </div>
            </div>

            {/* All platforms */}
            <div className="space-y-3">
              {displayPlatforms.map((platform, i) => (
                <div 
                  key={platform.platform}
                  className={`p-4 rounded-lg border ${
                    platform.is_recommended ? 'border-green-500/30 bg-green-500/5' : 'bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{getPlatformLogo(platform.platform)}</span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{platform.platform_label}</span>
                        {platform.is_recommended && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      {/* Elite: show reason */}
                      {isProPlan && platform.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {platform.reason}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-center px-3">
                      <p className="text-lg font-bold">{platform.recommended_price} €</p>
                      <p className="text-xs text-muted-foreground">Prix conseillé</p>
                    </div>
                    
                    <div className="text-center px-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{platform.avg_days_to_sell}j</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Délai moyen</p>
                    </div>
                    
                    <div className="w-24">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Proba</span>
                        <span className="text-xs font-medium">{platform.sale_probability}%</span>
                      </div>
                      <Progress value={platform.sale_probability} className="h-2" />
                    </div>
                  </div>
                  
                  {/* Elite: show constraints */}
                  {isProPlan && platform.constraints && platform.constraints.length > 0 && (
                    <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                      {platform.constraints.map((constraint, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {constraint}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pro users: show upgrade hint */}
            {!isProPlan && platforms.platforms.length > 3 && (
              <div className="mt-4 text-center">
                <Badge variant="outline" className="gap-1">
                  <Crown className="h-3 w-3" />
                  {platforms.platforms.length - 3} plateformes supplémentaires avec Pro
                </Badge>
              </div>
            )}
          </LockedFeatureOverlay>
        </CardContent>
      </Card>
    </motion.div>
  );
}
