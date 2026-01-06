import { Link } from "react-router-dom";
import {
  Package,
  Tag,
  TrendingDown,
  TrendingUp,
  Bell,
  ExternalLink,
  Trash2,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { WatchlistEntry } from "@/providers/types";

interface WatchlistItemRowProps {
  item: WatchlistEntry;
  isModel: boolean;
  onCreateAlert: () => void;
  onRemove: () => void;
  isRemoving: boolean;
}

export function WatchlistItemRow({
  item,
  isModel,
  onCreateAlert,
  onRemove,
  isRemoving,
}: WatchlistItemRowProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);

  const currentPrice = item.current_price || 0;
  const fairValue = item.fair_value || currentPrice;
  const deviation = fairValue > 0 ? ((currentPrice - fairValue) / fairValue) * 100 : 0;
  const priceChange = item.price_change_7d || 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      {/* Icône type */}
      <div className={`p-2 rounded-lg shrink-0 ${isModel ? "bg-blue-500/10" : "bg-purple-500/10"}`}>
        {isModel ? <Package className="h-4 w-4 text-blue-500" /> : <Tag className="h-4 w-4 text-purple-500" />}
      </div>

      {/* Nom et catégorie */}
      <div className="flex-1 min-w-0">
        <Link
          to={isModel ? `/catalog/${item.target_id}` : `/ad/${item.target_id}`}
          className="font-medium text-sm hover:text-primary truncate block"
        >
          {item.name || `${item.brand || "Inconnu"} #${item.target_id}`}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          {item.category && <Badge variant="secondary" className="text-[10px] h-5">{item.category}</Badge>}
          {item.brand && <span className="text-xs text-muted-foreground">{item.brand}</span>}
        </div>
      </div>

      {/* Prix actuel */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-sm font-semibold">{formatPrice(currentPrice)}</p>
        {!isModel && <p className="text-xs text-muted-foreground">{formatPrice(fairValue)}</p>}
      </div>

      {/* Écart - uniquement pour les annonces */}
      {!isModel && (
        <div className="shrink-0 hidden md:block w-20 text-center">
          <Badge 
            variant="outline" 
            className={`text-xs ${
              deviation < -5 ? "border-green-500/50 text-green-600 bg-green-500/5" : 
              deviation > 5 ? "border-red-500/50 text-red-500 bg-red-500/5" : 
              "border-border text-muted-foreground"
            }`}
          >
            {deviation > 0 ? "+" : ""}{deviation.toFixed(0)}%
          </Badge>
        </div>
      )}

      {/* Tendance 7j */}
      <div className="shrink-0 hidden lg:flex items-center gap-1 w-20 justify-center">
        {priceChange < 0 ? (
          <TrendingDown className="h-4 w-4 text-green-500" />
        ) : priceChange > 0 ? (
          <TrendingUp className="h-4 w-4 text-red-500" />
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        )}
        <span className={`text-xs font-medium ${
          priceChange < 0 ? "text-green-500" : priceChange > 0 ? "text-red-500" : "text-muted-foreground"
        }`}>
          {priceChange > 0 ? "+" : ""}{priceChange.toFixed(1)}%
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCreateAlert}>
                <Bell className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Créer une alerte</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={isModel ? `/catalog/${item.target_id}` : `/ad/${item.target_id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Voir les détails</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={onRemove}
                disabled={isRemoving}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Retirer de la watchlist</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
