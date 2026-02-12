import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Eye, Gauge, TrendingDown, MapPin, ShieldCheck, BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AnalyzedItem {
  title: string;
  price: string;
  platform: string;
  score: number;
  verdict: string;
  marketPrice: string;
  condition: string;
  location: string;
  deviation: string;
  recommendation: string;
}

const analyzedItems: AnalyzedItem[] = [
  {
    title: "RTX 4070 Super",
    price: "520 €",
    platform: "Leboncoin",
    score: 8.7,
    verdict: "Bonne affaire",
    marketPrice: "580 €",
    condition: "Très bon état",
    location: "Paris (75)",
    deviation: "-10% sous le marché",
    recommendation: "Prix inférieur de 10% à la médiane. Vendeur fiable. Bonne opportunité avec potentiel de revente estimé à +60 €.",
  },
  {
    title: "RTX 4060 Ti",
    price: "340 €",
    platform: "Leboncoin",
    score: 9.2,
    verdict: "Excellente affaire",
    marketPrice: "395 €",
    condition: "Comme neuf",
    location: "Lyon (69)",
    deviation: "-14% sous le marché",
    recommendation: "Top affaire ! Prix très compétitif pour l'état annoncé. Forte demande sur ce modèle.",
  },
  {
    title: "RX 7800 XT",
    price: "430 €",
    platform: "eBay",
    score: 5.4,
    verdict: "Prix correct",
    marketPrice: "420 €",
    condition: "Bon état",
    location: "Marseille (13)",
    deviation: "+2% au-dessus",
    recommendation: "Prix légèrement au-dessus du marché. Négocier à 400 € serait une meilleure affaire.",
  },
];

function ScoreDisplay({ score }: { score: number }) {
  const color = score >= 7 ? "text-accent" : score >= 4 ? "text-warning" : "text-destructive";
  return <span className={`font-bold ${color}`}>{score}/10</span>;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const isGood = verdict.includes("Bonne") || verdict.includes("Excellente");
  return (
    <Badge className={isGood ? "bg-success/10 text-success border-success/30 border" : "bg-muted text-muted-foreground"}>
      {verdict}
    </Badge>
  );
}

export function ScanPreview() {
  const [selected, setSelected] = useState<AnalyzedItem | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Overlay Monark Lens</span>
            <Badge variant="outline" className="text-[9px] text-muted-foreground border-dashed">Exemple fictif</Badge>
          </div>
          <Badge variant="outline" className="text-xs">Chrome Extension</Badge>
        </div>
        <div className="bg-background/50 rounded-lg p-3 border space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Annonces analysées aujourd'hui</span>
            <span className="text-sm font-semibold">47 annonces</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">12 bonnes affaires</Badge>
            <Badge variant="outline" className="text-xs">3 alertes déclenchées</Badge>
          </div>
        </div>
        <div className="space-y-2">
          {analyzedItems.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelected(item)}
              className="w-full flex items-center justify-between bg-background/50 rounded-lg p-2.5 border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer text-left group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{item.title}</span>
                  <VerdictBadge verdict={item.verdict} />
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  {item.platform} · {item.location}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-semibold text-primary">{item.price}</div>
                <div className="flex items-center gap-1 justify-end">
                  <Gauge className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-medium"><ScoreDisplay score={item.score} /></span>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="text-center text-xs text-muted-foreground">
          Score gratuit sur toutes les annonces • Verdict détaillé dès Standard
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.title}
              <Badge className="bg-primary/10 text-primary border-0 text-xs">Analyse Lens</Badge>
            </DialogTitle>
            <DialogDescription>{selected?.platform} · {selected?.location}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="text-xs text-muted-foreground">Prix annonce</div>
                  <div className="text-lg font-bold text-primary">{selected.price}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="text-xs text-muted-foreground">Market Score</div>
                  <div className="text-lg"><ScoreDisplay score={selected.score} /></div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <Gauge className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">Verdict :</span>
                  <VerdictBadge verdict={selected.verdict} />
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <BarChart3 className="h-4 w-4 text-warning flex-shrink-0" />
                  <span className="text-muted-foreground">Valeur marché :</span>
                  <span className="font-medium">{selected.marketPrice}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <TrendingDown className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-muted-foreground">Écart :</span>
                  <span className="font-medium">{selected.deviation}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <ShieldCheck className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">État :</span>
                  <span className="font-medium">{selected.condition}</span>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                <div className="text-sm font-medium text-accent mb-1">Analyse Monark Lens</div>
                <p className="text-xs text-muted-foreground">{selected.recommendation}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
