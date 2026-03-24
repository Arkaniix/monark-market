// Section 4 — Simulateur "Et si..." (Pro)
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { V3WhatIf, V3WhatIfPricePoint, V3Verdict } from "@/types/estimatorV3";
import { VERDICT_ICONS } from "@/types/estimatorV3";

interface WhatIfSectionProps {
  whatIf: V3WhatIf;
  inputPrice: number;
}

function getVerdictBg(verdict: V3Verdict) {
  const map: Record<V3Verdict, string> = {
    BUY: "bg-green-500/10 text-green-700 dark:text-green-400",
    NEGOTIATE: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    WAIT: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    AVOID: "bg-red-500/10 text-red-700 dark:text-red-400",
  };
  return map[verdict] || "";
}

export default function WhatIfSection({ whatIf, inputPrice }: WhatIfSectionProps) {
  const [highlightedIdx, setHighlightedIdx] = useState<number | null>(null);
  const pricePoints = whatIf?.price_points ?? [];

  // Preset buttons from price_points with delta_pct != 0, plus the current
  const presetButtons = pricePoints.filter(p =>
    p.delta_pct === -20 || p.delta_pct === -10 || p.delta_pct === 0 || p.delta_pct === 10 || p.delta_pct === 20
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Et si le prix changeait ?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2">
            {presetButtons.map((p, i) => {
              const isActive = highlightedIdx === pricePoints.indexOf(p);
              const isCurrent = p.delta_pct === 0;
              return (
                <Button
                  key={i}
                  variant={isActive || (highlightedIdx === null && isCurrent) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHighlightedIdx(pricePoints.indexOf(p))}
                  className="text-xs"
                >
                  {isCurrent ? `=${p.price}€=` : `${p.delta_pct > 0 ? "+" : ""}${p.delta_pct}%`}
                </Button>
              );
            })}
          </div>

          {/* Table — desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="pb-2 font-medium">Prix</th>
                  <th className="pb-2 font-medium text-center">Score</th>
                  <th className="pb-2 font-medium text-center">Verdict</th>
                  <th className="pb-2 font-medium text-right">Marge à revente</th>
                </tr>
              </thead>
              <tbody>
                {whatIf.price_points.map((p, i) => {
                  const isCurrent = p.delta_pct === 0;
                  const isHighlighted = highlightedIdx === i || (highlightedIdx === null && isCurrent);
                  return (
                    <tr
                      key={i}
                      className={`border-b border-border/50 cursor-pointer transition-colors ${isHighlighted ? "bg-primary/5 font-medium" : "hover:bg-muted/30"}`}
                      onClick={() => setHighlightedIdx(i)}
                    >
                      <td className="py-2.5">
                        {p.price}€ {isCurrent && <span className="text-xs text-muted-foreground ml-1">← actuel</span>}
                      </td>
                      <td className="py-2.5 text-center">{p.score}</td>
                      <td className="py-2.5 text-center">
                        <Badge className={`text-xs gap-1 border ${getVerdictBg(p.verdict)}`}>
                          {VERDICT_ICONS[p.verdict]} {p.verdict_label}
                        </Badge>
                      </td>
                      <td className={`py-2.5 text-right ${p.margin_at_median_pct >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {p.margin_at_median_pct > 0 ? "+" : ""}{p.margin_at_median_pct.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards — mobile */}
          <div className="sm:hidden space-y-2">
            {whatIf.price_points.map((p, i) => {
              const isCurrent = p.delta_pct === 0;
              const isHighlighted = highlightedIdx === i || (highlightedIdx === null && isCurrent);
              return (
                <div
                  key={i}
                  className={`rounded-lg border p-3 cursor-pointer transition-colors ${isHighlighted ? "bg-primary/5 border-primary/30" : ""}`}
                  onClick={() => setHighlightedIdx(i)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{p.price}€</span>
                      {isCurrent && <span className="text-xs text-muted-foreground ml-1">← actuel</span>}
                    </div>
                    <Badge className={`text-xs gap-1 border ${getVerdictBg(p.verdict)}`}>
                      {VERDICT_ICONS[p.verdict]} {p.verdict_label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Score: {p.score}</span>
                    <span className={p.margin_at_median_pct >= 0 ? "text-green-600" : "text-red-600"}>
                      Marge: {p.margin_at_median_pct > 0 ? "+" : ""}{p.margin_at_median_pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reference prices */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Repères :</p>
            <p>Plafond d'achat : <span className="font-medium">{whatIf.reference_prices.buy_ceiling}€</span></p>
            <p>Plancher de revente : <span className="font-medium">{whatIf.reference_prices.sell_floor}€</span></p>
            <p>Achat optimal : <span className="font-medium">{whatIf.reference_prices.optimal_buy}€</span></p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
