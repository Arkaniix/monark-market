// Unified V3 Estimator Form — component + bundle mode
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Calculator, Search, Loader2, AlertCircle, RefreshCw, Plus, X,
  Wrench, MonitorSmartphone, Lock, Sparkles, Cpu, Monitor, MemoryStick, HardDrive,
} from "lucide-react";
import { useModelsSearch } from "@/hooks";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { PlanType } from "@/hooks/useEntitlements";
import type { ModelAutocomplete } from "@/providers/types";
import type {
  V3EstimationRequest, EstimationLevel, EstimationMode,
  ConditionValue, PlatformValue,
} from "@/types/estimatorV3";
import { CONDITION_OPTIONS_V3, PLATFORM_OPTIONS_V3 } from "@/types/estimatorV3";
import { useToast } from "@/hooks/use-toast";

interface EstimatorFormProps {
  onSubmit: (request: V3EstimationRequest) => void;
  isPending: boolean;
  onReset: () => void;
}

const MAX_BUNDLE_COMPONENTS = 10;

function getCategoryIcon(cat: string) {
  switch (cat?.toUpperCase()) {
    case "GPU": return <Monitor className="h-4 w-4 text-primary" />;
    case "CPU": return <Cpu className="h-4 w-4 text-accent" />;
    case "RAM": return <MemoryStick className="h-4 w-4 text-green-500" />;
    case "SSD": case "STOCKAGE": return <HardDrive className="h-4 w-4 text-orange-500" />;
    default: return <Cpu className="h-4 w-4 text-muted-foreground" />;
  }
}

// Level config
interface LevelConfig {
  level: EstimationLevel;
  label: string;
  credits: number;
  requiredPlan: PlanType;
  planLabel: string;
}

const LEVELS: LevelConfig[] = [
  { level: "basic", label: "Basic", credits: 1, requiredPlan: "free", planLabel: "" },
  { level: "complete", label: "Complet", credits: 3, requiredPlan: "standard", planLabel: "Plan Standard requis" },
  { level: "pro", label: "Pro", credits: 5, requiredPlan: "pro", planLabel: "Plan Pro requis" },
];

const PLAN_RANK: Record<PlanType, number> = { free: 0, standard: 1, pro: 2 };

