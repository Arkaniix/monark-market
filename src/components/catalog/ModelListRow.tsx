import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Star, Bell, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ModelCardImage } from "./ModelCardImage";
import { cn } from "@/lib/utils";
import type { CatalogModel } from "@/providers/types";

interface ModelListRowProps {
  model: CatalogModel;
  onToggleWatchlist: (id: number, name: string, isInWatchlist: boolean) => void;
  onOpenAlert: (model: CatalogModel) => void;
  isWatchlistPending?: boolean;
  isInWatchlist?: boolean;
  hasAlert?: boolean;
}

const getLiquidityLabel = (liquidity: number) => {
  if (liquidity >= 0.75) return "Très liquide";
  if (liquidity >= 0.5) return "Liquide";
  if (liquidity >= 0.25) return "Peu liquide";
  return "Rare";
};

const getLiquidityColor = (liquidity: number) => {
  if (liquidity >= 0.75) return "default";
  if (liquidity >= 0.5) return "secondary";
  return "outline";
};

export function ModelListRow({ 
  model, 
  onToggleWatchlist, 
  onOpenAlert, 
  isWatchlistPending,
  isInWatchlist = false,
  hasAlert = false
}: ModelListRowProps) {
  return (
    <Card className="hover:border-primary/50 transition-all hover:shadow-md group overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Left: Image + Identity */}
        <div className="flex items-center gap-3 p-3 sm:w-[280px] sm:min-w-[280px]">
          {/* Thumbnail */}
          <div className="w-16 h-12 shrink-0 rounded overflow-hidden">
            <ModelCardImage
              imageUrl={model.image_url}
              modelName={model.name}
              brand={model.brand}
              category={model.category}
              aspectRatio="4/3"
              className="h-full"
            />
          </div>
          
          {/* Identity */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {model.name}
            </p>
            <p className="text-xs text-muted-foreground">{model.brand}</p>
            <Badge variant="secondary" className="text-[9px] px-1 py-0 mt-1">{model.category}</Badge>
          </div>
        </div>

        {/* Center: Metrics */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-3 sm:py-3 sm:px-4 border-t sm:border-t-0 sm:border-l border-border/50 bg-muted/20">
          {/* Fair Value */}
          <div className="text-center sm:text-left">
            <p className="text-lg font-bold">
              {model.fair_value_30d || model.price_median_30d || "N/A"}€
            </p>
            <p className="text-[10px] text-muted-foreground">Fair Value 30j</p>
          </div>
          
          {/* Variations */}
          <div className="text-center sm:text-left">
            <div className="flex flex-col gap-0.5">
              {model.var_7d_pct !== undefined && (
                <div className={`flex items-center justify-center sm:justify-start gap-0.5 text-xs ${model.var_7d_pct < 0 ? "text-success" : model.var_7d_pct > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {model.var_7d_pct < 0 ? <TrendingDown className="h-3 w-3" /> : model.var_7d_pct > 0 ? <TrendingUp className="h-3 w-3" /> : null}
                  <span className="font-medium">
                    {model.var_7d_pct > 0 ? "+" : ""}{model.var_7d_pct.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground text-[10px]">7j</span>
                </div>
              )}
              {model.var_30d_pct !== null && (
                <div className={`flex items-center justify-center sm:justify-start gap-0.5 text-xs ${model.var_30d_pct < 0 ? "text-success" : model.var_30d_pct > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {model.var_30d_pct < 0 ? <TrendingDown className="h-3 w-3" /> : model.var_30d_pct > 0 ? <TrendingUp className="h-3 w-3" /> : null}
                  <span className="font-medium">
                    {model.var_30d_pct > 0 ? "+" : ""}{model.var_30d_pct.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground text-[10px]">30j</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Variations</p>
          </div>
          
          {/* Liquidity */}
          <div className="text-center sm:text-left">
            <Badge variant={getLiquidityColor(model.liquidity)} className="text-[10px] px-1.5 py-0">
              {getLiquidityLabel(model.liquidity)}
            </Badge>
            <p className="text-[10px] text-muted-foreground mt-1">Liquidité</p>
          </div>
          
          {/* Ads count */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{model.ads_count}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Annonces</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex sm:flex-col items-center justify-center gap-2 p-3 border-t sm:border-t-0 sm:border-l border-border/50 sm:w-[120px]">
          {model.id ? (
            <Button className="flex-1 sm:flex-none sm:w-full h-8 text-xs" size="sm" asChild>
              <Link to={`/models/${model.id}`}>Voir détails</Link>
            </Button>
          ) : (
            <Button className="flex-1 sm:flex-none sm:w-full h-8 text-xs" size="sm" disabled>
              Voir détails
            </Button>
          )}
          <div className="flex gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={isInWatchlist ? "default" : "outline"} 
                    size="sm" 
                    className={cn("h-8 w-8 p-0", isInWatchlist && "bg-primary text-primary-foreground")}
                    onClick={() => onToggleWatchlist(model.id, model.name, isInWatchlist)} 
                    disabled={isWatchlistPending || !model.id}
                  >
                    <Star className={cn("h-3.5 w-3.5", isInWatchlist && "fill-current")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isInWatchlist ? "Dans la watchlist" : "Ajouter à la watchlist"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={hasAlert ? "default" : "outline"} 
                    size="sm" 
                    className={cn("h-8 w-8 p-0", hasAlert && "bg-primary text-primary-foreground")}
                    onClick={() => onOpenAlert(model)} 
                    disabled={!model.id}
                  >
                    <Bell className={cn("h-3.5 w-3.5", hasAlert && "fill-current")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{hasAlert ? "Alerte active" : "Créer une alerte"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </Card>
  );
}
