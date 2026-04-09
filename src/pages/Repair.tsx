import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, Microscope, ClipboardList } from "lucide-react";
import RepairGuidesTab from "@/components/repair/RepairGuidesTab";
import RepairDiagnosticTab from "@/components/repair/RepairDiagnosticTab";
import RepairHistoryTab from "@/components/repair/RepairHistoryTab";

export default function Repair() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "guides";

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", value);
    // Keep symptom/category only when going to diagnostic
    if (value !== "diagnostic") {
      next.delete("symptom");
      next.delete("category");
    }
    setSearchParams(next, { replace: true });
  };

  // Pre-selected symptom & category from guide redirect
  const preSymptom = searchParams.get("symptom") || undefined;
  const preCategory = searchParams.get("category") || undefined;

  return (
    <div className="container py-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Réparation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Guides de réparation et diagnostic IA pour vos composants
        </p>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="guides" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Guides</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostic" className="gap-2">
            <Microscope className="h-4 w-4" />
            <span className="hidden sm:inline">Diagnostic IA</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Historique</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides">
          <RepairGuidesTab
            onGoToDiagnostic={(symptomSlug, category) => {
              const next = new URLSearchParams();
              next.set("tab", "diagnostic");
              next.set("symptom", symptomSlug);
              next.set("category", category);
              setSearchParams(next, { replace: true });
            }}
          />
        </TabsContent>

        <TabsContent value="diagnostic">
          <RepairDiagnosticTab
            preSymptomSlug={preSymptom}
            preCategoryKey={preCategory}
          />
        </TabsContent>

        <TabsContent value="history">
          <RepairHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
