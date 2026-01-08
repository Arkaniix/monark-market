import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calculator, ChevronDown, RefreshCw, History, Search, Loader2, AlertCircle, Cpu, HardDrive, MemoryStick, Monitor, RotateCcw, Eye, Clock, Sparkles, AlertTriangle, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModelsSearch, useEstimationHistoryEnhanced } from "@/hooks";
import { useRunEstimation, useEstimatorStats, type EstimationResultUI } from "@/hooks/useEstimator";
import type { ModelAutocomplete, DealItem } from "@/providers/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import { PlanBadge, LockedValue } from "@/components/LockedFeatureOverlay";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EstimationHistoryItem } from "@/hooks/useEstimationHistory";

// Import section components
import SynthesisBanner from "@/components/estimator/SynthesisBanner";
import IndicatorsSection from "@/components/estimator/IndicatorsSection";
import AnalysisSection from "@/components/estimator/AnalysisSection";
import ScenariosSection from "@/components/estimator/ScenariosSection";
import ChartsSection from "@/components/estimator/ChartsSection";
import DecisionBlock from "@/components/estimator/DecisionBlock";
import NegotiationSection from "@/components/estimator/NegotiationSection";
import PlatformAnalysisSection from "@/components/estimator/PlatformAnalysisSection";
import AdSearchBar from "@/components/estimator/AdSearchBar";

// Available platforms
const PLATFORMS = [
  { value: "leboncoin", label: "Leboncoin" },
  { value: "ebay", label: "eBay" },
  { value: "fb-marketplace", label: "Facebook Marketplace" },
  { value: "vinted", label: "Vinted" },
  { value: "ldlc", label: "LDLC Occasion" },
];

// Plan hierarchy helper
const PLAN_HIERARCHY = { starter: 0, pro: 1, elite: 2 };

// Check if user can see data based on plan used at creation
function canViewHistoryData(currentPlan: string, planAtCreation: string, requiredPlan: 'pro' | 'elite'): boolean {
  const requiredLevel = PLAN_HIERARCHY[requiredPlan];
  const creationLevel = PLAN_HIERARCHY[planAtCreation as keyof typeof PLAN_HIERARCHY] ?? 0;
  // User can see data if they had access when created OR have access now
  return creationLevel >= requiredLevel;
}

