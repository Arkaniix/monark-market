import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Calculator, RefreshCw, History, Search, Loader2, AlertCircle, Cpu, HardDrive, MemoryStick, Monitor, RotateCcw, Eye, Clock, Sparkles, AlertTriangle, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModelsSearch, useEstimationHistoryEnhanced } from "@/hooks";
import type { ModelAutocomplete, DealItem } from "@/providers/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import { PlanBadge } from "@/components/LockedFeatureOverlay";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EstimationHistoryItem } from "@/hooks/useEstimationHistory";
import { MARKETPLACE_PLATFORMS, normalizePlatformKey } from "@/lib/platforms";

// Import NEW enhanced components
import EstimationOptionsBlock from "@/components/estimator/EstimationOptionsBlock";
import InputSummaryChips from "@/components/estimator/InputSummaryChips";
import SynthesisBanner from "@/components/estimator/SynthesisBanner";
import OpportunityScoreCard from "@/components/estimator/OpportunityScoreCard";
import HypothesesBanner from "@/components/estimator/HypothesesBanner";
import EnhancedDecisionBlock from "@/components/estimator/EnhancedDecisionBlock";
import EnhancedMarketCard from "@/components/estimator/EnhancedMarketCard";
import ChartsSection from "@/components/estimator/ChartsSection";
import EnhancedNegotiationSection from "@/components/estimator/EnhancedNegotiationSection";
import EnhancedScenariosSection from "@/components/estimator/EnhancedScenariosSection";
import EnhancedPlatformsSection from "@/components/estimator/EnhancedPlatformsSection";
import WhatIfSimulator from "@/components/estimator/WhatIfSimulator";
import AdSearchBar from "@/components/estimator/AdSearchBar";
import ExportCSVButton from "@/components/estimator/ExportCSVButton";

// Import enhanced estimator hook
import { useEnhancedEstimation, DEFAULT_ESTIMATION_OPTIONS } from "@/hooks/useEnhancedEstimator";
import type { EnhancedEstimationResult, EstimationOptions } from "@/types/estimator";
import { CONDITION_OPTIONS } from "@/types/estimator";

// Plan hierarchy helper
const PLAN_HIERARCHY = { starter: 0, pro: 1, elite: 2 };

