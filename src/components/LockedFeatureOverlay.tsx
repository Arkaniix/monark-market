import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/hooks/useEntitlements";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============= Configuration =============

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

// ============= Main Overlay Component =============

interface LockedFeatureOverlayProps {
  children: ReactNode;
  isLocked: boolean;
  requiredPlan: PlanType;
  featureName?: string;
  className?: string;
  showPreview?: boolean;
  variant?: "overlay" | "inline" | "minimal";
}

export default function LockedFeatureOverlay({
  children,
  isLocked,
  requiredPlan,
  featureName,
  className,
  showPreview = true,
  variant = "overlay",
}: LockedFeatureOverlayProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  const PlanIcon = PLAN_ICONS[requiredPlan];

  if (variant === "minimal") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("relative cursor-not-allowed", className)}>
              <div className="pointer-events-none select-none opacity-40 blur-[2px]">
                {children}
              </div>
              <div className="absolute top-1 right-1">
                <Lock className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">
                {featureName || "Fonctionnalité"} · Plan {PLAN_LABELS[requiredPlan]}
              </p>
              <Link 
                to="/pricing" 
                className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
              >
                Voir les plans <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("relative rounded-lg border border-dashed border-muted-foreground/30 p-4", className)}>
        <div className="pointer-events-none select-none opacity-50 blur-[3px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-3 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Plan {PLAN_LABELS[requiredPlan]} requis
            </span>
            <Button asChild size="sm" variant="default" className="h-7 text-xs">
              <Link to="/pricing">Upgrade</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default: overlay variant
  return (
    <div className={cn("relative", className)}>
      {showPreview ? (
        <div className="pointer-events-none select-none blur-[6px] opacity-60">
          {children}
        </div>
      ) : (
        <div className="pointer-events-none select-none opacity-30">
          {children}
        </div>
      )}

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
            {requiredPlan !== "starter" && " et supérieur"}
          </p>

          <Button asChild size="sm" className="gap-2">
            <Link to="/pricing">
              <PlanIcon className="h-4 w-4" />
              Voir les plans
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============= Locked Value (for table cells, inline values) =============

interface LockedValueProps {
  value: ReactNode;
  isLocked: boolean;
  requiredPlan: PlanType;
  featureName?: string;
}

export function LockedValue({ value, isLocked, requiredPlan, featureName }: LockedValueProps) {
  if (!isLocked) {
    return <>{value}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-muted-foreground cursor-help">
            <span className="blur-[4px] select-none">•••</span>
            <Lock className="h-3 w-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="text-sm">
              {featureName || "Cette donnée"} nécessite le plan{" "}
              <span className="font-medium text-primary">{PLAN_LABELS[requiredPlan]}</span>
            </p>
            <Link 
              to="/pricing" 
              className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
            >
              Voir les plans <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============= Locked Button (for action buttons) =============

interface LockedButtonProps {
  children: ReactNode;
  isLocked: boolean;
  requiredPlan: PlanType;
  featureName?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LockedButton({ 
  children, 
  isLocked, 
  requiredPlan, 
  featureName,
  className,
  variant = "default",
  size = "default",
}: LockedButtonProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            disabled 
            className={cn("gap-2 opacity-60", className)}
          >
            <Lock className="h-3 w-3" />
            {typeof children === 'string' ? children : 'Verrouillé'}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">
              {featureName || "Action"} · Plan {PLAN_LABELS[requiredPlan]}
            </p>
            <p className="text-xs text-muted-foreground">
              Passez au plan {PLAN_LABELS[requiredPlan]} pour débloquer cette fonctionnalité.
            </p>
            <Link 
              to="/pricing" 
              className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
            >
              Voir les plans <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============= Plan Badge =============

interface PlanBadgeProps {
  plan: PlanType;
  className?: string;
  showIcon?: boolean;
}

export function PlanBadge({ plan, className, showIcon = true }: PlanBadgeProps) {
  const PlanIcon = PLAN_ICONS[plan];
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
      plan === "elite" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      plan === "pro" && "bg-primary/10 text-primary",
      plan === "starter" && "bg-muted text-muted-foreground",
      className
    )}>
      {showIcon && <PlanIcon className="h-3 w-3" />}
      {PLAN_LABELS[plan]}
    </span>
  );
}

// ============= Upgrade CTA Badge =============

interface UpgradeBadgeProps {
  requiredPlan: PlanType;
  featureName?: string;
  className?: string;
}

export function UpgradeBadge({ requiredPlan, featureName, className }: UpgradeBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/pricing">
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1 cursor-pointer hover:bg-primary/10 transition-colors",
                requiredPlan === "pro" && "border-primary/50 text-primary",
                requiredPlan === "elite" && "border-amber-500/50 text-amber-600 dark:text-amber-400",
                className
              )}
            >
              <Crown className="h-3 w-3" />
              {PLAN_LABELS[requiredPlan]}
            </Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">
            {featureName ? `"${featureName}"` : "Cette fonctionnalité"} nécessite 
            le plan {PLAN_LABELS[requiredPlan]}.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============= Feature Card with Lock State =============

interface LockedFeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  isLocked: boolean;
  requiredPlan: PlanType;
  children?: ReactNode;
  className?: string;
}

export function LockedFeatureCard({
  title,
  description,
  icon,
  isLocked,
  requiredPlan,
  children,
  className,
}: LockedFeatureCardProps) {
  return (
    <div className={cn(
      "relative rounded-lg border p-4 transition-all",
      isLocked 
        ? "border-dashed border-muted-foreground/30 bg-muted/20" 
        : "border-border bg-card hover:shadow-sm",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isLocked ? "bg-muted/50 text-muted-foreground" : "bg-primary/10 text-primary"
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn(
              "font-medium",
              isLocked && "text-muted-foreground"
            )}>
              {title}
            </h4>
            {isLocked && <UpgradeBadge requiredPlan={requiredPlan} featureName={title} />}
          </div>
          <p className={cn(
            "text-sm mt-1",
            isLocked ? "text-muted-foreground/70" : "text-muted-foreground"
          )}>
            {description}
          </p>
          {children && !isLocked && (
            <div className="mt-3">{children}</div>
          )}
          {isLocked && (
            <Button asChild variant="link" size="sm" className="h-auto p-0 mt-2 text-primary">
              <Link to="/pricing" className="inline-flex items-center gap-1">
                Débloquer avec {PLAN_LABELS[requiredPlan]}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
