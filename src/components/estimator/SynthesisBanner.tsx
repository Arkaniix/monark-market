// Bandeau de synthèse - Visible à tous les plans
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle, Cpu, Monitor, MemoryStick, HardDrive } from "lucide-react";
import type { EstimationResultUI } from "@/hooks/useEstimator";

interface SynthesisBannerProps {
  result: EstimationResultUI;
}

// Verdict mapping
const VERDICT_CONFIG = {
  good: {
    label: "Bonne opportunité",
    description: "Ce composant présente actuellement un bon équilibre entre prix, demande et potentiel de revente.",
    icon: CheckCircle2,
    variant: "default" as const,
    bgClass: "bg-green-500/10 border-green-500/30",
    textClass: "text-green-600 dark:text-green-400",
  },
  caution: {
    label: "Opportunité moyenne",
    description: "Ce composant peut être rentable, mais des précautions sont nécessaires. La marge est limitée ou le marché est instable.",
    icon: AlertTriangle,
    variant: "secondary" as const,
    bgClass: "bg-amber-500/10 border-amber-500/30",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  risk: {
    label: "Opportunité risquée",
    description: "Le prix demandé est trop élevé par rapport au marché. Risque élevé de perte ou de difficulté à revendre.",
    icon: XCircle,
    variant: "destructive" as const,
    bgClass: "bg-destructive/10 border-destructive/30",
    textClass: "text-destructive",
  },
};

// Condition labels
const CONDITION_LABELS: Record<string, string> = {
  neuf: "Neuf",
  "comme-neuf": "Comme neuf",
  bon: "Bon état",
  "a-reparer": "À réparer",
};

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

export default function SynthesisBanner({ result }: SynthesisBannerProps) {
  const verdict = VERDICT_CONFIG[result.badge];
  const VerdictIcon = verdict.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`border-2 ${verdict.bgClass} shadow-lg`}>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Composant info */}
            <div className="flex items-center gap-4 flex-1">
              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                {getCategoryIcon(result.category)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{result.model_name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-xs">
                    {result.category}
                  </Badge>
                  <span>•</span>
                  <span>{CONDITION_LABELS[result.condition] || result.condition}</span>
                  {result.region && (
                    <>
                      <span>•</span>
                      <span>{result.region}</span>
                    </>
                  )}
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
