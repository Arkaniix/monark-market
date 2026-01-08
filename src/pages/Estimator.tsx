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
import { Calculator, ChevronDown, RefreshCw, History, Search, Loader2, AlertCircle, Cpu, HardDrive, MemoryStick, Monitor, RotateCcw, Eye, Clock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModelsSearch, useEstimationHistoryEnhanced } from "@/hooks";
import { useRunEstimation, useEstimatorStats, type EstimationResultUI } from "@/hooks/useEstimator";
import type { ModelAutocomplete } from "@/providers/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import { PlanBadge, LockedValue } from "@/components/LockedFeatureOverlay";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EstimationHistoryItem } from "@/hooks/useEstimationHistory";

// Import new section components
import SynthesisBanner from "@/components/estimator/SynthesisBanner";
import IndicatorsSection from "@/components/estimator/IndicatorsSection";
import AnalysisSection from "@/components/estimator/AnalysisSection";
import ScenariosSection from "@/components/estimator/ScenariosSection";
import ChartsSection from "@/components/estimator/ChartsSection";
import DecisionBlock from "@/components/estimator/DecisionBlock";
export default function Estimator() {
  const {
    toast
  } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"estimator" | "history">("estimator");

  // Entitlements
  const {
    plan,
    limits,
    helpers
  } = useEntitlements();
  const {
    estimator: estimatorLimits
  } = limits;

  // Form state
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelAutocomplete | null>(null);
  const [condition, setCondition] = useState("");
  const [region, setRegion] = useState("");
  const [buyPriceInput, setBuyPriceInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);

  // Result state
  const [result, setResult] = useState<EstimationResultUI | null>(null);

  // History
  const [viewResultsItem, setViewResultsItem] = useState<EstimationHistoryItem | null>(null);
  const [historyPage, setHistoryPage] = useState(1);

  // API hooks
  const {
    models,
    state: searchState,
    error: searchError,
    retry: retrySearch
  } = useModelsSearch(modelSearch);
  const {
    data: stats
  } = useEstimatorStats();
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

  // Pre-fill from URL
  useEffect(() => {
    if (prefillApplied) return;
    const modelId = searchParams.get('model_id');
    const modelName = searchParams.get('model_name');
    const category = searchParams.get('category');
    const price = searchParams.get('price');
    const conditionParam = searchParams.get('condition');
    const regionParam = searchParams.get('region');
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
    if (price) setBuyPriceInput(price);
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
    setPrefillApplied(true);
  }, [searchParams, prefillApplied]);
  const handleCalculate = async () => {
    if (!selectedModel || !condition || !buyPriceInput) {
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
        buy_price_input: parseFloat(buyPriceInput),
        region: region || undefined,
        mode_advanced: showAdvanced
      });
      setResult(estimation);
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
    setBuyPriceInput("");
    setResult(null);
  };
  const canUseEstimator = helpers.canUseEstimator();
  return <div className="min-h-screen py-8">
      <div className="container max-w-5xl">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8 text-center">
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
            {/* Form */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="mb-8">
              <Card className="shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Formulaire d'estimation</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
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
                                {searchState === "loading" && <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Recherche…</span></div>}
                                {searchState === "idle" && modelSearch.length < 2 && <div className="p-4 text-sm text-muted-foreground text-center">Tapez au moins 2 caractères</div>}
                                {searchState === "empty" && <CommandEmpty>Aucun modèle trouvé</CommandEmpty>}
                                {searchState === "error" && <div className="p-4 text-center"><div className="flex items-center justify-center gap-2 text-destructive mb-2"><AlertCircle className="h-4 w-4" /><span className="text-sm">{searchError}</span></div><Button variant="outline" size="sm" onClick={retrySearch}><RefreshCw className="h-3 w-3 mr-1" />Réessayer</Button></div>}
                                {searchState === "success" && models.length > 0 && <CommandGroup>
                                    {models.map(model => <CommandItem key={model.id} value={model.id.toString()} onSelect={() => {
                                  setSelectedModel(model);
                                  setModelPopoverOpen(false);
                                }} className="flex items-center gap-3 cursor-pointer">
                                        <div className="flex-shrink-0 w-8 h-8 rounded bg-muted flex items-center justify-center">{getCategoryIcon(model.category)}</div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                          <span className="font-medium truncate">{model.name}</span>
                                          <span className="text-xs text-muted-foreground truncate">{model.brand} • {model.category}</span>
                                        </div>
                                      </CommandItem>)}
                                  </CommandGroup>}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label>État *</Label>
                        <Select value={condition} onValueChange={setCondition}><SelectTrigger className="mt-2"><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent><SelectItem value="neuf">Neuf</SelectItem><SelectItem value="comme-neuf">Comme neuf</SelectItem><SelectItem value="bon">Bon état</SelectItem><SelectItem value="a-reparer">À réparer</SelectItem></SelectContent></Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div><Label>Prix d'achat envisagé (€) *</Label><Input type="number" placeholder="Ex: 280" value={buyPriceInput} onChange={e => setBuyPriceInput(e.target.value)} className="mt-2" /></div>
                      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                        
                        <CollapsibleContent className="pt-4">
                          <Label>Région</Label>
                          <Select value={region} onValueChange={setRegion}><SelectTrigger className="mt-2"><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent><SelectItem value="IDF">Île-de-France</SelectItem><SelectItem value="ARA">Auvergne-Rhône-Alpes</SelectItem><SelectItem value="PACA">PACA</SelectItem><SelectItem value="Occitanie">Occitanie</SelectItem></SelectContent></Select>
                        </CollapsibleContent>
                      </Collapsible>
                      <div className="flex gap-3 pt-2">
                        <Button onClick={handleCalculate} disabled={!selectedModel || !condition || !buyPriceInput || runEstimation.isPending || !canUseEstimator} className="flex-1 gap-2">
                          {runEstimation.isPending ? <><RefreshCw className="h-4 w-4 animate-spin" />Calcul...</> : <><Calculator className="h-4 w-4" />Estimer</>}
                        </Button>
                        <Button variant="outline" onClick={handleReset}>Reset</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {result && <motion.div key="results" initial={{
              opacity: 0,
              y: 40
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0
            }} className="space-y-6">
                  <SynthesisBanner result={result} />
                  <IndicatorsSection result={result} plan={plan} limits={estimatorLimits} />
                  <AnalysisSection result={result} plan={plan} limits={estimatorLimits} />
                  <ScenariosSection result={result} plan={plan} limits={estimatorLimits} />
                  <ChartsSection result={result} plan={plan} limits={estimatorLimits} />
                  <DecisionBlock result={result} />
                </motion.div>}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="history" className="mt-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Historique</CardTitle>
                <Button variant="outline" size="sm" onClick={refreshHistory} disabled={isLoadingHistory}><RefreshCw className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin' : ''}`} /></Button>
              </CardHeader>
              <CardContent>
                {historyState === "loading" && <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="flex items-center gap-4 p-4 border rounded-lg"><Skeleton className="h-12 w-12 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/2" /></div></div>)}</div>}
                {historyState === "error" && <div className="text-center py-12"><AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-70" /><p className="text-destructive mb-2">Erreur de chargement</p><Button variant="outline" onClick={retryHistory}><RefreshCw className="h-4 w-4 mr-2" />Réessayer</Button></div>}
                {historyState === "empty" && <div className="text-center py-12 text-muted-foreground"><History className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Aucune estimation</p></div>}
                {historyState === "success" && historyData?.items?.map(item => <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg mb-3 hover:bg-muted/50">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">{getCategoryIcon(item.category)}</div>
                    <div className="flex-1 min-w-0"><p className="font-medium truncate">{item.model_name}</p><p className="text-xs text-muted-foreground">{item.category} • {item.condition}</p></div>
                    <div className="text-sm text-right"><p className="font-medium">{item.buy_price_input}€</p><p className="text-xs text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" />{new Date(item.created_at).toLocaleDateString('fr-FR')}</p></div>
                    <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedModel({
                    id: item.model_id,
                    name: item.model_name,
                    brand: item.brand || '',
                    category: item.category,
                    family: null
                  });
                  setModelSearch(item.model_name);
                  setCondition(item.condition || '');
                  setBuyPriceInput(item.buy_price_input.toString());
                  setActiveTab("estimator");
                }}><RotateCcw className="h-4 w-4" /></Button>
                  </div>)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}