import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { 
  ArrowLeft, TrendingUp, TrendingDown, Bell, Heart, Clock, 
  ExternalLink, Activity, BarChart3, MapPin, Sparkles
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { 
  useModelDetail, 
  useModelPriceHistory, 
  useModelAds, 
  useToggleModelWatchlist,
  useCreatePriceAlert 
} from "@/hooks/useModelDetail";
import { ModelDetailSkeleton } from "@/components/model/ModelDetailSkeleton";
import { toast } from "@/hooks/use-toast";

export default function ModelDetail() {
  const { id } = useParams();

  // State
  const [selectedPeriod, setSelectedPeriod] = useState<"7" | "30" | "90">("30");
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertPriceMax, setAlertPriceMax] = useState("");
  const [alertVarMin, setAlertVarMin] = useState("");
  const [alertNotifyNewDeals, setAlertNotifyNewDeals] = useState(false);
  const [adsPage, setAdsPage] = useState(1);

  // API queries
  const { data: model, isLoading: modelLoading, error: modelError } = useModelDetail(id);
  const { data: priceHistory, isLoading: historyLoading } = useModelPriceHistory(id, selectedPeriod);
  const { data: adsData, isLoading: adsLoading } = useModelAds(id, adsPage, 10);
  
  const toggleWatchlist = useToggleModelWatchlist();
  const createAlert = useCreatePriceAlert();

  // Handlers
  const handleToggleWatchlist = async () => {
    if (!model) return;
    try {
      await toggleWatchlist.mutateAsync({
        modelId: model.id,
        action: isInWatchlist ? 'remove' : 'add',
      });
      setIsInWatchlist(!isInWatchlist);
      toast({
        title: isInWatchlist ? "Retiré de la watchlist" : "Ajouté à la watchlist",
        description: `"${model.name}" a été ${isInWatchlist ? "retiré de" : "ajouté à"} votre watchlist.`,
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAlert = async () => {
    if (!model) return;
    try {
      await createAlert.mutateAsync({
        model_id: model.id,
        price_max: alertPriceMax ? Number(alertPriceMax) : undefined,
        variation_min: alertVarMin ? Number(alertVarMin) : undefined,
        notify_new_deals: alertNotifyNewDeals,
      });
      setShowAlertDialog(false);
      toast({
        title: "Alerte créée",
        description: "Vous serez notifié selon vos critères.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'alerte.",
        variant: "destructive",
      });
    }
  };

  // Format helpers
  const formatPrice = (price: number) => `${price} €`;
  const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const getTrendIcon = (value: number) => {
    return value < 0 
      ? <TrendingDown className="h-4 w-4 text-success" /> 
      : <TrendingUp className="h-4 w-4 text-destructive" />;
  };

  if (modelLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-7xl">
          <ModelDetailSkeleton />
        </div>
      </div>
    );
  }

  if (modelError || !model) {
    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-7xl">
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">Modèle non trouvé.</p>
              <Button variant="outline" asChild>
                <Link to="/catalog">Retour au catalogue</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-7xl space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Accueil</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/catalog">Catalogue</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/catalog?category=${model.category}`}>{model.category}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{model.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <h1 className="text-4xl font-bold mb-3">{model.brand} {model.name}</h1>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{model.category}</Badge>
              {model.family && <Badge variant="outline">{model.family}</Badge>}
              {model.aliases.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  Alias: {model.aliases.slice(0, 2).join(", ")}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Prix médian 30j
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(model.kpi.median_30d)}</div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(model.kpi.var_30d_pct)}
                <span className={model.kpi.var_30d_pct < 0 ? "text-success" : "text-destructive"}>
                  {formatPercent(model.kpi.var_30d_pct)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fair Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(model.kpi.fair_value_30d)}</div>
              <p className="text-xs text-muted-foreground mt-1">30j hors outliers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Volume actif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{model.kpi.volume_active}</div>
              <p className="text-xs text-muted-foreground mt-1">annonces</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rareté</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(model.kpi.rarity_index * 100).toFixed(0)}%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${model.kpi.rarity_index * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Délai de vente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{model.kpi.median_days_to_sell}j</div>
              <p className="text-xs text-muted-foreground mt-1">médian</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dernier scan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(model.kpi.last_scan_at)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Outils rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={isInWatchlist ? "default" : "outline"}
                  onClick={handleToggleWatchlist}
                  disabled={toggleWatchlist.isPending}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {isInWatchlist ? "Dans la watchlist" : "Suivre modèle"}
                </Button>

                <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Bell className="h-4 w-4 mr-2" />
                      Créer alerte prix
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer une alerte pour {model.name}</DialogTitle>
                      <DialogDescription>
                        Soyez notifié lorsque certaines conditions sont remplies
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="price-max">Prix maximum (€)</Label>
                        <Input
                          id="price-max"
                          type="number"
                          placeholder={String(Math.round(model.kpi.fair_value_30d * 0.9))}
                          value={alertPriceMax}
                          onChange={(e) => setAlertPriceMax(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="var-pct">Variation minimale (%)</Label>
                        <Input
                          id="var-pct"
                          type="number"
                          placeholder="-5"
                          value={alertVarMin}
                          onChange={(e) => setAlertVarMin(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="new-deals"
                          checked={alertNotifyNewDeals}
                          onCheckedChange={setAlertNotifyNewDeals}
                        />
                        <Label htmlFor="new-deals">Notifier pour nouveaux deals</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateAlert} disabled={createAlert.isPending}>
                        Créer l'alerte
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" asChild>
                  <Link to={`/estimator?model=${model.id}`}>Estimer</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="price" className="space-y-4">
          <TabsList>
            <TabsTrigger value="price">
              <BarChart3 className="h-4 w-4 mr-2" />
              Évolution des prix
            </TabsTrigger>
            <TabsTrigger value="ads">
              <Activity className="h-4 w-4 mr-2" />
              Annonces récentes
            </TabsTrigger>
            {model.specs && (
              <TabsTrigger value="specs">Spécifications</TabsTrigger>
            )}
          </TabsList>

          {/* Price Chart Tab */}
          <TabsContent value="price">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Historique des prix</CardTitle>
                  <Select value={selectedPeriod} onValueChange={(v: "7" | "30" | "90") => setSelectedPeriod(v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="90">90 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Chargement...</p>
                  </div>
                ) : priceHistory?.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={priceHistory}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <Tooltip
                        labelFormatter={(v) => formatDate(v)}
                        formatter={(value: number) => [`${value} €`, "Prix médian"]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="price_median"
                        stroke="hsl(var(--primary))"
                        fill="url(#colorPrice)"
                        name="Prix médian"
                      />
                      <Line
                        type="monotone"
                        dataKey="price_p25"
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="3 3"
                        name="P25"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="price_p75"
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="3 3"
                        name="P75"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Aucune donnée disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <CardTitle>Annonces récentes</CardTitle>
                <CardDescription>
                  Les dernières annonces pour ce modèle
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : adsData?.items.length ? (
                  <div className="space-y-4">
                    {adsData.items.map((ad) => (
                      <div
                        key={ad.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-medium line-clamp-1">{ad.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {ad.city}, {ad.region}
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">{ad.condition}</Badge>
                            <span>•</span>
                            <span>{ad.platform}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xl font-bold">{ad.price}€</p>
                            {ad.score && (
                              <Badge variant={ad.score >= 80 ? "default" : "secondary"}>
                                Score: {ad.score}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" asChild>
                              <Link to={`/ads/${ad.ad_id}`}>Voir</Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={ad.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {adsData.total_pages > 1 && (
                      <div className="flex justify-center gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdsPage((p) => Math.max(1, p - 1))}
                          disabled={adsPage === 1}
                        >
                          Précédent
                        </Button>
                        <span className="flex items-center px-4 text-sm text-muted-foreground">
                          Page {adsPage} / {adsData.total_pages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdsPage((p) => Math.min(adsData.total_pages, p + 1))}
                          disabled={adsPage === adsData.total_pages}
                        >
                          Suivant
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune annonce récente pour ce modèle.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specs Tab */}
          {model.specs && (
            <TabsContent value="specs">
              <Card>
                <CardHeader>
                  <CardTitle>Spécifications techniques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {model.specs.vram_gb && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">VRAM</p>
                        <p className="text-xl font-bold">{model.specs.vram_gb} Go</p>
                      </div>
                    )}
                    {model.specs.memory_type && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Type de mémoire</p>
                        <p className="text-xl font-bold">{model.specs.memory_type}</p>
                      </div>
                    )}
                    {model.specs.tdp_w && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">TDP</p>
                        <p className="text-xl font-bold">{model.specs.tdp_w} W</p>
                      </div>
                    )}
                    {model.specs.bus_width_bit && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Bus mémoire</p>
                        <p className="text-xl font-bold">{model.specs.bus_width_bit} bits</p>
                      </div>
                    )}
                    {model.specs.chip && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Puce</p>
                        <p className="text-xl font-bold">{model.specs.chip}</p>
                      </div>
                    )}
                    {model.specs.release_date && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Date de sortie</p>
                        <p className="text-xl font-bold">{formatDate(model.specs.release_date)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
