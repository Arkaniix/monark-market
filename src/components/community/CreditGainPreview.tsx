// Component to display expected credit gains for a community task
import { Coins, Zap, Clock, ChevronDown, ChevronUp, Info, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  calculateCreditGain, 
  getCreditGainDescription,
  type CreditGainCalculation 
} from "@/hooks/useCommunityCredits";

interface CreditGainPreviewProps {
  priority: 'high' | 'medium' | 'low';
  type: 'list_only' | 'open_on_new';
  hoursSinceLastScan?: number;
  showBreakdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CreditGainPreview({
  priority,
  type,
  hoursSinceLastScan,
  showBreakdown = false,
  size = 'md',
  className,
}: CreditGainPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const gain = calculateCreditGain(priority, type, hoursSinceLastScan);
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  return (
    <div className={cn("", className)}>
      {/* Main display */}
      <div className={cn(
        "flex items-center gap-2",
        sizeClasses[size]
      )}>
        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
          <Coins className={cn(
            "shrink-0",
            size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'
          )} />
          <span>+{gain.total}</span>
        </div>
        
        {gain.isCapped && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-[10px] gap-0.5">
                  <Sparkles className="h-3 w-3" />
                  MAX
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Plafonné à 20 crédits max par scrap</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {showBreakdown && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      {/* Breakdown */}
      {showBreakdown && expanded && (
        <div className="mt-2 pl-6 space-y-1 text-sm text-muted-foreground">
          {gain.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1">
                {item.label}
                {item.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground/50" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </span>
              <span className="font-medium text-foreground">+{item.value}</span>
            </div>
          ))}
          {gain.isCapped && (
            <div className="flex items-center justify-between gap-4 text-amber-600 dark:text-amber-400">
              <span>Plafond appliqué</span>
              <span className="font-medium">-{gain.cappedAmount}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 pt-1 border-t font-medium text-foreground">
            <span>Total</span>
            <span className="text-green-600 dark:text-green-400">+{gain.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact inline version for task cards
interface CreditGainBadgeProps {
  priority: 'high' | 'medium' | 'low';
  type: 'list_only' | 'open_on_new';
  hoursSinceLastScan?: number;
  className?: string;
}

export function CreditGainBadge({
  priority,
  type,
  hoursSinceLastScan,
  className,
}: CreditGainBadgeProps) {
  const gain = calculateCreditGain(priority, type, hoursSinceLastScan);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={cn(
              "gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20 cursor-help",
              className
            )}
          >
            <Coins className="h-3 w-3" />
            +{gain.total}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">Tu gagnes {gain.total} crédits !</p>
            <p className="text-xs text-muted-foreground">
              {getCreditGainDescription(gain)}
            </p>
            {gain.isCapped && (
              <p className="text-xs text-amber-500">
                (Plafonné au maximum de 20 crédits)
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Large callout for task claim modal
interface CreditGainCalloutProps {
  priority: 'high' | 'medium' | 'low';
  type: 'list_only' | 'open_on_new';
  hoursSinceLastScan?: number;
  modelName?: string;
  className?: string;
}

export function CreditGainCallout({
  priority,
  type,
  hoursSinceLastScan,
  modelName,
  className,
}: CreditGainCalloutProps) {
  const gain = calculateCreditGain(priority, type, hoursSinceLastScan);
  
  return (
    <div className={cn(
      "rounded-lg bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 p-4",
      className
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-full bg-green-500/20">
          <Coins className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            {modelName ? `En scrapant ${modelName}` : 'En complétant cette mission'}
          </p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            Tu gagnes +{gain.total} crédits
          </p>
        </div>
      </div>
      
      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {gain.breakdown.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between bg-background/50 rounded px-2 py-1"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-green-600 dark:text-green-400">+{item.value}</span>
          </div>
        ))}
      </div>
      
      {gain.isCapped && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Plafonné à 20 crédits max par mission
        </p>
      )}
      
      {/* Priority indicator */}
      {priority === 'high' && (
        <div className="mt-3 pt-3 border-t border-green-500/20">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Mission prioritaire — Bonus +{gain.priorityBonus} crédits !
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
