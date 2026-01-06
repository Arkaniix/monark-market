import { cn } from "@/lib/utils";
import { Store, ShoppingBag, ShoppingCart, Monitor, Facebook, Shirt } from "lucide-react";

// Platform configuration with colors and optional icons
const PLATFORM_CONFIG: Record<string, {
  label: string;
  bgClass: string;
  textClass: string;
  icon?: React.ComponentType<{ className?: string }>;
}> = {
  leboncoin: {
    label: "Leboncoin",
    bgClass: "bg-orange-500/15",
    textClass: "text-orange-600 dark:text-orange-400",
    icon: Store,
  },
  ebay: {
    label: "eBay",
    bgClass: "bg-blue-500/15",
    textClass: "text-blue-600 dark:text-blue-400",
    icon: ShoppingBag,
  },
  amazon: {
    label: "Amazon",
    bgClass: "bg-amber-500/15",
    textClass: "text-amber-600 dark:text-amber-400",
    icon: ShoppingCart,
  },
  ldlc: {
    label: "LDLC",
    bgClass: "bg-red-500/15",
    textClass: "text-red-600 dark:text-red-400",
    icon: Monitor,
  },
  facebook: {
    label: "FB Marketplace",
    bgClass: "bg-sky-500/15",
    textClass: "text-sky-600 dark:text-sky-400",
    icon: Facebook,
  },
  vinted: {
    label: "Vinted",
    bgClass: "bg-teal-500/15",
    textClass: "text-teal-600 dark:text-teal-400",
    icon: Shirt,
  },
};

interface PlatformBadgeProps {
  platform: string;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function PlatformBadge({ 
  platform, 
  showIcon = true, 
  size = "sm",
  className 
}: PlatformBadgeProps) {
  const normalizedPlatform = platform.toLowerCase().replace(/\s+/g, "");
  const config = PLATFORM_CONFIG[normalizedPlatform];

  // Fallback for unknown platforms
  if (!config) {
    return (
      <span 
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-0.5",
          "bg-muted text-muted-foreground",
          size === "sm" ? "text-xs" : "text-sm",
          className
        )}
      >
        {platform}
      </span>
    );
  }

  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-medium",
        config.bgClass,
        config.textClass,
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
        className
      )}
    >
      {showIcon && Icon && <Icon className={iconSize} />}
      {config.label}
    </span>
  );
}
