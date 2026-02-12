// Simulateur What-If (Elite only)
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Crown, Calculator, TrendingUp, TrendingDown, Minus, CheckCircle2, Clock, Ban, MessageCircle } from "lucide-react";
import type { WhatIfData, ActionablePrices, DecisionAction } from "@/types/estimator";
import { getDecisionLabelFr } from "@/types/estimator";
import type { PlanType } from "@/hooks/useEntitlements";
import LockedFeatureOverlay, { PlanBadge } from "@/components/LockedFeatureOverlay";

interface WhatIfSimulatorProps {
  whatIf: WhatIfData;
  adPrice: number;
  actionablePrices: ActionablePrices;
  plan: PlanType;
}

function calculateWhatIf(
  buyPrice: number, 
  sellTarget: number, 
  sellFloor: number,
  buyCeiling: number
): { marginEuro: number; marginPct: number; decision: DecisionAction; verdict: string } {
  const marginEuro = sellTarget - buyPrice;
  const marginPct = Math.round((marginEuro / buyPrice) * 100);
  
  let decision: DecisionAction;
  let verdict: string;
  
  if (buyPrice <= buyCeiling * 0.9) {
    decision = "buy";
    verdict = "Excellente affaire - acheter sans hésiter";
  } else if (buyPrice <= buyCeiling) {
    decision = "buy";
    verdict = "Bon prix - dans la fourchette d'achat";
  } else if (buyPrice <= buyCeiling * 1.1) {
    decision = "negotiate";
    verdict = "Négocier pour rentrer dans la fourchette";
  } else if (buyPrice <= sellFloor) {
    decision = "wait";
    verdict = "Prix trop élevé - attendre une baisse";
  } else {
    decision = "pass";
    verdict = "Aucune rentabilité possible";
  }
  
  return { marginEuro, marginPct, decision, verdict };
}

function getDecisionIcon(action: DecisionAction) {
  switch (action) {
    case "buy": return CheckCircle2;
    case "negotiate": return MessageCircle;
    case "wait": return Clock;
    case "pass": return Ban;
  }
}

function getDecisionColor(action: DecisionAction) {
  switch (action) {
    case "buy": return "text-green-600";
    case "negotiate": return "text-primary";
    case "wait": return "text-amber-600";
    case "pass": return "text-destructive";
  }
}

export default function WhatIfSimulator({ 
  whatIf, 
  adPrice, 
  actionablePrices,
  plan 
}: WhatIfSimulatorProps) {
  const isElite = plan === "pro";
  const [sliderValue, setSliderValue] = useState(adPrice);
  const [inputValue, setInputValue] = useState(adPrice.toString());

  const result = useMemo(() => calculateWhatIf(
    sliderValue,
    actionablePrices.sell_target,
    actionablePrices.sell_floor,
    actionablePrices.buy_ceiling
  ), [sliderValue, actionablePrices]);

  const DecisionIcon = getDecisionIcon(result.decision);
  const decisionColor = getDecisionColor(result.decision);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value[0]);
    setInputValue(value[0].toString());
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= whatIf.slider_min && numValue <= whatIf.slider_max) {
      setSliderValue(numValue);
    }
  };

  const handlePresetClick = (price: number) => {
    setSliderValue(price);
    setInputValue(price.toString());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulateur "Et si..."
            <PlanBadge plan="pro" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LockedFeatureOverlay
            isLocked={!isElite}
            requiredPlan="pro"
            featureName="Simulateur What-If"
          >
            <div className="space-y-6">
              {/* Presets */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Testez différents prix d'achat :</p>
                <div className="flex flex-wrap gap-2">
                  {whatIf.presets.map((preset, i) => (
                    <Button
                      key={i}
                      variant={sliderValue === preset.price ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetClick(preset.price)}
                      className="gap-1"
                    >
                      {preset.relative_pct < 0 ? <TrendingDown className="h-3 w-3" /> : 
                       preset.relative_pct > 0 ? <TrendingUp className="h-3 w-3" /> : 
                       <Minus className="h-3 w-3" />}
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Slider + Input */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Slider
                    value={[sliderValue]}
                    min={whatIf.slider_min}
                    max={whatIf.slider_max}
                    step={5}
                    onValueChange={handleSliderChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{whatIf.slider_min}€</span>
                    <span>{whatIf.slider_max}€</span>
                  </div>
                </div>
                <div className="w-28 relative">
                  <Input
                    type="number"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="text-center pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>

              {/* Result */}
              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center`}>
                    <DecisionIcon className={`h-6 w-6 ${decisionColor}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Si j'achète à <strong>{sliderValue}€</strong></p>
                    <p className={`text-lg font-bold ${decisionColor}`}>
                      {getDecisionLabelFr(result.decision)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Prix d'achat</p>
                    <p className="font-semibold">{sliderValue} €</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revente cible</p>
                    <p className="font-semibold text-primary">{actionablePrices.sell_target} €</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Marge</p>
                    <p className={`font-semibold ${result.marginPct >= 0 ? "text-green-600" : "text-destructive"}`}>
                      {result.marginEuro > 0 ? "+" : ""}{result.marginEuro}€ ({result.marginPct}%)
                    </p>
                  </div>
                </div>

                <p className="text-sm text-center text-muted-foreground">
                  💡 {result.verdict}
                </p>
              </div>

              {/* Reference prices */}
              <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                <span>🟢 Plafond achat : {actionablePrices.buy_ceiling}€</span>
                <span>🟡 Plancher revente : {actionablePrices.sell_floor}€</span>
              </div>
            </div>
          </LockedFeatureOverlay>
        </CardContent>
      </Card>
    </motion.div>
  );
}
