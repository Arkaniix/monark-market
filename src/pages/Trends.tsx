import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useTrends } from "@/hooks/useProviderData";
import { TrendsSkeleton } from "@/components/trends/TrendsSkeleton";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Trends() {
  const [period, setPeriod] = useState<"7" | "30" | "90" | "180">("30");
  const [category, setCategory] = useState<string>("all");
  const [indicator, setIndicator] = useState<"price" | "volume" | "rarity" | "variation">("price");
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { data: trendsData, isLoading, error, refetch, isRefetching } = useTrends(period);

  const formatPrice = (value: number) => `${value}€`;
  const formatPercent = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

  const getTrendIcon = (value: number) => {
    if (value > 1) return <TrendingUp className="h-4 w-4 text-success" />;
    if (value < -1) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendBadge = (value: number) => {
    if (value > 1)
      return (
        <Badge variant="default" className="gap-1 bg-success/10 text-success border-success/20">
          <TrendingUp className="h-3 w-3" />
          {formatPercent(value)}
        </Badge>
      );
    if (value < -1)
      return (
        <Badge variant="destructive" className="gap-1">
          <TrendingDown className="h-3 w-3" />
          {formatPercent(value)}
        </Badge>
      );
    return (
      <Badge variant="secondary" className="gap-1">
        <Activity className="h-3 w-3" />
        {formatPercent(value)}
      </Badge>
    );
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Actualisation",
      description: "Les données sont en cours de mise à jour...",
    });
  };

  // Loading state
  if (isLoading) {
    return <TrendsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-7xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Impossible de charger les tendances du marché. 
              <Button variant="link" className="px-2" onClick={() => refetch()}>
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty state
  if (!trendsData) {
    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-7xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Aucune donnée</AlertTitle>
            <AlertDescription>
              Aucune donnée de tendances disponible pour le moment.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const {
    summary: marketSummary,
    marketTrends,
    volumeTrends,
    topIncreases,
    topDrops,
    mostActive,
    rareModels,
    regionStats,
    categoryDetails,
    categoryVariations,
  } = trendsData;

  const filteredTrends = marketTrends.slice(-parseInt(period));
  const filteredVolumes = volumeTrends.slice(-parseInt(period));

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">📊 Tendances du marché du hardware d'occasion</h1>
          <p className="text-muted-foreground">
            Analyse en temps réel des prix, volumes et raretés, calculée à partir des données
            communautaires.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Mise à jour :{" "}
            {formatDistanceToNow(new Date(marketSummary.last_update), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-5 gap-4 mb-8"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Prix médian global (30j)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{marketSummary.median_price}€</div>
                {getTrendIcon(marketSummary.var_30d)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Variation moyenne (30j)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{formatPercent(marketSummary.var_30d)}</div>
                {getTrendBadge(marketSummary.var_30d)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Volume total d'annonces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {marketSummary.volume_total.toLocaleString("fr-FR")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">annonces actives</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Nouveaux modèles détectés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{marketSummary.new_models}</div>
              <p className="text-xs text-muted-foreground mt-1">ce mois-ci</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Ratio offre / demande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{marketSummary.offer_demand_ratio}</div>
              <p className="text-xs text-muted-foreground mt-1">estimé</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Label>Période</Label>
                  <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="90">90 jours</SelectItem>
                      <SelectItem value="180">180 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Catégorie</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="gpu">GPU</SelectItem>
                      <SelectItem value="cpu">CPU</SelectItem>
                      <SelectItem value="ram">RAM</SelectItem>
                      <SelectItem value="ssd">SSD</SelectItem>
                      <SelectItem value="cm">Carte mère</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label>Indicateur</Label>
                  <Select value={indicator} onValueChange={(v) => setIndicator(v as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Prix médian</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="variation">Variation %</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="moving-avg"
                    checked={showMovingAverage}
                    onCheckedChange={setShowMovingAverage}
                  />
                  <Label htmlFor="moving-avg" className="text-sm">
                    Moyenne mobile 7j
                  </Label>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto gap-2"
                  onClick={handleRefresh}
                  disabled={isRefetching}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Price Evolution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Évolution du prix médian</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => `${value}€`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="global"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Global"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="gpu"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      name="GPU"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="cpu"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      name="CPU"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="ram"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      name="RAM"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Volume Evolution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Volume total d'annonces</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={filteredVolumes}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      name="Volume total"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Category Variations Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Variation moyenne par catégorie (30j)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryVariations} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="category" type="category" className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => formatPercent(value)}
                  />
                  <Bar
                    dataKey="variation"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    label={{ position: "right", formatter: formatPercent }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tables Section */}
        <Tabs defaultValue="increases" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="increases">Top hausses</TabsTrigger>
            <TabsTrigger value="drops">Top baisses</TabsTrigger>
            <TabsTrigger value="active">Plus actifs</TabsTrigger>
            <TabsTrigger value="rare">Modèles rares</TabsTrigger>
          </TabsList>

          <TabsContent value="increases">
            <Card>
              <CardHeader>
                <CardTitle>Top hausses (30 derniers jours)</CardTitle>
              </CardHeader>
              <CardContent>
                {topIncreases.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Aucune donnée disponible</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modèle</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Variation</TableHead>
                        <TableHead className="text-right">Prix médian</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topIncreases.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.model}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-success font-medium">
                              {formatPercent(item.var_30d_pct)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">{item.median}€</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.volume}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drops">
            <Card>
              <CardHeader>
                <CardTitle>Top baisses (30 derniers jours)</CardTitle>
              </CardHeader>
              <CardContent>
                {topDrops.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Aucune donnée disponible</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modèle</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Variation</TableHead>
                        <TableHead className="text-right">Prix médian</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topDrops.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.model}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-destructive font-medium">
                              {formatPercent(item.var_30d_pct)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">{item.median}€</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.volume}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Modèles les plus actifs</CardTitle>
              </CardHeader>
              <CardContent>
                {mostActive.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Aucune donnée disponible</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modèle</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                        <TableHead className="text-right">Prix médian</TableHead>
                        <TableHead className="text-right">Variation 7j</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mostActive.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.model}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold">{item.volume}</TableCell>
                          <TableCell className="text-right">{item.median}€</TableCell>
                          <TableCell className="text-right">
                            {getTrendBadge(item.var_30d_pct)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rare">
            <Card>
              <CardHeader>
                <CardTitle>Modèles rares</CardTitle>
              </CardHeader>
              <CardContent>
                {rareModels.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Aucune donnée disponible</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modèle</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Volume (7j)</TableHead>
                        <TableHead className="text-right">Prix médian</TableHead>
                        <TableHead className="text-right">Tendance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rareModels.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.model}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{item.volume}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{item.median}€</TableCell>
                          <TableCell className="text-right">
                            {item.var_30d_pct > 0 ? (
                              <Badge variant="default" className="gap-1 bg-success/10 text-success">
                                📈 en hausse
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                📉 en baisse
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Regional Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Prix moyens par région
              </CardTitle>
            </CardHeader>
            <CardContent>
              {regionStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Aucune donnée régionale disponible</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regionStats.map((region, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>{region.region}</span>
                          {getTrendBadge(region.var_30d_pct)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Prix médian</span>
                            <span className="text-lg font-bold">{region.median_price}€</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Volume</span>
                            <span className="text-sm">{region.volume.toLocaleString("fr-FR")}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Tendances détaillées par catégorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryDetails.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Aucune donnée de catégorie disponible</p>
              ) : (
                categoryDetails.map((cat, idx) => (
                  <Card key={idx}>
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedCategory(expandedCategory === cat.category ? null : cat.category)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CardTitle className="text-lg">{cat.category}</CardTitle>
                          {getTrendBadge(cat.var_30d_pct)}
                          <span className="text-sm text-muted-foreground">
                            Prix médian: {cat.median_price}€
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Volume: {cat.volume.toLocaleString("fr-FR")}
                          </span>
                        </div>
                        {expandedCategory === cat.category ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{cat.summary}</p>
                    </CardHeader>
                    {expandedCategory === cat.category && (
                      <CardContent>
                        <div className="grid lg:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h4 className="text-sm font-medium mb-3">Évolution des prix (30j)</h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={cat.price_history}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                  dataKey="date"
                                  tickFormatter={(date) => new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                                  className="text-xs"
                                />
                                <YAxis className="text-xs" />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                  }}
                                  formatter={(value: number) => `${value}€`}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="price"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-3">Volume d'annonces (30j)</h4>
                            <ResponsiveContainer width="100%" height={200}>
                              <AreaChart data={cat.volume_history}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                  dataKey="date"
                                  tickFormatter={(date) => new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                                  className="text-xs"
                                />
                                <YAxis className="text-xs" />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                  }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="volume"
                                  stroke="hsl(var(--chart-2))"
                                  fill="hsl(var(--chart-2))"
                                  fillOpacity={0.2}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-3">Top modèles</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Modèle</TableHead>
                                <TableHead className="text-right">Prix médian</TableHead>
                                <TableHead className="text-right">Variation 30j</TableHead>
                                <TableHead className="text-right">Volume</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cat.top_models.map((model, midx) => (
                                <TableRow key={midx}>
                                  <TableCell className="font-medium">{model.model}</TableCell>
                                  <TableCell className="text-right">{model.median}€</TableCell>
                                  <TableCell className="text-right">
                                    {getTrendBadge(model.var_30d_pct)}
                                  </TableCell>
                                  <TableCell className="text-right text-muted-foreground">
                                    {model.volume}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Methodology Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-8"
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Sources de données & méthodologie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                • Les données proviennent des scraps manuels effectués via l'extension navigateur
                des utilisateurs.
              </p>
              <p>
                • Les prix médians sont recalculés chaque jour à partir des annonces actives (hors
                valeurs extrêmes).
              </p>
              <p>
                • Les volumes et raretés sont mesurés selon le nombre d'annonces disponibles par
                modèle.
              </p>
              <p>
                • Des API externes (Google Trends, eBay Market Data, Hardware.info) pourront être
                intégrées à terme pour affiner les corrélations.
              </p>
              <p>
                • Toutes les données sont anonymisées et agrégées conformément au RGPD.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Button asChild size="lg">
            <Link to="/catalog">Explorer le catalogue complet</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/deals">Voir les deals en direct</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/community">Contribuer aux données</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
