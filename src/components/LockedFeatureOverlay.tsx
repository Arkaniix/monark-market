import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/hooks/useEntitlements";

interface LockedFeatureOverlayProps {
  children: ReactNode;
  isLocked: boolean;
  requiredPlan: PlanType;
  featureName?: string;
  className?: string;
  showPreview?: boolean; // If true, show blurred content; if false, show placeholder
}

const PLAN_LABELS: Record<PlanType, string> = {
  starter: "Starter",
  pro: "Pro",
  elite: "Élite",
};

const PLAN_ICONS: Record<PlanType, typeof Crown> = {
  starter: Sparkles,
  pro: Crown,
  elite: Crown,
};

export default function LockedFeatureOverlay({
  children,
  isLocked,
  requiredPlan,
  featureName,
  className,
  showPreview = true,
}: LockedFeatureOverlayProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  const PlanIcon = PLAN_ICONS[requiredPlan];

  return (
    <div className={cn("relative", className)}>
      {/* Blurred or placeholder content */}
      {showPreview ? (
        <div className="pointer-events-none select-none blur-[6px] opacity-60">
          {children}
        </div>
      ) : (
        <div className="pointer-events-none select-none opacity-30">
          {children}
        </div>
      )}

      {/* Overlay with CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-lg z-10">
        <div className="text-center px-4 py-6 max-w-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          
          <h4 className="font-semibold text-foreground mb-1">
            {featureName || "Fonctionnalité"} verrouillée
          </h4>
          
          <p className="text-sm text-muted-foreground mb-4">
            Disponible avec le plan{" "}
            <span className="font-medium text-primary">{PLAN_LABELS[requiredPlan]}</span>
            {requiredPlan === "elite" && " et supérieur"}
            {requiredPlan === "pro" && " et supérieur"}
          </p>

          <Button asChild size="sm" className="gap-2">
            <Link to="/account?tab=subscription">
              <PlanIcon className="h-4 w-4" />
              Passer au plan {PLAN_LABELS[requiredPlan]}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Smaller inline version for table cells or compact areas
interface LockedValueProps {
  value: ReactNode;
  isLocked: boolean;
  requiredPlan: PlanType;
}

export function LockedValue({ value, isLocked, requiredPlan }: LockedValueProps) {
  if (!isLocked) {
    return <>{value}</>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <span className="blur-[4px] select-none">•••</span>
      <Lock className="h-3 w-3" />
    </span>
  );
}

// Badge for showing required plan
interface PlanBadgeProps {
  plan: PlanType;
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const PlanIcon = PLAN_ICONS[plan];
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
      plan === "elite" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      plan === "pro" && "bg-primary/10 text-primary",
      plan === "starter" && "bg-muted text-muted-foreground",
      className
    )}>
      <PlanIcon className="h-3 w-3" />
      {PLAN_LABELS[plan]}
    </span>
  );
}