// Check if user can see data based on plan used at creation
function canViewHistoryData(currentPlan: string, planAtCreation: string, requiredPlan: 'pro' | 'elite'): boolean {
  const requiredLevel = PLAN_HIERARCHY[requiredPlan];
  const creationLevel = PLAN_HIERARCHY[planAtCreation as keyof typeof PLAN_HIERARCHY] ?? 0;
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
  const [adPrice, setAdPrice] = useState("");
  const [platform, setPlatform] = useState("");
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [isPCBlocked, setIsPCBlocked] = useState(false);

  // NEW: Options state
  const [options, setOptions] = useState<EstimationOptions>(DEFAULT_ESTIMATION_OPTIONS);

  // Result state - now enhanced
  const [result, setResult] = useState<EnhancedEstimationResult | null>(null);

  // History modal state
  const [viewHistoryItem, setViewHistoryItem] = useState<EstimationHistoryItem | null>(null);
  const [historyPage, setHistoryPage] = useState(1);

  // API hooks
  const { models, state: searchState, error: searchError, retry: retrySearch } = useModelsSearch(modelSearch);
  const shouldFetchHistory = activeTab === "history";
  const { 
    data: historyData, 
    state: historyState, 
    error: historyError, 
    refresh: refreshHistory, 
    retry: retryHistory, 
    isLoading: isLoadingHistory 
  } = useEstimationHistoryEnhanced(historyPage, shouldFetchHistory);
  
  // NEW: Enhanced estimation hook
  const enhancedEstimation = useEnhancedEstimation();

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
    setPlatform(normalizePlatformKey(ad.platform));
    setCondition(ad.condition?.toLowerCase().replace(" ", "-") || "bon");
    // Reset skip options when selecting an ad
    setOptions(DEFAULT_ESTIMATION_OPTIONS);
  };

  // Pre-fill from URL
  const lastProcessedUrl = useRef<string>('');
  
  useEffect(() => {
    const currentUrl = searchParams.toString();
    if (lastProcessedUrl.current === currentUrl && prefillApplied) return;
    
    const modelId = searchParams.get('model_id');
    const modelName = searchParams.get('model_name');
    const category = searchParams.get('category');
    const price = searchParams.get('price');
    const conditionParam = searchParams.get('condition');
    const platformParam = searchParams.get('platform');
    const itemType = searchParams.get('item_type');

    // Block PC types from URL params
    if (itemType === 'pc' || itemType === 'lot') {
      setIsPCBlocked(true);
      lastProcessedUrl.current = currentUrl;
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
      const normalized = conditionParam.toLowerCase().trim();
      const conditionMap: Record<string, string> = {
        'neuf': 'neuf',
        'comme_neuf': 'comme-neuf',
        'comme-neuf': 'comme-neuf',
        'comme neuf': 'comme-neuf',
        'bon': 'bon',
        'bon état': 'bon',
        'bon-etat': 'bon',
        'correct': 'bon',
        'satisfaisant': 'bon',
        'à_réparer': 'a-reparer',
        'a-reparer': 'a-reparer',
        'à réparer': 'a-reparer',
      };
      setCondition(conditionMap[normalized] || 'bon');
    }
    if (platformParam) setPlatform(normalizePlatformKey(platformParam));
    
    lastProcessedUrl.current = currentUrl;
    setPrefillApplied(true);
  }, [searchParams, prefillApplied]);

  const handleCalculate = async () => {
    if (!selectedModel || !adPrice) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir le modèle et le prix",
        variant: "destructive"
      });
      return;
    }
    
    // Validate required fields unless skipped
    if (!options.withoutCondition && !condition) {
      toast({
        title: "État manquant",
        description: "Sélectionnez un état ou cochez 'Estimation sans état'",
        variant: "destructive"
      });
      return;
    }
    if (!options.withoutPlatform && !platform) {
      toast({
        title: "Plateforme manquante",
        description: "Sélectionnez une plateforme ou cochez 'Estimation sans plateforme'",
        variant: "destructive"
      });
      return;
    }

    try {
      const estimation = await enhancedEstimation.runEstimation({
        modelId: selectedModel.id,
        modelName: selectedModel.name,
        adPrice: parseFloat(adPrice),
        condition: options.withoutCondition ? undefined : condition,
        platform: options.withoutPlatform ? undefined : platform,
        options,
      });
      setResult(estimation);
      toast({
        title: "Estimation réussie",
        description: `2 crédits déduits`
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
    setAdPrice("");
    setPlatform("");
    setResult(null);
    setIsPCBlocked(false);
    setOptions(DEFAULT_ESTIMATION_OPTIONS);
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

  // Check if form is valid
  const isFormValid = selectedModel && adPrice && 
    (options.withoutCondition || condition) && 
    (options.withoutPlatform || platform);

  // Handle options change
  const handleOptionsChange = (newOptions: EstimationOptions) => {
    setOptions(newOptions);
    if (newOptions.withoutPlatform) setPlatform("");
    if (newOptions.withoutCondition) setCondition("");
  };

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
                          Pour évaluer un PC, estimez chaque composant individuellement.
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
                  <CardContent className="space-y-6">
                    {/* NEW: Options block */}
                    <EstimationOptionsBlock
                      options={options}
                      onChange={handleOptionsChange}
                    />

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
                          <Label className={options.withoutCondition ? "text-muted-foreground" : ""}>
                            État {!options.withoutCondition && "*"}
                          </Label>
                          <Select 
                            value={condition} 
                            onValueChange={setCondition}
                            disabled={options.withoutCondition}
                          >
                            <SelectTrigger className={`mt-2 ${options.withoutCondition ? "opacity-50" : ""}`}>
                              <SelectValue placeholder={options.withoutCondition ? "Non renseigné" : "Sélectionner..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {CONDITION_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Platform */}
                        <div>
                          <Label className={options.withoutPlatform ? "text-muted-foreground" : ""}>
                            Plateforme de l'annonce {!options.withoutPlatform && "*"}
                          </Label>
                          <Select 
                            value={platform} 
                            onValueChange={setPlatform}
                            disabled={options.withoutPlatform}
                          >
                            <SelectTrigger className={`mt-2 ${options.withoutPlatform ? "opacity-50" : ""}`}>
                              <SelectValue placeholder={options.withoutPlatform ? "Non renseignée" : "Sélectionner..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {MARKETPLACE_PLATFORMS.map(p => (
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
                        </div>

                        {/* Input summary chips */}
                        <InputSummaryChips
                          modelName={selectedModel?.name || null}
                          category={selectedModel?.category || null}
                          adPrice={adPrice}
                          condition={condition}
                          platform={platform}
                          withoutCondition={options.withoutCondition}
                          withoutPlatform={options.withoutPlatform}
                        />

                        {/* Submit buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button 
                            onClick={handleCalculate} 
                            disabled={!isFormValid || enhancedEstimation.isPending || !canUseEstimator} 
                            className="flex-1 gap-2"
                          >
                            {enhancedEstimation.isPending ? (
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

            {/* Results - NEW enhanced layout */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div 
                  key="results" 
                  initial={{ opacity: 0, y: 40 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }} 
                  className="space-y-6"
                >
                  {/* === EXPORT CSV (Elite only, at top) === */}
                  {plan === 'elite' && (
                    <div className="flex justify-end">
                      <ExportCSVButton result={result as any} platform={result.inputs.platform || ""} />
                    </div>
                  )}

                  {/* === HYPOTHESES BANNER (if missing inputs) === */}
                  {result.hypotheses.length > 0 && (
                    <HypothesesBanner 
                      hypotheses={result.hypotheses}
                      onScrollToForm={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}

                  {/* === SECTION 1: SYNTHESIS + OPPORTUNITY SCORE (All plans) === */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <SynthesisBanner result={result as any} />
                    <OpportunityScoreCard 
                      opportunity={result.opportunity}
                      confidence={result.confidence}
                      tags={result.tags}
                      plan={plan}
                    />
                  </div>

                  {/* === SECTION 2: MARKET DATA (All plans, some locked) === */}
                  <EnhancedMarketCard
                    market={result.market}
                    adPrice={result.inputs.ad_price}
                    plan={plan}
                  />

                  {/* === SECTION 3: DECISION BLOCK (Pro+) === */}
                  <EnhancedDecisionBlock
                    decision={result.decision}
                    actionablePrices={result.actionable_prices}
                    adPrice={result.inputs.ad_price}
                    plan={plan}
                  />

                  {/* === SECTION 4: CHARTS (Pro+) === */}
                  <ChartsSection 
                    result={result as any} 
                    plan={plan} 
                    limits={estimatorLimits} 
                  />

                  {/* === SECTION 5: NEGOTIATION (Pro+) === */}
                  {result.negotiation && (
                    <EnhancedNegotiationSection
                      negotiation={result.negotiation}
                      adPrice={result.inputs.ad_price}
                      plan={plan}
                      withoutCondition={options.withoutCondition}
                    />
                  )}

                  {/* === SECTION 6: SCENARIOS (Elite) === */}
                  {result.scenarios && (
                    <EnhancedScenariosSection
                      scenarios={result.scenarios}
                      adPrice={result.inputs.ad_price}
                      plan={plan}
                    />
                  )}

                  {/* === SECTION 7: PLATFORMS (Pro+ basic, Elite full) === */}
                  {result.platforms && (
                    <EnhancedPlatformsSection
                      platforms={result.platforms}
                      plan={plan}
                      sourcePlatform={result.inputs.platform}
                    />
                  )}

                  {/* === SECTION 8: WHAT-IF SIMULATOR (Elite) === */}
                  {result.what_if && plan === 'elite' && (
                    <WhatIfSimulator
                      whatIf={result.what_if}
                      adPrice={result.inputs.ad_price}
                      actionablePrices={result.actionable_prices}
                      plan={plan}
                    />
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
                        {item.platform && (
                          <Badge variant="outline" className="text-xs">{item.platform}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.category} • {item.condition || "État inconnu"}</p>
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
                          const nextPlatform = normalizePlatformKey(item.platform);
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
                          if (nextPlatform) setPlatform(nextPlatform);
                          // Set skip options based on history item
                          setOptions({
                            withoutPlatform: !item.platform,
                            withoutCondition: !item.condition,
                          });
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

        {/* History View Modal */}
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
                
                {/* Basic info card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Modèle</p>
                        <p className="font-medium">{viewHistoryItem.model_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prix affiché</p>
                        <p className="font-medium">{viewHistoryItem.buy_price_input}€</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">État</p>
                        <p className="font-medium">{viewHistoryItem.condition || "Non renseigné"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Plateforme</p>
                        <p className="font-medium">{viewHistoryItem.platform || "Non renseignée"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results based on plan at creation */}
                {viewHistoryItem.results && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Résultats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Prix d'achat conseillé</p>
                            <p className="text-lg font-bold">{viewHistoryItem.results.buy_price_recommended}€</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Prix revente 1 mois</p>
                            <p className="text-lg font-bold">{viewHistoryItem.results.sell_price_1m}€</p>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Marge estimée</p>
                            <p className="text-lg font-bold text-green-600">+{viewHistoryItem.results.margin_pct}%</p>
                          </div>
                        </div>
                        {viewHistoryItem.results.advice && (
                          <p className="mt-4 text-sm text-muted-foreground border-t pt-4">
                            💡 {viewHistoryItem.results.advice}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
