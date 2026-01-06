import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  Download,
  Lock,
  Loader2,
  AlertCircle,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  RotateCcw,
  Camera,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModelsSearch, type SearchState, useEstimationHistoryEnhanced } from "@/hooks";
import {
  useRunEstimation,
  useEstimatorStats,
  type EstimationResult,
} from "@/hooks/useEstimator";
import type { ModelAutocomplete } from "@/providers/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import LockedFeatureOverlay, { LockedValue, PlanBadge } from "@/components/LockedFeatureOverlay";
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
import ImageUpload, { type UploadedImage } from "@/components/estimator/ImageUpload";
import PhotoGalleryModal from "@/components/estimator/PhotoGalleryModal";


export default function Estimator() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"estimator" | "history">("estimator");
  
  // Entitlements - single source of truth
  const { plan, limits, helpers, isLoading: entitlementsLoading } = useEntitlements();
  const { estimator: estimatorLimits } = limits;
  
  // Form state
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelAutocomplete | null>(null);
  const [condition, setCondition] = useState("");
  const [region, setRegion] = useState("");
  const [buyPriceInput, setBuyPriceInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);
  
  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  
  // Photo gallery modal state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryModelName, setGalleryModelName] = useState("");
  
  // Result state
  const [result, setResult] = useState<EstimationResult | null>(null);
  
  // History pagination
  const [historyPage, setHistoryPage] = useState(1);

  // API hooks - using new search hook with debounce/abort/timeout
  const { models, state: searchState, error: searchError, retry: retrySearch } = useModelsSearch(modelSearch);
  const { data: stats } = useEstimatorStats();
  // Only fetch history when on history tab
  const shouldFetchHistory = activeTab === "history";
  const { 
    data: historyData, 
    state: historyState,
    error: historyError,
    refresh: refreshHistory,
    retry: retryHistory,
    isLoading: isLoadingHistory 
  } = useEstimationHistoryEnhanced(historyPage, shouldFetchHistory);
  const runEstimation = useRunEstimation();

  // Helper to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category?.toUpperCase()) {
      case "GPU":
        return <Monitor className="h-4 w-4 text-primary" />;
      case "CPU":
        return <Cpu className="h-4 w-4 text-accent" />;
      case "RAM":
        return <MemoryStick className="h-4 w-4 text-green-500" />;
      case "SSD":
      case "STOCKAGE":
        return <HardDrive className="h-4 w-4 text-orange-500" />;
      default:
        return <Cpu className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Pre-fill from URL params (e.g., coming from ad detail page)
  useEffect(() => {
    if (prefillApplied) return;

    const modelId = searchParams.get('model_id');
    const modelName = searchParams.get('model_name');
    const category = searchParams.get('category');
    const price = searchParams.get('price');
    const conditionParam = searchParams.get('condition');
    const regionParam = searchParams.get('region');

    // Pre-fill model if available
    if (modelId && modelName) {
      setSelectedModel({
        id: parseInt(modelId, 10),
        name: modelName,
        brand: '',
        category: category || '',
        family: null,
      });
      setModelSearch(modelName);
    }

    // Pre-fill price
    if (price) {
      setBuyPriceInput(price);
    }

    // Pre-fill condition (normalize to estimator format)
    if (conditionParam) {
      const conditionMap: Record<string, string> = {
        'neuf': 'neuf',
        'comme_neuf': 'comme-neuf',
        'bon': 'bon',
        'correct': 'bon',
        'à_réparer': 'a-reparer',
      };
      setCondition(conditionMap[conditionParam] || conditionParam);
    }

    // Pre-fill region
    if (regionParam) {
      setRegion(regionParam);
    }

    setPrefillApplied(true);
  }, [searchParams, prefillApplied]);

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
    // Clean up image previews
    uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
  };

  // Open photo gallery for history item
  const openPhotoGallery = (photos: string[], modelName: string) => {
    setGalleryPhotos(photos);
    setGalleryModelName(modelName);
    setGalleryOpen(true);
  };

  const handleExport = () => {
    if (!result || !estimatorLimits.canExportEstimation) {
      toast({
        title: "Export non disponible",
        description: "L'export nécessite le plan Élite",
        variant: "destructive",
      });
      return;
    }
    
    // Simple CSV export
    const csvContent = `Modèle,${result.model_name}
Catégorie,${result.category}
État,${result.condition}
Prix médian,${result.market.median_price}€
Variation 30j,${result.market.var_30d_pct}%
Volume annonces,${result.market.volume_active}
Prix achat conseillé,${result.buy_price_recommended}€
Prix revente 1m,${result.sell_price_1m}€
Marge estimée,${result.margin_pct}%
Probabilité revente,${Math.round(result.resell_probability * 100)}%
Conseil,${result.advice}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `estimation-${result.model_name.replace(/\s+/g, "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export réussi",
      description: "Le fichier CSV a été téléchargé",
    });
  };

  // Chart data - only prepare if plan allows
  const priceChartData = useMemo(() => {
    if (!result?.trend_90d) return [];
    // Starter: no chart data
    if (!estimatorLimits.chartInteractive && estimatorLimits.chartPeriods.length === 0) {
      // Return limited preview data for starter
      return result.trend_90d.slice(-7).map((price, i) => ({
        day: i + 1,
        prix: price,
      }));
    }
    return result.trend_90d.map((price, i) => ({
      day: i + 1,
      prix: price,
    }));
  }, [result?.trend_90d, estimatorLimits]);

  const volumeChartData = useMemo(() => {
    if (!result?.volume_30d) return [];
    if (!estimatorLimits.chartInteractive) {
      return result.volume_30d.slice(-7).map((vol, i) => ({
        day: i + 1,
        volume: vol,
      }));
    }
    return result.volume_30d.map((vol, i) => ({
      day: i + 1,
      volume: vol,
    }));
  }, [result?.volume_30d, estimatorLimits]);

  const comparisonChartData = useMemo(() => {
    if (!result) return [];
    
    const data = [
      { label: "Prix marché", value: result.market.median_price },
    ];
    
    // Only add if plan allows
    if (estimatorLimits.canSeeBuyPrice) {
      data.push({ label: "Prix conseillé achat", value: result.buy_price_recommended });
    }
    if (estimatorLimits.canSeeSellPrice) {
      data.push({ label: "Prix revente 1m", value: result.sell_price_1m });
    }
    
    return data;
  }, [result, estimatorLimits]);

  // Check if user can use estimator
  const canUseEstimator = helpers.canUseEstimator();

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
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-sm text-muted-foreground max-w-2xl">
              Évite de surpayer ou de vendre à perte. Nos estimations se basent sur les
              tendances réelles du marché.
            </p>
            <PlanBadge plan={plan} />
          </div>
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
                      <p className="text-sm text-muted-foreground">Votre plan</p>
                      <p className="text-lg font-semibold capitalize">{plan}</p>
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
                                {/* State: Loading */}
                                {searchState === "loading" && (
                                  <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Recherche…</span>
                                  </div>
                                )}

                                {/* State: Idle (not enough characters) */}
                                {searchState === "idle" && modelSearch.length < 2 && (
                                  <div className="p-4 text-sm text-muted-foreground text-center">
                                    Tapez au moins 2 caractères
                                  </div>
                                )}

                                {/* State: Empty (no results) */}
                                {searchState === "empty" && (
                                  <CommandEmpty>Aucun modèle trouvé</CommandEmpty>
                                )}

                                {/* State: Error */}
                                {searchState === "error" && (
                                  <div className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 text-destructive mb-2">
                                      <AlertCircle className="h-4 w-4" />
                                      <span className="text-sm">{searchError || "Impossible de charger les modèles"}</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={retrySearch}>
                                      <RefreshCw className="h-3 w-3 mr-1" />
                                      Réessayer
                                    </Button>
                                  </div>
                                )}

                                {/* State: Success (show results) */}
                                {searchState === "success" && models.length > 0 && (
                                  <CommandGroup>
                                    {models.map((model) => (
                                      <CommandItem
                                        key={model.id}
                                        value={model.id.toString()}
                                        onSelect={() => {
                                          setSelectedModel(model);
                                          setModelPopoverOpen(false);
                                        }}
                                        className="flex items-center gap-3 cursor-pointer"
                                      >
                                        <div className="flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center">
                                          {getCategoryIcon(model.category)}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                          <span className="font-medium truncate">{model.name}</span>
                                          <span className="text-xs text-muted-foreground truncate">
                                            {model.brand} • {model.category}
                                            {model.family && ` • ${model.family}`}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}
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

                      {/* Photo Upload Section */}
                      <div className="space-y-2 pt-2">
                        <Label className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Photos (optionnel)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Ajoutez des photos de l'annonce ou du produit pour référence
                        </p>
                        <ImageUpload
                          images={uploadedImages}
                          onImagesChange={setUploadedImages}
                          maxFiles={5}
                          maxSizeMB={5}
                          maxWidthPx={1600}
                          disabled={runEstimation.isPending}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleCalculate}
                          disabled={!selectedModel || !condition || !buyPriceInput || runEstimation.isPending || !canUseEstimator}
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
                      Fonctionnalités par plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      {/* Starter features */}
                      <div className="p-3 rounded-lg bg-background/50 border">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <PlanBadge plan="starter" />
                        </h4>
                        <ul className="space-y-1 text-muted-foreground text-xs">
                          <li>✓ Prix médian actuel</li>
                          <li>✓ Variation 30j</li>
                          <li>✓ Volume annonces</li>
                          <li>✓ Label opportunité</li>
                          <li className="text-muted-foreground/60">✗ Prix achat/revente conseillé</li>
                          <li className="text-muted-foreground/60">✗ Marge estimée</li>
                        </ul>
                      </div>

                      {/* Pro features */}
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <PlanBadge plan="pro" />
                        </h4>
                        <ul className="space-y-1 text-muted-foreground text-xs">
                          <li>✓ Tout Starter +</li>
                          <li>✓ Prix achat/revente conseillé</li>
                          <li>✓ Marge & probabilité</li>
                          <li>✓ Graphiques interactifs 30j/90j</li>
                          <li className="text-muted-foreground/60">✗ Export CSV</li>
                        </ul>
                      </div>

                      {/* Elite features */}
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <PlanBadge plan="elite" />
                        </h4>
                        <ul className="space-y-1 text-muted-foreground text-xs">
                          <li>✓ Tout Pro +</li>
                          <li>✓ Export CSV</li>
                          <li>✓ Scénarios avancés</li>
                          <li>✓ Indicateurs premium</li>
                        </ul>
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
                      <div className="flex justify-between items-start mb-6">
                        <div className="text-center flex-1">
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
                        
                        {/* Export button - Elite only */}
                        {estimatorLimits.canExportEstimation ? (
                          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                            <Download className="h-4 w-4" />
                            Exporter
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled className="gap-2 opacity-50">
                            <Lock className="h-4 w-4" />
                            Export
                            <PlanBadge plan="elite" className="ml-1" />
                          </Button>
                        )}
                      </div>

                      {/* Key Metrics Grid - STARTER sees these */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {/* Prix médian - Always visible */}
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Prix médian actuel</p>
                          <p className="text-2xl font-bold text-primary">
                            {result.market.median_price}€
                          </p>
                        </div>
                        
                        {/* Variation 30j - Always visible */}
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
                        
                        {/* Volume - Always visible */}
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Volume annonces</p>
                          <p className="text-2xl font-bold">{result.market.volume_active}</p>
                        </div>
                        
                        {/* Probabilité - PRO+ only */}
                        <LockedFeatureOverlay
                          isLocked={!estimatorLimits.canSeeProbability}
                          requiredPlan="pro"
                          featureName="Probabilité de revente"
                        >
                          <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Prob. revente</p>
                            <p className="text-2xl font-bold">
                              {Math.round(result.resell_probability * 100)}%
                            </p>
                          </div>
                        </LockedFeatureOverlay>
                      </div>

                      {/* Main Results - PRO+ only */}
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Prix achat conseillé - PRO+ */}
                        <LockedFeatureOverlay
                          isLocked={!estimatorLimits.canSeeBuyPrice}
                          requiredPlan="pro"
                          featureName="Prix d'achat conseillé"
                        >
                          <Card className="border-accent/40 bg-gradient-to-br from-accent/10 to-transparent h-full">
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
                        </LockedFeatureOverlay>

                        {/* Prix revente - PRO+ */}
                        <LockedFeatureOverlay
                          isLocked={!estimatorLimits.canSeeSellPrice}
                          requiredPlan="pro"
                          featureName="Prix de revente"
                        >
                          <Card className="border-primary/40 bg-gradient-to-br from-primary/10 to-transparent h-full">
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
                        </LockedFeatureOverlay>

                        {/* Marge - PRO+ */}
                        <LockedFeatureOverlay
                          isLocked={!estimatorLimits.canSeeMargin}
                          requiredPlan="pro"
                          featureName="Marge estimée"
                        >
                          <Card className={`border-2 h-full ${
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
                        </LockedFeatureOverlay>
                      </div>

                      {/* Advice - Always visible */}
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" />
                          Conseil
                        </h4>
                        <p className="text-sm text-muted-foreground">{result.advice}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Charts - with plan restrictions */}
                  {(priceChartData.length > 0 || volumeChartData.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {priceChartData.length > 0 && (
                        <LockedFeatureOverlay
                          isLocked={!estimatorLimits.chartInteractive}
                          requiredPlan="pro"
                          featureName="Graphique interactif"
                          showPreview={true}
                        >
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center justify-between">
                                Évolution des prix (90j)
                                {!estimatorLimits.chartInteractive && (
                                  <Badge variant="outline" className="text-xs">Aperçu</Badge>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={priceChartData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="day" />
                                  <YAxis />
                                  {estimatorLimits.chartInteractive && <Tooltip />}
                                  <Area
                                    type="monotone"
                                    dataKey="prix"
                                    stroke="hsl(var(--primary))"
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.2}
                                  />
                                  {estimatorLimits.canSeeBuyPrice && (
                                    <ReferenceLine
                                      y={result.buy_price_recommended}
                                      stroke="hsl(var(--accent))"
                                      strokeDasharray="5 5"
                                      label="Achat conseillé"
                                    />
                                  )}
                                </AreaChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </LockedFeatureOverlay>
                      )}

                      {volumeChartData.length > 0 && (
                        <LockedFeatureOverlay
                          isLocked={!estimatorLimits.chartInteractive}
                          requiredPlan="pro"
                          featureName="Graphique interactif"
                          showPreview={true}
                        >
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center justify-between">
                                Volume des annonces (30j)
                                {!estimatorLimits.chartInteractive && (
                                  <Badge variant="outline" className="text-xs">Aperçu</Badge>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={volumeChartData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="day" />
                                  <YAxis />
                                  {estimatorLimits.chartInteractive && <Tooltip />}
                                  <Bar dataKey="volume" fill="hsl(var(--accent))" />
                                </BarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </LockedFeatureOverlay>
                      )}
                    </div>
                  )}

                  {/* Comparison Chart - PRO+ */}
                  {comparisonChartData.length > 1 && (
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historique des estimations
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshHistory}
                  disabled={isLoadingHistory}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  Rafraîchir
                </Button>
              </CardHeader>
              <CardContent>
                {/* Loading State - Skeleton Cards */}
                {historyState === "loading" && (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <div className="space-y-2 text-right">
                          <Skeleton className="h-4 w-20 ml-auto" />
                          <Skeleton className="h-3 w-16 ml-auto" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Error State */}
                {historyState === "error" && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-70" />
                    <p className="text-lg font-medium text-destructive mb-2">
                      Erreur de chargement
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {historyError || "Impossible de charger l'historique des estimations"}
                    </p>
                    <Button variant="outline" onClick={retryHistory} className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Réessayer
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {historyState === "empty" && (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Aucune estimation enregistrée</p>
                    <p className="text-sm mt-1">Lancez votre première estimation pour la voir ici</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("estimator")}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Nouvelle estimation
                    </Button>
                  </div>
                )}

                {/* Success State - History Cards */}
                {historyState === "success" && historyData?.items && historyData.items.length > 0 && (
                  <>
                    <div className="space-y-3">
                      {historyData.items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          {/* Model Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              {getCategoryIcon(item.category)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{item.model_name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                                <span>•</span>
                                <span className="capitalize">{item.condition?.replace('-', ' ')}</span>
                                {item.region && (
                                  <>
                                    <span>•</span>
                                    <span>{item.region}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Photo Badge + Date */}
                          <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
                            {/* Photo badge - clickable if has photos */}
                            {item.photos && item.photos.length > 0 && (
                              <button
                                onClick={() => openPhotoGallery(item.photos!, item.model_name)}
                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                                title="Voir les photos"
                              >
                                <Camera className="h-3 w-3" />
                                <span className="text-xs font-medium">{item.photos.length}</span>
                              </button>
                            )}
                            <div>
                              <Clock className="h-3 w-3 inline mr-1" />
                              {new Date(item.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </div>

                          {/* Prices */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="text-muted-foreground text-xs">Achat</p>
                              <p className="font-medium">{item.buy_price_input}€</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground text-xs">Conseillé</p>
                              <LockedValue 
                                value={<span className="font-medium text-accent">{item.buy_price_recommended}€</span>}
                                isLocked={!estimatorLimits.canSeeBuyPrice}
                                requiredPlan="pro"
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground text-xs">Revente</p>
                              <LockedValue 
                                value={<span className="font-medium text-primary">{item.sell_price_1m}€</span>}
                                isLocked={!estimatorLimits.canSeeSellPrice}
                                requiredPlan="pro"
                              />
                            </div>
                          </div>

                          {/* Margin + Trend */}
                          <div className="flex items-center gap-3">
                            <LockedValue 
                              value={
                                <Badge 
                                  variant={item.margin_pct >= 10 ? "default" : item.margin_pct >= 0 ? "secondary" : "destructive"}
                                  className={item.margin_pct >= 10 ? "bg-green-500/20 text-green-600 border-green-500/30" : ""}
                                >
                                  {item.margin_pct > 0 ? "+" : ""}{item.margin_pct}%
                                </Badge>
                              }
                              isLocked={!estimatorLimits.canSeeMargin}
                              requiredPlan="pro"
                            />
                            {item.trend === "up" ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : item.trend === "down" ? (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            ) : (
                              <Minus className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          {/* Reprendre Action */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Pre-fill form with history item values
                              setSelectedModel({
                                id: item.model_id,
                                name: item.model_name,
                                brand: item.brand || '',
                                category: item.category,
                                family: null,
                              });
                              setModelSearch(item.model_name);
                              setCondition(item.condition || '');
                              setRegion(item.region || '');
                              setBuyPriceInput(item.buy_price_input.toString());
                              setResult(null);
                              setActiveTab("estimator");
                              toast({
                                title: "Formulaire pré-rempli",
                                description: `Estimation de ${item.model_name} prête à être relancée`,
                              });
                            }}
                            className="gap-1 shrink-0"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Reprendre
                          </Button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {historyData.total > historyData.page_size && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          disabled={historyPage === 1 || isLoadingHistory}
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
                          disabled={historyPage >= Math.ceil(historyData.total / historyData.page_size) || isLoadingHistory}
                        >
                          Suivant
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Photo Gallery Modal */}
        <PhotoGalleryModal
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
          photos={galleryPhotos}
          modelName={galleryModelName}
        />
      </div>
    </div>
  );
}
