import { useState } from "react";
import { Cpu, HardDrive, CircuitBoard, Monitor, MemoryStick, Package, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

// Generic model images mapping (expandable when real images are added)
// For now, returns null to trigger placeholder
const MODEL_IMAGES: Record<string, string> = {
  // Example: "RTX 3070": "/images/models/rtx-3070.webp",
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

// Category to gradient colors
const CATEGORY_GRADIENTS: Record<string, string> = {
  "GPU": "from-emerald-500/20 to-teal-500/10",
  "Carte graphique": "from-emerald-500/20 to-teal-500/10",
  "CPU": "from-blue-500/20 to-indigo-500/10",
  "Processeur": "from-blue-500/20 to-indigo-500/10",
  "RAM": "from-purple-500/20 to-pink-500/10",
  "Mémoire": "from-purple-500/20 to-pink-500/10",
  "SSD": "from-orange-500/20 to-amber-500/10",
  "Stockage": "from-orange-500/20 to-amber-500/10",
  "Carte mère": "from-cyan-500/20 to-blue-500/10",
  "Motherboard": "from-cyan-500/20 to-blue-500/10",
  "PC": "from-violet-500/20 to-purple-500/10",
  "PC complet": "from-violet-500/20 to-purple-500/10",
};

interface DealCardImageProps {
  /** Image URL from the ad (if available) */
  imageUrl?: string | null;
  /** Model name for generic image lookup */
  modelName?: string | null;
  /** Category for fallback icon */
  category: string;
  /** Alt text */
  alt: string;
  /** Additional classes */
  className?: string;
}

export function DealCardImage({ 
  imageUrl, 
  modelName, 
  category, 
  alt,
  className 
}: DealCardImageProps) {
  const [imageError, setImageError] = useState(false);

  // 1. Try ad-specific image
  if (imageUrl && !imageError) {
    return (
      <div className={cn("relative w-full aspect-[16/9] overflow-hidden bg-muted", className)}>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // 2. Try model-specific generic image
  const modelImageUrl = modelName ? MODEL_IMAGES[modelName] : null;
  if (modelImageUrl) {
    return (
      <div className={cn("relative w-full aspect-[16/9] overflow-hidden bg-muted", className)}>
        <img
          src={modelImageUrl}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    );
  }

  // 3. Fallback: category icon placeholder
  const IconComponent = CATEGORY_ICONS[category] || Package;
  const gradient = CATEGORY_GRADIENTS[category] || "from-muted-foreground/20 to-muted/10";

  return (
    <div 
      className={cn(
        "relative w-full aspect-[16/9] overflow-hidden",
        "bg-gradient-to-br",
        gradient,
        "flex items-center justify-center",
        className
      )}
    >
      <IconComponent className="h-12 w-12 text-muted-foreground/40" />
    </div>
  );
}
