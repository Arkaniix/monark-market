import { useState, useMemo } from "react";
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
  History,
  Search,
  Minus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useModelsAutocomplete,
  useRunEstimation,
  useEstimationHistory,
  useEstimatorStats,
  type EstimationResult,
  type ModelAutocomplete,
} from "@/hooks/useEstimator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Estimator() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"estimator" | "history">("estimator");
  
  // Form state
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelAutocomplete | null>(null);
  const [condition, setCondition] = useState("");
  const [region, setRegion] = useState("");
  const [buyPriceInput, setBuyPriceInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  
  // Result state
  const [result, setResult] = useState<EstimationResult | null>(null);
  
  // History pagination
  const [historyPage, setHistoryPage] = useState(1);

  // API hooks
  const { data: models, isLoading: isLoadingModels } = useModelsAutocomplete(modelSearch);
  const { data: stats } = useEstimatorStats();
  const { data: historyData, isLoading: isLoadingHistory } = useEstimationHistory(historyPage);
  const runEstimation = useRunEstimation();

  const handleCalculate = async () => {
    if (!selectedModel || !condition || !buyPriceInput) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      const estimation = await runEstimation.mutateAsync({
        model_id: selectedModel.id,
        condition,
        buy_price_input: parseFloat(buyPriceInput),
        region: region || undefined,
        mode_advanced: showAdvanced,
      });
      
      setResult(estimation);
      toast({
        title: "Estimation réussie",
        description: `${estimation.credit_cost} crédits ont été déduits de votre compte`,
      });
    } catch (error: any) {
      const message = error?.message || "Une erreur est survenue";
      
      if (message.includes("crédits") || message.includes("credits") || error?.status === 402) {
        toast({
          title: "Crédits insuffisants",
          description: "Vous n'avez pas assez de crédits pour cette estimation. Rechargez votre compte.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      }
    }
  };

  const handleReset = () => {
    setSelectedModel(null);
    setModelSearch("");
    setCondition("");
    setRegion("");
    setBuyPriceInput("");
    setResult(null);
  };

  // Chart data
  const priceChartData = useMemo(() => 
    result?.trend_90d?.map((price, i) => ({
      day: i + 1,
      prix: price,
    })) || [], [result?.trend_90d]);

  const volumeChartData = useMemo(() =>
    result?.volume_30d?.map((vol, i) => ({
      day: i + 1,
      volume: vol,
    })) || [], [result?.volume_30d]);

  const comparisonChartData = useMemo(() => result
    ? [
        { label: "Prix marché", value: result.market.median_price },
        { label: "Prix conseillé achat", value: result.buy_price_recommended },
        { label: "Prix revente 1m", value: result.sell_price_1m },
      ]
    : [], [result]);

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

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "estimator" | "history")} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="estimator" className="gap-2">
              <Calculator className="h-4 w-4" />
              Estimation
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estimator" className="mt-8">
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
                      <p className="text-lg font-semibold">{stats?.last_recalc || "—"}</p>
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
                        {stats?.total_estimations?.toLocaleString() || "—"}
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
                      <p className="text-sm font-medium">{stats?.data_sources?.join(", ") || "—"}</p>
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
                      {/* Model Autocomplete */}
                      <div className="space-y-2">
                        <Label>Modèle *</Label>
                        <Popover open={modelPopoverOpen} onOpenChange={setModelPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={modelPopoverOpen}
                              className="w-full justify-between"
                            >
                              {selectedModel ? (
                                <span>{selectedModel.name} ({selectedModel.category})</span>
                              ) : (
                                <span className="text-muted-foreground">Rechercher un modèle...</span>
                              )}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 z-50" align="start">
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="Tapez pour rechercher..."
                                value={modelSearch}
                                onValueChange={setModelSearch}
                              />
                              <CommandList>
                                {isLoadingModels && (
                                  <div className="p-4 text-center">
                                    <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                                  </div>
                                )}
                                {!isLoadingModels && modelSearch.length >= 2 && (!models || models.length === 0) && (
                                  <CommandEmpty>Aucun modèle trouvé</CommandEmpty>
                                )}
                                {!isLoadingModels && modelSearch.length < 2 && (
                                  <div className="p-4 text-sm text-muted-foreground text-center">
                                    Tapez au moins 2 caractères
                                  </div>
                                )}
                                <CommandGroup>
                                  {models?.map((model) => (
                                    <CommandItem
                                      key={model.id}
                                      value={model.id.toString()}
                                      onSelect={() => {
                                        setSelectedModel(model);
                                        setModelPopoverOpen(false);
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">{model.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {model.brand} • {model.category}
                                          {model.family && ` • ${model.family}`}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Condition */}
                      <div>
                        <Label htmlFor="condition">État du composant *</Label>
                        <Select value={condition} onValueChange={setCondition}>
                          <SelectTrigger id="condition" className="bg-background mt-2">
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

                      {/* Buy Price */}
                      <div>
                        <Label htmlFor="price">Prix d'achat envisagé (€) *</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="Ex: 280"
                          value={buyPriceInput}
                          onChange={(e) => setBuyPriceInput(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      {/* Advanced Mode */}
                      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full">
                            <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
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
                                <SelectItem value="Hauts-de-France">Hauts-de-France</SelectItem>
                                <SelectItem value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</SelectItem>
                                <SelectItem value="Bretagne">Bretagne</SelectItem>
                                <SelectItem value="Normandie">Normandie</SelectItem>
                                <SelectItem value="Pays de la Loire">Pays de la Loire</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleCalculate}
                          disabled={!selectedModel || !condition || !buyPriceInput || runEstimation.isPending}
                          className="flex-1 gap-2"
                        >
                          {runEstimation.isPending ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Calcul...
                            </>
                          ) : (
                            <>
                              <Calculator className="h-4 w-4" />
                              Estimer
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
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          Prix de revente estimé
                        </h4>
                        <p className="text-muted-foreground">
                          Basé sur la projection linéaire du prix moyen des 30 à 90 derniers
                          jours. Tient compte de la tendance actuelle du marché.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-1 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-orange-500" />
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
                        {/* Credit Cost Badge */}
                        <Badge variant="outline" className="mb-4">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Coût: {result.credit_cost} crédits
                        </Badge>

                        <Badge
                          variant={
                            result.badge === "good"
                              ? "default"
                              : result.badge === "caution"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-base px-6 py-2 gap-2 mb-4 ml-2"
                        >
                          {result.badge === "good" ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5" />
                          )}
                          {result.badge === "good"
                            ? "✅ Bonne opportunité d'achat"
                            : result.badge === "caution"
                            ? "⚠️ Marché instable, prudence"
                            : "📉 Risque élevé"}
                        </Badge>

                        <h2 className="text-2xl font-bold mb-2">{result.model_name}</h2>
                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {result.category} • {result.brand}
                          </span>
                          <span>•</span>
                          <span>État: {result.condition}</span>
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
                              result.market.var_30d_pct >= 0 ? "text-green-500" : "text-destructive"
                            }`}
                          >
                            {result.market.var_30d_pct > 0 ? "+" : ""}
                            {result.market.var_30d_pct}%
                          </p>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Volume annonces</p>
                          <p className="text-2xl font-bold">{result.market.volume_active}</p>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Prob. revente</p>
                          <p className="text-2xl font-bold">
                            {Math.round(result.resell_probability * 100)}%
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
                              {result.buy_price_recommended}€
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
                              {result.sell_price_1m}€
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Prix de vente estimé à 30 jours
                            </p>
                          </CardContent>
                        </Card>

                        <Card className={`border-2 ${
                          result.margin_pct >= 10
                            ? "border-green-500/40 bg-gradient-to-br from-green-500/10 to-transparent"
                            : result.margin_pct >= 0
                            ? "border-orange-500/40 bg-gradient-to-br from-orange-500/10 to-transparent"
                            : "border-destructive/40 bg-gradient-to-br from-destructive/10 to-transparent"
                        }`}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-normal text-muted-foreground">
                              Marge estimée
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-4xl font-bold mb-1 ${
                              result.margin_pct >= 10
                                ? "text-green-500"
                                : result.margin_pct >= 0
                                ? "text-orange-500"
                                : "text-destructive"
                            }`}>
                              {result.margin_pct > 0 ? "+" : ""}
                              {result.margin_pct}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Sur un achat à {result.buy_price_input}€
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Advice */}
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" />
                          Conseil
                        </h4>
                        <p className="text-sm text-muted-foreground">{result.advice}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Charts */}
                  {(priceChartData.length > 0 || volumeChartData.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {priceChartData.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Évolution des prix (90j)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <AreaChart data={priceChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                  type="monotone"
                                  dataKey="prix"
                                  stroke="hsl(var(--primary))"
                                  fill="hsl(var(--primary))"
                                  fillOpacity={0.2}
                                />
                                <ReferenceLine
                                  y={result.buy_price_recommended}
                                  stroke="hsl(var(--accent))"
                                  strokeDasharray="5 5"
                                  label="Achat conseillé"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      {volumeChartData.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Volume des annonces (30j)</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <BarChart data={volumeChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="volume" fill="hsl(var(--accent))" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Comparison Chart */}
                  {comparisonChartData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Comparaison des prix</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={comparisonChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="label" width={150} />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historique des estimations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : historyData?.items && historyData.items.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Modèle</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Prix achat</TableHead>
                          <TableHead>Prix conseillé</TableHead>
                          <TableHead>Revente 1m</TableHead>
                          <TableHead>Marge</TableHead>
                          <TableHead>Tendance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyData.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell className="font-medium">{item.model_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell>{item.buy_price_input}€</TableCell>
                            <TableCell className="text-accent">{item.buy_price_recommended}€</TableCell>
                            <TableCell className="text-primary">{item.sell_price_1m}€</TableCell>
                            <TableCell>
                              <span className={
                                item.margin_pct >= 10
                                  ? "text-green-500"
                                  : item.margin_pct >= 0
                                  ? "text-orange-500"
                                  : "text-destructive"
                              }>
                                {item.margin_pct > 0 ? "+" : ""}{item.margin_pct}%
                              </span>
                            </TableCell>
                            <TableCell>
                              {item.trend === "up" ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : item.trend === "down" ? (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              ) : (
                                <Minus className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {historyData.total > historyData.page_size && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          disabled={historyPage === 1}
                        >
                          Précédent
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {historyData.page} sur {Math.ceil(historyData.total / historyData.page_size)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryPage((p) => p + 1)}
                          disabled={historyPage >= Math.ceil(historyData.total / historyData.page_size)}
                        >
                          Suivant
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune estimation dans l'historique</p>
                    <p className="text-sm">Lancez votre première estimation pour la voir ici</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
