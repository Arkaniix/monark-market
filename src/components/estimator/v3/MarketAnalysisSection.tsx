// Section 2 — Analyse marché + Négociation (Complete+)
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TrendingUp, TrendingDown, Minus, BarChart3, Droplets, Activity, Lightbulb, Target } from "lucide-react";
import type { V3EstimationResponse } from "@/types/estimatorV3";
import PercentileBar from "./PercentileBar";

interface MarketAnalysisSectionProps {
  result: V3EstimationResponse;
}

function MomentumIcon({ momentum }: { momentum: string }) {
  if (momentum === "rising") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (momentum === "falling") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function LevelBadge({ level, label }: { level: string; label: string }) {
  const colors: Record<string, string> = {
    high: "text-green-600 bg-green-500/10 border-green-500/30",
    medium: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30",
    moderate: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30",
    low: "text-red-600 bg-red-500/10 border-red-500/30",
  };
  const icons: Record<string, string> = { high: "🟢", medium: "🟡", moderate: "🟡", low: "🔴" };
  return (
    <Badge variant="outline" className={`gap-1 ${colors[level] || ""}`}>
      {icons[level] || "⚪"} {label}
    </Badge>
  );
}

export default function MarketAnalysisSection({ result }: MarketAnalysisSectionProps) {
  const { market, trends, liquidity, volatility, score, negotiation, input } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-6"
    >
      {/* Percentile distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Positionnement prix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PercentileBar
            distribution={market.distribution}
            userPrice={input.price}
            verdictColor={score.verdict_color}
          />
          <p className="text-sm text-muted-foreground">
            Percentile : <span className="font-medium text-foreground">{market.percentile_label}</span>
          </p>

          {market.condition_adjusted && (
            <p className="text-sm text-muted-foreground">
              Médiane pour « {market.condition_adjusted.condition_label} » :{" "}
              <span className="font-medium text-foreground">{market.condition_adjusted.median_price}€</span>
              {" "}(votre prix est{" "}
              <span className={market.condition_adjusted.price_vs_condition_pct <= 0 ? "text-green-600" : "text-red-600"}>
                {market.condition_adjusted.price_vs_condition_pct > 0 ? "+" : ""}{market.condition_adjusted.price_vs_condition_pct.toFixed(0)}%
              </span>)
            </p>
          )}

          {market.new_price != null && market.discount_vs_new_pct != null && (
            <p className="text-sm text-muted-foreground">
              Prix neuf : <span className="font-medium text-foreground">{market.new_price}€</span>
              {" "}— décote de{" "}
              <Badge variant="outline" className="text-green-600 border-green-500/50 text-xs">
                -{Math.abs(market.discount_vs_new_pct).toFixed(0)}%
              </Badge>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Trends + Liquidity + Volatility grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Trends */}
        {trends && (
          <Card>
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center gap-2">
                <MomentumIcon momentum={trends.momentum} />
                <span className="text-sm font-medium">Tendance</span>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                {trends.trend_7d_pct != null && <span>7j: {trends.trend_7d_pct > 0 ? "+" : ""}{trends.trend_7d_pct.toFixed(1)}%</span>}
                {trends.trend_30d_pct != null && <span>30j: {trends.trend_30d_pct > 0 ? "+" : ""}{trends.trend_30d_pct.toFixed(1)}%</span>}
              </div>
              <p className="text-xs text-muted-foreground">{trends.interpretation}</p>
            </CardContent>
          </Card>
        )}

        {/* Liquidity */}
        {liquidity && (
          <Card>
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Liquidité</span>
                <LevelBadge level={liquidity.level} label={liquidity.level_label} />
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{liquidity.sold_30d} ventes/30j</span>
                <span>{liquidity.active_listings} annonces</span>
              </div>
              <p className="text-xs text-muted-foreground">{liquidity.interpretation}</p>
            </CardContent>
          </Card>
        )}

        {/* Volatility */}
        {volatility && (
          <Card>
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Volatilité</span>
                <LevelBadge level={volatility.level} label={volatility.level_label} />
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>±{volatility.sigma.toFixed(0)}€</span>
                <span>IQR: {volatility.iqr.toFixed(0)}€</span>
              </div>
              <p className="text-xs text-muted-foreground">{volatility.interpretation}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Score decomposition (accordion) */}
      <Accordion type="single" collapsible>
        <AccordionItem value="score-details" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Décomposition du score
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-2 text-sm pb-4">
            <div className="flex justify-between">
              <span>Score de base (position prix)</span>
              <span className="font-medium">{score.base_score}</span>
            </div>
            <div className="flex justify-between">
              <span>Tendance</span>
              <span className={`font-medium ${score.modifiers.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                {score.modifiers.trend >= 0 ? "+" : ""}{score.modifiers.trend}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Liquidité</span>
              <span className={`font-medium ${score.modifiers.liquidity >= 0 ? "text-green-600" : "text-red-600"}`}>
                {score.modifiers.liquidity >= 0 ? "+" : ""}{score.modifiers.liquidity}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Décote vs neuf</span>
              <span className={`font-medium ${score.modifiers.value_vs_new >= 0 ? "text-green-600" : "text-red-600"}`}>
                {score.modifiers.value_vs_new >= 0 ? "+" : ""}{score.modifiers.value_vs_new}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Total modifieurs</span>
              <span className="font-medium">{score.modifiers.total_raw} (ajusté: {score.modifiers.total_adjusted})</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Score final</span>
              <span className="font-bold">{score.overall}</span>
            </div>
            <div className="border-t pt-3 mt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                Confiance : {score.confidence.score.toFixed(2)} ({score.confidence.level === "high" ? "Élevée" : score.confidence.level === "medium" ? "Moyenne" : "Faible"})
              </p>
              {score.confidence.factors.map((f, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className={f.impact === "positive" ? "text-green-500" : "text-red-500"}>
                    {f.impact === "positive" ? "✓" : "✗"}
                  </span>
                  {f.label}
                </p>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Negotiation */}
      {negotiation && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              🤝 Négociation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 3 cards */}
            <div className="grid sm:grid-cols-3 gap-3">
              <NegotiationCard
                label="Agressive"
                emoji="🔴"
                price={negotiation.aggressive.price}
                savings={negotiation.aggressive.savings_eur}
                savingsPct={negotiation.aggressive.savings_pct}
                inputPrice={input.price}
              />
              <NegotiationCard
                label="Compromis"
                emoji="🟡"
                price={negotiation.compromise.price}
                savings={negotiation.compromise.savings_eur}
                savingsPct={negotiation.compromise.savings_pct}
                inputPrice={input.price}
              />
              <NegotiationCard
                label="Maximum"
                emoji="🟢"
                price={negotiation.max.price}
                savings={negotiation.max.savings_eur}
                savingsPct={negotiation.max.savings_pct}
                inputPrice={input.price}
              />
            </div>

            {/* Tip */}
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm">{negotiation.tip}</p>
            </div>

            {/* Arguments */}
            {negotiation.arguments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Arguments à utiliser :</p>
                <ul className="space-y-1">
                  {negotiation.arguments.map((arg, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>{arg}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function NegotiationCard({
  label, emoji, price, savings, savingsPct, inputPrice,
}: {
  label: string; emoji: string; price: number; savings: number; savingsPct: number; inputPrice: number;
}) {
  const isAtPrice = Math.abs(savings) < 1;
  return (
    <Card className="text-center">
      <CardContent className="py-4 space-y-1">
        <p className="text-xs text-muted-foreground">{emoji} {label}</p>
        <p className="text-2xl font-bold">{price}€</p>
        {isAtPrice ? (
          <p className="text-xs text-muted-foreground">= prix affiché</p>
        ) : (
          <p className={`text-xs ${savings > 0 ? "text-green-600" : "text-red-600"}`}>
            {savings > 0 ? "-" : "+"}{Math.abs(savings)}€ ({savings > 0 ? "-" : "+"}{Math.abs(savingsPct).toFixed(0)}%)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
