import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { EstimationResultUI } from "@/hooks/useEstimator";

interface ExportCSVButtonProps {
  result: EstimationResultUI;
  platform?: string;
}

export default function ExportCSVButton({ result, platform }: ExportCSVButtonProps) {
  const { toast } = useToast();

  const handleExport = () => {
    // Build CSV content
    const headers = [
      "Modèle",
      "Catégorie",
      "État",
      "Plateforme",
      "Prix annonce (€)",
      "Prix achat recommandé (€)",
      "Prix revente 1 mois (€)",
      "Prix revente 3 mois (€)",
      "Marge (%)",
      "Probabilité revente (%)",
      "Niveau de risque",
      "Recommandation",
      "Prix médian marché (€)",
      "Variation 30j (%)",
      "Volume actif",
      "Indice rareté",
      "Tendance",
      "Date export"
    ];

    const values = [
      result.model_name,
      result.category,
      result.condition,
      platform || result.platform || "-",
      result.buy_price_input.toString(),
      result.buy_price_recommended.toString(),
      result.sell_price_1m.toString(),
      result.sell_price_3m?.toString() || "-",
      result.margin_pct.toString(),
      (result.resell_probability * 100).toFixed(0),
      result.risk_level === "low" ? "Faible" : result.risk_level === "medium" ? "Moyen" : "Élevé",
      result.advice,
      result.market.median_price.toString(),
      result.market.var_30d_pct.toString(),
      result.market.volume_active.toString(),
      result.market.rarity_index.toString(),
      result.market.trend === "up" ? "Hausse" : result.market.trend === "down" ? "Baisse" : "Stable",
      new Date().toLocaleDateString("fr-FR")
    ];

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      values.map(escapeCSV).join(",")
    ].join("\n");

    // Create and download file
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `estimation-${result.model_name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "Le fichier CSV a été téléchargé"
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Exporter CSV
    </Button>
  );
}
