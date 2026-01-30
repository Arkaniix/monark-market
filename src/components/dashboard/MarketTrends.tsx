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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { TrendsData, TopModel, MarketTrendPoint } from "@/providers/types";

interface MarketTrendsProps {
  data: TrendsData | undefined;
  isLoading: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "Tous", dataKey: "global" },
  { value: "GPU", label: "GPU", dataKey: "gpu" },
  { value: "CPU", label: "CPU", dataKey: "cpu" },
  { value: "RAM", label: "RAM", dataKey: "ram" },
  { value: "SSD", label: "SSD", dataKey: "ssd" },
  { value: "Autres", label: "Autres", dataKey: "cm" },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function MarketTrends({ data, isLoading }: MarketTrendsProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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

  // Safe destructuring with fallbacks
  const summary = data.summary ?? { median_price: 0, volume_total: 0, new_models: 0, offer_demand_ratio: 1, var_30d: 0 };
  const marketTrends = Array.isArray(data.marketTrends) ? data.marketTrends : [];
  const topIncreases = Array.isArray(data.topIncreases) ? data.topIncreases : [];
  const topDrops = Array.isArray(data.topDrops) ? data.topDrops : [];
  const categoryVariations = Array.isArray(data.categoryVariations) ? data.categoryVariations : [];

  // Filter helper
  const matchesCategory = (category: string) => {
    if (categoryFilter === "all") return true;
    if (categoryFilter === "Autres") {
      return !["GPU", "CPU", "RAM", "SSD"].includes(category);
    }
    return category === categoryFilter;
  };

  // Filter data based on selected category (already safe arrays)
  const filteredTopIncreases = topIncreases.filter((m: TopModel) => matchesCategory(m.category));
  const filteredTopDrops = topDrops.filter((m: TopModel) => matchesCategory(m.category));
  const filteredCategoryVariations = categoryVariations.filter((c) => matchesCategory(c.category));

  // Get the dataKey for the selected category
  const selectedOption = CATEGORY_OPTIONS.find(opt => opt.value === categoryFilter) || CATEGORY_OPTIONS[0];
  const chartDataKey = selectedOption.dataKey;
  const chartLabel = categoryFilter === "all" ? "Global" : selectedOption.label;

  const formatPrice = (value: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

  const formatPercent = (value: number) => 
    `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  // Prendre les 14 derniers points pour le graphique compact avec toutes les catégories
  const chartData = marketTrends.slice(-14).map((point: MarketTrendPoint) => ({
    date: new Date(point.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    global: point.global,
    gpu: (point as any).gpu || point.global,
    cpu: (point as any).cpu || point.global,
    ram: (point as any).ram || point.global,
    ssd: (point as any).ssd || point.global,
    cm: (point as any).cm || point.global,
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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Évolution des prix (14 derniers jours)
                </CardTitle>
                <div className="flex items-center gap-1 p-1 rounded-md bg-muted">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={categoryFilter === opt.value ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setCategoryFilter(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCategory" x1="0" y1="0" x2="0" y2="1">
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
                      formatter={(value: number) => [`${value.toFixed(0)} €`, `Prix ${chartLabel}`]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={chartDataKey}
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorCategory)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Variations par catégorie */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-3">Variation 30j par catégorie</p>
                <div className="flex flex-wrap gap-3">
                  {filteredCategoryVariations.length > 0 ? filteredCategoryVariations.map((cat) => (
                    <div key={cat.category} className="flex items-center gap-2">
                      <Badge variant="outline" className={getCategoryColor(cat.category)}>
                        {cat.category}
                      </Badge>
                      <span className={`text-sm font-medium ${cat.variation >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {formatPercent(cat.variation)}
                      </span>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">Aucune donnée pour cette catégorie</p>
                  )}
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
                  {filteredTopIncreases.length > 0 ? filteredTopIncreases.slice(0, 3).map((model: TopModel, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-red-500/5 border border-red-500/10">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{model.model}</p>
                        <Badge variant="outline" className="text-xs">{model.category}</Badge>
                      </div>
                      <span className="text-red-500 font-bold ml-2">
                        +{model.var_30d_pct.toFixed(1)}%
                      </span>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground py-2">Aucune hausse</p>
                  )}
                </div>
              </div>

              {/* Top baisses */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Baisses</span>
                </div>
                <div className="space-y-2">
                  {filteredTopDrops.length > 0 ? filteredTopDrops.slice(0, 3).map((model: TopModel, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-green-500/5 border border-green-500/10">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{model.model}</p>
                        <Badge variant="outline" className="text-xs">{model.category}</Badge>
                      </div>
                      <span className="text-green-500 font-bold ml-2">
                        {model.var_30d_pct.toFixed(1)}%
                      </span>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground py-2">Aucune baisse</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
