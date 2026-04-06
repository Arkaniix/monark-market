import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RepairCategory, RepairSymptom } from "@/types/repair";
import { REPAIR_CATEGORIES } from "@/types/repair";
import { useSymptoms, useRepairGuide } from "@/hooks/useRepair";
import RepairCategoryStep from "@/components/repair/RepairCategoryStep";
import RepairGuideStep from "@/components/repair/RepairGuideStep";

export default function Repair() {
  const [selectedCategory, setSelectedCategory] = useState<RepairCategory | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<RepairSymptom | null>(null);

  const { data: symptoms, isLoading: symptomsLoading } = useSymptoms(selectedCategory);
  const { data: guideData, isLoading: guideLoading } = useRepairGuide(selectedSymptom?.slug ?? null);

  // Current step
  const step = selectedSymptom ? 2 : selectedCategory ? 1 : 0;

  const handleBack = () => {
    if (selectedSymptom) {
      setSelectedSymptom(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const breadcrumb = [
    { label: "Réparation", onClick: () => { setSelectedCategory(null); setSelectedSymptom(null); } },
    ...(selectedCategory
      ? [{ label: REPAIR_CATEGORIES.find((c) => c.key === selectedCategory)?.label ?? "", onClick: () => setSelectedSymptom(null) }]
      : []),
    ...(selectedSymptom ? [{ label: selectedSymptom.title }] : []),
  ];

  return (
    <div className="container py-8 max-w-5xl space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {"onClick" in b ? (
              <button onClick={b.onClick} className="hover:text-primary transition-colors">
                {b.label}
              </button>
            ) : (
              <span className="text-foreground font-medium">{b.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {step > 0 && (
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1">
          ← Retour
        </Button>
      )}

      {/* Step 0-1: Category + Symptom selection */}
      {!selectedSymptom && (
        <RepairCategoryStep
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          symptoms={symptoms ?? []}
          symptomsLoading={symptomsLoading}
          onSelectSymptom={setSelectedSymptom}
        />
      )}

      {/* Step 2: Guide */}
      {selectedSymptom && (
        <RepairGuideStep
          symptom={selectedSymptom}
          guideData={guideData ?? null}
          guideLoading={guideLoading}
        />
      )}
    </div>
  );
}
