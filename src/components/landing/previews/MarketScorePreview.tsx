import { Badge } from "@/components/ui/badge";
import { Gauge, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreExample {
  title: string;
  price: string;
  score: number;
  trend: "up" | "down" | "stable";
  trendLabel: string;
}

const scoreExamples: ScoreExample[] = [
  { title: "RTX 4070 Super", price: "520 €", score: 8.7, trend: "down", trendLabel: "-10% vs marché" },
  { title: "i7-13700K", price: "210 €", score: 6.1, trend: "stable", trendLabel: "Prix médian" },
  { title: "RX 7600", price: "245 €", score: 3.2, trend: "up", trendLabel: "+12% vs marché" },
  { title: "RTX 3060 12Go", price: "175 €", score: 7.8, trend: "down", trendLabel: "-8% vs marché" },
];

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? "bg-success" : score >= 4 ? "bg-warning" : "bg-destructive";
  const textColor = score >= 7 ? "text-success" : score >= 4 ? "text-warning" : "text-destructive";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold tabular-nums ${textColor}`}>{score.toFixed(1)}</span>
    </div>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-success" />;
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

export function MarketScorePreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Market Score</span>
          <Badge variant="outline" className="text-[9px] text-muted-foreground border-dashed">Exemple fictif</Badge>
        </div>
        <Badge variant="outline" className="text-xs">Score 0–10</Badge>
      </div>

      <div className="bg-background/50 rounded-lg p-3 border">
        <p className="text-xs text-muted-foreground mb-3">
          Chaque annonce reçoit un score instantané basé sur le prix, la tendance et la demande.
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-success">7–10</div>
            <div className="text-[10px] text-muted-foreground">Bonne affaire</div>
          </div>
          <div>
            <div className="text-lg font-bold text-warning">4–6</div>
            <div className="text-[10px] text-muted-foreground">Prix correct</div>
          </div>
          <div>
            <div className="text-lg font-bold text-destructive">0–3</div>
            <div className="text-[10px] text-muted-foreground">Au-dessus</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {scoreExamples.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-background/50 rounded-lg p-2.5 border"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{item.title}</div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <TrendIcon trend={item.trend} />
                {item.trendLabel}
              </div>
            </div>
            <div className="text-sm font-semibold text-primary flex-shrink-0">{item.price}</div>
            <div className="w-24 flex-shrink-0">
              <ScoreBar score={item.score} />
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Score gratuit sur le plan Free • Détails complets dès Starter
      </div>
    </div>
  );
}
