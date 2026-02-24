import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { Calculator, RefreshCw, History, Search, Loader2, AlertCircle, Cpu, HardDrive, MemoryStick, Monitor, RotateCcw, Eye, Clock, Sparkles, AlertTriangle, Crown, ArrowLeft, ScanSearch } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnhancedEstimationHistory } from "@/hooks";
import type { EnhancedEstimationHistoryItem } from "@/types/estimator";
import { useToast } from "@/hooks/use-toast";
import { useModelsSearch } from "@/hooks";
import type { ModelAutocomplete, DealItem } from "@/providers/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { PlanType } from "@/hooks/useEntitlements";
import { PlanBadge } from "@/components/LockedFeatureOverlay";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MARKETPLACE_PLATFORMS, normalizePlatformKey } from "@/lib/platforms";

// Import NEW enhanced components
import EstimationOptionsBlock from "@/components/estimator/EstimationOptionsBlock";
import InputSummaryChips from "@/components/estimator/InputSummaryChips";
import SynthesisBanner from "@/components/estimator/SynthesisBanner";
import OpportunityScoreCard from "@/components/estimator/OpportunityScoreCard";
import HypothesesBanner from "@/components/estimator/HypothesesBanner";
import EnhancedDecisionBlock from "@/components/estimator/EnhancedDecisionBlock";
import EnhancedMarketCard from "@/components/estimator/EnhancedMarketCard";

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

import { Handshake, TrendingUp, BarChart3, Target } from "lucide-react";

