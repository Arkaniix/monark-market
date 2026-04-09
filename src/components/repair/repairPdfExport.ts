import jsPDF from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DeepDiagnosticResponse } from "@/types/repair";
import { CONFIDENCE_CONFIG, DIFFICULTY_CONFIG } from "@/types/repair";

export function generateDiagnosticPdf(data: DeepDiagnosticResponse) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const a = data.deep_analysis;
  if (!a) return;

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const checkPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
    }
  };

  const addTitle = (text: string, size = 14) => {
    checkPage(12);
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin, y);
    y += size * 0.5 + 2;
  };

  const addText = (text: string, size = 10) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, contentW);
    checkPage(lines.length * (size * 0.4 + 1));
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.4 + 1) + 2;
  };

  const addBullet = (text: string) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, contentW - 5);
    checkPage(lines.length * 5);
    doc.text("•", margin, y);
    doc.text(lines, margin + 5, y);
    y += lines.length * 5 + 1;
  };

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Monark — Diagnostic de réparation", margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Généré le ${format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}`, margin, y);
  y += 6;

  doc.text(`Composant : ${data.model_name}`, margin, y);
  y += 5;
  doc.text(`Symptôme : ${data.symptom?.title ?? "—"} (${data.symptom?.category ?? ""})`, margin, y);
  y += 5;

  const confLabel = CONFIDENCE_CONFIG[a.confidence]?.label ?? a.confidence;
  doc.text(`Confiance : ${confLabel}${data.cached ? " | Depuis le cache" : ""}`, margin, y);
  y += 8;

  // Separator
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // Model-specific notes
  if (a.model_specific_notes) {
    addTitle("Notes spécifiques au modèle");
    addText(a.model_specific_notes);
    y += 3;
  }

  // Known issues
  if (a.known_issues?.length) {
    addTitle("Problèmes connus");
    a.known_issues.forEach((issue) => addBullet(issue));
    y += 3;
  }

  // Personalized diagnostic
  if (a.personalized_diagnostic?.length) {
    addTitle("Diagnostic personnalisé");
    a.personalized_diagnostic.forEach((step) => {
      checkPage(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${step.order}. ${step.title}`, margin, y);
      y += 5;
      addText(step.description);
      if (step.expected_result) {
        doc.setFont("helvetica", "italic");
        addText(`→ Résultat attendu : ${step.expected_result}`);
      }
    });
    y += 3;
  }

  // Personalized repair
  if (a.personalized_repair?.length) {
    addTitle("Réparations personnalisées");
    a.personalized_repair.forEach((rep) => {
      checkPage(20);
      const diffLabel = DIFFICULTY_CONFIG[rep.difficulty as keyof typeof DIFFICULTY_CONFIG]?.label ?? rep.difficulty;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${rep.scenario} (${rep.probability_pct ?? 0}% - ${diffLabel})`, margin, y);
      y += 6;

      (rep.steps ?? []).forEach((s, i) => {
        addText(`${i + 1}. ${s}`);
      });

      if (rep.materials?.length) {
        checkPage(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Matériel :", margin + 3, y);
        y += 4;
        rep.materials.forEach((m) => {
          addBullet(`${m.name}${m.spec ? ` (${m.spec})` : ""} — ${(m.est_price_eur ?? 0).toFixed(2)} €`);
        });
      }

      addText(`Coût : ${(rep.estimated_cost_eur ?? 0).toFixed(2)} € | Temps : ${rep.estimated_time_min ?? 0} min`);
      y += 3;
    });
  }

  // ROI
  if (a.roi_estimate) {
    addTitle("ROI estimé");
    const roi = a.roi_estimate;
    addText(`Coût réparation : ${(roi.total_repair_cost_eur ?? 0).toFixed(2)} €`);
    addText(`Valeur réparé : ${(roi.estimated_value_repaired_eur ?? 0).toFixed(2)} €`);
    addText(`ROI : ${(roi.roi_pct ?? 0).toFixed(0)}%`);
    if (roi.recommendation) addText(`Recommandation : ${roi.recommendation}`);
    y += 3;
  }

  // Warnings
  if (a.warnings?.length) {
    addTitle("⚠ Avertissements");
    a.warnings.forEach((w) => addBullet(w));
    y += 3;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("Généré par Monark — monark-market.fr", margin, footerY);
  doc.text(format(new Date(), "dd/MM/yyyy"), pageW - margin - 20, footerY);

  // Save
  const modelSlug = (data.model_name || "composant").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
  const dateStr = format(new Date(), "yyyy-MM-dd");
  doc.save(`monark_diagnostic_${modelSlug}_${dateStr}.pdf`);
}
