// Carte marché enrichie avec volatilité et dispersion
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity,
  AlertTriangle,
  Database
} from "lucide-react";
import type { MarketDataEnhanced } from "@/types/estimator";
import type { PlanType } from "@/hooks/useEntitlements";

interface EnhancedMarketCardProps {
  market: MarketDataEnhanced;
  adPrice: number;
  plan: PlanType;
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "up": return TrendingUp;
    case "down": return TrendingDown;
    default: return Minus;
  }
}

function getTrendColor(trend: string) {
  switch (trend) {
    case "up": return "text-green-600";
    case "down": return "text-destructive";
    default: return "text-amber-600";
  }
}

function getVolatilityConfig(volatility: string) {
  switch (volatility) {
    case "low": return { label: "Faible", color: "text-green-600 bg-green-500/10", description: "Prix stables" };
    case "high": return { label: "Élevée", color: "text-destructive bg-destructive/10", description: "Prix imprévisibles" };
    default: return { label: "Moyenne", color: "text-amber-600 bg-amber-500/10", description: "Variations normales" };
  }
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "decimal" }).format(Math.round(value)) + " €";
}

export default function EnhancedMarketCard({ market, adPrice, plan }: EnhancedMarketCardProps) {
  const TrendIcon = getTrendIcon(market.trend);
  const trendColor = getTrendColor(market.trend);
  const volatilityConfig = getVolatilityConfig(market.volatility);
  const priceDeviation = ((adPrice - market.median_price) / market.median_price * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Données marché
            <Badge variant="outline" className="text-xs ml-auto">
              <Database className="h-3 w-3 mr-1" />
              {market.data_points} points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Median price */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Prix médian</p>
              <p className="text-xl font-bold">{formatPrice(market.median_price)}</p>
              <p className={`text-xs mt-1 ${priceDeviation <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                Annonce : {priceDeviation > 0 ? '+' : ''}{priceDeviation.toFixed(1)}%
              </p>
            </div>

            {/* Price range */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Fourchette marché</p>
              <p className="text-lg font-bold">
                {formatPrice(market.price_p25)} - {formatPrice(market.price_p75)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                P25 - P75 (50% des annonces)
              </p>
            </div>

            {/* Trend */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Tendance 30j</p>
              <div className="flex items-center gap-2">
                <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                <span className={`text-xl font-bold ${trendColor}`}>
                  {market.var_30d_pct > 0 ? '+' : ''}{market.var_30d_pct}%
                </span>
              </div>
              {market.var_90d_pct !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  90j : {market.var_90d_pct > 0 ? '+' : ''}{market.var_90d_pct}%
                </p>
              )}
            </div>

            {/* Volume */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Volume</p>
              <p className="text-xl font-bold">{market.volume_active}</p>
              <p className="text-xs text-muted-foreground mt-1">
                +{market.new_listings_7d} cette semaine
              </p>
            </div>
          </div>

          {/* Second row: volatility & rarity */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Volatility */}
            <div className={`p-4 rounded-lg border ${volatilityConfig.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4" />
                <p className="text-xs font-medium">Volatilité</p>
              </div>
              <p className="font-bold">{volatilityConfig.label}</p>
              <p className="text-xs text-muted-foreground">{volatilityConfig.description}</p>
              <p className="text-xs mt-2">IQR : {market.iqr}€</p>
            </div>

            {/* Rarity */}
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium">Rareté</p>
              </div>
              <p className="font-bold">
                {market.rarity_index < 30 ? 'Courant' : 
                 market.rarity_index < 60 ? 'Modéré' : 'Rare'}
              </p>
              <p className="text-xs text-muted-foreground">
                {market.rarity_index < 30 ? 'Beaucoup d\'offres similaires' :
                 market.rarity_index < 60 ? 'Offre équilibrée' : 
                 'Peu d\'offres - prix potentiellement plus élevé'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
