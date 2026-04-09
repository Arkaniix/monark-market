import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText } from "lucide-react";
import type { DeepDiagnosticResponse } from "@/types/repair";
import { CONFIDENCE_CONFIG, DIFFICULTY_CONFIG } from "@/types/repair";
import { generateDiagnosticPdf } from "@/components/repair/repairPdfExport";

interface Props {
  data: DeepDiagnosticResponse;
}

export default function DiagnosticResult({ data }: Props) {
  const a = data.deep_analysis;
  if (!a) return null;

  const conf = CONFIDENCE_CONFIG[a.confidence] ?? CONFIDENCE_CONFIG.medium;

  const handleExportPdf = () => {
    generateDiagnosticPdf(data);
  };

  return (
    <div className="space-y-4">
      {/* Header badges + PDF button */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-primary/10 text-primary">
          🔬 Personnalisé pour {data.model_name}
        </Badge>
        {data.cached && <Badge variant="outline">Depuis le cache</Badge>}
        <Badge className={conf.className}>Confiance : {conf.label}</Badge>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-2">
          <FileText className="h-4 w-4" />
          Exporter en PDF
        </Button>
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
                  <div className="flex items-center justify-between flex-wrap gap-2">
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
