import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  DollarSign,
  Info,
  Sparkles,
} from "lucide-react";
import { mockModels } from "@/lib/mockData";

interface EstimationResult {
  fairValue: number;
  confidenceMin: number;
  confidenceMax: number;
  suggestedPrice: number;
  potentialMargin: number;
  marginPercentage: number;
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
}

const conditions = [
  { value: "neuf", label: "Neuf", multiplier: 1.0 },
  { value: "comme-neuf", label: "Comme neuf", multiplier: 0.95 },
  { value: "tres-bon", label: "Très bon état", multiplier: 0.9 },
  { value: "bon", label: "Bon état", multiplier: 0.85 },
  { value: "satisfaisant", label: "Satisfaisant", multiplier: 0.75 },
];

const regions = [
  { value: "idf", label: "Île-de-France", adjustment: 1.05 },
  { value: "ara", label: "Auvergne-Rhône-Alpes", adjustment: 0.98 },
  { value: "paca", label: "PACA", adjustment: 1.02 },
  { value: "occ", label: "Occitanie", adjustment: 0.95 },
  { value: "na", label: "Nouvelle-Aquitaine", adjustment: 0.97 },
  { value: "ge", label: "Grand Est", adjustment: 1.0 },
  { value: "hdf", label: "Hauts-de-France", adjustment: 0.98 },
  { value: "other", label: "Autre région", adjustment: 0.96 },
];

