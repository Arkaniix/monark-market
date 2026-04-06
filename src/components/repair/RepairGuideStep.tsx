import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Search, Microscope, Lightbulb, AlertTriangle, Loader2 } from "lucide-react";
import { useDeepDiagnostic } from "@/hooks/useRepair";
import { useCredits } from "@/hooks/useCredits";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type {
  RepairSymptom,
  RepairGuideResponse,
  DeepDiagnosticResponse,
} from "@/types/repair";
import {
  SEVERITY_CONFIG,
  DIFFICULTY_CONFIG,
  CONFIDENCE_CONFIG,
} from "@/types/repair";

interface Props {
  symptom: RepairSymptom;
  guideData: RepairGuideResponse | null;
  guideLoading: boolean;
}

interface AutocompleteResult {
  id: number;
  label?: string;
  name?: string;
  manufacturer?: string;
}

export default function RepairGuideStep({ symptom, guideData, guideLoading }: Props) {
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<AutocompleteResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [context, setContext] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deepResult, setDeepResult] = useState<DeepDiagnosticResponse | null>(null);

  const { creditsRemaining } = useCredits();
  const deepDiagnostic = useDeepDiagnostic();

  const { data: searchResults } = useQuery<AutocompleteResult[]>({
    queryKey: ["models", "autocomplete", modelSearch],
    queryFn: () => apiGet<AutocompleteResult[]>(`/v1/models/autocomplete?q=${encodeURIComponent(modelSearch)}&limit=10`),
    enabled: modelSearch.length >= 2,
  });

  const handleSelectModel = (m: AutocompleteResult) => {
    setSelectedModel(m);
    setModelSearch(m.label || m.name || "");
    setShowResults(false);
  };

  const handleDeepDiagnostic = async () => {
    setShowConfirm(false);
    try {
      const result = await deepDiagnostic.mutateAsync({
        symptom_id: symptom.id,
        model_id: selectedModel?.id ?? null,
        custom_name: null,
        context: context || null,
      });
      setDeepResult(result);
      toast.success("Diagnostic approfondi généré !");
    } catch (e: any) {
      if (e?.status === 402 || e?.message?.includes("crédit")) {
        toast.error("Crédits insuffisants", { description: "Rechargez vos crédits pour continuer." });
      } else {
        toast.error("Erreur lors du diagnostic", { description: e?.message });
      }
    }
  };

  const guide = guideData?.guide;

  if (guideLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!guide) {
    return <p className="text-muted-foreground">Guide non disponible.</p>;
  }

  const sev = SEVERITY_CONFIG[guide.severity] ?? SEVERITY_CONFIG.medium;
  const diff = DIFFICULTY_CONFIG[guide.difficulty] ?? DIFFICULTY_CONFIG.intermediate;

  return (
    <div className="space-y-6">
      {/* Model autocomplete */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Sélectionnez votre composant pour un diagnostic plus précis (optionnel)
          </p>
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
        </CardContent>
      </Card>

      {/* Section 1: Header */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold flex-1">
            {symptom.title}
          </h2>
          <Badge className={sev.className}>Sévérité : {sev.label}</Badge>
          <Badge className={diff.className}>Difficulté : {diff.label}</Badge>
          <Badge variant="outline">{guide.success_rate_pct ?? 0}% de succès</Badge>
        </CardContent>
      </Card>

      {/* Accordion sections */}
      <Accordion type="multiple" defaultValue={["diagnostic"]} className="space-y-2">
        {/* Section 2: Diagnostic steps */}
        <AccordionItem value="diagnostic" className="border rounded-lg">
          <AccordionTrigger className="px-4 text-base font-semibold">
            🔍 Diagnostic ({guide.diagnostic_steps?.length ?? 0} étapes)
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            {(guide.diagnostic_steps ?? []).map((step) => (
              <Card key={step.order}>
                <CardContent className="p-3 space-y-1">
                  <p className="font-medium text-sm">
                    <span className="text-primary font-bold mr-2">{step.order}.</span>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                  {step.tools_needed?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {step.tools_needed.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Section 3: Common causes */}
        <AccordionItem value="causes" className="border rounded-lg">
          <AccordionTrigger className="px-4 text-base font-semibold">
            📊 Causes probables ({guide.common_causes?.length ?? 0})
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            {[...(guide.common_causes ?? [])]
              .sort((a, b) => (b.probability_pct ?? 0) - (a.probability_pct ?? 0))
              .map((cause) => {
                const cd = DIFFICULTY_CONFIG[cause.repair_difficulty] ?? DIFFICULTY_CONFIG.intermediate;
                return (
                  <div key={cause.cause} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cause.cause}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{cause.probability_pct ?? 0}%</span>
                        <Badge className={`text-xs ${cd.className}`}>{cd.label}</Badge>
                      </div>
                    </div>
                    <Progress value={cause.probability_pct ?? 0} className="h-2" />
                  </div>
                );
              })}
          </AccordionContent>
        </AccordionItem>

        {/* Section 4: Repair procedures */}
        <AccordionItem value="procedures" className="border rounded-lg">
          <AccordionTrigger className="px-4 text-base font-semibold">
            🔧 Procédures de réparation ({guide.repair_procedures?.length ?? 0})
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            {(guide.repair_procedures ?? []).map((proc, idx) => (
              <Card key={idx}>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm">{proc.cause_ref}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-3">
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    {(proc.steps ?? []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>

                  {proc.materials?.length > 0 && (
                    <div className="rounded border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Matériel</th>
                            <th className="text-right p-2">Prix estimé</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proc.materials.map((m, i) => (
                            <tr key={i} className="border-t">
                              <td className="p-2">{m.name}</td>
                              <td className="p-2 text-right">{(m.est_price_eur ?? 0).toFixed(2)} €</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>💰 Coût total : {(proc.estimated_cost_eur ?? 0).toFixed(2)} €</span>
                    <span>⏱ Temps : {proc.estimated_time_min ?? 0} min</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Section 5: Pro tips */}
        <AccordionItem value="tips" className="border rounded-lg">
          <AccordionTrigger className="px-4 text-base font-semibold">
            💡 Conseils pratiques ({guide.pro_tips?.length ?? 0})
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-2">
            {(guide.pro_tips ?? []).map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* CTA: Deep diagnostic */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Microscope className="h-6 w-6 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold">Diagnostic approfondi personnalisé</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Obtenez une analyse spécifique à votre{" "}
                {selectedModel ? (selectedModel.label || selectedModel.name) : "composant"},
                avec les problèmes connus de ce modèle et une estimation du ROI de la réparation.
              </p>
            </div>
          </div>

          {!selectedModel && (
            <p className="text-xs text-muted-foreground">
              ↑ Sélectionnez un composant ci-dessus pour débloquer le diagnostic approfondi.
            </p>
          )}

          <Textarea
            placeholder="Décrivez la situation (ex: acheté pour pièces, PC d'un ami...)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="resize-none"
            rows={2}
          />

          <Button
            disabled={!selectedModel || deepDiagnostic.isPending}
            onClick={() => setShowConfirm(true)}
            className="w-full sm:w-auto"
          >
            {deepDiagnostic.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyse en cours...
              </>
            ) : (
              "Lancer le diagnostic — 5 crédits"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le diagnostic</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action coûte 5 crédits. Solde actuel : {creditsRemaining} crédits. Continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeepDiagnostic}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deep diagnostic result */}
      {deepResult && <DeepDiagnosticResult data={deepResult} />}
    </div>
  );
}

// ==================== Deep Diagnostic Result ====================

function DeepDiagnosticResult({ data }: { data: DeepDiagnosticResponse }) {
  const a = data.deep_analysis;
  if (!a) return null;

  const conf = CONFIDENCE_CONFIG[a.confidence] ?? CONFIDENCE_CONFIG.medium;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-primary/10 text-primary">
          🔬 Personnalisé pour {data.model_name}
        </Badge>
        {data.cached && <Badge variant="outline">Depuis le cache</Badge>}
        <Badge className={conf.className}>Confiance : {conf.label}</Badge>
      </div>

      {/* Model-specific notes */}
      {a.model_specific_notes && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2">Notes spécifiques au modèle</h4>
            <p className="text-sm text-muted-foreground">{a.model_specific_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Known issues */}
      {a.known_issues?.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <h4 className="font-semibold text-sm">Problèmes connus</h4>
            {a.known_issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                <span>{issue}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Personalized diagnostic */}
      {a.personalized_diagnostic?.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="font-semibold text-sm">Diagnostic personnalisé</h4>
            {a.personalized_diagnostic.map((step) => (
              <div key={step.order} className="space-y-1">
                <p className="text-sm font-medium">
                  <span className="text-primary font-bold mr-2">{step.order}.</span>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                {step.expected_result && (
                  <p className="text-xs text-primary/80">→ Résultat attendu : {step.expected_result}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Personalized repair */}
      {a.personalized_repair?.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h4 className="font-semibold text-sm">Réparations personnalisées</h4>
            {a.personalized_repair.map((rep, idx) => {
              const rd = DIFFICULTY_CONFIG[rep.difficulty as keyof typeof DIFFICULTY_CONFIG] ?? DIFFICULTY_CONFIG.intermediate;
              return (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{rep.scenario}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{rep.probability_pct ?? 0}%</Badge>
                      <Badge className={`text-xs ${rd.className}`}>{rd.label}</Badge>
                    </div>
                  </div>
                  <ol className="list-decimal list-inside text-xs space-y-0.5 text-muted-foreground">
                    {(rep.steps ?? []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                  {rep.materials?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rep.materials.map((m, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {m.name}{m.spec ? ` (${m.spec})` : ""} — {(m.est_price_eur ?? 0).toFixed(2)} €
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>💰 {(rep.estimated_cost_eur ?? 0).toFixed(2)} €</span>
                    <span>⏱ {rep.estimated_time_min ?? 0} min</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ROI */}
      {a.roi_estimate && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 space-y-3">
            <h4 className="font-semibold text-sm">💰 ROI estimé</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Coût réparation</p>
                <p className="text-lg font-bold">{(a.roi_estimate.total_repair_cost_eur ?? 0).toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valeur réparé</p>
                <p className="text-lg font-bold">{(a.roi_estimate.estimated_value_repaired_eur ?? 0).toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className={`text-lg font-bold ${(a.roi_estimate.roi_pct ?? 0) > 100 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {(a.roi_estimate.roi_pct ?? 0).toFixed(0)}%
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{a.roi_estimate.recommendation}</p>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {a.warnings?.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 space-y-2">
            <h4 className="font-semibold text-sm">⚠️ Avertissements</h4>
            {a.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