export default function Estimator() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
  const [activeTab, setActiveTab] = useState<"estimator" | "history">("estimator");
  const [historyPage, setHistoryPage] = useState(1);
  // Result state - now enhanced
  const [result, setResult] = useState<EnhancedEstimationResult | null>(null);

  // API hooks
  const { models, state: searchState, error: searchError, retry: retrySearch } = useModelsSearch(modelSearch);
  
  // NEW: Enhanced estimation hook
  const enhancedEstimation = useEnhancedEstimation();

  // History query
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isHistoryError,
    refetch: refreshHistory,
  } = useEnhancedEstimationHistory(historyPage, activeTab === "history");

  const historyState = isLoadingHistory ? "loading"
    : isHistoryError ? "error"
    : historyData?.items?.length === 0 ? "empty"
    : "success";

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
    
    // Lens extension params
    const lensComponentId = searchParams.get('component');
    const lensSource = searchParams.get('source');

    // Block PC types from URL params
    if (itemType === 'pc' || itemType === 'lot') {
      setIsPCBlocked(true);
      lastProcessedUrl.current = currentUrl;
      setPrefillApplied(true);
      return;
    }

    // Handle Lens extension pre-fill (from Mes Analyses or extension)
    if (lensSource === 'lens') {
      const resolvedName = modelName || (lensComponentId ? `Composant #${lensComponentId}` : '');
      if (resolvedName) {
        setSelectedModel({
          id: lensComponentId ? parseInt(lensComponentId, 10) : 0,
          name: resolvedName,
          brand: '',
          category: category || '',
          family: null
        });
        setModelSearch(resolvedName);
      }
      if (price) setAdPrice(price);
      if (platformParam) setPlatform(normalizePlatformKey(platformParam));
      if (conditionParam) {
        const normalized = conditionParam.toLowerCase().trim();
        const conditionMap: Record<string, string> = {
          'neuf': 'neuf', 'comme_neuf': 'comme-neuf', 'comme-neuf': 'comme-neuf',
          'comme neuf': 'comme-neuf', 'bon': 'bon', 'bon état': 'bon',
          'bon-etat': 'bon', 'correct': 'bon', 'satisfaisant': 'bon',
          'à_réparer': 'a-reparer', 'a-reparer': 'a-reparer', 'à réparer': 'a-reparer',
        };
        setCondition(conditionMap[normalized] || 'bon');
      }
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
        brand: selectedModel.brand,
        category: selectedModel.category,
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

        {/* Tabs: Estimator + History */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "estimator" | "history")}>
          <TabsList className="mb-6">
            <TabsTrigger value="estimator" className="gap-1.5">
              <Calculator className="h-3.5 w-3.5" />
              Estimation
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-3.5 w-3.5" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estimator">

        {/* Lens pre-fill banner */}
        {searchParams.get('source') === 'lens' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <ScanSearch className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium flex-1">Décision complète — données pré-remplies depuis Mes Analyses</span>
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7" asChild>
                <Link to="/lens-history">
                  <ArrowLeft className="h-3 w-3" />
                  Retour à Mes Analyses
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

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
                {/* Options block */}
                <EstimationOptionsBlock
                  options={options}
                  onChange={handleOptionsChange}
                  plan={plan}
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

        {/* Results - Enhanced layout */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              key="results" 
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="space-y-6"
            >
              {/* === EXPORT CSV (Pro only, at top) === */}
              {plan === 'pro' && (
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

              {/* ============ ACCESSIBLE SECTIONS ============ */}

              {/* === SECTION 1: SYNTHESIS + OPPORTUNITY SCORE === */}
              <div className="grid md:grid-cols-2 gap-6">
                <SynthesisBanner result={result as any} />
                <OpportunityScoreCard 
                  opportunity={result.opportunity}
                  confidence={result.confidence}
                  tags={result.tags}
                  plan={plan}
                />
              </div>

              {/* === SECTION 2: MARKET DATA === */}
              <EnhancedMarketCard
                market={result.market}
                adPrice={result.inputs.ad_price}
                plan={plan}
              />

              {/* === SECTION 3: DECISION BLOCK (Pro+) === */}
              {plan !== 'standard' && plan !== 'free' && (
                <EnhancedDecisionBlock
                  decision={result.decision}
                  actionablePrices={result.actionable_prices}
                  adPrice={result.inputs.ad_price}
                  plan={plan}
                />
              )}

              {/* === SECTION 4: NEGOTIATION (Pro+) === */}
              {result.negotiation && plan !== 'standard' && plan !== 'free' && (
                <EnhancedNegotiationSection
                  negotiation={result.negotiation}
                  adPrice={result.inputs.ad_price}
                  plan={plan}
                  withoutCondition={options.withoutCondition}
                />
              )}

              {/* === SECTION 5: PLATFORMS (Pro+) === */}
              {result.platforms && plan !== 'standard' && plan !== 'free' && (
                <EnhancedPlatformsSection
                  platforms={result.platforms}
                  plan={plan}
                  sourcePlatform={result.inputs.platform}
                />
              )}

              {/* === SECTION 6: SCENARIOS (Pro) === */}
              {result.scenarios && plan === 'pro' && (
                <EnhancedScenariosSection
                  scenarios={result.scenarios}
                  adPrice={result.inputs.ad_price}
                  plan={plan}
                />
              )}

              {/* === SECTION 7: WHAT-IF SIMULATOR (Pro) === */}
              {result.what_if && plan === 'pro' && (
                <WhatIfSimulator
                  whatIf={result.what_if}
                  adPrice={result.inputs.ad_price}
                  actionablePrices={result.actionable_prices}
                  plan={plan}
                />
              )}

              {/* ============ LOCKED SECTIONS ============ */}
              
              {/* Decision Block - Locked for Standard/Free */}
              {(plan === 'standard' || plan === 'free') && (
                <EnhancedDecisionBlock
                  decision={result.decision}
                  actionablePrices={result.actionable_prices}
                  adPrice={result.inputs.ad_price}
                  plan={plan}
                />
              )}

              {/* Negotiation - Locked for Standard/Free */}
              {result.negotiation && (plan === 'standard' || plan === 'free') && (
                <EnhancedNegotiationSection
                  negotiation={result.negotiation}
                  adPrice={result.inputs.ad_price}
                  plan={plan}
                  withoutCondition={options.withoutCondition}
                />
              )}

              {/* Platforms - Locked for Standard/Free */}
              {result.platforms && (plan === 'standard' || plan === 'free') && (
                <EnhancedPlatformsSection
                  platforms={result.platforms}
                  plan={plan}
                  sourcePlatform={result.inputs.platform}
                />
              )}

              {/* Scenarios - Locked for non-Pro */}
              {result.scenarios && plan !== 'pro' && (
                <EnhancedScenariosSection
                  scenarios={result.scenarios}
                  adPrice={result.inputs.ad_price}
                  plan={plan}
                />
              )}

              {/* What-If - Locked for non-Pro */}
              {result.what_if && plan !== 'pro' && (
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

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-4 w-4 text-primary" />
                    Historique des estimations
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refreshHistory()} disabled={isLoadingHistory}>
                      <RefreshCw className={cn("h-4 w-4", isLoadingHistory && "animate-spin")} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground" asChild>
                      <Link to="/lens-history?tab=estimations">
                        <ScanSearch className="h-3.5 w-3.5" />
                        Voir dans Mes Analyses
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                  💡 Vos estimations complètes sont aussi disponibles dans{" "}
                  <Link to="/lens-history?tab=estimations" className="text-primary hover:underline font-medium">
                    Mes Analyses
                  </Link>
                  . Les données affichées correspondent au plan actif lors de l'estimation.
                </p>

                {historyState === "loading" && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="h-4 w-2/3 mb-2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {historyState === "error" && (
                  <div className="flex flex-col items-center py-10">
                    <RefreshCw className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">Erreur de chargement</p>
                    <Button variant="outline" size="sm" onClick={() => refreshHistory()}>
                      Réessayer
                    </Button>
                  </div>
                )}

                {historyState === "empty" && (
                  <div className="flex flex-col items-center py-10">
                    <Calculator className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-1">Aucune estimation</p>
                    <p className="text-xs text-muted-foreground mb-4 text-center max-w-xs">
                      Lancez votre première estimation via le formulaire.
                    </p>
                    <Button size="sm" onClick={() => setActiveTab("estimator")}>
                      Nouvelle estimation
                    </Button>
                  </div>
                )}

                {historyState === "success" && historyData?.items?.map((item) => {
                  const planColors: Record<string, string> = {
                    free: "bg-muted/50 text-muted-foreground border-border",
                    standard: "bg-primary/10 text-primary border-primary/20",
                    pro: "bg-green-500/15 text-green-400 border-green-500/30",
                  };
                  return (
                    <Card key={item.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              <p className="text-sm font-semibold truncate">{item.model_name}</p>
                              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", planColors[item.plan_at_creation] || "")}>
                                {item.plan_at_creation}
                              </Badge>
                              {item.platform && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {item.platform}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.category} · {item.condition || "État inconnu"}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-primary tabular-nums">{item.ad_price}€</p>
                            <p className="text-[11px] text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-3 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 h-7 text-xs"
                            onClick={() => {
                              navigate(`/estimator?model_id=${item.model_id}&model_name=${encodeURIComponent(item.model_name)}&price=${item.ad_price}&platform=${item.platform || ""}&condition=${item.condition || ""}&source=history`);
                              setActiveTab("estimator");
                            }}
                          >
                            <RotateCcw className="h-3 w-3" />
                            Ré-estimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