export default function Estimator() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"estimator" | "history">("estimator");

  // Entitlements
  const { plan, limits, helpers } = useEntitlements();
  const { estimator: estimatorLimits } = limits;

  // Form state
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelAutocomplete | null>(null);
  const [condition, setCondition] = useState("");
  const [region, setRegion] = useState("");
  const [adPrice, setAdPrice] = useState("");
  const [platform, setPlatform] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [isPCBlocked, setIsPCBlocked] = useState(false);

  // Result state
  const [result, setResult] = useState<EstimationResultUI | null>(null);

  // History modal state
  const [viewHistoryItem, setViewHistoryItem] = useState<EstimationHistoryItem | null>(null);
  const [historyPage, setHistoryPage] = useState(1);

  // API hooks
  const { models, state: searchState, error: searchError, retry: retrySearch } = useModelsSearch(modelSearch);
  const { data: stats } = useEstimatorStats();
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

  // Handle ad selection from search
  const handleAdSelect = (ad: DealItem) => {
    // Block PC and Lot types
    if (ad.item_type === 'pc' || ad.item_type === 'lot') {
      setIsPCBlocked(true);
      toast({
        title: "Type non supporté",
        description: "L'estimation n'est pas disponible pour les PC complets et les lots. Estimez les composants individuellement.",
        variant: "destructive"
      });
      return;
    }
    setIsPCBlocked(false);
    setSelectedModel({
      id: ad.id,
      name: ad.model_name,
      brand: "",
      category: ad.category,
      family: null,
    });
    setModelSearch(ad.model_name);
    setAdPrice(ad.price.toString());
    setPlatform(ad.platform.toLowerCase().replace(" ", "-"));
    setCondition(ad.condition?.toLowerCase().replace(" ", "-") || "bon");
  };

  // Pre-fill from URL
  useEffect(() => {
    if (prefillApplied) return;
    const modelId = searchParams.get('model_id');
    const modelName = searchParams.get('model_name');
    const category = searchParams.get('category');
    const price = searchParams.get('price');
    const conditionParam = searchParams.get('condition');
    const regionParam = searchParams.get('region');
    const platformParam = searchParams.get('platform');
    const itemType = searchParams.get('item_type');

    // Block PC types from URL params
    if (itemType === 'pc' || itemType === 'lot') {
      setIsPCBlocked(true);
      setPrefillApplied(true);
      return;
    }

    if (modelId && modelName) {
      setSelectedModel({
        id: parseInt(modelId, 10),
        name: modelName,
        brand: '',
        category: category || '',
        family: null
      });
      setModelSearch(modelName);
    }
    if (price) setAdPrice(price);
    if (conditionParam) {
      const conditionMap: Record<string, string> = {
        'neuf': 'neuf',
        'comme_neuf': 'comme-neuf',
        'bon': 'bon',
        'correct': 'bon',
        'à_réparer': 'a-reparer'
      };
      setCondition(conditionMap[conditionParam] || conditionParam);
    }
    if (regionParam) setRegion(regionParam);
    if (platformParam) setPlatform(platformParam);
    setPrefillApplied(true);
  }, [searchParams, prefillApplied]);

  const handleCalculate = async () => {
    if (!selectedModel || !condition || !adPrice) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }
    try {
      const estimation = await runEstimation.mutateAsync({
        model_id: selectedModel.id,
        condition,
        buy_price_input: parseFloat(adPrice),
        region: region || undefined,
        mode_advanced: showAdvanced
      });
      setResult({ ...estimation, platform });
      toast({
        title: "Estimation réussie",
        description: `${estimation.credit_cost} crédits déduits`
      });
    } catch (error: any) {
      const message = error?.message || "Une erreur est survenue";
      toast({
        title: message.includes("crédit") ? "Crédits insuffisants" : "Erreur",
        description: message,
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setSelectedModel(null);
    setModelSearch("");
    setCondition("");
    setRegion("");
    setAdPrice("");
    setPlatform("");
    setResult(null);
    setIsPCBlocked(false);
  };

  // Convert history item to result UI format for viewing
  const convertHistoryToResult = (item: EstimationHistoryItem): EstimationResultUI => {
    return {
      model_id: item.model_id,
      model_name: item.model_name,
      category: item.category,
      condition: item.condition,
      region: item.region,
      platform: item.platform,
      buy_price_input: item.buy_price_input,
      buy_price_recommended: item.results.buy_price_recommended,
      sell_price_1m: item.results.sell_price_1m,
      sell_price_3m: item.results.sell_price_3m,
      margin_pct: item.results.margin_pct,
      resell_probability: item.results.resell_probability,
      risk_level: item.results.risk_level,
      advice: item.results.advice,
      badge: item.results.badge,
      market: {
        median_price: item.results.market.median_price,
        var_30d_pct: item.results.market.var_30d_pct,
        volume_active: item.results.market.volume,
        rarity_index: item.results.market.rarity_index,
        trend: item.results.market.trend,
      },
      credit_cost: 0,
    };
  };

  // Get badge for plan at creation
  const getPlanBadge = (planAtCreation: string) => {
    switch (planAtCreation) {
      case 'elite':
        return <Badge variant="secondary" className="gap-1 text-xs"><Crown className="h-3 w-3" />Élite</Badge>;
      case 'pro':
        return <Badge variant="outline" className="text-xs">Pro</Badge>;
      default:
        return <Badge variant="outline" className="text-xs opacity-60">Starter</Badge>;
    }
  };

  const canUseEstimator = helpers.canUseEstimator();

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-5xl">
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
              <h1 className="text-3xl font-bold">💰 Estimator</h1>
              <p className="text-muted-foreground text-sm">Est-ce que j'achète ce composant pour le revendre ?</p>
            </div>
          </div>
          <PlanBadge plan={plan} />
        </motion.div>

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "estimator" | "history")} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="estimator" className="gap-2"><Calculator className="h-4 w-4" />Estimation</TabsTrigger>
            <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" />Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="estimator" className="mt-8">
            {/* PC Blocked Warning */}
            {isPCBlocked && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Estimation non disponible</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          L'estimateur ne prend pas en charge les PC complets ni les lots. 
                          Pour évaluer un PC, estimez chaque composant individuellement (CPU, GPU, RAM, etc.) 
                          et additionnez les valeurs.
                        </p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={handleReset}>
                          Nouvelle estimation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Ad Search Bar */}
            {!isPCBlocked && <AdSearchBar onAdSelect={handleAdSelect} />}

            {/* Form */}
            {!isPCBlocked && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Formulaire d'estimation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {/* Model search */}
                        <div className="space-y-2">
                          <Label>Modèle *</Label>
                          <Popover open={modelPopoverOpen} onOpenChange={setModelPopoverOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between">
                                {selectedModel ? <span>{selectedModel.name}</span> : <span className="text-muted-foreground">Rechercher...</span>}
                                <Search className="ml-2 h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 z-50" align="start">
                              <Command shouldFilter={false}>
                                <CommandInput placeholder="Tapez pour rechercher..." value={modelSearch} onValueChange={setModelSearch} />
                                <CommandList>
                                  {searchState === "loading" && (
                                    <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span className="text-sm">Recherche…</span>
                                    </div>
                                  )}
                                  {searchState === "idle" && modelSearch.length < 2 && (
                                    <div className="p-4 text-sm text-muted-foreground text-center">
                                      Tapez au moins 2 caractères
                                    </div>
                                  )}
                                  {searchState === "empty" && <CommandEmpty>Aucun modèle trouvé</CommandEmpty>}
                                  {searchState === "error" && (
                                    <div className="p-4 text-center">
                                      <div className="flex items-center justify-center gap-2 text-destructive mb-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{searchError}</span>
                                      </div>
                                      <Button variant="outline" size="sm" onClick={retrySearch}>
                                        <RefreshCw className="h-3 w-3 mr-1" />Réessayer
                                      </Button>
                                    </div>
                                  )}
                                  {searchState === "success" && models.length > 0 && (
                                    <CommandGroup>
                                      {models.map(model => (
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
                                            <span className="text-xs text-muted-foreground truncate">{model.brand} • {model.category}</span>
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
                          <Label>État *</Label>
                          <Select value={condition} onValueChange={setCondition}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Sélectionner..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="neuf">Neuf</SelectItem>
                              <SelectItem value="comme-neuf">Comme neuf</SelectItem>
                              <SelectItem value="bon">Bon état</SelectItem>
                              <SelectItem value="a-reparer">À réparer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Platform */}
                        <div>
                          <Label>Plateforme de l'annonce *</Label>
                          <Select value={platform} onValueChange={setPlatform}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Sélectionner..." />
                            </SelectTrigger>
                            <SelectContent>
                              {PLATFORMS.map(p => (
                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Ad price */}
                        <div>
                          <Label>Prix affiché sur l'annonce (€) *</Label>
                          <Input 
                            type="number" 
                            placeholder="Ex: 280" 
                            value={adPrice} 
                            onChange={e => setAdPrice(e.target.value)} 
                            className="mt-2" 
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Le prix demandé par le vendeur
                          </p>
                        </div>

                        {/* Advanced options */}
                        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                              Options avancées
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-4">
                            <Label>Région</Label>
                            <Select value={region} onValueChange={setRegion}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IDF">Île-de-France</SelectItem>
                                <SelectItem value="ARA">Auvergne-Rhône-Alpes</SelectItem>
                                <SelectItem value="PACA">PACA</SelectItem>
                                <SelectItem value="Occitanie">Occitanie</SelectItem>
                              </SelectContent>
                            </Select>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Submit buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button 
                            onClick={handleCalculate} 
                            disabled={!selectedModel || !condition || !adPrice || !platform || runEstimation.isPending || !canUseEstimator} 
                            className="flex-1 gap-2"
                          >
                            {runEstimation.isPending ? (
                              <><RefreshCw className="h-4 w-4 animate-spin" />Calcul...</>
                            ) : (
                              <><Calculator className="h-4 w-4" />Estimer</>
                            )}
                          </Button>
                          <Button variant="outline" onClick={handleReset}>Reset</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Results - Reorganized by plan visibility */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div 
                  key="results" 
                  initial={{ opacity: 0, y: 40 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }} 
                  className="space-y-6"
                >
                  {/* === SECTION 1: VISIBLE FOR ALL PLANS === */}
                  <SynthesisBanner result={result} />
                  <IndicatorsSection result={result} plan={plan} limits={estimatorLimits} />

                  {/* === SECTION 2: PRO+ CONTENT (visible Pro/Elite, locked Starter) === */}
                  {plan !== 'starter' && (
                    <>
                      <AnalysisSection result={result} plan={plan} limits={estimatorLimits} />
                      <ChartsSection result={result} plan={plan} limits={estimatorLimits} />
                      <DecisionBlock result={result} plan={plan} limits={estimatorLimits} />
                    </>
                  )}

                  {/* === SECTION 3: ELITE CONTENT (visible Elite only) === */}
                  {plan === 'elite' && (
                    <>
                      <ScenariosSection result={result} plan={plan} limits={estimatorLimits} />
                      <NegotiationSection result={result} plan={plan} limits={estimatorLimits} />
                      <PlatformAnalysisSection 
                        result={result} 
                        plan={plan} 
                        limits={estimatorLimits} 
                        sourcePlatform={platform}
                      />
                    </>
                  )}

                  {/* === SECTION 4: LOCKED CONTENT FOR LOWER PLANS === */}
                  {plan === 'starter' && (
                    <div className="space-y-6 opacity-80">
                      <AnalysisSection result={result} plan={plan} limits={estimatorLimits} />
                      <ChartsSection result={result} plan={plan} limits={estimatorLimits} />
                      <DecisionBlock result={result} plan={plan} limits={estimatorLimits} />
                      <ScenariosSection result={result} plan={plan} limits={estimatorLimits} />
                      <NegotiationSection result={result} plan={plan} limits={estimatorLimits} />
                      <PlatformAnalysisSection 
                        result={result} 
                        plan={plan} 
                        limits={estimatorLimits} 
                        sourcePlatform={platform}
                      />
                    </div>
                  )}

                  {plan === 'pro' && (
                    <div className="space-y-6 opacity-80">
                      <ScenariosSection result={result} plan={plan} limits={estimatorLimits} />
                      <NegotiationSection result={result} plan={plan} limits={estimatorLimits} />
                      <PlatformAnalysisSection 
                        result={result} 
                        plan={plan} 
                        limits={estimatorLimits} 
                        sourcePlatform={platform}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="history" className="mt-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historique des estimations
                </CardTitle>
                <Button variant="outline" size="sm" onClick={refreshHistory} disabled={isLoadingHistory}>
                  <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  💡 Consultez vos estimations passées sans dépenser de crédits. Les données affichées correspondent au plan actif lors de l'estimation.
                </p>

                {historyState === "loading" && (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {historyState === "error" && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-70" />
                    <p className="text-destructive mb-2">Erreur de chargement</p>
                    <Button variant="outline" onClick={retryHistory}>
                      <RefreshCw className="h-4 w-4 mr-2" />Réessayer
                    </Button>
                  </div>
                )}

                {historyState === "empty" && (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune estimation</p>
                  </div>
                )}

                {historyState === "success" && historyData?.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg mb-3 hover:bg-muted/50">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{item.model_name}</p>
                        {getPlanBadge(item.plan_at_creation)}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.category} • {item.condition}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="font-medium">{item.buy_price_input}€</p>
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setViewHistoryItem(item)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Voir
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedModel({
                            id: item.model_id,
                            name: item.model_name,
                            brand: item.brand || '',
                            category: item.category,
                            family: null
                          });
                          setModelSearch(item.model_name);
                          setCondition(item.condition || '');
                          setAdPrice(item.buy_price_input.toString());
                          setPlatform(item.platform || '');
                          setActiveTab("estimator");
                        }}
                        title="Réestimer (coûte des crédits)"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* History View Modal - Shows data based on plan_at_creation */}
        <Dialog open={!!viewHistoryItem} onOpenChange={(open) => !open && setViewHistoryItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Résultats sauvegardés
                {viewHistoryItem && getPlanBadge(viewHistoryItem.plan_at_creation)}
                <Badge variant="secondary" className="ml-2">
                  {viewHistoryItem?.created_at ? new Date(viewHistoryItem.created_at).toLocaleDateString('fr-FR') : ''}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            {viewHistoryItem && (
              <div className="space-y-6 mt-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    ⚠️ Ces données datent du {new Date(viewHistoryItem.created_at).toLocaleDateString('fr-FR')}. 
                    Le marché peut avoir évolué depuis. Pour des données à jour, relancez une estimation (coûte des crédits).
                  </p>
                </div>
                
                {/* Always show synthesis and basic indicators */}
                <SynthesisBanner result={convertHistoryToResult(viewHistoryItem)} />
                <IndicatorsSection 
                  result={convertHistoryToResult(viewHistoryItem)} 
                  plan={viewHistoryItem.plan_at_creation} 
                  limits={estimatorLimits} 
                />

                {/* Show Pro content if estimation was made with Pro or Elite */}
                {canViewHistoryData(plan, viewHistoryItem.plan_at_creation, 'pro') && (
                  <>
                    <AnalysisSection 
                      result={convertHistoryToResult(viewHistoryItem)} 
                      plan={viewHistoryItem.plan_at_creation} 
                      limits={estimatorLimits} 
                    />
                    <ChartsSection 
                      result={convertHistoryToResult(viewHistoryItem)} 
                      plan={viewHistoryItem.plan_at_creation} 
                      limits={estimatorLimits} 
                    />
                    <DecisionBlock 
                      result={convertHistoryToResult(viewHistoryItem)} 
                      plan={viewHistoryItem.plan_at_creation} 
                      limits={estimatorLimits} 
                    />
                  </>
                )}

                {/* Show Elite content if estimation was made with Elite */}
                {canViewHistoryData(plan, viewHistoryItem.plan_at_creation, 'elite') && viewHistoryItem.results.scenarios && (
                  <>
                    <ScenariosSection 
                      result={convertHistoryToResult(viewHistoryItem)} 
                      plan="elite" 
                      limits={estimatorLimits} 
                    />
                  </>
                )}

                {canViewHistoryData(plan, viewHistoryItem.plan_at_creation, 'elite') && viewHistoryItem.results.negotiation && (
                  <NegotiationSection 
                    result={convertHistoryToResult(viewHistoryItem)} 
                    plan="elite" 
                    limits={estimatorLimits} 
                  />
                )}

                {canViewHistoryData(plan, viewHistoryItem.plan_at_creation, 'elite') && viewHistoryItem.results.platforms && (
                  <PlatformAnalysisSection 
                    result={convertHistoryToResult(viewHistoryItem)} 
                    plan="elite" 
                    limits={estimatorLimits} 
                    sourcePlatform={viewHistoryItem.platform}
                  />
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
