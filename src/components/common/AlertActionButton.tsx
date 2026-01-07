import { useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Alert } from "@/providers/types";

interface AlertActionButtonProps {
  targetId: number;
  targetType: "ad" | "model";
  existingAlerts: Alert[];
  onCreateAlert: () => void;
  onDeleteAlert: (alertId: number) => void;
  disabled?: boolean;
  size?: "sm" | "default";
  className?: string;
}

const getAlertTypeLabel = (alertType: string) => {
  switch (alertType) {
    case "price_below":
      return "Prix en dessous";
    case "price_above":
      return "Prix au dessus";
    case "deal_detected":
      return "Bonne affaire";
    default:
      return alertType;
  }
};

export function AlertActionButton({
  targetId,
  targetType,
  existingAlerts,
  onCreateAlert,
  onDeleteAlert,
  disabled = false,
  size = "default",
  className,
}: AlertActionButtonProps) {
  const hasAlerts = existingAlerts.length > 0;
  const buttonSize = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  // If no alerts exist, simple button to create
  if (!hasAlerts) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={size}
              className={cn(buttonSize, "p-0", className)}
              onClick={onCreateAlert}
              disabled={disabled}
            >
              <Bell className={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-sm">Créer une alerte</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If alerts exist, show dropdown with options
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size={size}
                className={cn(buttonSize, "p-0 bg-primary text-primary-foreground", className)}
                disabled={disabled}
              >
                <Bell className={cn(iconSize, "fill-current")} />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent className="text-sm">
            {existingAlerts.length} alerte{existingAlerts.length > 1 ? "s" : ""} active{existingAlerts.length > 1 ? "s" : ""}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onCreateAlert} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Créer une nouvelle alerte</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Alertes actives ({existingAlerts.length})
        </div>
        {existingAlerts.map((alert) => (
          <DropdownMenuItem
            key={alert.id}
            onClick={() => onDeleteAlert(alert.id)}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <div className="flex-1 truncate">
              <span className="text-sm">{getAlertTypeLabel(alert.alert_type)}</span>
              {alert.price_threshold && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({alert.price_threshold}€)
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
