import { useState } from "react";
import { Cpu, HardDrive, CircuitBoard, Monitor, MemoryStick, Package, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Category to icon mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "GPU": HardDrive,
  "Carte graphique": HardDrive,
  "CPU": Cpu,
  "Processeur": Cpu,
  "RAM": MemoryStick,
  "Mémoire": MemoryStick,
  "SSD": Layers,
  "Stockage": Layers,
  "Carte mère": CircuitBoard,
  "Motherboard": CircuitBoard,
  "PC": Monitor,
  "PC complet": Monitor,
};

// Category to gradient colors (premium, subtle)
const CATEGORY_GRADIENTS: Record<string, { bg: string; icon: string }> = {
  "GPU": { bg: "from-emerald-500/15 via-teal-500/8 to-transparent", icon: "text-emerald-500/60" },
  "Carte graphique": { bg: "from-emerald-500/15 via-teal-500/8 to-transparent", icon: "text-emerald-500/60" },
  "CPU": { bg: "from-blue-500/15 via-indigo-500/8 to-transparent", icon: "text-blue-500/60" },
  "Processeur": { bg: "from-blue-500/15 via-indigo-500/8 to-transparent", icon: "text-blue-500/60" },
  "RAM": { bg: "from-purple-500/15 via-pink-500/8 to-transparent", icon: "text-purple-500/60" },
  "Mémoire": { bg: "from-purple-500/15 via-pink-500/8 to-transparent", icon: "text-purple-500/60" },
  "SSD": { bg: "from-orange-500/15 via-amber-500/8 to-transparent", icon: "text-orange-500/60" },
  "Stockage": { bg: "from-orange-500/15 via-amber-500/8 to-transparent", icon: "text-orange-500/60" },
  "Carte mère": { bg: "from-cyan-500/15 via-blue-500/8 to-transparent", icon: "text-cyan-500/60" },
  "Motherboard": { bg: "from-cyan-500/15 via-blue-500/8 to-transparent", icon: "text-cyan-500/60" },
  "PC": { bg: "from-violet-500/15 via-purple-500/8 to-transparent", icon: "text-violet-500/60" },
  "PC complet": { bg: "from-violet-500/15 via-purple-500/8 to-transparent", icon: "text-violet-500/60" },
};

const DEFAULT_GRADIENT = { bg: "from-muted-foreground/15 via-muted/8 to-transparent", icon: "text-muted-foreground/50" };

interface ModelCardImageProps {
  /** Generic model image URL (from our database) */
  imageUrl?: string | null;
  /** Model name for display in placeholder */
  modelName: string;
  /** Brand name */
  brand: string;
  /** Category for fallback icon */
  category: string;
  /** Aspect ratio */
  aspectRatio?: "16/9" | "4/3" | "3/2" | "1/1";
  /** Additional classes */
  className?: string;
  /** Size variant for placeholder content */
  size?: "sm" | "md" | "lg";
}

export function ModelCardImage({ 
  imageUrl, 
  modelName, 
  brand,
  category, 
  aspectRatio = "4/3",
  className,
  size = "md"
}: ModelCardImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const aspectClass = aspectRatio === "16/9" 
    ? "aspect-[16/9]" 
    : aspectRatio === "3/2" 
      ? "aspect-[3/2]" 
      : aspectRatio === "1/1"
        ? "aspect-square"
        : "aspect-[4/3]";

  const sizeClasses = {
    sm: { icon: "h-5 w-5", name: "text-[8px]", brand: "text-[7px]" },
    md: { icon: "h-8 w-8", name: "text-xs", brand: "text-[10px]" },
    lg: { icon: "h-10 w-10", name: "text-sm", brand: "text-xs" }
  };

  // Try to load an image if available
  if (imageUrl && !imageError) {
    return (
      <div className={cn(
        "relative w-full overflow-hidden bg-muted/50 border-b border-border/30",
        aspectClass,
        className
      )}>
        {imageLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <img
          src={imageUrl}
          alt={modelName}
          className={cn(
            "w-full h-full object-cover transition-all duration-300",
            "group-hover:scale-[1.02]",
            imageLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: category icon placeholder with model name
  const IconComponent = CATEGORY_ICONS[category] || Package;
  const gradientConfig = CATEGORY_GRADIENTS[category] || DEFAULT_GRADIENT;

  // Extract short model name for display based on size
  const maxLength = size === "sm" ? 14 : size === "md" ? 24 : 32;
  const displayModelName = modelName.length > maxLength 
    ? modelName.substring(0, maxLength) + "…" 
    : modelName;

  return (
    <div 
      className={cn(
        "relative w-full overflow-hidden border-b border-border/30",
        "bg-gradient-to-br",
        gradientConfig.bg,
        "bg-muted/30",
        aspectClass,
        className
      )}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '12px 12px'
      }} />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center gap-1.5 p-3">
        <IconComponent className={cn(sizeClasses[size].icon, gradientConfig.icon)} />
        
        <span className={cn(
          "font-medium text-muted-foreground/80 text-center leading-tight max-w-full line-clamp-2",
          sizeClasses[size].name
        )}>
          {displayModelName}
        </span>
        
        <span className={cn("text-muted-foreground/50", sizeClasses[size].brand)}>
          {brand}
        </span>
      </div>
    </div>
  );
}

// Skeleton version for loading states
export function ModelCardImageSkeleton({ 
  aspectRatio = "4/3",
  className
}: { 
  aspectRatio?: "16/9" | "4/3" | "3/2" | "1/1";
  className?: string;
}) {
  const aspectClass = aspectRatio === "16/9" 
    ? "aspect-[16/9]" 
    : aspectRatio === "3/2" 
      ? "aspect-[3/2]" 
      : aspectRatio === "1/1"
        ? "aspect-square"
        : "aspect-[4/3]";

  return (
    <Skeleton className={cn("w-full", aspectClass, className)} />
  );
}
