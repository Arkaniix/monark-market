import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Loader2, Microscope, RefreshCw } from "lucide-react";
import { useSymptoms, useDeepDiagnostic } from "@/hooks/useRepair";
import { useCredits } from "@/hooks/useCredits";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type { RepairCategory, RepairSymptom, DeepDiagnosticResponse } from "@/types/repair";
import { REPAIR_CATEGORIES } from "@/types/repair";
import DiagnosticResult from "@/components/repair/DiagnosticResult";
import { cn } from "@/lib/utils";
import {
  HelpCircle, Monitor, Thermometer, Zap, Volume2, Power, AlertTriangle,
  Eye, Cpu, MemoryStick, HardDrive, CircuitBoard, Gauge, Fan, Wrench,
  type LucideIcon as LucideIconType,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIconType> = {
  monitor: Monitor, thermometer: Thermometer, zap: Zap, volume2: Volume2, volume: Volume2,
  power: Power, "alert-triangle": AlertTriangle, alerttriangle: AlertTriangle, eye: Eye,
  cpu: Cpu, "memory-stick": MemoryStick, memorystick: MemoryStick, "hard-drive": HardDrive,
  harddrive: HardDrive, "circuit-board": CircuitBoard, circuitboard: CircuitBoard,
  gauge: Gauge, fan: Fan, wrench: Wrench, "help-circle": HelpCircle, helpcircle: HelpCircle,
};

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const key = (name || "").toLowerCase().replace(/[-_]/g, "");
  const Icon = ICON_MAP[name?.toLowerCase()] || ICON_MAP[key] || HelpCircle;
  return <Icon className={className} />;
}

interface AutocompleteResult {
  id: number;
  label?: string;
  name?: string;
  manufacturer?: string;
  category_slug?: string;
}

interface Props {
  preSymptomSlug?: string;
  preCategoryKey?: string;
}

