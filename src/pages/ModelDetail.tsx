import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Activity,
  Zap,
  ArrowLeft,
  Package,
  Flame,
  Eye,
  BarChart3,
} from "lucide-react";
import { mockModels, mockAds } from "@/lib/mockData";
import ModelComparator from "@/components/ModelComparator";

export default function ModelDetail() {
  const { id } = useParams();
  const model = mockModels.find((m) => m.id === id);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [showComparator, setShowComparator] = useState(false);

  if (!model) {
    return (
      <div className="min-h-screen py-8">
        <div className="container">
          <Card className="p-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Modèle introuvable</h2>
              <p className="text-muted-foreground mb-4">
                Le modèle que vous recherchez n'existe pas.
              </p>
              <Link to="/catalog">
                <Button>Retour au catalogue</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Mock related ads
  const relatedAds = mockAds.filter((ad) => ad.model === model.name).slice(0, 5);

  // Extended price history for different periods
  const priceHistory7d = model.priceHistory.slice(-7);
  const priceHistory30d = model.priceHistory;
  const priceHistory90d = [
    { date: "15/10", price: model.medianPrice * 1.15 },
    { date: "22/10", price: model.medianPrice * 1.13 },
    { date: "29/10", price: model.medianPrice * 1.11 },
    { date: "05/11", price: model.medianPrice * 1.09 },
    { date: "12/11", price: model.medianPrice * 1.07 },
    { date: "19/11", price: model.medianPrice * 1.05 },
    { date: "26/11", price: model.medianPrice * 1.03 },
    ...model.priceHistory,
  ];

  const currentHistory =
    selectedPeriod === "7"
      ? priceHistory7d
      : selectedPeriod === "30"
      ? priceHistory30d
      : priceHistory90d;

  // Price distribution (histogram)
  const priceDistribution = [
    { range: `${model.medianPrice - 100}-${model.medianPrice - 50}`, count: 12 },
    { range: `${model.medianPrice - 50}-${model.medianPrice - 25}`, count: 28 },
    { range: `${model.medianPrice - 25}-${model.medianPrice}`, count: 45 },
    { range: `${model.medianPrice}-${model.medianPrice + 25}`, count: 38 },
    { range: `${model.medianPrice + 25}-${model.medianPrice + 50}`, count: 22 },
    { range: `${model.medianPrice + 50}-${model.medianPrice + 100}`, count: 8 },
  ];

  // Regional prices
  const regionalPrices = [
    { region: "Île-de-France", avgPrice: model.medianPrice + 15, volume: 89 },
    { region: "Auvergne-Rhône-Alpes", avgPrice: model.medianPrice - 5, volume: 42 },
    { region: "Provence-Alpes-Côte d'Azur", avgPrice: model.medianPrice + 8, volume: 35 },
    { region: "Occitanie", avgPrice: model.medianPrice - 12, volume: 28 },
    { region: "Nouvelle-Aquitaine", avgPrice: model.medianPrice - 8, volume: 24 },
    { region: "Grand Est", avgPrice: model.medianPrice + 3, volume: 18 },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Back Button */}
        <Link to="/catalog">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {model.category}
              </Badge>
              <h1 className="text-4xl font-bold mb-2">{model.name}</h1>
              <p className="text-xl text-muted-foreground">{model.brand}</p>
            </div>
            <Badge
              variant={
                model.rarity === "Commun"
                  ? "secondary"
                  : model.rarity === "Peu courant"
                  ? "default"
                  : "destructive"
              }
              className="text-base px-4 py-2"
            >
              {model.rarity}
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Prix médian actuel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{model.medianPrice}€</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Variation 30j
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold flex items-center gap-2 ${
                    model.priceChange30d < 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {model.priceChange30d < 0 ? (
                    <TrendingDown className="h-6 w-6" />
                  ) : (
                    <TrendingUp className="h-6 w-6" />
                  )}
                  {model.priceChange30d.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Volume d'annonces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{model.volume}</div>
                <p className="text-xs text-muted-foreground mt-1">annonces actives</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Dernière mise à jour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {new Date(model.lastUpdate).toLocaleDateString("fr-FR")}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <Dialog open={showComparator} onOpenChange={setShowComparator}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Comparer avec un autre modèle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Comparateur de modèles</DialogTitle>
                <DialogDescription>
                  Comparez {model.name} avec un autre modèle
                </DialogDescription>
              </DialogHeader>
              <ModelComparator currentModel={model} />
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="gap-2">
            <Zap className="h-4 w-4" />
            Lancer un scan
          </Button>

          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Ajouter à la watchlist
          </Button>
        </div>

        {/* Price Evolution Chart */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Évolution du prix médian</CardTitle>
              <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <TabsList>
                  <TabsTrigger value="7">7 jours</TabsTrigger>
                  <TabsTrigger value="30">30 jours</TabsTrigger>
                  <TabsTrigger value="90">90 jours</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={currentHistory}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => [`${value}€`, "Prix"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Price Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution des prix (30 derniers jours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="range" className="text-xs" angle={-45} textAnchor="end" height={80} />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => [`${value} annonces`, "Nombre"]}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  La majorité des annonces ({45 + 38} sur {153}) se situe entre{" "}
                  <span className="font-semibold text-foreground">
                    {model.medianPrice - 25}€ et {model.medianPrice + 25}€
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Regional Prices */}
          <Card>
            <CardHeader>
              <CardTitle>Prix moyens par région</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalPrices.map((region, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{region.volume} annonces</span>
                        <span className="font-bold">{region.avgPrice}€</span>
                        <span
                          className={`text-xs ${
                            region.avgPrice < model.medianPrice
                              ? "text-success"
                              : region.avgPrice > model.medianPrice
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {region.avgPrice > model.medianPrice ? "+" : ""}
                          {region.avgPrice - model.medianPrice}€
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full"
                        style={{
                          width: `${(region.volume / regionalPrices[0].volume) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 Les meilleures opportunités se trouvent actuellement en{" "}
                  <span className="font-semibold text-foreground">Occitanie</span> (-12€ vs
                  médiane)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Ads */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Meilleures annonces actuelles</CardTitle>
              <Link to="/deals">
                <Button variant="outline" size="sm">
                  Voir toutes les annonces
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {relatedAds.length > 0 ? (
              <div className="space-y-3">
                {relatedAds.map((ad) => (
                  <div
                    key={ad.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={ad.dealScore > 85 ? "default" : "secondary"}>
                          {ad.dealScore > 85 && <Flame className="h-3 w-3 mr-1" />}
                          Score: {ad.dealScore}
                        </Badge>
                        <Badge variant="outline">{ad.condition}</Badge>
                      </div>
                      <div className="font-medium mb-1">{ad.title}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {ad.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(ad.date).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {ad.seller}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold">{ad.price}€</div>
                      <div className="text-xs text-success font-medium">
                        -{Math.round(((ad.fairValue - ad.price) / ad.fairValue) * 100)}% vs Fair
                        Value
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune annonce active pour ce modèle actuellement</p>
                <Button variant="outline" className="mt-4 gap-2">
                  <Zap className="h-4 w-4" />
                  Lancer un scan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Analyse & Recommandations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Tendance baissière</h3>
                    <p className="text-sm text-muted-foreground">
                      Le prix a baissé de {Math.abs(model.priceChange30d).toFixed(1)}% sur 30
                      jours. C'est le bon moment pour acheter si vous cherchez ce modèle.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Volume élevé</h3>
                    <p className="text-sm text-muted-foreground">
                      {model.volume} annonces actives. Bonne liquidité du marché, facile de revendre
                      rapidement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Opportunités régionales</h3>
                    <p className="text-sm text-muted-foreground">
                      Prix -12€ en Occitanie vs médiane nationale. Élargissez votre zone de
                      recherche.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <Flame className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Deals disponibles</h3>
                    <p className="text-sm text-muted-foreground">
                      {relatedAds.filter((a) => a.dealScore > 85).length} annonces avec score supérieur à 85.
                      Agissez vite, ces opportunités partent rapidement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
