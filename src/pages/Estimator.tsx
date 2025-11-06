import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Activity,
  DollarSign,
  Info,
  Sparkles,
  Clock,
  Database,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Minus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  estimatorStats,
  estimatorModels,
  generateEstimation,
  mockEstimationHistory,
  type ModelEstimation,
  type EstimationHistoryItem,
} from "@/lib/estimatorMockData";

export default function Estimator() {
  const navigate = useNavigate();
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [state, setState] = useState("");
  const [region, setRegion] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [result, setResult] = useState<ModelEstimation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [history, setHistory] = useState<EstimationHistoryItem[]>(mockEstimationHistory);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("estimator_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const handleCalculate = () => {
    if (!selectedModelId || !state || !purchasePrice) return;

    setIsCalculating(true);

    // Simulate calculation delay
    setTimeout(() => {
      const estimation = generateEstimation(
        selectedModelId,
        state,
        parseFloat(purchasePrice),
        region || undefined
      );
      setResult(estimation);
      setIsCalculating(false);

      // Add to history
      if (estimation) {
        const historyItem: EstimationHistoryItem = {
          id: Date.now().toString(),
          date: new Date().toISOString().split("T")[0],
          model: estimation.model,
          category: estimation.category,
          median_price: estimation.market.median_price,
          buy_price: estimation.estimate.buy_price,
          margin_pct: estimation.estimate.profit_margin_pct,
          trend: estimation.market.trend,
        };
        const newHistory = [historyItem, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem("estimator_history", JSON.stringify(newHistory));
      }
    }, 1500);
  };

  const handleReset = () => {
    setSelectedModelId(null);
    setState("");
    setRegion("");
    setPurchasePrice("");
    setResult(null);
  };

  const selectedModel = estimatorModels.find((m) => m.id === selectedModelId);

  // Chart data
  const priceChartData =
    result?.trend_90d.map((price, i) => ({
      day: i + 1,
      prix: price,
    })) || [];

  const volumeChartData =
    result?.volume_30d.map((vol, i) => ({
      day: i + 1,
      volume: vol,
    })) || [];

  const comparisonChartData = result
    ? [
        { label: "Prix marché", value: result.market.median_price },
        { label: "Prix conseillé achat", value: result.estimate.buy_price },
        { label: "Prix revente 30j", value: result.estimate.sell_price_30d },
      ]
    : [];

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Calculator className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold">💰 Estimator</h1>
              <p className="text-muted-foreground">
                Calcule le bon prix d'achat et de revente
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Évite de surpayer ou de vendre à perte. Nos estimations se basent sur les
            tendances réelles du marché.
          </p>
        </motion.div>

        {/* Quick indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Dernier recalcul</p>
                  <p className="text-lg font-semibold">{estimatorStats.last_recalc}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Estimations totales</p>
                  <p className="text-lg font-semibold">
                    {estimatorStats.total_estimations.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Sources de données</p>
                  <p className="text-sm font-medium">{estimatorStats.data_sources.join(", ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Formulaire d'estimation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="model">Modèle *</Label>
                    <Select
                      value={selectedModelId?.toString() || ""}
                      onValueChange={(v) => setSelectedModelId(parseInt(v))}
                    >
                      <SelectTrigger id="model" className="bg-background mt-2">
                        <SelectValue placeholder="Sélectionner un modèle..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50 max-h-[300px]">
                        {estimatorModels.map((model) => (
                          <SelectItem key={model.id} value={model.id.toString()}>
                            {model.fullName} ({model.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="state">État du composant *</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger id="state" className="bg-background mt-2">
                        <SelectValue placeholder="Sélectionner l'état..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="neuf">Neuf</SelectItem>
                        <SelectItem value="comme-neuf">Comme neuf</SelectItem>
                        <SelectItem value="bon">Bon état</SelectItem>
                        <SelectItem value="a-reparer">À réparer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price">Prix d'achat envisagé (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Ex: 280"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full">
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Mode avancé (facultatif)
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="region">Région</Label>
                        <Select value={region} onValueChange={setRegion}>
                          <SelectTrigger id="region" className="bg-background mt-2">
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            <SelectItem value="IDF">Île-de-France</SelectItem>
                            <SelectItem value="ARA">Auvergne-Rhône-Alpes</SelectItem>
                            <SelectItem value="PACA">PACA</SelectItem>
                            <SelectItem value="Occitanie">Occitanie</SelectItem>
                            <SelectItem value="Grand Est">Grand Est</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCalculate}
                      disabled={!selectedModelId || !state || !purchasePrice || isCalculating}
                      className="flex-1 gap-2"
                    >
                      {isCalculating ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Calcul...
                        </>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4" />
                          Estimer maintenant
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-muted/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-5 w-5 text-primary" />
                  Comment fonctionne l'estimateur ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Prix médian actuel
                    </h4>
                    <p className="text-muted-foreground">
                      Calculé à partir du prix médian des annonces actives (hors outliers),
                      ajusté selon l'état et la région.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-accent" />
                      Prix d'achat conseillé
                    </h4>
                    <p className="text-muted-foreground">
                      Prix médian - marge de sécurité (5 à 10% selon rareté et tendance).
                      Ne payez pas plus pour maximiser votre marge.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      Prix de revente estimé
                    </h4>
                    <p className="text-muted-foreground">
                      Basé sur la projection linéaire du prix moyen des 30 à 90 derniers
                      jours. Tient compte de la tendance actuelle du marché.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-warning" />
                      Probabilité de revente rapide
                    </h4>
                    <p className="text-muted-foreground">
                      Calculée via le volume d'annonces et la rareté. Plus le composant est
                      demandé, plus il se revendra vite.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Badge & Summary */}
              <Card className="border-2 shadow-xl">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <Badge
                      variant={
                        result.estimate.badge === "good"
                          ? "default"
                          : result.estimate.badge === "caution"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-base px-6 py-2 gap-2 mb-4"
                    >
                      {result.estimate.badge === "good" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : result.estimate.badge === "caution" ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5" />
                      )}
                      {result.estimate.badge === "good"
                        ? "✅ Bonne opportunité d'achat"
                        : result.estimate.badge === "caution"
                        ? "⚠️ Marché instable, prudence"
                        : "📉 Risque élevé"}
                    </Badge>

                    <h2 className="text-2xl font-bold mb-2">{result.model}</h2>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {result.category} • {result.brand}
                      </span>
                      <span>•</span>
                      <span>État: {result.state}</span>
                      {result.region && (
                        <>
                          <span>•</span>
                          <span>{result.region}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Prix médian actuel</p>
                      <p className="text-2xl font-bold text-primary">
                        {result.market.median_price}€
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Variation 30j</p>
                      <p
                        className={`text-2xl font-bold ${
                          result.market.var_30d_pct >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {result.market.var_30d_pct > 0 ? "+" : ""}
                        {result.market.var_30d_pct}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Volume annonces</p>
                      <p className="text-2xl font-bold">{result.market.volume}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Indice de rareté</p>
                      <p className="text-2xl font-bold">
                        {Math.round(result.market.rarity_index * 100) / 100}
                      </p>
                    </div>
                  </div>

                  {/* Main Results */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="border-accent/40 bg-gradient-to-br from-accent/10 to-transparent">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-normal text-muted-foreground">
                          Prix d'achat conseillé
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-accent mb-1">
                          {result.estimate.buy_price}€
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Ne payez pas plus pour maximiser votre marge
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/40 bg-gradient-to-br from-primary/10 to-transparent">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-normal text-muted-foreground">
                          Prix de revente (1 mois)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-primary mb-1">
                          {result.estimate.sell_price_30d}€
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Prix optimal pour vente rapide
                        </p>
                      </CardContent>
                    </Card>

                    <Card
                      className={`border-${
                        result.estimate.profit_margin_pct >= 0 ? "success" : "destructive"
                      }/40 bg-gradient-to-br from-${
                        result.estimate.profit_margin_pct >= 0 ? "success" : "destructive"
                      }/10 to-transparent`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-normal text-muted-foreground">
                          Marge brute potentielle
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div
                          className={`text-4xl font-bold mb-1 flex items-center gap-2 ${
                            result.estimate.profit_margin_pct >= 0
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {result.estimate.profit_margin_pct >= 0 ? (
                            <TrendingUp className="h-8 w-8" />
                          ) : (
                            <TrendingDown className="h-8 w-8" />
                          )}
                          {result.estimate.profit_margin_pct > 0 ? "+" : ""}
                          {result.estimate.profit_margin_pct}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Probabilité revente: {Math.round(result.estimate.resell_probability * 100)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Évolution du prix médian (90j)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={priceChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="day"
                          className="text-xs"
                          label={{ value: "Jours", position: "insideBottom", offset: -5 }}
                        />
                        <YAxis className="text-xs" label={{ value: "Prix (€)", angle: -90, position: "insideLeft" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="prix"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Volume d'annonces (30j)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={volumeChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="day"
                          className="text-xs"
                          label={{ value: "Jours", position: "insideBottom", offset: -5 }}
                        />
                        <YAxis className="text-xs" label={{ value: "Annonces", angle: -90, position: "insideLeft" }} />
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
                          stroke="hsl(var(--accent))"
                          fill="hsl(var(--accent) / 0.2)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comparatif prix médian vs estimations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="label" type="category" className="text-xs" width={150} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => [`${value}€`, "Prix"]}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Advice */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Recommandation automatique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {result.estimate.advice}
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                    <p>
                      <strong>Conseil:</strong> Achetez uniquement si le prix est ≤{" "}
                      {result.estimate.buy_price}€.
                    </p>
                    {result.market.trend === "down" && (
                      <p>
                        Attendez 2 à 3 semaines si le marché reste en baisse pour obtenir un
                        meilleur prix.
                      </p>
                    )}
                    <p>
                      <strong>Revente idéale:</strong> {result.estimate.sell_price_30d}€ sous 30
                      jours.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate(`/deals?model=${selectedModel?.name}`)}
                  className="gap-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  Voir les meilleures offres pour ce modèle
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate(`/trends?category=${result.category}`)}
                  className="gap-2"
                >
                  <TrendingUp className="h-5 w-5" />
                  Explorer les tendances similaires
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate("/community")}
                  className="gap-2"
                >
                  <Database className="h-5 w-5" />
                  Contribuer à la mise à jour des données
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Historique des estimations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune estimation pour le moment. Lancez votre première estimation ci-dessus !
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-2 font-semibold">Date</th>
                        <th className="pb-2 font-semibold">Modèle</th>
                        <th className="pb-2 font-semibold">Catégorie</th>
                        <th className="pb-2 font-semibold">Prix médian</th>
                        <th className="pb-2 font-semibold">Prix conseillé</th>
                        <th className="pb-2 font-semibold">Marge</th>
                        <th className="pb-2 font-semibold">Tendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-3">{item.date}</td>
                          <td className="py-3 font-medium">{item.model}</td>
                          <td className="py-3">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="py-3">{item.median_price}€</td>
                          <td className="py-3 font-semibold text-accent">{item.buy_price}€</td>
                          <td
                            className={`py-3 font-semibold ${
                              item.margin_pct >= 0 ? "text-success" : "text-destructive"
                            }`}
                          >
                            {item.margin_pct > 0 ? "+" : ""}
                            {item.margin_pct}%
                          </td>
                          <td className="py-3">
                            {item.trend === "up" ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : item.trend === "down" ? (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            ) : (
                              <Minus className="h-4 w-4 text-muted-foreground" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Methodology */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">Sources de données & méthodologie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
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
              <p>• Toutes les données sont anonymisées et agrégées conformément au RGPD.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
