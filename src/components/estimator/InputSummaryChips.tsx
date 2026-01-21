// Résumé des entrées sous forme de chips
import { Badge } from "@/components/ui/badge";
import { Cpu, Monitor, MemoryStick, HardDrive, HelpCircle } from "lucide-react";
import { MARKETPLACE_PLATFORMS } from "@/lib/platforms";
import { CONDITION_MAP } from "@/types/estimator";

interface InputSummaryChipsProps {
  modelName: string | null;
  category: string | null;
  adPrice: string;
  condition: string;
  platform: string;
  withoutCondition: boolean;
  withoutPlatform: boolean;
}

function getCategoryIcon(category: string | null) {
  switch (category?.toUpperCase()) {
    case "GPU":
      return <Monitor className="h-3 w-3" />;
    case "CPU":
      return <Cpu className="h-3 w-3" />;
    case "RAM":
      return <MemoryStick className="h-3 w-3" />;
    case "SSD":
    case "STOCKAGE":
      return <HardDrive className="h-3 w-3" />;
    default:
      return <Cpu className="h-3 w-3" />;
  }
}

export default function InputSummaryChips({
  modelName,
  category,
  adPrice,
  condition,
  platform,
  withoutCondition,
  withoutPlatform,
}: InputSummaryChipsProps) {
  const platformLabel = MARKETPLACE_PLATFORMS.find(p => p.value === platform)?.label;
  const conditionLabel = CONDITION_MAP[condition];

  // Don't show if no data yet
  if (!modelName && !adPrice) return null;

  return (
    <div className="flex flex-wrap gap-2 py-3 px-1">
      {modelName && (
        <Badge variant="secondary" className="gap-1.5 py-1">
          {getCategoryIcon(category)}
          {modelName}
        </Badge>
      )}
      
      {adPrice && (
        <Badge variant="outline" className="py-1">
          💰 {adPrice} €
        </Badge>
      )}
      
      {withoutCondition ? (
        <Badge variant="outline" className="py-1 gap-1 text-amber-600 border-amber-500/50">
          <HelpCircle className="h-3 w-3" />
          État inconnu
        </Badge>
      ) : condition ? (
        <Badge variant="outline" className="py-1">
          📦 {conditionLabel || condition}
        </Badge>
      ) : null}
      
      {withoutPlatform ? (
        <Badge variant="outline" className="py-1 gap-1 text-amber-600 border-amber-500/50">
          <HelpCircle className="h-3 w-3" />
          Plateforme inconnue
        </Badge>
      ) : platform ? (
        <Badge variant="outline" className="py-1">
          🌐 {platformLabel || platform}
        </Badge>
      ) : null}
    </div>
  );
}
