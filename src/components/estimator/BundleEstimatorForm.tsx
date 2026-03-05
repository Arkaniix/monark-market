import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, X, Search, Loader2, AlertCircle, RefreshCw, Monitor, Cpu, MemoryStick, HardDrive, Sparkles, Calculator } from "lucide-react";
import { useModelsSearch } from "@/hooks";
import { MARKETPLACE_PLATFORMS, normalizePlatformKey } from "@/lib/platforms";
import { useBundleEstimation, useComponentLookup, VERDICT_CONFIG } from "@/hooks/useBundleEstimator";
import type { BundleResult } from "@/hooks/useBundleEstimator";
import type { ModelAutocomplete } from "@/providers/types";
import { useToast } from "@/hooks/use-toast";

const MAX_COMPONENTS = 10;

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case "gpu": return <Monitor className="h-4 w-4 text-primary" />;
    case "cpu": return <Cpu className="h-4 w-4 text-accent" />;
    case "ram": return <MemoryStick className="h-4 w-4 text-emerald-500" />;
    case "ssd": case "stockage": return <HardDrive className="h-4 w-4 text-orange-500" />;
    default: return <Cpu className="h-4 w-4 text-muted-foreground" />;
  }
};

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = { gpu: "GPU", cpu: "CPU", ram: "RAM", ssd: "SSD", stockage: "Stockage", psu: "Alim", case: "Boîtier", motherboard: "CM", cooler: "Refroidissement" };
  return map[cat?.toLowerCase()] || cat?.toUpperCase() || "—";
};

interface SelectedComponent {
  id: number;
  name: string;
  category: string;
}

