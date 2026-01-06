import { cn } from "@/lib/utils";
import { Store, ShoppingBag, ShoppingCart, Monitor, Smartphone, Shirt, Package } from "lucide-react";

// Platform configuration with colors and icons (Lucide icons for legal safety)
const PLATFORM_CONFIG: Record<string, {
  label: string;
  shortLabel: string;
  bgClass: string;
  textClass: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  leboncoin: {
    label: "Leboncoin",
    shortLabel: "LBC",
    bgClass: "bg-orange-500/15 dark:bg-orange-500/20",
    textClass: "text-orange-600 dark:text-orange-400",
    icon: Store,
  },
  ebay: {
    label: "eBay",
    shortLabel: "eBay",
    bgClass: "bg-blue-500/15 dark:bg-blue-500/20",
    textClass: "text-blue-600 dark:text-blue-400",
    icon: ShoppingBag,
  },
  amazon: {
    label: "Amazon",
    shortLabel: "AMZ",
    bgClass: "bg-amber-500/15 dark:bg-amber-500/20",
    textClass: "text-amber-600 dark:text-amber-400",
    icon: ShoppingCart,
  },
  ldlc: {
    label: "LDLC",
    shortLabel: "LDLC",
    bgClass: "bg-red-500/15 dark:bg-red-500/20",
    textClass: "text-red-600 dark:text-red-400",
    icon: Monitor,
  },
  facebook: {
    label: "FB Marketplace",
    shortLabel: "FB",
    bgClass: "bg-sky-500/15 dark:bg-sky-500/20",
    textClass: "text-sky-600 dark:text-sky-400",
    icon: Smartphone,
  },
  vinted: {
    label: "Vinted",
    shortLabel: "Vinted",
    bgClass: "bg-teal-500/15 dark:bg-teal-500/20",
    textClass: "text-teal-600 dark:text-teal-400",
    icon: Shirt,
  },
};

interface PlatformBadgeProps {
  platform: string;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function PlatformBadge({ 
  platform, 
  showIcon = true,
  showLabel = true,
  size = "sm",
  className 
}: PlatformBadgeProps) {
  const normalizedPlatform = platform.toLowerCase().replace(/[\s_-]+/g, "").replace("marketplace", "");
  
  // Handle variations
  const platformKey = normalizedPlatform === "fb" || normalizedPlatform === "fbmarket" 
    ? "facebook" 
    : normalizedPlatform;
    
  const config = PLATFORM_CONFIG[platformKey];

  // Fallback for unknown platforms
  if (!config) {
    return (
      <span 
        className={cn(
          "inline-flex items-center gap-0.5 rounded-md",
          "bg-muted text-muted-foreground",
          size === "xs" ? "px-1 py-0 text-[10px] h-5" :
          size === "sm" ? "px-1.5 py-0.5 text-xs" : 
          "px-2 py-1 text-sm",
          className
        )}
      >
        <Package className={size === "xs" ? "h-2.5 w-2.5" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        {showLabel && <span>{platform}</span>}
      </span>
    );
  }

  const Icon = config.icon;
  const iconSize = size === "xs" ? "h-2.5 w-2.5" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const label = size === "xs" ? config.shortLabel : config.label;

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        config.bgClass,
        config.textClass,
        showIcon && showLabel ? "gap-0.5" : "",
        size === "xs" ? "px-1 py-0 text-[10px] h-5" :
        size === "sm" ? "px-1.5 py-0.5 text-xs" : 
        "px-2 py-1 text-sm",
        className
      )}
    >
      {showIcon && <Icon className={iconSize} />}
      {showLabel && <span>{label}</span>}
    </span>
  );
}

// Export platform list for filters
export const AVAILABLE_PLATFORMS = Object.entries(PLATFORM_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}))