export default function RepairDiagnosticTab({ preSymptomSlug, preCategoryKey }: Props) {
  // Step: 0 = config, 1 = loading, 2 = result
  const [step, setStep] = useState(0);

  // Model search
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<AutocompleteResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [useCustom, setUseCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<RepairCategory | null>(null);

  // Symptom
  const detectedCategory: RepairCategory | null =
    (selectedModel?.category_slug as RepairCategory) || customCategory || (preCategoryKey as RepairCategory) || null;
  const [selectedSymptom, setSelectedSymptom] = useState<RepairSymptom | null>(null);

  // Context
  const [context, setContext] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Result
  const [deepResult, setDeepResult] = useState<DeepDiagnosticResponse | null>(null);

  const { creditsRemaining } = useCredits();
  const deepDiagnostic = useDeepDiagnostic();

  const { data: symptoms, isLoading: symptomsLoading } = useSymptoms(detectedCategory);
  const { data: searchResults } = useQuery<AutocompleteResult[]>({
    queryKey: ["models", "autocomplete", modelSearch],
    queryFn: () => apiGet<AutocompleteResult[]>(`/v1/models/autocomplete?q=${encodeURIComponent(modelSearch)}&limit=10`),
    enabled: modelSearch.length >= 2 && !useCustom,
  });

  // Pre-select symptom from URL params
  useEffect(() => {
    if (preSymptomSlug && symptoms && !selectedSymptom) {
      const match = symptoms.find((s) => s.slug === preSymptomSlug);
      if (match) setSelectedSymptom(match);
    }
  }, [preSymptomSlug, symptoms, selectedSymptom]);

  const handleSelectModel = (m: AutocompleteResult) => {
    setSelectedModel(m);
    setModelSearch(m.label || m.name || "");
    setShowResults(false);
  };

  const canSubmit = !!(selectedSymptom && (selectedModel || (useCustom && customName.trim())));

  const handleLaunch = async () => {
    setShowConfirm(false);
    setStep(1);
    try {
      const result = await deepDiagnostic.mutateAsync({
        symptom_id: selectedSymptom!.id,
        model_id: selectedModel?.id ?? null,
        custom_name: useCustom ? customName : null,
        context: context || null,
      });
      setDeepResult(result);
      setStep(2);
      toast.success("Diagnostic approfondi généré !");
    } catch (e: any) {
      setStep(0);
      if (e?.status === 402 || e?.message?.includes("crédit")) {
        toast.error("Crédits insuffisants", { description: "Rechargez vos crédits pour continuer." });
      } else {
        toast.error("Erreur lors du diagnostic", { description: e?.message });
      }
    }
  };

  const handleReset = () => {
    setStep(0);
    setDeepResult(null);
    setSelectedModel(null);
    setModelSearch("");
    setSelectedSymptom(null);
    setContext("");
    setUseCustom(false);
    setCustomName("");
    setCustomCategory(null);
  };

  // Step 1: Loading
  if (step === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg font-semibold">
          Analyse en cours pour {selectedModel?.label || selectedModel?.name || customName}...
        </p>
        <p className="text-sm text-muted-foreground">Notre IA analyse les spécificités de votre modèle</p>
      </div>
    );
  }

  // Step 2: Result
  if (step === 2 && deepResult) {
    return (
      <div className="space-y-6 mt-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold">Résultat du diagnostic</h2>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Nouveau diagnostic
          </Button>
        </div>
        <DiagnosticResult data={deepResult} />
      </div>
    );
  }

  // Step 0: Configuration form
  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-start gap-3 mb-2">
        <Microscope className="h-6 w-6 text-primary mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold">Diagnostic IA personnalisé</h2>
          <p className="text-sm text-muted-foreground">
            Obtenez une analyse approfondie spécifique à votre modèle avec ROI estimé — 5 crédits
          </p>
        </div>
      </div>

      {/* Field 1: Component */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="font-medium text-sm">1. Quel composant voulez-vous diagnostiquer ?</p>

          {!useCustom ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un modèle..."
                  value={modelSearch}
                  onChange={(e) => {
                    setModelSearch(e.target.value);
                    setShowResults(true);
                    if (!e.target.value) setSelectedModel(null);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="pl-9"
                />
                {showResults && searchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((r) => (
                      <button
                        key={r.id}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                        onClick={() => handleSelectModel(r)}
                      >
                        <span className="font-medium">{r.label || r.name}</span>
                        {r.manufacturer && (
                          <span className="text-muted-foreground ml-2">{r.manufacturer}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedModel && (
                <Badge variant="outline" className="text-xs">
                  ✓ {selectedModel.label || selectedModel.name}
                </Badge>
              )}
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => { setUseCustom(true); setSelectedModel(null); setModelSearch(""); }}
              >
                Pas dans le catalogue ?
              </button>
            </>
          ) : (
            <>
              <Input
                placeholder="Nom du composant (ex: RTX 3060 Ti)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value.slice(0, 200))}
                maxLength={200}
              />
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {REPAIR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setCustomCategory(cat.key)}
                    className={cn(
                      "text-xs p-2 rounded border text-center transition-colors",
                      customCategory === cat.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => { setUseCustom(false); setCustomName(""); setCustomCategory(null); }}
              >
                Chercher dans le catalogue
              </button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Field 2: Symptom */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="font-medium text-sm">2. Quel est le problème ?</p>
          {!detectedCategory && (
            <p className="text-xs text-muted-foreground">
              Sélectionnez un composant pour afficher les symptômes disponibles.
            </p>
          )}
          {symptomsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          )}
          {detectedCategory && !symptomsLoading && (symptoms ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground">Aucun symptôme disponible.</p>
          )}
          {(symptoms ?? []).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {symptoms!.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSymptom(s)}
                  className={cn(
                    "flex items-start gap-2 p-3 rounded-lg border text-left transition-colors",
                    selectedSymptom?.id === s.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <LucideIcon name={s.icon} className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-xs">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field 3: Context */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="font-medium text-sm">3. Contexte (optionnel)</p>
          <Textarea
            placeholder="Décrivez la situation : où l'avez-vous acheté, depuis quand le problème, ce que vous avez déjà essayé..."
            value={context}
            onChange={(e) => setContext(e.target.value.slice(0, 1000))}
            className="resize-none"
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right">{context.length}/1000</p>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        disabled={!canSubmit}
        onClick={() => setShowConfirm(true)}
        size="lg"
        className="w-full sm:w-auto"
      >
        Lancer le diagnostic — 5 crédits
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le diagnostic</AlertDialogTitle>
            <AlertDialogDescription>
              Cette analyse coûte 5 crédits. Solde actuel : {creditsRemaining} crédits. Continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLaunch}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