export default function Estimator() {
  const [selectedModel, setSelectedModel] = useState("");
  const [condition, setCondition] = useState("");
  const [region, setRegion] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [result, setResult] = useState<EstimationResult | null>(null);

  const calculateEstimation = () => {
    if (!selectedModel || !condition || !region || !purchasePrice) {
      return;
    }

    const model = mockModels.find((m) => m.id === selectedModel);
    if (!model) return;

    const conditionData = conditions.find((c) => c.value === condition);
    const regionData = regions.find((r) => r.value === region);
    if (!conditionData || !regionData) return;

    // Calculate Fair Value
    const baseFairValue = model.medianPrice;
    const adjustedFairValue = baseFairValue * conditionData.multiplier * regionData.adjustment;
    
    // Confidence interval (±10%)
    const confidenceMin = adjustedFairValue * 0.9;
    const confidenceMax = adjustedFairValue * 1.1;

    // Suggested selling price (Fair Value + small margin)
    const suggestedPrice = Math.round(adjustedFairValue * 1.08);

    // Potential margin
    const purchase = parseFloat(purchasePrice);
    const potentialMargin = suggestedPrice - purchase;
    const marginPercentage = (potentialMargin / purchase) * 100;

    // Risk assessment
    let riskLevel: "low" | "medium" | "high" = "low";
    let recommendation = "";

    if (purchase < confidenceMin) {
      riskLevel = "low";
      recommendation = "Excellente opportunité ! Le prix d'achat est nettement en dessous de la Fair Value. Forte marge potentielle avec risque minimal.";
    } else if (purchase >= confidenceMin && purchase <= adjustedFairValue) {
      riskLevel = "low";
      recommendation = "Bonne affaire. Le prix est dans la fourchette basse, vous devriez pouvoir dégager une marge confortable.";
    } else if (purchase > adjustedFairValue && purchase <= confidenceMax) {
      riskLevel = "medium";
      recommendation = "Prudence recommandée. Le prix d'achat est légèrement au-dessus de la Fair Value. Marge limitée, mais l'opération reste viable.";
    } else {
      riskLevel = "high";
      recommendation = "Risque élevé. Le prix d'achat dépasse largement la Fair Value. Difficile de dégager une marge suffisante. Déconseillé sauf cas particulier.";
    }

    setResult({
      fairValue: Math.round(adjustedFairValue),
      confidenceMin: Math.round(confidenceMin),
      confidenceMax: Math.round(confidenceMax),
      suggestedPrice,
      potentialMargin: Math.round(potentialMargin),
      marginPercentage: Math.round(marginPercentage * 10) / 10,
      riskLevel,
      recommendation,
    });
  };

  const reset = () => {
    setSelectedModel("");
    setCondition("");
    setRegion("");
    setPurchasePrice("");
    setResult(null);
  };

  // Prepare chart data
  const chartData = result
    ? [
        {
          name: "Très bon prix",
          value: result.confidenceMin,
          range: [0, result.confidenceMin],
          color: "hsl(var(--success))",
        },
        {
          name: "Bon prix",
          value: result.fairValue - result.confidenceMin,
          range: [result.confidenceMin, result.fairValue],
          color: "hsl(var(--primary))",
        },
        {
          name: "Prix correct",
          value: result.confidenceMax - result.fairValue,
          range: [result.fairValue, result.confidenceMax],
          color: "hsl(var(--warning))",
        },
        {
          name: "Prix élevé",
          value: result.confidenceMax * 0.15,
          range: [result.confidenceMax, result.confidenceMax * 1.15],
          color: "hsl(var(--destructive))",
        },
      ]
    : [];

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Calculator className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Estimator</h1>
              <p className="text-muted-foreground">
                Estimez le Fair Value et votre marge potentielle
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Informations de l'annonce
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="model">Modèle *</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model" className="bg-background mt-2">
                      <SelectValue placeholder="Sélectionner un modèle..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-[300px]">
                      {mockModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} - {model.medianPrice}€ ({model.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="condition">État *</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger id="condition" className="bg-background mt-2">
                      <SelectValue placeholder="Sélectionner l'état..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {conditions.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="region">Région *</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger id="region" className="bg-background mt-2">
                      <SelectValue placeholder="Sélectionner la région..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {regions.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Prix d'achat envisagé (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Ex: 320"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Le prix auquel vous envisagez d'acheter ce produit
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={calculateEstimation}
                    disabled={!selectedModel || !condition || !region || !purchasePrice}
                    className="flex-1 gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Calculer
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-5 w-5" />
                Comment fonctionne l'estimateur ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Fair Value</h4>
                  <p className="text-muted-foreground">
                    Prix médian du marché ajusté selon l'état du produit et la région. Calculé à
                    partir de centaines d'annonces réelles.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Intervalle de confiance</h4>
                  <p className="text-muted-foreground">
                    Fourchette de prix ±10% autour de la Fair Value. 80% des annonces se situent
                    dans cet intervalle.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Prix conseillé</h4>
                  <p className="text-muted-foreground">
                    Prix de revente suggéré pour maximiser vos chances de vendre rapidement tout en
                    dégageant une marge confortable.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Niveau de risque</h4>
                  <p className="text-muted-foreground">
                    Évaluation du risque basée sur l'écart entre votre prix d'achat et la Fair
                    Value. Plus l'écart est faible, plus le risque est bas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 space-y-6"
            >
              {/* Risk Badge */}
              <div className="flex justify-center">
                <Badge
                  variant={
                    result.riskLevel === "low"
                      ? "default"
                      : result.riskLevel === "medium"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-base px-6 py-2 gap-2"
                >
                  {result.riskLevel === "low" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  Risque{" "}
                  {result.riskLevel === "low"
                    ? "faible"
                    : result.riskLevel === "medium"
                    ? "modéré"
                    : "élevé"}
                </Badge>
              </div>

              {/* Key Metrics */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      Fair Value estimée
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary mb-1">
                      {result.fairValue}€
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Intervalle : {result.confidenceMin}€ - {result.confidenceMax}€
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      Prix de revente conseillé
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-accent mb-1">
                      {result.suggestedPrice}€
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pour une vente rapide et rentable
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`border-${
                    result.potentialMargin > 0 ? "success" : "destructive"
                  }/20 bg-gradient-to-br from-${
                    result.potentialMargin > 0 ? "success" : "destructive"
                  }/5 to-transparent`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      Marge potentielle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-4xl font-bold mb-1 flex items-center gap-2 ${
                        result.potentialMargin > 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {result.potentialMargin > 0 ? (
                        <TrendingUp className="h-8 w-8" />
                      ) : (
                        <TrendingDown className="h-8 w-8" />
                      )}
                      {result.potentialMargin > 0 ? "+" : ""}
                      {result.potentialMargin}€
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {result.marginPercentage > 0 ? "+" : ""}
                      {result.marginPercentage}% de marge
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Price Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Positionnement de votre prix d'achat</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => [`${value}€`, "Prix"]}
                      />
                      <ReferenceLine
                        x={parseFloat(purchasePrice)}
                        stroke="hsl(var(--foreground))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        label={{
                          value: "Votre prix",
                          position: "top",
                          fill: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Recommandation</h4>
                        <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Détail du calcul</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Prix médian du marché</span>
                      <span className="text-sm font-semibold">
                        {mockModels.find((m) => m.id === selectedModel)?.medianPrice}€
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">
                        Ajustement état (
                        {conditions.find((c) => c.value === condition)?.label})
                      </span>
                      <span className="text-sm font-semibold">
                        ×{conditions.find((c) => c.value === condition)?.multiplier}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">
                        Ajustement région ({regions.find((r) => r.value === region)?.label})
                      </span>
                      <span className="text-sm font-semibold">
                        ×{regions.find((r) => r.value === region)?.adjustment}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-sm font-semibold">Fair Value finale</span>
                      <span className="text-lg font-bold text-primary">{result.fairValue}€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action */}
              <div className="flex justify-center">
                <Button onClick={reset} variant="outline" size="lg">
                  Faire une nouvelle estimation
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
