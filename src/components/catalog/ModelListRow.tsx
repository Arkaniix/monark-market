import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Package, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ModelCardImage } from "./ModelCardImage";
import { WatchlistActionButton } from "@/components/common/WatchlistActionButton";
import { AlertActionButton } from "@/components/common/AlertActionButton";
import type { CatalogModel, Alert } from "@/providers/types";

interface ModelListRowProps {
  model: CatalogModel;
  onToggleWatchlist: (id: number, name: string, isInWatchlist: boolean) => void;
  onOpenAlert: (model: CatalogModel) => void;
  onDeleteAlert: (alertId: number) => void;
  isWatchlistPending?: boolean;
  isInWatchlist?: boolean;
  existingAlerts?: Alert[];
}

const getLiquidityLabel = (liquidity: number) => {
  if (liquidity >= 0.75) return "Se vend vite";
  if (liquidity >= 0.5) return "Demande correcte";
  if (liquidity >= 0.25) return "Vente lente";
  return "Rare sur le marché";
};

const getLiquidityColor = (liquidity: number) => {
  if (liquidity >= 0.75) return "default";
  if (liquidity >= 0.5) return "secondary";
  return "outline";
};

const getLiquidityTooltip = (liquidity: number) => {
  const percentage = Math.round(liquidity * 100);
  if (liquidity >= 0.75) {
    return `Liquidité ${percentage}% — Ce modèle se vend rapidement. Fort volume d'annonces et rotation élevée.`;
  }
  if (liquidity >= 0.5) {
    return `Liquidité ${percentage}% — Demande modérée. Délai de vente raisonnable.`;
  }
  if (liquidity >= 0.25) {
    return `Liquidité ${percentage}% — Peu de demande. La vente peut prendre du temps.`;
  }
  return `Liquidité ${percentage}% — Très peu d'annonces. Modèle rare ou peu recherché.`;
};

export function ModelListRow({ 
  model, 
  onToggleWatchlist, 
  onOpenAlert, 
  onDeleteAlert,
  isWatchlistPending,
  isInWatchlist = false,
  existingAlerts = []
}: ModelListRowProps) {
  return (
    <Card className="hover:border-primary/50 transition-all hover:shadow-md group overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Left: Image + Identity */}
        <div className="flex items-center gap-4 p-4 sm:w-[320px] sm:min-w-[320px]">
          {/* Thumbnail */}
          <div className="w-20 h-16 shrink-0 rounded-md overflow-hidden">
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
            <p className="text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {model.name}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{model.brand}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">{model.category}</Badge>
              {model.variants_count != null && model.variants_count > 0 && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Layers className="h-3 w-3" />
                  {model.variants_count} var.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Metrics */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 p-4 sm:py-4 sm:px-5 border-t sm:border-t-0 sm:border-l border-border/50 bg-muted/20">
          {/* Fair Value */}
          <div className="text-center sm:text-left">
            <p className="text-xl font-bold">
              {model.fair_value_30d || model.price_median_30d || "N/A"}€
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Fair Value 30j</p>
          </div>
          
          {/* Variations */}
          <div className="text-center sm:text-left">
            <div className="flex flex-col gap-1">
              {model.var_7d_pct !== undefined && (
                <div className={`flex items-center justify-center sm:justify-start gap-1 text-sm ${model.var_7d_pct < 0 ? "text-success" : model.var_7d_pct > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {model.var_7d_pct < 0 ? <TrendingDown className="h-4 w-4" /> : model.var_7d_pct > 0 ? <TrendingUp className="h-4 w-4" /> : null}
                  <span className="font-semibold">
                    {model.var_7d_pct > 0 ? "+" : ""}{model.var_7d_pct.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground text-xs">7j</span>
                </div>
              )}
              {model.var_30d_pct !== null && (
                <div className={`flex items-center justify-center sm:justify-start gap-1 text-sm ${model.var_30d_pct < 0 ? "text-success" : model.var_30d_pct > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {model.var_30d_pct < 0 ? <TrendingDown className="h-4 w-4" /> : model.var_30d_pct > 0 ? <TrendingUp className="h-4 w-4" /> : null}
                  <span className="font-semibold">
                    {model.var_30d_pct > 0 ? "+" : ""}{model.var_30d_pct.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground text-xs">30j</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Variations</p>
          </div>
          
          {/* Liquidity */}
          <div className="text-center sm:text-left">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex flex-col items-center sm:items-start cursor-help">
                    <Badge variant={getLiquidityColor(model.liquidity)} className="text-xs px-2 py-0.5">
                      {getLiquidityLabel(model.liquidity)}
                    </Badge>
                    <div className="w-full max-w-[70px] h-2 bg-muted rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.round(model.liquidity * 100)}%` }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px] text-sm">
                  {getLiquidityTooltip(model.liquidity)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-xs text-muted-foreground mt-1">Liquidité</p>
          </div>
          
          {/* Ads count */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-base font-semibold">{model.ads_count}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Annonces</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex sm:flex-col items-center justify-center gap-3 p-4 border-t sm:border-t-0 sm:border-l border-border/50 sm:w-[140px]">
          {model.id ? (
            <Button className="flex-1 sm:flex-none sm:w-full h-10 text-sm" size="default" asChild>
              <Link to={`/models/${model.id}`}>Voir détails</Link>
            </Button>
          ) : (
            <Button className="flex-1 sm:flex-none sm:w-full h-10 text-sm" size="default" disabled>
              Voir détails
            </Button>
          )}
          <div className="flex gap-2">
            <WatchlistActionButton
              isInWatchlist={isInWatchlist}
              onToggle={() => onToggleWatchlist(model.id, model.name, isInWatchlist)}
              disabled={isWatchlistPending || !model.id}
              size="default"
            />
            <AlertActionButton
              targetId={model.id}
              targetType="model"
              existingAlerts={existingAlerts}
              onCreateAlert={() => onOpenAlert(model)}
              onDeleteAlert={onDeleteAlert}
              disabled={!model.id}
              size="default"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