export default function EstimatorForm({ onSubmit, isPending, onReset }: EstimatorFormProps) {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { plan } = useEntitlements();

  // Mode
  const [mode, setMode] = useState<EstimationMode>(
    searchParams.get("type") === "bundle" ? "bundle" : "component"
  );

  // Component mode
  const [selectedModel, setSelectedModel] = useState<ModelAutocomplete | null>(null);
  const [modelSearch, setModelSearch] = useState("");
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [price, setPrice] = useState("");

  // Bundle mode
  const [bundleComponents, setBundleComponents] = useState<ModelAutocomplete[]>([]);
  const [bundlePrice, setBundlePrice] = useState("");
  const [bundlePopoverOpen, setBundlePopoverOpen] = useState(false);
  const [bundleSearch, setBundleSearch] = useState("");

  // Common
  const [condition, setCondition] = useState<ConditionValue | "">("");
  const [platform, setPlatform] = useState<PlatformValue | "">("");
  const [withoutCondition, setWithoutCondition] = useState(false);
  const [withoutPlatform, setWithoutPlatform] = useState(false);

  // Level
  const bestLevel = LEVELS.filter(l => PLAN_RANK[plan] >= PLAN_RANK[l.requiredPlan]).pop();
  const [level, setLevel] = useState<EstimationLevel>(bestLevel?.level || "basic");

  // Search hooks
  const { models, state: searchState, error: searchError, retry: retrySearch } = useModelsSearch(
    mode === "component" ? modelSearch : bundleSearch
  );

  // URL prefill
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current) return;
    const modelId = searchParams.get("model_id");
    const modelName = searchParams.get("model_name");
    const cat = searchParams.get("category");
    const p = searchParams.get("price");
    if (modelId && modelName) {
      setSelectedModel({ id: parseInt(modelId), name: modelName, brand: "", category: cat || "", family: null });
      setModelSearch(modelName);
    }
    if (p) setPrice(p);
    prefilled.current = true;
  }, [searchParams]);

  // Bundle mode requires Pro
  const bundleBlocked = mode === "bundle" && PLAN_RANK[plan] < PLAN_RANK["pro"];

  const handleSubmit = () => {
    if (mode === "component") {
      if (!selectedModel || !price) {
        toast({ title: "Champs manquants", description: "Modèle et prix requis", variant: "destructive" });
        return;
      }
      if (!withoutCondition && !condition) {
        toast({ title: "État manquant", description: "Sélectionnez un état ou cochez 'Sans état'", variant: "destructive" });
        return;
      }
      const req: V3EstimationRequest = {
        mode: "component",
        model_id: selectedModel.id,
        price: parseFloat(price),
        condition: withoutCondition ? null : (condition || null),
        platform: withoutPlatform ? null : (platform || null),
        level,
      };
      onSubmit(req);
    } else {
      if (bundleComponents.length === 0 || !bundlePrice) {
        toast({ title: "Champs manquants", description: "Ajoutez des composants et un prix", variant: "destructive" });
        return;
      }
      const req: V3EstimationRequest = {
        mode: "bundle",
        total_price: parseFloat(bundlePrice),
        components: bundleComponents.map(c => ({ model_id: c.id })),
        condition: withoutCondition ? null : (condition || null),
        platform: withoutPlatform ? null : (platform || null),
        level,
      };
      onSubmit(req);
    }
  };

  const handleReset = () => {
    setSelectedModel(null);
    setModelSearch("");
    setPrice("");
    setBundleComponents([]);
    setBundlePrice("");
    setCondition("");
    setPlatform("");
    setWithoutCondition(false);
    setWithoutPlatform(false);
    onReset();
  };

  const addBundleComponent = (model: ModelAutocomplete) => {
    if (bundleComponents.length >= MAX_BUNDLE_COMPONENTS) return;
    setBundleComponents(prev => [...prev, model]);
    setBundleSearch("");
    setBundlePopoverOpen(false);
  };

  const isValid = mode === "component"
    ? !!selectedModel && !!price && (withoutCondition || !!condition)
    : bundleComponents.length > 0 && !!bundlePrice;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Estimation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "component" ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setMode("component")}
            >
              <Wrench className="h-3.5 w-3.5" />
              Composant seul
            </Button>
            <Button
              variant={mode === "bundle" ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setMode("bundle")}
            >
              <MonitorSmartphone className="h-3.5 w-3.5" />
              PC complet
            </Button>
          </div>

          {/* Bundle blocked */}
          {bundleBlocked && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 text-sm flex items-center gap-2">
              <Lock className="h-4 w-4 text-orange-500 shrink-0" />
              Le mode PC complet nécessite un plan Pro
            </div>
          )}

          {/* Component mode fields */}
          {mode === "component" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Modèle *</Label>
                <Popover open={modelPopoverOpen} onOpenChange={setModelPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {selectedModel ? selectedModel.name : <span className="text-muted-foreground">Rechercher un modèle...</span>}
                      <Search className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-50" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder="Tapez pour rechercher..." value={modelSearch} onValueChange={setModelSearch} />
                      <CommandList>
                        {searchState === "loading" && (
                          <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Recherche…</span>
                          </div>
                        )}
                        {searchState === "idle" && modelSearch.length < 2 && (
                          <div className="p-4 text-sm text-muted-foreground text-center">Tapez au moins 2 caractères</div>
                        )}
                        {searchState === "empty" && <CommandEmpty>Aucun modèle trouvé</CommandEmpty>}
                        {searchState === "error" && (
                          <div className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-destructive mb-2">
                              <AlertCircle className="h-4 w-4" /><span className="text-sm">{searchError}</span>
                            </div>
                            <Button variant="outline" size="sm" onClick={retrySearch}><RefreshCw className="h-3 w-3 mr-1" />Réessayer</Button>
                          </div>
                        )}
                        {searchState === "success" && models.length > 0 && (
                          <CommandGroup>
                            {models.map(m => (
                              <CommandItem
                                key={m.id}
                                value={m.id.toString()}
                                onSelect={() => { setSelectedModel(m); setModelPopoverOpen(false); }}
                                className="flex items-center gap-3 cursor-pointer"
                              >
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                                  {getCategoryIcon(m.category)}
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="font-medium truncate">{m.name}</span>
                                  <span className="text-xs text-muted-foreground">{m.brand} · {m.category}</span>
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

              <div className="space-y-2">
                <Label>Prix affiché (€) *</Label>
                <Input type="number" placeholder="Ex: 280" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
            </div>
          )}

          {/* Bundle mode fields */}
          {mode === "bundle" && !bundleBlocked && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Prix total du lot (€) *</Label>
                <Input type="number" placeholder="Ex: 1500" value={bundlePrice} onChange={e => setBundlePrice(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Composants ({bundleComponents.length}/{MAX_BUNDLE_COMPONENTS})</Label>
                <Popover open={bundlePopoverOpen} onOpenChange={setBundlePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between" disabled={bundleComponents.length >= MAX_BUNDLE_COMPONENTS}>
                      <span className="text-muted-foreground">+ Ajouter un composant</span>
                      <Plus className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-50" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput placeholder="Rechercher…" value={bundleSearch} onValueChange={setBundleSearch} />
                      <CommandList>
                        {searchState === "loading" && (
                          <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Recherche…</span>
                          </div>
                        )}
                        {searchState === "idle" && bundleSearch.length < 2 && (
                          <div className="p-4 text-sm text-muted-foreground text-center">Tapez au moins 2 caractères</div>
                        )}
                        {searchState === "empty" && <CommandEmpty>Aucun modèle trouvé</CommandEmpty>}
                        {searchState === "success" && models.length > 0 && (
                          <CommandGroup>
                            {models.map(m => (
                              <CommandItem key={m.id} value={m.id.toString()} onSelect={() => addBundleComponent(m)} className="flex items-center gap-3 cursor-pointer">
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">{getCategoryIcon(m.category)}</div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="font-medium truncate">{m.name}</span>
                                  <span className="text-xs text-muted-foreground">{m.brand} · {m.category}</span>
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

              {/* Bundle component list */}
              <AnimatePresence>
                {bundleComponents.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                    {bundleComponents.map((comp, i) => (
                      <motion.div
                        key={`${comp.id}-${i}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border"
                      >
                        <div className="w-7 h-7 rounded bg-background flex items-center justify-center shrink-0">
                          {getCategoryIcon(comp.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{comp.name}</p>
                          <p className="text-[11px] text-muted-foreground">{comp.category}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setBundleComponents(prev => prev.filter((_, idx) => idx !== i))}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Common options */}
          {!(mode === "bundle" && bundleBlocked) && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Condition */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="no-condition"
                      checked={withoutCondition}
                      onCheckedChange={(v) => { setWithoutCondition(!!v); if (v) setCondition(""); }}
                    />
                    <label htmlFor="no-condition" className="text-sm cursor-pointer">Estimation sans état</label>
                  </div>
                  {!withoutCondition && (
                    <Select value={condition} onValueChange={(v) => setCondition(v as ConditionValue)}>
                      <SelectTrigger>
                        <SelectValue placeholder="État du composant" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS_V3.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Platform */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="no-platform"
                      checked={withoutPlatform}
                      onCheckedChange={(v) => { setWithoutPlatform(!!v); if (v) setPlatform(""); }}
                    />
                    <label htmlFor="no-platform" className="text-sm cursor-pointer">Estimation sans plateforme</label>
                  </div>
                  {!withoutPlatform && (
                    <Select value={platform} onValueChange={(v) => setPlatform(v as PlatformValue)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Plateforme" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_OPTIONS_V3.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Level selector */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Niveau d'estimation</Label>
                <RadioGroup
                  value={level}
                  onValueChange={(v) => setLevel(v as EstimationLevel)}
                  className="space-y-2"
                >
                  {LEVELS.map(l => {
                    const locked = PLAN_RANK[plan] < PLAN_RANK[l.requiredPlan];
                    return (
                      <div key={l.level} className="flex items-center space-x-3">
                        <RadioGroupItem
                          value={l.level}
                          id={`level-${l.level}`}
                          disabled={locked}
                        />
                        <label
                          htmlFor={`level-${l.level}`}
                          className={`flex items-center gap-2 text-sm cursor-pointer ${locked ? "opacity-50" : ""}`}
                        >
                          <span className="font-medium">{l.label}</span>
                          <Badge variant="outline" className="text-[10px]">{l.credits} crédit{l.credits > 1 ? "s" : ""}</Badge>
                          {locked && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              {l.planLabel}
                            </span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || isPending}
                  className="flex-1 gap-2"
                >
                  {isPending ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" />Calcul...</>
                  ) : (
                    <><Calculator className="h-4 w-4" />🔍 Estimer</>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset}>Reset</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
