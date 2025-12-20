import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Package, Tag, TrendingDown, TrendingUp, Bell, ExternalLink, Trash2, 
  Zap, Clock, Target, BarChart3, AlertTriangle, CheckCircle2, Minus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import type { WatchlistEntry, PriceHistoryPoint } from "@/providers/types";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip as RechartsTooltip,
  ReferenceLine,
} from "recharts";

interface WatchlistItemCardProps {
  item: WatchlistEntry;
  isModel: boolean;
  priceHistory: { price: number; date?: string }[];
  isLoadingHistory: boolean;
  onCreateAlert: () => void;
  onRemove: () => void;
  isRemoving: boolean;
}

export function WatchlistItemCard({
  item,
  isModel,
  priceHistory,
  isLoadingHistory,
  onCreateAlert,
  onRemove,
  isRemoving,
}: WatchlistItemCardProps) {
  const [showChart, setShowChart] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);

  const currentPrice = item.current_price || 0;
  const fairValue = item.fair_value || currentPrice;
  const deviation = fairValue > 0 ? ((currentPrice - fairValue) / fairValue) * 100 : 0;
  const priceChange = item.price_change_7d || 0;

  // Calculs d'opportunité
  const isGoodDeal = deviation < -10;
  const isOverpriced = deviation > 15;
  const isFairPrice = Math.abs(deviation) <= 10;

  // Score de liquidité simulé (basé sur variation - plus stable = plus liquide)
  const liquidityScore = Math.max(0, Math.min(100, 100 - Math.abs(priceChange) * 10));

  // Tendance des 30 derniers jours
  const trendData = priceHistory.length > 1 ? priceHistory : [];
  const priceMin = trendData.length > 0 ? Math.min(...trendData.map(p => p.price)) : currentPrice;
  const priceMax = trendData.length > 0 ? Math.max(...trendData.map(p => p.price)) : currentPrice;
  const priceRange = priceMax - priceMin;
  const currentVsRange = priceRange > 0 ? ((currentPrice - priceMin) / priceRange) * 100 : 50;

  // Déterminer le signal d'achat
  const getBuySignal = () => {
    if (isGoodDeal && priceChange < 0) {
      return { label: "Acheter maintenant", color: "text-green-500", bg: "bg-green-500/10", icon: Zap };
    }
    if (isGoodDeal) {
      return { label: "Bonne affaire", color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 };
    }
    if (isOverpriced) {
      return { label: "Surévalué", color: "text-red-500", bg: "bg-red-500/10", icon: AlertTriangle };
    }
    if (priceChange < -5) {
      return { label: "Prix en baisse", color: "text-blue-500", bg: "bg-blue-500/10", icon: TrendingDown };
    }
    return { label: "Prix stable", color: "text-muted-foreground", bg: "bg-muted", icon: Minus };
  };

  const signal = getBuySignal();
  const SignalIcon = signal.icon;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Header avec signal */}
        <div className={`px-4 py-2 flex items-center justify-between ${signal.bg}`}>
          <div className="flex items-center gap-2">
            <SignalIcon className={`h-4 w-4 ${signal.color}`} />
            <span className={`text-sm font-medium ${signal.color}`}>{signal.label}</span>
          </div>
          {isModel && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Liquidité {liquidityScore.toFixed(0)}%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Facilité de revente estimée</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Contenu principal */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Info produit */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded ${isModel ? "bg-blue-500/10" : "bg-purple-500/10"}`}>
                  {isModel ? <Package className="h-4 w-4 text-blue-500" /> : <Tag className="h-4 w-4 text-purple-500" />}
                </div>
                <Link
                  to={isModel ? `/catalog/${item.target_id}` : `/ad/${item.target_id}`}
                  className="font-semibold hover:text-primary truncate"
                >
                  {item.name || `${item.brand || "Inconnu"} #${item.target_id}`}
                </Link>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
                {item.brand && <span className="text-xs text-muted-foreground">{item.brand}</span>}
              </div>

              {/* Prix et comparaison */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Prix actuel</p>
                  <p className="text-lg font-bold">{formatPrice(currentPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Juste prix</p>
                  <p className="text-lg font-medium text-muted-foreground">{formatPrice(fairValue)}</p>
                </div>
              </div>

              {/* Indicateurs visuels */}
              <div className="space-y-2">
                {/* Écart au juste prix */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Écart juste prix</span>
                    <span className={deviation < 0 ? "text-green-500" : deviation > 0 ? "text-red-500" : ""}>
                      {deviation > 0 ? "+" : ""}{deviation.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-1/2 h-full w-0.5 bg-foreground/30"
                      style={{ transform: 'translateX(-50%)' }}
                    />
                    <div 
                      className={`h-full transition-all ${
                        deviation < 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ 
                        width: `${Math.min(50, Math.abs(deviation))}%`,
                        marginLeft: deviation < 0 ? `${50 - Math.min(50, Math.abs(deviation))}%` : '50%'
                      }}
                    />
                  </div>
                </div>

                {/* Position dans la fourchette de prix 30j */}
                {trendData.length > 1 && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Position 30j</span>
                      <span>
                        {formatPrice(priceMin)} - {formatPrice(priceMax)}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={currentVsRange} className="h-2" />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background shadow"
                        style={{ left: `calc(${currentVsRange}% - 6px)` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                      <span>Min</span>
                      <span>Max</span>
                    </div>
                  </div>
                )}

                {/* Variation 7j */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Variation 7 jours</span>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    priceChange < 0 ? "text-green-500" : priceChange > 0 ? "text-red-500" : "text-muted-foreground"
                  }`}>
                    {priceChange < 0 ? <TrendingDown className="h-3 w-3" /> : 
                     priceChange > 0 ? <TrendingUp className="h-3 w-3" /> : null}
                    {priceChange > 0 ? "+" : ""}{priceChange.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique interactif */}
          {isModel && trendData.length > 1 && (
            <div className="mt-4">
              <button 
                onClick={() => setShowChart(!showChart)}
                className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
              >
                <BarChart3 className="h-3 w-3" />
                {showChart ? "Masquer le graphique" : "Voir l'historique 30j"}
              </button>
              
              {showChart && (
                <div className="h-32 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id={`gradient-${item.target_id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v ? new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : ''}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={['dataMin - 20', 'dataMax + 20']} 
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}€`}
                        width={50}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => [formatPrice(value), "Prix"]}
                        labelFormatter={(label) => label ? new Date(label).toLocaleDateString('fr-FR') : ''}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                      {fairValue > 0 && (
                        <ReferenceLine 
                          y={fairValue} 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeDasharray="3 3"
                          label={{ value: 'Juste prix', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        fill={`url(#gradient-${item.target_id})`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={onCreateAlert}>
                      <Bell className="h-4 w-4 mr-1" />
                      Alerte
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Créer une alerte prix</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Link to={isModel ? `/catalog/${item.target_id}` : `/ad/${item.target_id}`}>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Détails
                </Button>
              </Link>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={isRemoving}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Retirer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
