import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { mockModels } from "@/lib/mockData";

export default function Trends() {
  const gpuModels = mockModels.filter((m) => m.category === "GPU");
  const cpuModels = mockModels.filter((m) => m.category === "CPU");
  const ramModels = mockModels.filter((m) => m.category === "RAM");

  const marketIndexData = [
    { date: "15/12", gpu: 100, cpu: 100, ram: 100 },
    { date: "22/12", gpu: 98, cpu: 101, ram: 97 },
    { date: "29/12", gpu: 95, cpu: 99, ram: 95 },
    { date: "05/01", gpu: 93, cpu: 98, ram: 93 },
    { date: "12/01", gpu: 91, cpu: 99, ram: 91 },
  ];

  const volumeData = mockModels.slice(0, 5).map((model) => ({
    name: model.name.split(" ").slice(0, 2).join(" "),
    volume: model.volume,
  }));

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tendances du Marché</h1>
          <p className="text-muted-foreground">
            Analyses et évolutions des prix du matériel informatique d'occasion
          </p>
        </div>

        {/* Market Indices */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Indice GPU (30j)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">91</div>
                <Badge variant="destructive" className="gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -9%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tendance baissière continue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Indice CPU (30j)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">99</div>
                <Badge variant="secondary" className="gap-1">
                  <Activity className="h-3 w-3" />
                  -1%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Marché stable
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Indice RAM (30j)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">91</div>
                <Badge variant="destructive" className="gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -9%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Forte baisse des prix
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Market Index Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Évolution des Indices de Marché</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={marketIndexData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gpu"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="GPU"
                />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  name="CPU"
                />
                <Line
                  type="monotone"
                  dataKey="ram"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  name="RAM"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volume Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Volume d'Annonces par Modèle (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="volume" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs defaultValue="gpu" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="gpu">GPU</TabsTrigger>
            <TabsTrigger value="cpu">CPU</TabsTrigger>
            <TabsTrigger value="ram">RAM</TabsTrigger>
          </TabsList>

          <TabsContent value="gpu">
            <div className="grid md:grid-cols-2 gap-6">
              {gpuModels.map((model) => (
                <Card key={model.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{model.brand}</p>
                      </div>
                      <Badge variant="outline">{model.rarity}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prix médian</span>
                        <span className="text-2xl font-bold">{model.medianPrice}€</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">7 jours</span>
                          <div className={`flex items-center gap-1 ${model.priceChange7d < 0 ? "text-success" : "text-destructive"}`}>
                            {model.priceChange7d < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                            <span className="font-medium">{model.priceChange7d.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">30 jours</span>
                          <div className={`flex items-center gap-1 ${model.priceChange30d < 0 ? "text-success" : "text-destructive"}`}>
                            {model.priceChange30d < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                            <span className="font-medium">{model.priceChange30d.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <ResponsiveContainer width="100%" height={80}>
                          <LineChart data={model.priceHistory}>
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

                      <div className="text-xs text-muted-foreground">
                        Volume: {model.volume} annonces • MAJ: {new Date(model.lastUpdate).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cpu">
            <div className="grid md:grid-cols-2 gap-6">
              {cpuModels.map((model) => (
                <Card key={model.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{model.brand}</p>
                      </div>
                      <Badge variant="outline">{model.rarity}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prix médian</span>
                        <span className="text-2xl font-bold">{model.medianPrice}€</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">7 jours</span>
                          <div className={`flex items-center gap-1 ${model.priceChange7d < 0 ? "text-success" : "text-destructive"}`}>
                            {model.priceChange7d < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                            <span className="font-medium">{model.priceChange7d.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">30 jours</span>
                          <div className={`flex items-center gap-1 ${model.priceChange30d < 0 ? "text-success" : "text-destructive"}`}>
                            {model.priceChange30d < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                            <span className="font-medium">{model.priceChange30d.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <ResponsiveContainer width="100%" height={80}>
                          <LineChart data={model.priceHistory}>
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

                      <div className="text-xs text-muted-foreground">
                        Volume: {model.volume} annonces • MAJ: {new Date(model.lastUpdate).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ram">
            <div className="grid md:grid-cols-2 gap-6">
              {ramModels.map((model) => (
                <Card key={model.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{model.brand}</p>
                      </div>
                      <Badge variant="outline">{model.rarity}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prix médian</span>
                        <span className="text-2xl font-bold">{model.medianPrice}€</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">7 jours</span>
                          <div className={`flex items-center gap-1 ${model.priceChange7d < 0 ? "text-success" : "text-destructive"}`}>
                            {model.priceChange7d < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                            <span className="font-medium">{model.priceChange7d.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">30 jours</span>
                          <div className={`flex items-center gap-1 ${model.priceChange30d < 0 ? "text-success" : "text-destructive"}`}>
                            {model.priceChange30d < 0 ? (
                              <TrendingDown className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4" />
                            )}
                            <span className="font-medium">{model.priceChange30d.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <ResponsiveContainer width="100%" height={80}>
                          <LineChart data={model.priceHistory}>
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="hsl(var(--warning))"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Volume: {model.volume} annonces • MAJ: {new Date(model.lastUpdate).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
