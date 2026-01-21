// Bandeau de synthèse - Visible à tous les plans
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle, Cpu, Monitor, MemoryStick, HardDrive, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { EnhancedEstimationResult } from "@/types/estimator";
import { CONDITION_MAP } from "@/types/estimator";

interface SynthesisBannerProps {
  result: EnhancedEstimationResult;
}

// Badge de plan pour indiquer l'accessibilité
function PlanBadge({ plan }: { plan: "starter" | "pro" | "elite" }) {
  const config = {
    starter: { label: "Starter", className: "border-muted-foreground/50 text-muted-foreground" },
    pro: { label: "Pro", className: "border-primary/50 text-primary" },
    elite: { label: "Élite", className: "border-amber-500/50 text-amber-600" },
  };
  const { label, className } = config[plan];
  return (
    <Badge variant="outline" className={`ml-2 gap-1 text-xs ${className}`}>
      <Sparkles className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// Map opportunity label to verdict config
function getVerdictFromOpportunity(label: string): {
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  variant: "default" | "secondary" | "destructive";
  bgClass: string;
  textClass: string;
} {
  switch (label) {
    case "Excellente":
      return {
        label: "Excellente opportunité",
        description: "Prix très attractif avec un fort potentiel de marge. Achat recommandé.",
        icon: CheckCircle2,
        variant: "default",
        bgClass: "bg-green-500/10 border-green-500/30",
        textClass: "text-green-600 dark:text-green-400",
      };
    case "Bonne":
      return {
        label: "Bonne opportunité",
        description: "Ce composant présente un bon équilibre entre prix, demande et potentiel de revente.",
        icon: CheckCircle2,
        variant: "default",
        bgClass: "bg-green-500/10 border-green-500/30",
        textClass: "text-green-600 dark:text-green-400",
      };
    case "Moyenne":
      return {
        label: "Opportunité moyenne",
        description: "Ce composant peut être rentable, mais des précautions sont nécessaires. La marge est limitée ou le marché est instable.",
        icon: AlertTriangle,
        variant: "secondary",
        bgClass: "bg-amber-500/10 border-amber-500/30",
        textClass: "text-amber-600 dark:text-amber-400",
      };
    case "Faible":
    default:
      return {
        label: "Opportunité risquée",
        description: "Le prix demandé est trop élevé par rapport au marché. Risque élevé de perte ou de difficulté à revendre.",
        icon: XCircle,
        variant: "destructive",
        bgClass: "bg-destructive/10 border-destructive/30",
        textClass: "text-destructive",
      };
  }
}

// Category icons
function getCategoryIcon(category: string) {
  switch (category?.toUpperCase()) {
    case "GPU":
      return <Monitor className="h-5 w-5" />;
    case "CPU":
      return <Cpu className="h-5 w-5" />;
    case "RAM":
      return <MemoryStick className="h-5 w-5" />;
    case "SSD":
    case "STOCKAGE":
      return <HardDrive className="h-5 w-5" />;
    default:
      return <Cpu className="h-5 w-5" />;
  }
}

// Trend icon
function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
}

export default function SynthesisBanner({ result }: SynthesisBannerProps) {
  const verdict = getVerdictFromOpportunity(result.opportunity.label);
  const VerdictIcon = verdict.icon;

  const conditionLabel = result.inputs.condition 
    ? CONDITION_MAP[result.inputs.condition] || result.inputs.condition 
    : "État inconnu";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`border-2 ${verdict.bgClass} shadow-lg h-full`}>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Synthèse</h3>
            <PlanBadge plan="starter" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Composant info */}
            <div className="flex items-center gap-4 flex-1">
              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                {getCategoryIcon(result.inputs.category)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{result.inputs.model_name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {result.inputs.category}
                  </Badge>
                  <span>•</span>
                  <span>{conditionLabel}</span>
                  {result.inputs.platform && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{result.inputs.platform}</span>
                    </>
                  )}
                </div>
                {/* Quick market info */}
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="text-muted-foreground">
                    Médian: <span className="text-foreground font-medium">{result.market.median_price}€</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={result.market.trend} />
                    <span className={result.market.trend === "up" ? "text-green-500" : result.market.trend === "down" ? "text-red-500" : "text-muted-foreground"}>
                      {result.market.var_30d_pct > 0 ? "+" : ""}{result.market.var_30d_pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <Badge 
                variant={verdict.variant}
                className={`text-base px-5 py-2 gap-2 ${verdict.bgClass} ${verdict.textClass} border`}
              >
                <VerdictIcon className="h-5 w-5" />
                {verdict.label}
              </Badge>
              <div className="text-2xl font-bold">
                {result.opportunity.score}/100
              </div>
            </div>
          </div>

          {/* Description explicative */}
          <p className="mt-4 text-sm text-muted-foreground border-t pt-4">
            {verdict.description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
