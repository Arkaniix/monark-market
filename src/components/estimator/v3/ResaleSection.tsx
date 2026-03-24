// Section 3 — Revente & Scénarios (Pro)
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Timer, Hourglass } from "lucide-react";
import type { V3EstimationResponse, V3ResalePlatformData, V3Scenario } from "@/types/estimatorV3";

interface ResaleSectionProps {
  result: V3EstimationResponse;
}

/** Normalize platforms from API (object keyed by name) into a renderable array */
function normalizePlatforms(resale: V3EstimationResponse["resale"]): Array<V3ResalePlatformData & { platform: string; platform_label: string }> {
  if (!resale?.platforms) return [];

  if (Array.isArray(resale.platforms)) {
    return (resale.platforms as any[]).map(p => ({
      ...p,
      platform: p.platform ?? "unknown",
      platform_label: p.platform_label ?? p.platform ?? "—",
    }));
  }

  return Object.entries(resale.platforms as Record<string, V3ResalePlatformData>).map(([key, data]) => ({
    ...data,
    platform: key,
    platform_label: key.charAt(0).toUpperCase() + key.slice(1),
  }));
}

function PlatformCard({ platform, isFirst }: { platform: ReturnType<typeof normalizePlatforms>[number]; isFirst: boolean }) {
  const hasFees = (platform.seller_fees_pct ?? 0) > 0;
  const displayMarginEur = hasFees ? (platform.net_margin_eur ?? platform.margin_eur ?? 0) : (platform.margin_eur ?? 0);
  const displayMarginPct = hasFees ? (platform.net_margin_pct ?? platform.margin_pct ?? 0) : (platform.margin_pct ?? 0);
  const marginPositive = displayMarginEur >= 0;

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
            <p className="font-bold">{platform.recommended_price ?? 0}€</p>
          </div>
          {hasFees ? (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Frais vendeur</p>
              <p className="text-sm">~{platform.seller_fees_pct}%</p>
            </div>
          ) : (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Marge</p>
              <p className={`font-bold ${marginPositive ? "text-green-600" : "text-red-600"}`}>
                {marginPositive ? "+" : ""}{displayMarginEur}€ ({marginPositive ? "+" : ""}{displayMarginPct.toFixed(0)}%)
              </p>
            </div>
          )}
          {hasFees && (
            <>
              <div>
                <p className="text-xs text-muted-foreground">Vous recevez</p>
                <p className="font-medium">{platform.seller_net_price ?? "—"}€</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Marge nette</p>
                <p className={`font-bold ${marginPositive ? "text-green-600" : "text-red-600"}`}>
                  {marginPositive ? "+" : ""}{displayMarginEur}€ ({marginPositive ? "+" : ""}{displayMarginPct.toFixed(0)}%)
                </p>
              </div>
            </>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="text-sm">{platform.volume_30d ?? 0} ventes/mois</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Délai · Proba</p>
            <p className="text-sm">~{platform.est_sell_days ?? "?"}j · {platform.sell_probability_30d_pct ?? "?"}%</p>
          </div>
        </div>
        {platform.note && (
          <p className="text-xs text-muted-foreground italic mt-2 border-t pt-2">ℹ️ {platform.note}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ScenarioCard({ scenario, label, icon, isOptimal }: { scenario: V3Scenario; label: string; icon: string; isOptimal: boolean }) {
  const marginPositive = (scenario.margin_eur ?? 0) >= 0;
  const probabilityPct = scenario.probability_pct ?? 0;
  return (
    <Card className={isOptimal ? "border-2 border-primary/50" : ""}>
      <CardContent className="py-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span>{icon}</span>
          <span className="text-sm font-medium">{label}</span>
          {isOptimal && <Badge className="text-[10px]">Recommandé</Badge>}
        </div>
        <p className="text-2xl font-bold">{scenario.sell_price ?? 0}€</p>
        <p className={`text-sm font-medium ${marginPositive ? "text-green-600" : "text-red-600"}`}>
          {marginPositive ? "+" : ""}{scenario.margin_eur ?? 0}€ ({marginPositive ? "+" : ""}{(scenario.margin_pct ?? 0).toFixed(0)}%)
        </p>
        <p className="text-xs text-muted-foreground">~{scenario.est_days ?? "?"}j</p>
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${probabilityPct >= 70 ? "bg-green-500" : probabilityPct >= 40 ? "bg-yellow-500" : "bg-orange-500"}`}
              style={{ width: `${probabilityPct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">{probabilityPct}% de chance</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResaleSection({ result }: ResaleSectionProps) {
  const { resale, scenarios } = result;
  if (!resale && !scenarios) return null;

  const sortedPlatforms = normalizePlatforms(resale)
    .sort((a, b) => (b.is_recommended ? 1 : 0) - (a.is_recommended ? 1 : 0));

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

      {scenarios && (
        <div>
          <h3 className="text-lg font-bold mb-3">📊 Scénarios de revente</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <ScenarioCard scenario={scenarios.quick} label="Vente rapide" icon="⏩" isOptimal={false} />
            <ScenarioCard scenario={scenarios.optimal} label="Optimal" icon="✅" isOptimal={true} />
            <ScenarioCard scenario={scenarios.patient} label="Patient" icon="⏳" isOptimal={false} />
          </div>

          {(scenarios.timing || scenarios.saturation) && (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {scenarios.timing && (
                <Card>
                  <CardContent className="py-3">
                    <p className="text-sm">
                      <span className="font-medium">Timing : </span>
                      <span className={timingColors[scenarios.timing.timing] || ""}>
                        {timingIcons[scenarios.timing.timing] || ""} {scenarios.timing.label}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{scenarios.timing.detail}</p>
                  </CardContent>
                </Card>
              )}
              {scenarios.saturation && (
                <Card>
                  <CardContent className="py-3">
                    <p className="text-sm">
                      <span className="font-medium">Saturation : </span>
                      <span>{satIcons[scenarios.saturation.level] || ""} {scenarios.saturation.label}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{scenarios.saturation.detail}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
