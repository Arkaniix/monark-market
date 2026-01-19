// Section graphiques - Pro+
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { 
  TrendingUp, 
  BarChart3,
  Lock
} from "lucide-react";
import LockedFeatureOverlay from "@/components/LockedFeatureOverlay";
import type { EstimationResultUI } from "@/hooks/useEstimator";
import type { PlanType, EstimatorFeatures } from "@/hooks/useEntitlements";

interface ChartsSectionProps {
  result: EstimationResultUI;
  plan: PlanType;
  limits: EstimatorFeatures;
}

export default function ChartsSection({ result, plan, limits }: ChartsSectionProps) {
  const [chartPeriod, setChartPeriod] = useState<"30" | "90">("30");
  
  // Préparer les données des graphiques
  const priceChartData = useMemo(() => {
    if (!result?.trend_90d) return [];
    
    const dataLength = chartPeriod === "30" ? 30 : 90;
    const data = result.trend_90d.slice(-dataLength);
    
    return data.map((price, i) => ({
      day: i + 1,
      prix: price,
      label: `J-${dataLength - i}`,
    }));
  }, [result?.trend_90d, chartPeriod]);

  const volumeChartData = useMemo(() => {
    if (!result?.volume_30d) return [];
    return result.volume_30d.map((vol, i) => ({
      day: i + 1,
      volume: vol,
      label: `J-${30 - i}`,
    }));
  }, [result?.volume_30d]);

  const isStarter = plan === "starter";
  const canInteract = limits.chartInteractive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="space-y-4"
    >
      {/* Évolution des prix */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Évolution des prix
              <Badge variant="outline" className={`ml-2 gap-1 text-xs ${isStarter ? "" : "border-primary/50 text-primary"}`}>
                <Lock className="h-3 w-3" /> Pro
              </Badge>
            </CardTitle>
            {canInteract && (
              <div className="flex gap-2">
                {limits.chartPeriods.includes("30") && (
                  <Button
                    variant={chartPeriod === "30" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartPeriod("30")}
                  >
                    30j
                  </Button>
                )}
                {limits.chartPeriods.includes("90") && (
                  <Button
                    variant={chartPeriod === "90" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartPeriod("90")}
                  >
                    90j
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            isLocked={!canInteract}
            requiredPlan="pro"
            featureName="Graphiques interactifs"
            showPreview={true}
          >
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={priceChartData}>
                  <defs>
                    <linearGradient id="colorPrix" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `J${value}`}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}€`}
                    domain={['dataMin - 10', 'dataMax + 10']}
                  />
                  {canInteract && (
                    <Tooltip
                      formatter={(value: number) => [`${value} €`, "Prix"]}
                      labelFormatter={(label) => `Jour ${label}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  <ReferenceLine 
                    y={result.market.median_price} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    label={{ 
                      value: "Médian", 
                      position: "right",
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="prix"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorPrix)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {canInteract 
                  ? `Historique des prix sur les ${chartPeriod} derniers jours. La ligne pointillée indique le prix médian actuel.`
                  : "Aperçu limité. Passez au plan Pro pour interagir avec les graphiques."
                }
              </p>
            </div>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>

      {/* Volume des annonces */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            Volume des annonces (30j)
            <Badge variant="outline" className={`ml-2 gap-1 text-xs ${isStarter ? "" : "border-primary/50 text-primary"}`}>
              <Lock className="h-3 w-3" /> Pro
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            isLocked={!canInteract}
            requiredPlan="pro"
            featureName="Graphique volume"
            showPreview={true}
          >
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={volumeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value % 5 === 0 ? `J${value}` : ""}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  {canInteract && (
                    <Tooltip
                      formatter={(value: number) => [value, "Annonces"]}
                      labelFormatter={(label) => `Jour ${label}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  <Bar 
                    dataKey="volume" 
                    fill="hsl(var(--accent))" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Nombre d'annonces actives par jour. Un volume élevé indique une forte activité.
              </p>
            </div>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>
    </motion.div>
  );
}
