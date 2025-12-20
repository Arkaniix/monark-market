import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Activity,
  Package,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendsData, TopModel, MarketTrendPoint } from "@/providers/types";

interface MarketTrendsProps {
  data: TrendsData | undefined;
  isLoading: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function MarketTrends({ data, isLoading }: MarketTrendsProps) {
  if (isLoading || !data) {
    return (
      <section className="py-8">
        <div className="container">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Tendances du marché</h2>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </section>
    );
  }

  const { summary, marketTrends, topIncreases, topDrops, categoryVariations } = data;

  const formatPrice = (value: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

  const formatPercent = (value: number) => 
    `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  // Prendre les 7 derniers points pour le graphique compact
  const chartData = marketTrends.slice(-14).map((point: MarketTrendPoint) => ({
    date: new Date(point.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    global: point.global,
  }));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "GPU": return "text-primary";
      case "CPU": return "text-accent";
      case "RAM": return "text-green-500";
      case "SSD": return "text-amber-500";
      case "CM": return "text-purple-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <section className="py-8 bg-gradient-to-b from-muted/20 to-background">
      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Tendances du marché
            </h2>
            <p className="text-muted-foreground">Vue globale du marché hardware d'occasion</p>
          </div>
          <Link to="/deals">
            <Button variant="outline" size="sm">
              Explorer le marché
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <motion.div 
          variants={itemVariants} 
          initial="hidden" 
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prix médian</p>
                  <p className="text-xl font-bold">{formatPrice(summary.median_price)}</p>
                  <p className={`text-xs ${summary.var_30d >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {formatPercent(summary.var_30d)} / 30j
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Volume total</p>
                  <p className="text-xl font-bold">{summary.volume_total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">annonces actives</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Layers className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nouveaux modèles</p>
                  <p className="text-xl font-bold">{summary.new_models}</p>
                  <p className="text-xs text-muted-foreground">ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Activity className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ratio O/D</p>
                  <p className="text-xl font-bold">{summary.offer_demand_ratio.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">offre / demande</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Graphique + Top Hausses/Baisses */}
        <motion.div 
          variants={itemVariants} 
          initial="hidden" 
          animate="visible"
          transition={{ delay: 0.1 }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Graphique évolution prix */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Évolution des prix (14 derniers jours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorGlobal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}€`}
                      domain={['dataMin - 10', 'dataMax + 10']}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(0)} €`, 'Prix médian']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="global" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorGlobal)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Variations par catégorie */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-3">Variation 30j par catégorie</p>
                <div className="flex flex-wrap gap-3">
                  {categoryVariations.map((cat) => (
                    <div key={cat.category} className="flex items-center gap-2">
                      <Badge variant="outline" className={getCategoryColor(cat.category)}>
                        {cat.category}
                      </Badge>
                      <span className={`text-sm font-medium ${cat.variation >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {formatPercent(cat.variation)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Hausses & Baisses compact */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top mouvements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top hausses */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Hausses</span>
                </div>
                <div className="space-y-2">
                  {topIncreases.slice(0, 3).map((model: TopModel, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-red-500/5 border border-red-500/10">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{model.model}</p>
                        <Badge variant="outline" className="text-xs">{model.category}</Badge>
                      </div>
                      <span className="text-red-500 font-bold ml-2">
                        +{model.var_30d_pct.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top baisses */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Baisses</span>
                </div>
                <div className="space-y-2">
                  {topDrops.slice(0, 3).map((model: TopModel, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-green-500/5 border border-green-500/10">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{model.model}</p>
                        <Badge variant="outline" className="text-xs">{model.category}</Badge>
                      </div>
                      <span className="text-green-500 font-bold ml-2">
                        {model.var_30d_pct.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
