import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { RepairCategory, RepairSymptom } from "@/types/repair";
import { REPAIR_CATEGORIES } from "@/types/repair";
import {
  HelpCircle, Monitor, Thermometer, Zap, Volume2, Power, AlertTriangle,
  Eye, Cpu, MemoryStick, HardDrive, CircuitBoard, Gauge, Fan, Wrench,
  type LucideIcon as LucideIconType,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIconType> = {
  monitor: Monitor,
  thermometer: Thermometer,
  zap: Zap,
  volume2: Volume2,
  volume: Volume2,
  power: Power,
  "alert-triangle": AlertTriangle,
  alerttriangle: AlertTriangle,
  eye: Eye,
  cpu: Cpu,
  "memory-stick": MemoryStick,
  memorystick: MemoryStick,
  "hard-drive": HardDrive,
  harddrive: HardDrive,
  "circuit-board": CircuitBoard,
  circuitboard: CircuitBoard,
  gauge: Gauge,
  fan: Fan,
  wrench: Wrench,
  "help-circle": HelpCircle,
  helpcircle: HelpCircle,
};

interface Props {
  selectedCategory: RepairCategory | null;
  onSelectCategory: (cat: RepairCategory) => void;
  symptoms: RepairSymptom[];
  symptomsLoading: boolean;
  onSelectSymptom: (s: RepairSymptom) => void;
}

function LucideIcon({ name, className }: { name: string; className?: string }) {
  const pascalName = name
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("") as keyof typeof icons;
  const Icon = icons[pascalName] || icons["HelpCircle"];
  return <Icon className={className} />;
}

export default function RepairCategoryStep({
  selectedCategory,
  onSelectCategory,
  symptoms,
  symptomsLoading,
  onSelectSymptom,
}: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left: Categories */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Catégorie du composant</h2>
        <div className="grid grid-cols-2 gap-3">
          {REPAIR_CATEGORIES.map((cat) => (
            <Card
              key={cat.key}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                selectedCategory === cat.key && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => onSelectCategory(cat.key)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{cat.emoji}</span>
                <span className="font-medium text-sm">{cat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right: Symptoms */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {selectedCategory ? "Quel est le problème ?" : "Sélectionnez une catégorie"}
        </h2>

        {!selectedCategory && (
          <p className="text-muted-foreground text-sm">
            Choisissez le type de composant pour voir les symptômes associés.
          </p>
        )}

        {symptomsLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        )}

        {selectedCategory && !symptomsLoading && symptoms.length === 0 && (
          <p className="text-muted-foreground text-sm">Aucun symptôme disponible pour cette catégorie.</p>
        )}

        {symptoms.map((symptom) => (
          <Card
            key={symptom.id}
            className="cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50"
            onClick={() => onSelectSymptom(symptom)}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <LucideIcon name={symptom.icon} className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">{symptom.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{symptom.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
