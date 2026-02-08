import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, MapPin, Clock, TrendingDown, ShieldCheck, Truck, BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Ad {
  title: string;
  price: string;
  platform: string;
  score: number;
  location: string;
  condition: string;
  publishedAt: string;
  priceVsMedian: string;
  seller: string;
  shipping: string;
  description: string;
  recommendation: string;
}

const ads: Ad[] = [
  {
    title: "RTX 4070 Ti Super NEUVE",
    price: "680 €",
    platform: "Leboncoin",
    score: 72,
    location: "Paris",
    condition: "Neuf sous blister",
    publishedAt: "il y a 1h",
    priceVsMedian: "+2% au-dessus de la médiane",
    seller: "Particulier • 12 ventes",
    shipping: "Colissimo, Mondial Relay",
    description: "Carte graphique neuve, jamais ouverte. Facture disponible.",
    recommendation: "Prix correct pour du neuf. Négocier à 650 € serait une bonne affaire.",
  },
  {
    title: "RX 7900 XTX — Comme neuve",
    price: "590 €",
    platform: "eBay",
    score: 85,
    location: "Lyon",
    condition: "Comme neuf",
    publishedAt: "il y a 3h",
    priceVsMedian: "-7% sous la médiane",
    seller: "Pro • 99.1% positifs",
    shipping: "Chronopost Express",
    description: "Utilisée 6 mois pour du gaming. Aucun minage. Boîte d'origine.",
    recommendation: "Excellente opportunité. Prix bien en dessous du marché, vendeur fiable.",
  },
  {
    title: "RTX 3080 10Go FE",
    price: "290 €",
    platform: "Leboncoin",
    score: 91,
    location: "Marseille",
    condition: "Bon état",
    publishedAt: "il y a 30 min",
    priceVsMedian: "-12% sous la médiane",
    seller: "Particulier • inscrit depuis 2020",
    shipping: "Remise en main propre",
    description: "RTX 3080 Founders Edition. Fonctionne parfaitement, pâte thermique refaite.",
    recommendation: "Top affaire ! Prix très bas, forte demande. Acheter rapidement avant que ça parte.",
  },
];

function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 85 ? "text-accent" : score >= 70 ? "text-warning" : "text-destructive";
  return <span className={`font-bold ${variant}`}>{score}/100</span>;
}

export function AnnoncesPreview() {
  const [selected, setSelected] = useState<Ad | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Annonces récentes</span>
          <div className="flex gap-1">
            {["Tous", "GPU", "CPU"].map((f) => (
              <Badge key={f} variant={f === "GPU" ? "default" : "outline"} className="text-[10px] cursor-pointer">{f}</Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {ads.map((ad, i) => (
            <button
              key={i}
              onClick={() => setSelected(ad)}
              className="w-full flex items-start gap-3 bg-background/50 border rounded-lg p-3 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer text-left group"
            >
              <div className="h-11 w-11 bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/40 transition-colors" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{ad.title}</div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{ad.platform}</span>
                  <span>•</span>
                  <span>{ad.location}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-primary">{ad.price}</div>
                <div className="flex items-center gap-1 justify-end">
                  <Star className="h-3 w-3 text-warning" />
                  <span className="text-[10px] font-medium">{ad.score}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.title}
              <Badge className="bg-primary/10 text-primary border-0 text-xs">Élite</Badge>
            </DialogTitle>
            <DialogDescription>{selected?.platform} • {selected?.location}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="text-xs text-muted-foreground">Prix</div>
                  <div className="text-lg font-bold text-primary">{selected.price}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="text-xs text-muted-foreground">Score</div>
                  <div className="text-lg"><ScoreBadge score={selected.score} /></div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground italic">
                "{selected.description}"
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <ShieldCheck className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">État :</span>
                  <span className="font-medium">{selected.condition}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">Publié :</span>
                  <span className="font-medium">{selected.publishedAt}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <BarChart3 className="h-4 w-4 text-warning flex-shrink-0" />
                  <span className="text-muted-foreground">vs Médiane :</span>
                  <span className="font-medium">{selected.priceVsMedian}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Star className="h-4 w-4 text-warning flex-shrink-0" />
                  <span className="text-muted-foreground">Vendeur :</span>
                  <span className="font-medium">{selected.seller}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Livraison :</span>
                  <span className="font-medium">{selected.shipping}</span>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                <div className="text-sm font-medium text-accent mb-1">Recommandation Élite</div>
                <p className="text-xs text-muted-foreground">{selected.recommendation}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
