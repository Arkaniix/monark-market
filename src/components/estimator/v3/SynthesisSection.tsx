// Section 1 — Synthèse (tous plans, component + bundle)
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, AlertCircle, Cpu, Monitor, MemoryStick, HardDrive } from "lucide-react";
import type { V3EstimationResponse, V3PrimaryRisk, V3BundleComponent } from "@/types/estimatorV3";
import { getVerdictColorClass, VERDICT_ICONS } from "@/types/estimatorV3";

interface SynthesisSectionProps {
  result: V3EstimationResponse;
}

function ConfidenceDots({ level }: { level: "high" | "medium" | "low" }) {
  const filled = level === "high" ? 3 : level === "medium" ? 2 : 1;
  const labels: Record<string, string> = { high: "Élevée", medium: "Moyenne", low: "Faible" };
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Confiance :</span>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${i < filled ? "bg-primary" : "bg-muted"}`}
        />
      ))}
      <span className="text-xs font-medium">{labels[level]}</span>
    </div>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };
  return (
    <div className="space-y-1">
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold">{score}<span className="text-lg text-muted-foreground">/100</span></span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorMap[color] || "bg-primary"}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function RiskAlert({ risk }: { risk: V3PrimaryRisk }) {
  const config: Record<string, { bg: string; icon: typeof AlertTriangle; iconClass: string }> = {
    danger: { bg: "bg-red-500/10 border-red-500/30", icon: AlertTriangle, iconClass: "text-red-500" },
    warning: { bg: "bg-orange-500/10 border-orange-500/30", icon: AlertTriangle, iconClass: "text-orange-500" },
    info: { bg: "bg-blue-500/10 border-blue-500/30", icon: Info, iconClass: "text-blue-500" },
  };
  const c = config[risk.level] || config.info;
  const Icon = c.icon;
  return (
    <div className={`rounded-lg border p-3 ${c.bg}`}>
      <div className="flex items-start gap-2">
        <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${c.iconClass}`} />
        <div>
          <p className="text-sm font-medium">{risk.text}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{risk.detail}</p>
        </div>
      </div>
    </div>
  );
}

function getCatIcon(cat: string) {
  switch (cat?.toUpperCase()) {
    case "GPU": return <Monitor className="h-6 w-6" />;
    case "CPU": return <Cpu className="h-6 w-6" />;
    case "RAM": return <MemoryStick className="h-6 w-6" />;
    case "SSD": case "STOCKAGE": return <HardDrive className="h-6 w-6" />;
    default: return <Cpu className="h-6 w-6" />;
  }
}

