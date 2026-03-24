// Section 3 — Revente & Scénarios (Pro)
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Timer, Hourglass } from "lucide-react";
import type { V3EstimationResponse, V3ResalePlatform, V3Scenario } from "@/types/estimatorV3";

interface ResaleSectionProps {
  result: V3EstimationResponse;
}

function PlatformCard({ platform, isFirst }: { platform: V3ResalePlatform; isFirst: boolean }) {
  const marginPositive = platform.margin_eur >= 0;
  return (
    <Card className={isFirst ? "border-2 border-primary/50" : ""}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {platform.is_recommended && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
            <span className="font-medium">{platform.platform_label}</span>
            {platform.is_recommended && (
              <Badge variant="outline" className="text-[10px] text-primary border-primary/50">recommandé</Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Prix conseillé</p>
            <p className="font-bold">{platform.recommended_price}€</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Marge</p>
            <p className={`font-bold ${marginPositive ? "text-green-600" : "text-red-600"}`}>
              {marginPositive ? "+" : ""}{platform.margin_eur}€ ({marginPositive ? "+" : ""}{platform.margin_pct.toFixed(0)}%)
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="text-sm">{platform.volume_30d} ventes/mois</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Délai · Proba</p>
            <p className="text-sm">~{platform.est_sell_days}j · {platform.sell_probability_30d_pct}%</p>
          </div>
        </div>
        {platform.note && (
          <p className="text-xs text-muted-foreground italic mt-2 border-t pt-2">ℹ️ {platform.note}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ScenarioCard({ scenario, isOptimal }: { scenario: V3Scenario; isOptimal: boolean }) {
  const marginPositive = scenario.margin_eur >= 0;
  const icons: Record<string, typeof Clock> = { quick: Timer, optimal: Clock, patient: Hourglass };
  const Icon = icons[scenario.id] || Clock;
  return (
    <Card className={isOptimal ? "border-2 border-primary/50" : ""}>
      <CardContent className="py-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{scenario.label}</span>
          {isOptimal && <Badge className="text-[10px]">Recommandé</Badge>}
        </div>
        <p className="text-2xl font-bold">{scenario.sell_price}€</p>
        <p className={`text-sm font-medium ${marginPositive ? "text-green-600" : "text-red-600"}`}>
          {marginPositive ? "+" : ""}{scenario.margin_eur}€ ({marginPositive ? "+" : ""}{scenario.margin_pct.toFixed(0)}%)
        </p>
        <p className="text-xs text-muted-foreground">~{scenario.est_days}j</p>
        {/* Probability bar */}
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${scenario.probability_pct >= 70 ? "bg-green-500" : scenario.probability_pct >= 40 ? "bg-yellow-500" : "bg-orange-500"}`}
              style={{ width: `${scenario.probability_pct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">{scenario.probability_pct}% de chance</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResaleSection({ result }: ResaleSectionProps) {
  const { resale, scenarios } = result;
  if (!resale && !scenarios) return null;

  // Sort platforms: recommended first
  const sortedPlatforms = resale
    ? [...resale.platforms].sort((a, b) => (b.is_recommended ? 1 : 0) - (a.is_recommended ? 1 : 0))
    : [];

  const timingColors: Record<string, string> = {
    good: "text-green-600", neutral: "text-muted-foreground", cautious: "text-orange-600", bad: "text-red-600",
  };
  const timingIcons: Record<string, string> = {
    good: "🟢", neutral: "⚪", cautious: "🟠", bad: "🔴",
  };
  const satIcons: Record<string, string> = {
    low: "🟢", moderate: "⚖️", high: "🔴",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Resale platforms */}
      {sortedPlatforms.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            📦 Où revendre ?
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPlatforms.map((p, i) => (
              <PlatformCard key={p.platform} platform={p} isFirst={i === 0} />
            ))}
          </div>
        </div>
      )}

      {/* Scenarios */}
      {scenarios && (
        <div>
          <h3 className="text-lg font-bold mb-3">📊 Scénarios de revente</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <ScenarioCard scenario={scenarios.quick} isOptimal={false} />
            <ScenarioCard scenario={scenarios.optimal} isOptimal={true} />
            <ScenarioCard scenario={scenarios.patient} isOptimal={false} />
          </div>

          {/* Market context */}
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardContent className="py-3">
                <p className="text-sm">
                  <span className="font-medium">Timing : </span>
                  <span className={timingColors[scenarios.timing.timing] || ""}>
                    {timingIcons[scenarios.timing.timing]} {scenarios.timing.label}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{scenarios.timing.detail}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3">
                <p className="text-sm">
                  <span className="font-medium">Saturation : </span>
                  <span>{satIcons[scenarios.saturation.level]} {scenarios.saturation.label}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{scenarios.saturation.detail}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
}
