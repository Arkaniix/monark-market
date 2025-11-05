import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { mockModels, Model } from "@/lib/mockData";

interface ModelComparatorProps {
  currentModel: Model;
}

export default function ModelComparator({ currentModel }: ModelComparatorProps) {
  const [selectedModelId, setSelectedModelId] = useState<string>("");

  // Get models from the same category excluding current model
  const availableModels = mockModels.filter(
    (m) => m.category === currentModel.category && m.id !== currentModel.id
  );

  const compareModel = mockModels.find((m) => m.id === selectedModelId);

  // Combine price histories for comparison
  const combinedHistory =
    compareModel &&
    currentModel.priceHistory.map((item, index) => ({
      date: item.date,
      [currentModel.name]: item.price,
      [compareModel.name]: compareModel.priceHistory[index]?.price || 0,
    }));

  return (
    <div className="space-y-6">
      {/* Model Selector */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Sélectionnez un modèle à comparer avec {currentModel.name}
        </label>
        <Select value={selectedModelId} onValueChange={setSelectedModelId}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Choisir un modèle..." />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {availableModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name} - {model.medianPrice}€
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {compareModel ? (
        <>
          {/* Comparison Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Model */}
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {currentModel.category}
                    </Badge>
                    <CardTitle className="text-lg">{currentModel.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentModel.brand}
                    </p>
                  </div>
                  <Badge>{currentModel.rarity}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Prix médian</div>
                    <div className="text-3xl font-bold">{currentModel.medianPrice}€</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">7 jours</div>
                      <div
                        className={`flex items-center gap-1 font-medium ${
                          currentModel.priceChange7d < 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {currentModel.priceChange7d < 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                        <span>{currentModel.priceChange7d.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">30 jours</div>
                      <div
                        className={`flex items-center gap-1 font-medium ${
                          currentModel.priceChange30d < 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {currentModel.priceChange30d < 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                        <span>{currentModel.priceChange30d.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-semibold">{currentModel.volume} annonces</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <ResponsiveContainer width="100%" height={60}>
                      <LineChart data={currentModel.priceHistory}>
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compare Model */}
            <Card className="border-accent">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {compareModel.category}
                    </Badge>
                    <CardTitle className="text-lg">{compareModel.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {compareModel.brand}
                    </p>
                  </div>
                  <Badge>{compareModel.rarity}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Prix médian</div>
                    <div className="text-3xl font-bold">{compareModel.medianPrice}€</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {compareModel.medianPrice > currentModel.medianPrice ? "+" : ""}
                      {compareModel.medianPrice - currentModel.medianPrice}€ vs{" "}
                      {currentModel.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">7 jours</div>
                      <div
                        className={`flex items-center gap-1 font-medium ${
                          compareModel.priceChange7d < 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {compareModel.priceChange7d < 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                        <span>{compareModel.priceChange7d.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">30 jours</div>
                      <div
                        className={`flex items-center gap-1 font-medium ${
                          compareModel.priceChange30d < 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {compareModel.priceChange30d < 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                        <span>{compareModel.priceChange30d.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-semibold">{compareModel.volume} annonces</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <ResponsiveContainer width="100%" height={60}>
                      <LineChart data={compareModel.priceHistory}>
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution comparative des prix</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={combinedHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => `${value}€`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={currentModel.name}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name={currentModel.name}
                  />
                  <Line
                    type="monotone"
                    dataKey={compareModel.name}
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    name={compareModel.name}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Differences */}
          <Card>
            <CardHeader>
              <CardTitle>Différences clés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Prix médian</span>
                  <span className="text-sm">
                    {Math.abs(compareModel.medianPrice - currentModel.medianPrice) < 10 ? (
                      <Badge variant="secondary" className="gap-1">
                        <Activity className="h-3 w-3" />
                        Prix similaires
                      </Badge>
                    ) : compareModel.medianPrice < currentModel.medianPrice ? (
                      <Badge variant="default" className="gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {compareModel.name} moins cher de{" "}
                        {currentModel.medianPrice - compareModel.medianPrice}€
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {currentModel.name} moins cher de{" "}
                        {compareModel.medianPrice - currentModel.medianPrice}€
                      </Badge>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Volume du marché</span>
                  <span className="text-sm">
                    {Math.abs(compareModel.volume - currentModel.volume) < 20 ? (
                      <Badge variant="secondary">Volume similaire</Badge>
                    ) : compareModel.volume > currentModel.volume ? (
                      <Badge variant="default">
                        {compareModel.name} plus liquide (+
                        {compareModel.volume - currentModel.volume} annonces)
                      </Badge>
                    ) : (
                      <Badge variant="default">
                        {currentModel.name} plus liquide (+
                        {currentModel.volume - compareModel.volume} annonces)
                      </Badge>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Tendance 30j</span>
                  <span className="text-sm">
                    {compareModel.priceChange30d < currentModel.priceChange30d ? (
                      <Badge variant="default" className="gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {compareModel.name} baisse plus (
                        {(currentModel.priceChange30d - compareModel.priceChange30d).toFixed(1)}%
                        de différence)
                      </Badge>
                    ) : compareModel.priceChange30d > currentModel.priceChange30d ? (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {currentModel.name} baisse plus (
                        {(compareModel.priceChange30d - currentModel.priceChange30d).toFixed(1)}%
                        de différence)
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Évolution similaire</Badge>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Sélectionnez un modèle pour commencer la comparaison</p>
          </div>
        </Card>
      )}
    </div>
  );
}