// ============= Component mode synthesis =============
function ComponentSynthesis({ result }: { result: V3EstimationResponse }) {
  const { score, model, input, market, primary_risk, justifications } = result;
  const verdictClass = getVerdictColorClass(score.verdict_color);
  const priceDiffPct = market.price_vs_median_pct;

  return (
    <Card className={`border-2 shadow-lg ${verdictClass.split(" ").filter(c => c.startsWith("bg-") || c.startsWith("border-")).join(" ")}`}>
      <CardContent className="py-6 space-y-5">
        {/* Credits used */}
        <div className="flex justify-end">
          <Badge variant="outline" className="text-[10px]">
            {result.credits_used} crédit{result.credits_used > 1 ? "s" : ""} utilisé{result.credits_used > 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Model header */}
        <div className="flex items-center gap-4">
          {model.image_url ? (
            <img src={model.image_url} alt={model.name} className="h-16 w-16 rounded-xl object-contain bg-muted" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
              {getCatIcon(model.category)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{model.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
              <Badge variant="outline" className="text-xs">{model.category}</Badge>
              <span>·</span>
              <span>{model.manufacturer}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {input.price}€
              {input.condition_label && ` · ${input.condition_label}`}
              {input.platform_label && ` · ${input.platform_label}`}
            </p>
          </div>
        </div>

        {/* Score + Verdict */}
        <div className="grid sm:grid-cols-2 gap-4">
          <ScoreBar score={score.overall} color={score.verdict_color} />
          <div className="flex flex-col items-start sm:items-end justify-center gap-1">
            <Badge className={`text-base px-4 py-1.5 gap-2 border ${verdictClass}`}>
              {VERDICT_ICONS[score.verdict]} {score.verdict_label}
            </Badge>
            <p className="text-xs text-muted-foreground">{score.verdict_description}</p>
          </div>
        </div>

        <ConfidenceDots level={score.confidence.level} />

        {/* Summary */}
        <p className="text-sm">{score.summary}</p>

        {/* Median + gap */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            Médiane du marché : <span className="font-medium text-foreground">{market.median_price}€</span>
          </span>
          <span>·</span>
          <span className="text-muted-foreground">Votre prix :</span>
          <Badge variant="outline" className={priceDiffPct <= 0 ? "text-green-600 border-green-500/50" : "text-red-600 border-red-500/50"}>
            {priceDiffPct > 0 ? "+" : ""}{priceDiffPct != null ? priceDiffPct.toFixed(0) : "—"}%
          </Badge>
        </div>

        {/* Primary risk */}
        {primary_risk && <RiskAlert risk={primary_risk} />}

        {/* Justifications */}
        {justifications.length > 0 && (
          <ul className="space-y-1.5 border-t pt-3">
            {justifications.map((j, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                {j}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ============= Bundle mode synthesis =============
function BundleSynthesis({ result }: { result: V3EstimationResponse }) {
  const { score, input, bundle_analysis, components, primary_risk, justifications } = result;
  const ba = bundle_analysis!;
  const verdictClass = getVerdictColorClass(score.verdict_color);

  return (
    <Card className={`border-2 shadow-lg ${verdictClass.split(" ").filter(c => c.startsWith("bg-") || c.startsWith("border-")).join(" ")}`}>
      <CardContent className="py-6 space-y-5">
        <div className="flex justify-end">
          <Badge variant="outline" className="text-[10px]">
            {result.credits_used} crédit{result.credits_used > 1 ? "s" : ""} utilisé{result.credits_used > 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Bundle header */}
        <div>
          <h2 className="text-xl font-bold">
            Lot de {components?.length || 0} composants · {input.price}€
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {input.condition_label && `${input.condition_label} · `}
            {input.platform_label || "Multi-plateformes"}
          </p>
        </div>

        {/* Score + Verdict inline */}
        <div className="flex items-center gap-4 flex-wrap">
          <ScoreBar score={score.overall} color={score.verdict_color} />
          <Badge className={`text-base px-4 py-1.5 gap-2 border ${verdictClass}`}>
            {VERDICT_ICONS[score.verdict]} {score.verdict_label}
          </Badge>
        </div>

        <p className="text-sm">{score.summary}</p>

        {/* Bundle analysis table */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
          <h4 className="font-medium text-muted-foreground mb-2">Analyse du lot</h4>
          <div className="flex justify-between"><span>Valeur composants séparés</span><span className="font-medium">{ba.total_parts_value}€</span></div>
          <div className="flex justify-between"><span>Décote bundle ({ba.bundle_discount_pct ?? 0}%)</span><span className="font-medium text-orange-500">-{ba.bundle_discount_eur ?? 0}€</span></div>
          <div className="flex justify-between border-t pt-2"><span className="font-medium">Valeur estimée du lot</span><span className="font-bold">{ba.estimated_bundle_value ?? 0}€</span></div>
          <div className="flex justify-between">
            <span>Prix demandé</span>
            <span className={(ba.price_vs_bundle_pct ?? 0) > 0 ? "text-red-500" : "text-green-500"}>
              {input.price}€ ({(ba.price_vs_bundle_pct ?? 0) > 0 ? "+" : ""}{(ba.price_vs_bundle_pct ?? 0).toFixed(1)}%)
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>Économie vs achat séparé</span>
            <span className="font-medium text-green-600">{ba.savings_vs_separate_eur}€ ({ba.savings_vs_separate_pct}%)</span>
          </div>
        </div>

        {/* Components list */}
        {components && components.length > 0 && (
          <div className="rounded-lg border p-4 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Composants</h4>
            {components.map((comp, i) => (
              <ComponentRow key={i} comp={comp} />
            ))}
          </div>
        )}

        {primary_risk && <RiskAlert risk={primary_risk} />}

        {justifications.length > 0 && (
          <ul className="space-y-1.5 border-t pt-3">
            {justifications.map((j, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                {j}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ComponentRow({ comp }: { comp: V3BundleComponent }) {
  const noData = comp.status === "no_data";
  return (
    <div className={`flex items-center gap-3 p-2 rounded ${noData ? "opacity-50" : ""}`}>
      {comp.image_url ? (
        <img src={comp.image_url} alt={comp.name} className="h-8 w-8 rounded object-contain bg-muted" />
      ) : (
        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
          {getCatIcon(comp.category)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{comp.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">{comp.category}</Badge>
          {comp.condition_label && <span>{comp.condition_label}</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        {noData ? (
          <span className="text-xs text-muted-foreground italic">Données insuffisantes</span>
        ) : (
          <span className="text-sm font-medium">~{comp.fair_value ?? comp.median_price}€</span>
        )}
      </div>
    </div>
  );
}

// ============= Main export =============
export default function SynthesisSection({ result }: SynthesisSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {result.mode === "bundle" && result.bundle_analysis ? (
        <BundleSynthesis result={result} />
      ) : (
        <ComponentSynthesis result={result} />
      )}
    </motion.div>
  );
}
