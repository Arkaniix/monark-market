import { useState } from "react";
import { Cpu, HardDrive, CircuitBoard, Monitor, MemoryStick, Package, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Generic model images mapping (expandable when real images are added)
// For now, returns null to trigger placeholder
const MODEL_IMAGES: Record<string, string> = {
  // Example: "RTX 3070": "/images/models/rtx-3070.webp",
  // "RTX 4090": "/images/models/rtx-4090.webp",
};

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

// Category to gradient colors (subtle, professional)
const CATEGORY_GRADIENTS: Record<string, { bg: string; icon: string }> = {
  "GPU": { bg: "from-emerald-500/10 via-teal-500/5 to-transparent", icon: "text-emerald-500/50" },
  "Carte graphique": { bg: "from-emerald-500/10 via-teal-500/5 to-transparent", icon: "text-emerald-500/50" },
  "CPU": { bg: "from-blue-500/10 via-indigo-500/5 to-transparent", icon: "text-blue-500/50" },
  "Processeur": { bg: "from-blue-500/10 via-indigo-500/5 to-transparent", icon: "text-blue-500/50" },
  "RAM": { bg: "from-purple-500/10 via-pink-500/5 to-transparent", icon: "text-purple-500/50" },
  "Mémoire": { bg: "from-purple-500/10 via-pink-500/5 to-transparent", icon: "text-purple-500/50" },
  "SSD": { bg: "from-orange-500/10 via-amber-500/5 to-transparent", icon: "text-orange-500/50" },
  "Stockage": { bg: "from-orange-500/10 via-amber-500/5 to-transparent", icon: "text-orange-500/50" },
  "Carte mère": { bg: "from-cyan-500/10 via-blue-500/5 to-transparent", icon: "text-cyan-500/50" },
  "Motherboard": { bg: "from-cyan-500/10 via-blue-500/5 to-transparent", icon: "text-cyan-500/50" },
  "PC": { bg: "from-violet-500/10 via-purple-500/5 to-transparent", icon: "text-violet-500/50" },
  "PC complet": { bg: "from-violet-500/10 via-purple-500/5 to-transparent", icon: "text-violet-500/50" },
};

const DEFAULT_GRADIENT = { bg: "from-muted-foreground/10 via-muted/5 to-transparent", icon: "text-muted-foreground/40" };

interface DealCardImageProps {
  /** Image URL from the ad (if available) */
  imageUrl?: string | null;
  /** Generic model image URL (from our database) */
  modelImageUrl?: string | null;
  /** Model name for display in placeholder */
  modelName?: string | null;
  /** Category for fallback icon */
  category: string;
  /** Alt text */
  alt: string;
  /** Aspect ratio */
  aspectRatio?: "16/9" | "4/3" | "3/2";
  /** Additional classes */
  className?: string;
}

export function DealCardImage({ 
  imageUrl, 
  modelImageUrl,
  modelName, 
  category, 
  alt,
  aspectRatio = "4/3",
  className 
}: DealCardImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const aspectClass = aspectRatio === "16/9" 
    ? "aspect-[16/9]" 
    : aspectRatio === "3/2" 
      ? "aspect-[3/2]" 
      : "aspect-[4/3]";

  // Determine which image to use
  const effectiveImageUrl = imageUrl || modelImageUrl || (modelName ? MODEL_IMAGES[modelName] : null);

  // 1. Try to load an image (ad image, model image, or from our mapping)
  if (effectiveImageUrl && !imageError) {
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
          src={effectiveImageUrl}
          alt={alt}
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

  // 2. Fallback: category icon placeholder with model name
  const IconComponent = CATEGORY_ICONS[category] || Package;
  const gradientConfig = CATEGORY_GRADIENTS[category] || DEFAULT_GRADIENT;

  // Extract short model name for display
  const displayModelName = modelName 
    ? modelName.length > 20 
      ? modelName.substring(0, 20) + "…" 
      : modelName
    : null;

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
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '16px 16px'
      }} />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center gap-1.5 p-3">
        <IconComponent className={cn("h-8 w-8", gradientConfig.icon)} />
        
        {displayModelName && (
          <span className="text-[10px] font-medium text-muted-foreground/70 text-center leading-tight max-w-full truncate">
            {displayModelName}
          </span>
        )}
        
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">
          {category}
        </span>
      </div>
    </div>
  );
}

// Skeleton version for loading states
export function DealCardImageSkeleton({ 
  aspectRatio = "4/3",
  className 
}: { 
  aspectRatio?: "16/9" | "4/3" | "3/2";
  className?: string;
}) {
  const aspectClass = aspectRatio === "16/9" 
    ? "aspect-[16/9]" 
    : aspectRatio === "3/2" 
      ? "aspect-[3/2]" 
      : "aspect-[4/3]";

  return (
    <Skeleton className={cn("w-full", aspectClass, className)} />
  );
}
