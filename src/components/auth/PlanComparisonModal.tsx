import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Zap, 
  Bell, 
  Database, 
  Calculator, 
  Search, 
  GraduationCap, 
  Download, 
  Headphones,
  Crown,
  Sparkles,
  Star,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlanComparisonModalProps {
  trigger: React.ReactNode;
  selectedPlan: string;
  onSelectPlan: (planId: string) => void;
}

const PLANS = [
  {
    id: "standard",
    name: "Standard",
    price: "11,99€",
    description: "Pour les acheteurs réguliers",
    recommended: true,
    icon: Star,
    gradient: "from-primary to-primary/80",
  },
  {
    id: "pro",
    name: "Pro",
    price: "24,99€",
    description: "Pour les revendeurs et pros",
    recommended: false,
    icon: Crown,
    gradient: "from-amber-500 to-amber-600",
  },
];

const ESTIMATOR_TOOLTIPS = {
  standard: "Analyse complète : prix actionnables, aide à la négociation, graphiques interactifs 30/90j avec volume.",
  pro: "Analyse complète + scénarios avec probabilités et délais, simulateur What-if, export CSV.",
};

const FEATURES = [
  { name: "Crédits mensuels", icon: Zap, standard: "200", pro: "800", highlight: true },
  { name: "Alertes actives", icon: Bell, standard: "10", pro: "100", highlight: true },
  { name: "Base annonces + Catalogue", icon: Database, standard: true, pro: true },
  { name: "Estimator", icon: Calculator, standard: "Complet", pro: "Complet+", hasTooltips: true },
  { name: "Introduction plateforme", icon: GraduationCap, standard: true, pro: true },
  { name: "Formation avancée", icon: GraduationCap, standard: true, pro: true },
  { name: "Scénarios + Négociation", icon: Search, standard: false, pro: true },
  { name: "Export CSV", icon: Download, standard: false, pro: true },
  { name: "Support prioritaire", icon: Headphones, standard: false, pro: true },
];

function FeatureValue({ 
  value, 
  planId, 
  hasTooltip,
  tooltipContent 
}: { 
  value: boolean | string; 
  planId: string;
  hasTooltip?: boolean;
  tooltipContent?: string;
}) {
  const content = typeof value === "boolean" ? (
    value ? (
      <div className="flex items-center justify-center">
        <div className="rounded-full bg-green-500/20 p-1">
          <Check className="h-4 w-4 text-green-500" />
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center">
        <div className="rounded-full bg-muted p-1">
          <X className="h-4 w-4 text-muted-foreground/40" />
        </div>
      </div>
    )
  ) : (
    <span className={cn(
      "text-sm font-semibold",
      planId === "pro" && "text-amber-500",
      planId === "standard" && "text-primary",
    )}>
      {value}
    </span>
  );

  if (hasTooltip && tooltipContent) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center gap-1 cursor-help">
            {content}
            <HelpCircle className="h-3 w-3 text-muted-foreground/60" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function PlanComparisonModal({
  trigger,
  selectedPlan,
  onSelectPlan,
}: PlanComparisonModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-br from-background to-muted/30">
          <DialogTitle className="text-2xl font-bold text-center">
            Choisissez votre plan
          </DialogTitle>
          <p className="text-center text-muted-foreground text-sm mt-1">
            Comparez les fonctionnalités et trouvez le plan adapté à vos besoins
          </p>
        </DialogHeader>

        <div className="p-6">
          {/* Plan cards header */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="flex items-end pb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fonctionnalités
              </span>
            </div>
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => onSelectPlan(plan.id)}
                  className={cn(
                    "relative text-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.02]",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  {plan.recommended && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 shadow-md">
                      Recommandé
                    </Badge>
                  )}
                  
                  <div className={cn(
                    "w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-gradient-to-br",
                    plan.gradient
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="font-bold text-lg">{plan.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">{plan.description}</div>
                  
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className={cn(
                      "text-2xl font-bold",
                      plan.id === "pro" && "text-amber-500",
                      plan.id === "standard" && "text-primary",
                    )}>
                      {plan.price}
                    </span>
                    <span className="text-xs text-muted-foreground">/mois</span>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Feature rows */}
          <div className="rounded-xl border overflow-hidden">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.name}
                  className={cn(
                    "grid grid-cols-3 gap-3 py-3.5 px-4 items-center",
                    index % 2 === 0 ? "bg-muted/20" : "bg-background",
                    index !== FEATURES.length - 1 && "border-b border-border/50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      feature.highlight ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        feature.highlight ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "text-sm",
                      feature.highlight ? "font-medium" : "text-muted-foreground"
                    )}>
                      {feature.name}
                    </span>
                  </div>
                  <div className="text-center">
                    <FeatureValue 
                      value={feature.standard} 
                      planId="standard" 
                      hasTooltip={feature.hasTooltips}
                      tooltipContent={feature.hasTooltips ? ESTIMATOR_TOOLTIPS.standard : undefined}
                    />
                  </div>
                  <div className="text-center">
                    <FeatureValue 
                      value={feature.pro} 
                      planId="pro" 
                      hasTooltip={feature.hasTooltips}
                      tooltipContent={feature.hasTooltips ? ESTIMATOR_TOOLTIPS.pro : undefined}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hint text */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Cliquez sur un plan ci-dessus pour le sélectionner
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}