export default function BundleEstimatorForm() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [components, setComponents] = useState<SelectedComponent[]>([]);
  const [bundlePrice, setBundlePrice] = useState("");
  const [platform, setPlatform] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [result, setResult] = useState<BundleResult | null>(null);

  const { models, state: searchState, error: searchError, retry: retrySearch } = useModelsSearch(modelSearch);
  const bundleMutation = useBundleEstimation();

  // Pre-fill from URL params
  const prefillIds = searchParams.get("components")?.split(",").map(Number).filter(Boolean) || [];
  const { data: prefillComponents } = useComponentLookup(prefillIds);

  useEffect(() => {
    if (searchParams.get("type") === "bundle") {
      const price = searchParams.get("price");
      if (price) setBundlePrice(price);
      const plat = searchParams.get("platform");
      if (plat) setPlatform(normalizePlatformKey(plat));
    }
  }, [searchParams]);

  useEffect(() => {
    if (prefillComponents && prefillComponents.length > 0 && components.length === 0) {
      setComponents(prefillComponents.map(c => ({ id: c.id, name: c.name, category: c.category })));
    }
  }, [prefillComponents]);

  const addComponent = (model: ModelAutocomplete) => {
    if (components.length >= MAX_COMPONENTS) {
      toast({ title: "Maximum atteint", description: `${MAX_COMPONENTS} composants maximum`, variant: "destructive" });
      return;
    }
    if (components.some(c => c.id === model.id)) {
      toast({ title: "Déjà ajouté", description: "Ce composant est déjà dans la liste", variant: "destructive" });
      return;
    }
    setComponents(prev => [...prev, { id: model.id, name: model.name, category: model.category }]);
    setModelSearch("");
    setPopoverOpen(false);
  };

  const removeComponent = (id: number) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  const handleEstimate = async () => {
    if (components.length === 0 || !bundlePrice) return;
    try {
      const res = await bundleMutation.mutateAsync({
        component_ids: components.map(c => c.id),
        bundle_price: parseFloat(bundlePrice),
        platform: platform || undefined,
      });
      setResult(res);
    } catch {
      toast({ title: "Erreur", description: "Impossible d'analyser le bundle", variant: "destructive" });
    }
  };

  const handleReset = () => {
    setComponents([]);
    setBundlePrice("");
    setPlatform("");
    setResult(null);
  };

  const isFormValid = components.length > 0 && bundlePrice && parseFloat(bundlePrice) > 0;

  return (
    <div className="space-y-6">
      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              PC complet — Estimation par composants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bundle Price */}
            <div className="space-y-2">
              <Label>Prix total de l'annonce (€) *</Label>
              <Input
                type="number"
                placeholder="Ex: 1500"
                value={bundlePrice}
                onChange={e => setBundlePrice(e.target.value)}
              />
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <Label>Plateforme</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Optionnel" />
                </SelectTrigger>
                <SelectContent>
                  {MARKETPLACE_PLATFORMS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Component search + add */}
            <div className="space-y-2">
              <Label>Composants ({components.length}/{MAX_COMPONENTS})</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" disabled={components.length >= MAX_COMPONENTS}>
                    <span className="text-muted-foreground">Ajouter un composant…</span>
                    <Plus className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 z-50" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput placeholder="Rechercher un modèle..." value={modelSearch} onValueChange={setModelSearch} />
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
                          {models.map(model => (
                            <CommandItem
                              key={model.id}
                              value={model.id.toString()}
                              onSelect={() => addComponent(model)}
                              className="flex items-center gap-3 cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                                {getCategoryIcon(model.category)}
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium truncate">{model.name}</span>
                                <span className="text-xs text-muted-foreground truncate">{model.brand} • {model.category}</span>
                              </div>
                              {components.some(c => c.id === model.id) && (
                                <Badge variant="outline" className="text-[10px] shrink-0">Ajouté</Badge>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Component list */}
            <AnimatePresence>
              {components.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  {components.map((comp, i) => (
                    <motion.div
                      key={comp.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border"
                    >
                      <div className="w-7 h-7 rounded bg-background flex items-center justify-center shrink-0">
                        {getCategoryIcon(comp.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{comp.name}</p>
                        <p className="text-[11px] text-muted-foreground">{getCategoryLabel(comp.category)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeComponent(comp.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleEstimate} disabled={!isFormValid || bundleMutation.isPending} className="flex-1 gap-2">
                {bundleMutation.isPending ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" />Analyse…</>
                ) : (
                  <><Calculator className="h-4 w-4" />Estimer le PC</>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>Reset</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Verdict */}
            <BundleVerdict result={result} />
            {/* Components table */}
            <BundleComponentsTable result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============= Sub-components =============

function BundleVerdict({ result }: { result: BundleResult }) {
  const config = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.insufficient_data;
  const diffSign = result.value_difference > 0 ? "+" : "";

  return (
    <Card className={`border ${config.bg}`}>
      <CardContent className="py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.components_found}/{result.components_requested} composants trouvés dans la base
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">Prix annonce</p>
              <p className="text-xl font-bold tabular-nums">{result.bundle_price} €</p>
            </div>
            <div className="text-2xl text-muted-foreground">vs</div>
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">Valeur pièces</p>
              <p className="text-xl font-bold text-primary tabular-nums">{result.total_estimated_value} €</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-muted-foreground">Écart</p>
              <p className={`text-lg font-bold tabular-nums ${config.color}`}>
                {diffSign}{result.value_difference_percent.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BundleComponentsTable({ result }: { result: BundleResult }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Détail des composants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="pb-2 font-medium">Composant</th>
                <th className="pb-2 font-medium">Catégorie</th>
                <th className="pb-2 font-medium text-right">Prix médian</th>
                <th className="pb-2 font-medium text-right">Observations</th>
              </tr>
            </thead>
            <tbody>
              {result.components.map((comp) => (
                <tr key={comp.component_id} className="border-b border-border/50">
                  <td className="py-2.5 font-medium">{comp.component_name}</td>
                  <td className="py-2.5">
                    <Badge variant="outline" className="text-[10px]">{getCategoryLabel(comp.category)}</Badge>
                  </td>
                  <td className="py-2.5 text-right tabular-nums">
                    {comp.median_price !== null ? `${comp.median_price} €` : <span className="text-muted-foreground italic">Pas de données</span>}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">{comp.data_points}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2">
                <td className="pt-3 font-bold" colSpan={2}>Total estimé</td>
                <td className="pt-3 text-right font-bold text-primary tabular-nums">{result.total_estimated_value} €</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
