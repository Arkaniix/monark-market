import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, LayoutGrid, TrendingUp, TrendingDown, Cpu, BarChart3, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ModelCard {
  name: string;
  brand: string;
  median: string;
  trend: string;
  trendDown: boolean;
  fairValue: string;
  liquidity: number;
  adsCount: number;
  vram: string;
  tdp: string;
  releaseDate: string;
  var30d: string;
  var90d: string;
}

const models: ModelCard[] = [
  {
    name: "RTX 4070 Super",
    brand: "NVIDIA",
    median: "510 €",
    trend: "-2%",
    trendDown: true,
    fairValue: "495 €",
    liquidity: 82,
    adsCount: 47,
    vram: "12 Go GDDR6X",
    tdp: "220W",
    releaseDate: "Jan 2024",
    var30d: "-3.2%",
    var90d: "-8.1%",
  },
  {
    name: "RX 7800 XT",
    brand: "AMD",
    median: "440 €",
    trend: "+1%",
    trendDown: false,
    fairValue: "430 €",
    liquidity: 68,
    adsCount: 31,
    vram: "16 Go GDDR6",
    tdp: "263W",
    releaseDate: "Sep 2023",
    var30d: "+1.5%",
    var90d: "-4.2%",
  },
  {
    name: "RTX 4060 Ti",
    brand: "NVIDIA",
    median: "330 €",
    trend: "-4%",
    trendDown: true,
    fairValue: "310 €",
    liquidity: 91,
    adsCount: 63,
    vram: "8 Go GDDR6",
    tdp: "160W",
    releaseDate: "Mai 2023",
    var30d: "-4.1%",
    var90d: "-12.5%",
  },
  {
    name: "Arc A770",
    brand: "Intel",
    median: "260 €",
    trend: "+3%",
    trendDown: false,
    fairValue: "245 €",
    liquidity: 34,
    adsCount: 12,
    vram: "16 Go GDDR6",
    tdp: "225W",
    releaseDate: "Oct 2022",
    var30d: "+2.8%",
    var90d: "+5.0%",
  },
];

function LiquidityBar({ value }: { value: number }) {
  const color = value >= 75 ? "bg-accent" : value >= 50 ? "bg-warning" : "bg-destructive";
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden w-full">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function CataloguePreview() {
  const [selected, setSelected] = useState<ModelCard | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-background/50 border rounded-lg px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
            <Search className="h-3 w-3" /> Rechercher un modèle…
          </div>
          <div className="bg-background/50 border rounded-lg px-2.5 py-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {models.map((card, i) => (
            <button
              key={i}
              onClick={() => setSelected(card)}
              className="bg-background/50 border rounded-lg p-2.5 space-y-1.5 text-left hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <div className="h-12 bg-muted/50 rounded flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary/40 transition-colors" />
              </div>
              <div className="text-xs font-medium truncate">{card.name}</div>
              <div className="text-[10px] text-muted-foreground">{card.brand}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{card.median}</span>
                <span className={`text-[10px] font-medium ${card.trendDown ? "text-destructive" : "text-accent"}`}>{card.trend}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected?.name}
              <Badge className="bg-primary/10 text-primary border-0 text-xs">Élite</Badge>
            </DialogTitle>
            <DialogDescription>{selected?.brand} — Fiche modèle complète</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground">Médiane</div>
                  <div className="font-bold text-sm">{selected.median}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground">Juste prix</div>
                  <div className="font-bold text-sm text-accent">{selected.fairValue}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground">Annonces</div>
                  <div className="font-bold text-sm">{selected.adsCount}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Liquidité du marché</div>
                <div className="flex items-center gap-2">
                  <LiquidityBar value={selected.liquidity} />
                  <span className="text-xs font-semibold">{selected.liquidity}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Tendances</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <div className="text-[10px] text-muted-foreground">7 jours</div>
                    <div className={`font-semibold text-xs ${selected.trendDown ? "text-destructive" : "text-accent"}`}>{selected.trend}</div>
                  </div>
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <div className="text-[10px] text-muted-foreground">30 jours</div>
                    <div className={`font-semibold text-xs ${selected.var30d.startsWith("-") ? "text-destructive" : "text-accent"}`}>{selected.var30d}</div>
                  </div>
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <div className="text-[10px] text-muted-foreground">90 jours</div>
                    <div className={`font-semibold text-xs ${selected.var90d.startsWith("-") ? "text-destructive" : "text-accent"}`}>{selected.var90d}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Spécifications</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    <span>{selected.vram}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    <span>{selected.tdp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Sortie : {selected.releaseDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
