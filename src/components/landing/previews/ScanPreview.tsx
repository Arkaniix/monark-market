import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, TrendingDown, MapPin, Star, ShieldCheck, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ScannedItem {
  title: string;
  price: string;
  time: string;
  condition: string;
  location: string;
  score: number;
  platform: string;
  priceHistory: string;
  seller: string;
  shipping: string;
}

const scannedItems: ScannedItem[] = [
  {
    title: "RTX 4070 Super",
    price: "520 €",
    time: "il y a 2 min",
    condition: "Très bon état",
    location: "Paris (75)",
    score: 87,
    platform: "Leboncoin",
    priceHistory: "-15 € en 3 jours",
    seller: "Particulier • inscrit depuis 2021",
    shipping: "Mondial Relay, Colissimo",
  },
  {
    title: "RTX 4060 Ti",
    price: "340 €",
    time: "il y a 5 min",
    condition: "Comme neuf",
    location: "Lyon (69)",
    score: 92,
    platform: "Leboncoin",
    priceHistory: "Stable depuis 7 jours",
    seller: "Particulier • inscrit depuis 2019",
    shipping: "Remise en main propre",
  },
  {
    title: "RX 7800 XT",
    price: "430 €",
    time: "il y a 8 min",
    condition: "Bon état",
    location: "Marseille (13)",
    score: 74,
    platform: "eBay",
    priceHistory: "+10 € en 5 jours",
    seller: "Pro • 98.5% avis positifs",
    shipping: "Colissimo, Chronopost",
  },
];

function ScoreColor({ score }: { score: number }) {
  if (score >= 85) return <span className="text-accent font-bold">{score}/100</span>;
  if (score >= 70) return <span className="text-warning font-bold">{score}/100</span>;
  return <span className="text-destructive font-bold">{score}/100</span>;
}

export function ScanPreview() {
  const [selected, setSelected] = useState<ScannedItem | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium">Scan en cours…</span>
            <Badge variant="outline" className="text-[9px] text-muted-foreground border-dashed">Exemple fictif</Badge>
          </div>
          <Badge variant="outline" className="text-xs">leboncoin</Badge>
        </div>
        <div className="bg-background/50 rounded-lg p-3 border space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Pages scannées</span>
            <span className="text-sm font-semibold">24 / 30</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-[80%] bg-gradient-to-r from-primary to-accent rounded-full transition-all" />
          </div>
        </div>
        <div className="space-y-2">
          {scannedItems.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelected(item)}
              className="w-full flex items-center justify-between bg-background/50 rounded-lg p-2.5 border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer text-left group"
            >
              <div>
                <div className="text-sm font-medium group-hover:text-primary transition-colors">{item.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {item.time}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">{item.price}</span>
                <Eye className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
        <div className="text-center text-xs text-muted-foreground">
          156 annonces récupérées • 3 nouvelles bonnes affaires
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.title}
              <Badge className="bg-primary/10 text-primary border-0 text-xs">Élite</Badge>
            </DialogTitle>
            <DialogDescription>Données complètes récupérées par le scanner</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="text-xs text-muted-foreground">Prix</div>
                  <div className="text-lg font-bold text-primary">{selected.price}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="text-xs text-muted-foreground">Score d'opportunité</div>
                  <div className="text-lg"><ScoreColor score={selected.score} /></div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <ShieldCheck className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">État :</span>
                  <span className="font-medium">{selected.condition}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">Localisation :</span>
                  <span className="font-medium">{selected.location}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <TrendingDown className="h-4 w-4 text-warning flex-shrink-0" />
                  <span className="text-muted-foreground">Historique prix :</span>
                  <span className="font-medium">{selected.priceHistory}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Livraison :</span>
                  <span className="font-medium">{selected.shipping}</span>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                <div className="text-sm font-medium text-accent mb-1">Analyse Élite</div>
                <p className="text-xs text-muted-foreground">
                  Prix inférieur de 8% à la médiane du marché. Vendeur fiable avec historique cohérent. Bonne opportunité d'achat avec potentiel de revente estimé à +60 €.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
