import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface WatchlistActionButtonProps {
  isInWatchlist: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function WatchlistActionButton({
  isInWatchlist,
  onToggle,
  disabled = false,
  size = "default",
  className,
}: WatchlistActionButtonProps) {
  const buttonSize = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isInWatchlist ? "default" : "outline"}
            size={size}
            className={cn(
              buttonSize,
              "p-0",
              isInWatchlist && "bg-primary text-primary-foreground",
              className
            )}
            onClick={onToggle}
            disabled={disabled}
          >
            <Star className={cn(iconSize, isInWatchlist && "fill-current")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-sm">
          {isInWatchlist ? "Retirer de la watchlist" : "Ajouter à la watchlist"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
