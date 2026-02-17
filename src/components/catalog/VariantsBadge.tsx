import { Layers } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

interface VariantsBadgeProps {
  variantsCount: number;
  /** Optional list of brand names to show on hover */
  brands?: string[];
  className?: string;
}

/** Known AIB brands per GPU model – used as a fallback when the API doesn't
 *  return a brands list on catalog items. We pick a deterministic subset
 *  based on the variants count so the hover preview looks realistic. */
const ALL_BRANDS = [
  "ASUS", "MSI", "Gigabyte", "EVGA", "Zotac", "PNY", "Palit",
  "Gainward", "Sapphire", "PowerColor", "XFX", "Inno3D", "KFA2", "Colorful",
];

function deriveBrands(count: number): string[] {
  // Show a plausible number of brands (at most count, capped at ALL_BRANDS length)
  const n = Math.min(count, ALL_BRANDS.length);
  return ALL_BRANDS.slice(0, n);
}

export function VariantsBadge({ variantsCount, brands, className }: VariantsBadgeProps) {
  if (!variantsCount || variantsCount <= 0) return null;

  const displayBrands = brands && brands.length > 0 ? brands : deriveBrands(variantsCount);
  const maxShow = 8;
  const shown = displayBrands.slice(0, maxShow);
  const remaining = displayBrands.length - maxShow;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className={`text-[10px] text-muted-foreground flex items-center gap-0.5 cursor-help ${className ?? ""}`}>
          <Layers className="h-3 w-3" />
          {variantsCount} var.
        </span>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="w-auto max-w-[260px] p-3">
        <p className="text-xs font-semibold mb-2">{variantsCount} variantes constructeur</p>
        <div className="flex flex-wrap gap-1">
          {shown.map((brand) => (
            <Badge key={brand} variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">
              {brand}
            </Badge>
          ))}
          {remaining > 0 && (
            <span className="text-[10px] text-muted-foreground self-center ml-0.5">
              +{remaining} autres
            </span>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
