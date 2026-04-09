import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, FileText, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRepairHistory, useRepairOutcome, useDeepDiagnostic } from "@/hooks/useRepair";
import type { RepairHistoryItem, RepairOutcome, DeepDiagnosticResponse } from "@/types/repair";
import { OUTCOME_CONFIG, CATEGORY_LABELS } from "@/types/repair";
import DiagnosticResult from "@/components/repair/DiagnosticResult";
import { generateDiagnosticPdf } from "@/components/repair/repairPdfExport";

const LIMIT = 20;

export default function RepairHistoryTab() {
  const [offset, setOffset] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");

  // Feedback dialog
  const [feedbackItem, setFeedbackItem] = useState<RepairHistoryItem | null>(null);
  const [feedbackOutcome, setFeedbackOutcome] = useState<RepairOutcome>("repaired");
  const [feedbackNotes, setFeedbackNotes] = useState("");

  // View result dialog
  const [viewResult, setViewResult] = useState<DeepDiagnosticResponse | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const usedDeep = typeFilter === "deep" ? true : typeFilter === "guide" ? false : null;
  const { data, isLoading } = useRepairHistory({
    limit: LIMIT,
    offset,
    usedDeep,
    outcome: outcomeFilter !== "all" ? outcomeFilter : null,
  });
  const outcomeMut = useRepairOutcome();
  const deepDiagnostic = useDeepDiagnostic();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = Math.floor(offset / LIMIT) + 1;
  const totalPages = Math.ceil(total / LIMIT);

  const handleFeedbackSubmit = async () => {
    if (!feedbackItem) return;
    try {
      await outcomeMut.mutateAsync({
        id: feedbackItem.id,
        payload: { outcome: feedbackOutcome, outcome_notes: feedbackNotes || null },
      });
      toast.success("Feedback enregistré !");
      setFeedbackItem(null);
      setFeedbackNotes("");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleView = async (item: RepairHistoryItem) => {
    if (!item.used_deep) return;
    setViewLoading(true);
    try {
      const result = await deepDiagnostic.mutateAsync({
        symptom_id: item.symptom_id,
        model_id: item.model_id,
        custom_name: item.custom_name,
        context: null,
      });
      setViewResult(result);
    } catch {
      toast.error("Impossible de charger le diagnostic");
    } finally {
      setViewLoading(false);
    }
  };

  const handlePdf = async (item: RepairHistoryItem) => {
    if (!item.used_deep) return;
    setViewLoading(true);
    try {
      const result = await deepDiagnostic.mutateAsync({
        symptom_id: item.symptom_id,
        model_id: item.model_id,
        custom_name: item.custom_name,
        context: null,
      });
      generateDiagnosticPdf(result);
      toast.success("PDF généré !");
    } catch {
      toast.error("Impossible de générer le PDF");
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <h2 className="text-lg font-semibold">Historique des diagnostics</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setOffset(0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="deep">IA uniquement</SelectItem>
            <SelectItem value="guide">Guide uniquement</SelectItem>
          </SelectContent>
        </Select>

        <Select value={outcomeFilter} onValueChange={(v) => { setOutcomeFilter(v); setOffset(0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Résultat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="repaired">Réparé</SelectItem>
            <SelectItem value="not_repaired">Non réparé</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="abandoned">Abandonné</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucun diagnostic dans l'historique.
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Composant</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Symptôme</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Résultat</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {item.model_name || item.custom_name || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[item.symptom_category] ?? item.symptom_category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{item.symptom_title}</TableCell>
                  <TableCell>
                    <Badge className={item.used_deep ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-muted text-muted-foreground"}>
                      {item.used_deep ? "IA" : "Guide"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.credits_spent > 0 ? `${item.credits_spent} cr` : "—"}
                  </TableCell>
                  <TableCell>
                    {item.outcome ? (
                      <Badge className={`text-xs ${OUTCOME_CONFIG[item.outcome]?.className ?? ""}`}>
                        {OUTCOME_CONFIG[item.outcome]?.label ?? item.outcome}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {item.used_deep && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(item)} title="Voir">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePdf(item)} title="PDF">
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setFeedbackItem(item);
                          setFeedbackOutcome(item.outcome ?? "repaired");
                          setFeedbackNotes(item.outcome_notes ?? "");
                        }}
                        title="Feedback"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{total} résultat{total > 1 ? "s" : ""}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setOffset(offset - LIMIT)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">{page}/{totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setOffset(offset + LIMIT)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Feedback Dialog */}
      <Dialog open={!!feedbackItem} onOpenChange={(o) => !o && setFeedbackItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback — {feedbackItem?.model_name || feedbackItem?.custom_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Résultat</p>
              <Select value={feedbackOutcome} onValueChange={(v) => setFeedbackOutcome(v as RepairOutcome)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repaired">Réparé avec succès</SelectItem>
                  <SelectItem value="not_repaired">Non réparé</SelectItem>
                  <SelectItem value="abandoned">Abandonné</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Notes (optionnel)</p>
              <Textarea
                placeholder="Qu'est-ce qui a marché ou pas ?"
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackItem(null)}>Annuler</Button>
            <Button onClick={handleFeedbackSubmit} disabled={outcomeMut.isPending}>
              {outcomeMut.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Result Dialog */}
      <Dialog open={!!viewResult} onOpenChange={(o) => !o && setViewResult(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Diagnostic — {viewResult?.model_name}</DialogTitle>
          </DialogHeader>
          {viewResult && <DiagnosticResult data={viewResult} />}
        </DialogContent>
      </Dialog>

      {/* Loading overlay for view/pdf */}
      {viewLoading && !viewResult && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Chargement...</p>
          </div>
        </div>
      )}
    </div>
  );
}
