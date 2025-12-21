// Component to display credit reset date and non-cumulative credits info
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Info, AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CreditResetInfoProps {
  resetDate: string | null;
  creditsRemaining: number;
  variant?: "default" | "compact" | "badge";
  showTooltip?: boolean;
  className?: string;
}

const RESET_TOOLTIP_TEXT = 
  "Les crédits sont remis à zéro à chaque nouveau cycle mensuel. " +
  "Les crédits non utilisés et ceux gagnés via le scrap communautaire " +
  "ne sont pas reportés au mois suivant.";

export function CreditResetInfo({
  resetDate,
  creditsRemaining,
  variant = "default",
  showTooltip = true,
  className,
}: CreditResetInfoProps) {
  if (!resetDate) return null;

  const resetDateObj = new Date(resetDate);
  const daysUntilReset = differenceInDays(resetDateObj, new Date());
  const formattedDate = format(resetDateObj, "dd MMMM", { locale: fr });
  const isResetSoon = daysUntilReset <= 7 && daysUntilReset >= 0;
  const hasCreditsToLose = creditsRemaining > 0 && isResetSoon;

  const TooltipWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!showTooltip) return <>{children}</>;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent className="max-w-[280px] p-3" side="bottom">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <RefreshCw className="h-4 w-4 text-primary" />
                Crédits non cumulables
              </div>
              <p className="text-sm text-muted-foreground">{RESET_TOOLTIP_TEXT}</p>
              {hasCreditsToLose && (
                <div className="flex items-center gap-2 text-warning text-sm pt-1 border-t border-border">
                  <AlertTriangle className="h-3 w-3" />
                  {creditsRemaining} crédits seront perdus dans {daysUntilReset} jour{daysUntilReset > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (variant === "badge") {
    return (
      <TooltipWrapper>
        <Badge
          variant={isResetSoon ? "outline" : "secondary"}
          className={cn(
            "gap-1 cursor-help",
            isResetSoon && hasCreditsToLose && "border-warning text-warning",
            className
          )}
        >
          <Calendar className="h-3 w-3" />
          Reset le {formattedDate}
          {showTooltip && <Info className="h-3 w-3 ml-1 opacity-50" />}
        </Badge>
      </TooltipWrapper>
    );
  }

  if (variant === "compact") {
    return (
      <TooltipWrapper>
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs text-muted-foreground cursor-help",
            isResetSoon && hasCreditsToLose && "text-warning",
            className
          )}
        >
          <Calendar className="h-3 w-3" />
          <span>Reset le {formattedDate}</span>
          {showTooltip && <Info className="h-3 w-3 opacity-50" />}
        </div>
      </TooltipWrapper>
    );
  }

  // Default variant
  return (
    <TooltipWrapper>
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg bg-muted/50 cursor-help transition-colors hover:bg-muted",
          isResetSoon && hasCreditsToLose && "bg-warning/10 border border-warning/30",
          className
        )}
      >
        <div className={cn(
          "p-1.5 rounded-md",
          isResetSoon && hasCreditsToLose ? "bg-warning/20" : "bg-primary/10"
        )}>
          <Calendar className={cn(
            "h-4 w-4",
            isResetSoon && hasCreditsToLose ? "text-warning" : "text-primary"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">Reset le {formattedDate}</span>
            {showTooltip && <Info className="h-3 w-3 text-muted-foreground" />}
          </div>
          {isResetSoon && hasCreditsToLose && (
            <p className="text-xs text-warning">
              {creditsRemaining} crédits seront perdus dans {daysUntilReset} jour{daysUntilReset > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {isResetSoon && (
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
        )}
      </div>
    </TooltipWrapper>
  );
}

// Inline text version for use in sentences
export function CreditResetText({
  resetDate,
  className,
}: {
  resetDate: string | null;
  className?: string;
}) {
  if (!resetDate) return null;

  const formattedDate = format(new Date(resetDate), "dd/MM", { locale: fr });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("underline decoration-dotted cursor-help", className)}>
            reset le {formattedDate}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] p-3">
          <p className="text-sm">{RESET_TOOLTIP_TEXT}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
