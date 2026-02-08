import { Badge } from "@/components/ui/badge";
import { TrendingUp, Eye, MapPin, Zap } from "lucide-react";

export function AlertesPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Alertes actives</span>
          <Badge variant="outline" className="text-[9px] text-muted-foreground border-dashed">Exemple fictif</Badge>
        </div>
        <Badge className="bg-primary/10 text-primary border-0 text-xs">3 alertes</Badge>
      </div>
      <div className="space-y-2.5">
        {[
          { type: "Prix", model: "RTX 4070", condition: "< 450 €", icon: TrendingUp, active: true },
          { type: "Nouveau listing", model: "RX 7900 XTX", condition: "Toute annonce", icon: Eye, active: true },
          { type: "Localisation", model: "RTX 3080", condition: "Île-de-France", icon: MapPin, active: false },
        ].map((alert, i) => (
          <div key={i} className={`flex items-center gap-3 rounded-lg p-3 border ${alert.active ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border"}`}>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.active ? "bg-primary/10" : "bg-muted"}`}>
              <alert.icon className={`h-4 w-4 ${alert.active ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{alert.model}</div>
              <div className="text-xs text-muted-foreground">{alert.type} • {alert.condition}</div>
            </div>
            <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${alert.active ? "bg-accent" : "bg-muted-foreground/30"}`} />
          </div>
        ))}
      </div>
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-accent">Nouvelle alerte !</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">RTX 4070 à 420 € — en dessous de votre seuil.</p>
      </div>
    </div>
  );
}
