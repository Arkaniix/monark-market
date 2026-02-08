import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Target, Gauge, ShieldCheck, BarChart3, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function EstimatorPreview() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-full text-left space-y-4 group cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm font-medium group-hover:text-primary transition-colors">Estimation</span>
          </div>
          <Badge variant="outline" className="text-xs">RTX 4070</Badge>
        </div>
        <div className="bg-background/50 rounded-lg p-4 border group-hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Score d'opportunité</span>
            <span className="text-2xl font-bold text-primary">78/100</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-[78%] bg-gradient-to-r from-primary to-accent rounded-full" />
          </div>
        </div>
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <ArrowRight className="h-4 w-4 text-accent" />
            <span className="font-medium text-accent text-sm">Recommandation : Acheter</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Prix en dessous de la médiane, demande stable, bon potentiel de revente.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-background/50 rounded p-2 text-center">
            <div className="text-xs text-muted-foreground">Médiane</div>
            <div className="font-semibold text-sm">485 €</div>
          </div>
          <div className="bg-background/50 rounded p-2 text-center">
            <div className="text-xs text-muted-foreground">Tendance</div>
            <div className="font-semibold text-sm text-destructive">-3%</div>
          </div>
          <div className="bg-background/50 rounded p-2 text-center">
            <div className="text-xs text-muted-foreground">Liquidité</div>
            <div className="font-semibold text-sm text-accent">Élevée</div>
          </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Estimation — RTX 4070
              <Badge className="bg-primary/10 text-primary border-0 text-xs">Élite</Badge>
            </DialogTitle>
            <DialogDescription>Analyse complète avec tous les indicateurs</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Score d'opportunité</span>
                <span className="text-2xl font-bold text-primary">78/100</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                <div className="h-full w-[78%] bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Prix", value: "22/25", icon: DollarSign },
                  { label: "Demande", value: "19/25", icon: TrendingUp },
                  { label: "Fiabilité", value: "20/25", icon: ShieldCheck },
                  { label: "Potentiel", value: "17/25", icon: Target },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <item.icon className="h-4 w-4 mx-auto text-primary" />
                    <div className="text-[10px] text-muted-foreground">{item.label}</div>
                    <div className="text-xs font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <ArrowRight className="h-4 w-4 text-accent" />
                <span className="font-medium text-accent text-sm">Décision : Acheter</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Le prix est 8% en dessous de la médiane avec une demande soutenue. Fenêtre d'achat favorable.
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Risque principal :</span> La tendance baissière pourrait continuer (-3% sur 7j).
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground">Plafond d'achat</div>
                <div className="font-bold text-sm text-primary">490 €</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground">Prix cible</div>
                <div className="font-bold text-sm text-accent">450 €</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground">Plancher</div>
                <div className="font-bold text-sm text-warning">420 €</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Scénarios de revente</div>
              <div className="space-y-1.5">
                {[
                  { label: "Revente rapide (< 7j)", price: "500 €", margin: "+50 €", color: "text-accent" },
                  { label: "Revente standard (7-30j)", price: "520 €", margin: "+70 €", color: "text-primary" },
                  { label: "Revente patiente (30-90j)", price: "480 €", margin: "+30 €", color: "text-warning" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/30 rounded p-2 text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.price}</span>
                      <span className={`font-semibold text-xs ${s.color}`}>{s.margin}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "Médiane", value: "485 €" },
                { label: "Tendance 7j", value: "-3%" },
                { label: "Liquidité", value: "Élevée" },
                { label: "Confiance", value: "92%" },
              ].map((item, i) => (
                <div key={i} className="bg-muted/50 rounded p-2">
                  <div className="text-[10px] text-muted-foreground">{item.label}</div>
                  <div className="font-semibold text-xs">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
