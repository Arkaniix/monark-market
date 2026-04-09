import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Microscope, Lightbulb, ArrowRight } from "lucide-react";
import type { RepairSymptom, RepairGuideResponse } from "@/types/repair";
import { SEVERITY_CONFIG, DIFFICULTY_CONFIG } from "@/types/repair";

interface Props {
  symptom: RepairSymptom;
  guideData: RepairGuideResponse | null;
  guideLoading: boolean;
  onGoToDiagnostic: () => void;
}

export default function RepairGuideStep({ symptom, guideData, guideLoading, onGoToDiagnostic }: Props) {
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
      {/* Header */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold flex-1">{symptom.title}</h2>
          <Badge className={sev.className}>Sévérité : {sev.label}</Badge>
          <Badge className={diff.className}>Difficulté : {diff.label}</Badge>
          <Badge variant="outline">{guide.success_rate_pct ?? 0}% de succès</Badge>
        </CardContent>
      </Card>

      {/* Accordion sections */}
      <Accordion type="multiple" defaultValue={["diagnostic"]} className="space-y-2">
        {/* Diagnostic steps */}
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

        {/* Common causes */}
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

        {/* Repair procedures */}
        <AccordionItem value="procedures" className="border rounded-lg">
          <AccordionTrigger className="px-4 text-base font-semibold">
            🔧 Procédures de réparation ({guide.repair_procedures?.length ?? 0})
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            {(guide.repair_procedures ?? []).map((proc, idx) => (
              <Card key={idx}>
                <CardContent className="p-3 space-y-3">
                  <p className="font-semibold text-sm">{proc.cause_ref}</p>
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

        {/* Pro tips */}
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

      {/* CTA → Diagnostic IA */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Microscope className="h-6 w-6 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold">Besoin d'un diagnostic personnalisé ?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Obtenez une analyse IA spécifique à votre modèle exact,
                avec les problèmes connus et le ROI estimé de la réparation.
              </p>
            </div>
          </div>
          <Button onClick={onGoToDiagnostic} className="gap-2">
            Aller au diagnostic IA
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
