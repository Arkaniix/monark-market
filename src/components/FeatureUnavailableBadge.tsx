import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FeatureUnavailableBadgeProps {
  feature?: string;
  className?: string;
}

export function FeatureUnavailableBadge({ feature, className }: FeatureUnavailableBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`gap-1 border-warning text-warning ${className || ''}`}>
            <Clock className="h-3 w-3" />
            Bientôt disponible
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{feature ? `"${feature}"` : 'Cette fonctionnalité'} sera disponible prochainement.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper to check if an error is ApiFeatureUnavailableError
export function isFeatureUnavailableError(error: unknown): error is { name: string; feature: string } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name: string }).name === 'ApiFeatureUnavailableError'
  );
}
