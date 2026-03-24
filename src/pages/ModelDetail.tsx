import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { 
  TrendingUp, TrendingDown, Bell, Heart, Clock, 
  Activity, BarChart3, Sparkles, Info, Layers,
  Store, ShoppingBag, ShoppingCart, Monitor, Smartphone, Shirt, Package
} from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { 
  useModelDetail, 
  useModelPriceHistory, 
  useSimilarModels,
  useToggleModelWatchlist
} from "@/hooks/useModelDetail";
import { CreateAlertModal, AlertTarget } from "@/components/alerts/CreateAlertModal";
import { ModelDetailSkeleton } from "@/components/model/ModelDetailSkeleton";
import { ImageGallery } from "@/components/model/ImageGallery";
import { ModelCardImage } from "@/components/catalog/ModelCardImage";
import { VariantsSection } from "@/components/model/VariantsSection";
import { toast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/api/client";
import { MARKET } from "@/lib/api/endpoints";

// ============= Types for listings count =============
interface PlatformCount {
  platform: string;
  label: string;
  count: number;
  avg_price: number;
}

interface ConditionCount {
  condition: string;
  label: string;
  count: number;
}

interface ListingsCount {
  model_id: number;
  period: string;
  total: number;
  by_platform: PlatformCount[];
  by_condition?: ConditionCount[];
}

// Platform visual config
const PLATFORM_VISUALS: Record<string, { icon: React.ComponentType<{ className?: string }>; colorClass: string; barClass: string; bgClass: string; borderClass: string }> = {
  "ebay":        { icon: ShoppingBag, colorClass: "text-blue-400", barClass: "bg-blue-500", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/30" },
  "leboncoin":   { icon: Store,       colorClass: "text-orange-400", barClass: "bg-orange-500", bgClass: "bg-orange-500/10", borderClass: "border-orange-500/30" },
  "facebook":    { icon: Smartphone,  colorClass: "text-sky-400", barClass: "bg-sky-500", bgClass: "bg-sky-500/10", borderClass: "border-sky-500/30" },
  "vinted":      { icon: Shirt,       colorClass: "text-teal-400", barClass: "bg-teal-500", bgClass: "bg-teal-500/10", borderClass: "border-teal-500/30" },
  "ldlc":        { icon: Monitor,     colorClass: "text-red-400", barClass: "bg-red-500", bgClass: "bg-red-500/10", borderClass: "border-red-500/30" },
  "amazon":      { icon: ShoppingCart, colorClass: "text-amber-400", barClass: "bg-amber-500", bgClass: "bg-amber-500/10", borderClass: "border-amber-500/30" },
};

const EBAY_SOURCES = ['ebay_sold', 'ebay_active', 'scraper_disappear'];

function aggregatePlatforms(byPlatform: PlatformCount[]) {
  const aggregated = new Map<string, { label: string; count: number; totalPrice: number }>();
  for (const p of byPlatform) {
    const key = EBAY_SOURCES.includes(p.platform) ? 'ebay' : p.platform === 'crowdsource' ? null : p.platform;
    if (!key) continue;
    const existing = aggregated.get(key) || { label: key === 'ebay' ? 'eBay' : p.label, count: 0, totalPrice: 0 };
    existing.count += p.count;
    existing.totalPrice += p.count * p.avg_price;
    aggregated.set(key, existing);
  }
  return Array.from(aggregated.entries()).map(([key, p]) => ({
    key,
    label: p.label,
    count: p.count,
    avg_price: p.count > 0 ? Math.round(p.totalPrice / p.count) : 0,
  })).sort((a, b) => b.count - a.count);
}

function getPlatformVisual(platform: string) {
  return PLATFORM_VISUALS[platform] ?? { icon: Package, colorClass: "text-violet-400", barClass: "bg-violet-500", bgClass: "bg-violet-500/10", borderClass: "border-violet-500/30" };
}

const CONDITION_STYLES: Record<string, string> = {
  "neuf": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "comme neuf": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "pour pièces": "bg-red-500/15 text-red-400 border-red-500/30",
  "pour pieces": "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function ModelDetail() {
  const { id } = useParams();

  // State
  const [selectedPeriod, setSelectedPeriod] = useState<"7" | "30" | "90">("30");
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  // API queries
  const { data: model, isLoading: modelLoading, error: modelError } = useModelDetail(id);
  const { data: priceHistory, isLoading: historyLoading } = useModelPriceHistory(id, selectedPeriod);
  const { data: similarModels, isLoading: similarLoading } = useSimilarModels(id, 6);

  // Listings count query
  const { data: listingsCount, isLoading: listingsLoading, error: listingsError } = useQuery<ListingsCount>({
    queryKey: ['listings-count', id],
    queryFn: () => apiGet<ListingsCount>(MARKET.LISTINGS_COUNT(id!)),
    enabled: !!id,
    retry: false,
  });
  
  const toggleWatchlist = useToggleModelWatchlist();
  
  // Alert target for CreateAlertModal
  const alertTarget: AlertTarget | null = model ? {
    type: 'model',
    id: model.id,
    name: `${model.brand} ${model.name}`,
    category: model.category,
    currentPrice: model.kpi.median_30d,
  } : null;

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

  // Build estimator URL with pre-filled params
  const getEstimatorUrl = () => {
    if (!model) return '/estimator';
    const params = new URLSearchParams();
    params.set('model_id', String(model.id));
    params.set('model_name', `${model.brand} ${model.name}`);
    params.set('price', String(model.kpi.median_30d));
    return `/estimator?${params.toString()}`;
  };

  // Format helpers
  const formatPrice = (price: number | null | undefined) => price != null ? `${price} €` : '—';
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
    <div className="min-h-screen py-8 scroll-smooth">
      <div className="container max-w-7xl space-y-8">
        {/* Breadcrumb - navigation context */}
        <nav aria-label="Fil d'Ariane">
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
                <BreadcrumbLink asChild>
                  <Link to={`/catalog?brand=${model.brand}`}>{model.brand}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{model.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Header - H1 principal */}
        <motion.header
          id="model-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-6 items-start"
        >
          {/* Galerie d'images */}
          <div className="hidden sm:block flex-shrink-0 w-[400px]">
            {model.images && model.images.length > 0 ? (
              <ImageGallery 
                images={model.images} 
                modelName={`${model.brand} ${model.name}`} 
              />
            ) : model.image_url ? (
              <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                <div className="aspect-[4/3] bg-muted/30">
                  <img
                    src={model.image_url}
                    alt={`${model.brand} ${model.name}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-muted-foreground text-sm">' + model.name + '</div>';
                    }}
                  />
                </div>
                <div className="bg-muted/50 text-center py-1 border-t border-border/30">
                  <span className="text-[9px] text-muted-foreground/60 italic">
                    Image non contractuelle
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                <ModelCardImage
                  imageUrl={null}
                  modelName={model.name}
                  brand={model.brand}
                  category={model.category}
                  aspectRatio="4/3"
                  size="lg"
                />
                <div className="bg-muted/50 text-center py-1 border-t border-border/30">
                  <span className="text-[9px] text-muted-foreground/60 italic">
                    Image non contractuelle
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Titre & Badges */}
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{model.name}</h1>
            <div className="flex gap-2 flex-wrap">
              {model.manufacturer && (
                <Badge variant="default" className="bg-primary/90">
                  {model.manufacturer}
                </Badge>
              )}
              {model.brand && model.brand !== model.manufacturer && (
                <Badge variant="secondary">{model.brand}</Badge>
              )}
              <Badge variant="outline">{model.category}</Badge>
              {model.family && <Badge variant="outline">{model.family}</Badge>}
              {model.aliases.length > 0 && (
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs cursor-help">
                        Alias: {model.aliases.slice(0, 2).join(", ")}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Autres noms commerciaux pour ce modèle</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </motion.header>

        {/* KPI Cards - Section indicateurs clés */}
        <motion.section
          id="market-indicators"
          aria-labelledby="kpi-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 id="kpi-heading" className="sr-only">Indicateurs de marché</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Prix médian */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Prix médian 30j
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(model.kpi.median_30d)}</div>
                {model.kpi.var_30d_pct != null ? (
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(model.kpi.var_30d_pct)}
                    <span className={model.kpi.var_30d_pct < 0 ? "text-success" : "text-destructive"}>
                      {formatPercent(model.kpi.var_30d_pct)}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">—</p>
                )}
              </CardContent>
            </Card>

            {/* Fair Value avec tooltip explicatif */}
            <Card>
              <CardHeader className="pb-2">
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 cursor-help">
                        Juste prix
                        <Info className="h-3 w-3" />
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">
                        Estimation pondérée du prix raisonnable, calculée à partir des transactions 
                        des 30 derniers jours en excluant les valeurs extrêmes.
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(model.kpi.fair_value_30d)}</div>
                {model.kpi.fair_value_30d != null && model.new_price_eur != null && model.new_price_eur > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    <span className="text-xs text-muted-foreground">Neuf : {model.new_price_eur.toLocaleString('fr-FR')} €</span>
                    {(() => {
                      const savings = Math.round((1 - model.kpi.fair_value_30d / model.new_price_eur!) * 100);
                      return savings > 0 ? (
                        <div>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500/15 text-emerald-500 border-emerald-500/30">
                            -{savings}% vs neuf
                          </Badge>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Volume actif */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Annonces actives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{model.kpi.volume_active}</div>
              </CardContent>
            </Card>

            {/* Rareté avec tooltip */}
            <Card>
              <CardHeader className="pb-2">
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 cursor-help">
                        Rareté
                        <Info className="h-3 w-3" />
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">
                        Indicateur de disponibilité sur le marché. 
                        Plus le pourcentage est élevé, moins il y a d'annonces disponibles.
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
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

            {/* Délai de vente */}
            <Card>
              <CardHeader className="pb-2">
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 cursor-help">
                        Délai de vente
                        <Info className="h-3 w-3" />
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">
                        Temps médian entre la publication d'une annonce et sa disparition (vente présumée).
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{model.kpi.median_days_to_sell != null ? `${model.kpi.median_days_to_sell} jours` : '—'}</div>
              </CardContent>
            </Card>

            {/* Dernier scan */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Mis à jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(model.kpi.last_scan_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Quick Tools - Actions rapides */}
        <motion.section
          id="quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Actions rapides
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {/* Watchlist button */}
                <Button
                  variant={isInWatchlist ? "default" : "outline"}
                  onClick={handleToggleWatchlist}
                  disabled={toggleWatchlist.isPending}
                  className="gap-2"
                >
                  <Heart className={`h-4 w-4 ${isInWatchlist ? 'fill-current' : ''}`} />
                  {isInWatchlist ? "Dans la watchlist" : "Suivre le modèle"}
                </Button>

                {/* Alert button - opens CreateAlertModal */}
                <Button
                  variant="outline"
                  onClick={() => setShowAlertModal(true)}
                  className="gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Créer une alerte prix
                </Button>

                {/* Estimator button - navigates with pre-filled params */}
                <Button variant="outline" asChild className="gap-2">
                  <Link to={getEstimatorUrl()}>
                    <Sparkles className="h-4 w-4" />
                    Estimer
                  </Link>
                </Button>
              </div>

              {/* CreateAlertModal component */}
              <CreateAlertModal
                open={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                target={alertTarget}
                defaultAlertType="price_below"
              />
            </CardContent>
          </Card>
        </motion.section>

        {/* Tabs - Analyses détaillées */}
        <section id="detailed-analysis" className="scroll-mt-8">
          <Tabs defaultValue="price" className="space-y-6">
            <TabsList>
              <TabsTrigger value="price">
                <BarChart3 className="h-4 w-4 mr-2" />
                Évolution des prix
              </TabsTrigger>
              <TabsTrigger value="volume">
                <Activity className="h-4 w-4 mr-2" />
                Volume d'annonces
              </TabsTrigger>
              <TabsTrigger value="ads">
                <Store className="h-4 w-4 mr-2" />
                Activité marché
              </TabsTrigger>
              {model.specs && (
                <TabsTrigger value="specs">Fiche technique</TabsTrigger>
              )}
            </TabsList>

            {/* Price Chart Tab */}
            <TabsContent value="price">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Évolution des prix</h3>
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
                  (() => {
                    // Calculate Y-axis domain to always include P25, median, and P75 with padding
                    const allP25 = priceHistory.map((d: any) => d.price_p25).filter(Boolean);
                    const allP75 = priceHistory.map((d: any) => d.price_p75).filter(Boolean);
                    const minPrice = Math.min(...allP25);
                    const maxPrice = Math.max(...allP75);
                    const padding = (maxPrice - minPrice) * 0.1;
                    const yMin = Math.floor((minPrice - padding) / 10) * 10;
                    const yMax = Math.ceil((maxPrice + padding) / 10) * 10;

                    return (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={priceHistory}>
                          <defs>
                            {/* Gradient médiane - couleur principale douce */}
                            <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                            </linearGradient>
                            {/* Gradient dispersion P25-P75 - très subtil */}
                            <linearGradient id="colorDispersion" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.08} />
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(v) => new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                            tickLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <YAxis 
                            domain={[yMin, yMax]}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            axisLine={{ stroke: 'hsl(var(--border))' }}
                            tickLine={{ stroke: 'hsl(var(--border))' }}
                            tickFormatter={(v) => `${v} €`}
                            width={65}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (!active || !payload?.length) return null;
                              const data = payload[0]?.payload;
                              return (
                                <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl min-w-[200px]">
                                  <p className="font-semibold text-sm mb-3 pb-2 border-b border-border/50">
                                    {formatDate(String(label))}
                                  </p>
                                  <div className="space-y-2">
                                    {/* Médiane - mise en avant */}
                                    <div className="flex justify-between items-center gap-4 bg-primary/5 -mx-2 px-2 py-1 rounded">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                        <span className="text-sm font-medium">Médiane</span>
                                      </div>
                                      <span className="font-bold text-primary">{data?.price_median} €</span>
                                    </div>
                                    {/* P25 */}
                                    <div className="flex justify-between items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-0.5 bg-primary/40" />
                                        <span className="text-xs text-muted-foreground">P25 (bas)</span>
                                      </div>
                                      <span className="text-sm text-muted-foreground">{data?.price_p25} €</span>
                                    </div>
                                    {/* P75 */}
                                    <div className="flex justify-between items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-0.5 bg-primary/40" />
                                        <span className="text-xs text-muted-foreground">P75 (haut)</span>
                                      </div>
                                      <span className="text-sm text-muted-foreground">{data?.price_p75} €</span>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground/70 mt-3 pt-2 border-t border-border/50 leading-relaxed">
                                    💡 Un prix proche de P25 = bonne affaire
                                  </p>
                                </div>
                              );
                            }}
                          />
                          <Legend 
                            formatter={(value) => {
                              const labels: Record<string, string> = {
                                'price_p75': 'P75',
                                'price_p25': 'P25',
                                'price_median': 'Médiane',
                              };
                              return labels[value] || value;
                            }}
                          />
                          {/* Bande de dispersion P25-P75 - teinte primaire subtile */}
                          <Area
                            type="monotone"
                            dataKey="price_p75"
                            stroke="none"
                            fill="url(#colorDispersion)"
                            name="price_p75"
                            legendType="none"
                          />
                          <Area
                            type="monotone"
                            dataKey="price_p25"
                            stroke="none"
                            fill="hsl(var(--background))"
                            name="price_p25"
                            legendType="none"
                          />
                          {/* Lignes P25/P75 - teinte primaire légère, pas de contrastes forts */}
                          <Line
                            type="monotone"
                            dataKey="price_p25"
                            stroke="hsl(var(--primary) / 0.35)"
                            strokeDasharray="4 3"
                            strokeWidth={1.5}
                            name="price_p25"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="price_p75"
                            stroke="hsl(var(--primary) / 0.35)"
                            strokeDasharray="4 3"
                            strokeWidth={1.5}
                            name="price_p75"
                            dot={false}
                          />
                          {/* Médiane - ligne principale plus visible */}
                          <Area
                            type="monotone"
                            dataKey="price_median"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2.5}
                            fill="url(#colorMedian)"
                            name="price_median"
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    );
                  })()
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Aucune donnée disponible</p>
                  </div>
                )}
                
                {/* Légende pédagogique */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 cursor-help">
                            <div className="w-3 h-0.5 bg-primary rounded" />
                            <span className="text-muted-foreground">Médiane</span>
                            <Info className="h-3 w-3 text-muted-foreground/60" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">Prix médian (50e percentile)</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Le prix "central" du marché : 50 % des annonces sont moins chères, 50 % sont plus chères.
                          </p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 cursor-help">
                            <div className="w-3 h-0.5 bg-muted-foreground/60 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0, currentColor 3px, transparent 3px, transparent 6px)' }} />
                            <span className="text-muted-foreground">P25</span>
                            <Info className="h-3 w-3 text-muted-foreground/60" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">P25 = Prix bas du marché</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            25 % des annonces sont moins chères que ce prix. Un bon indicateur pour repérer les bonnes affaires.
                          </p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 cursor-help">
                            <div className="w-3 h-0.5 bg-muted-foreground/60 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0, currentColor 3px, transparent 3px, transparent 6px)' }} />
                            <span className="text-muted-foreground">P75</span>
                            <Info className="h-3 w-3 text-muted-foreground/60" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">P75 = Prix haut du marché</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            25 % des annonces sont plus chères que ce prix. Utile pour éviter de surpayer.
                          </p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 cursor-help">
                            <div className="w-4 h-3 bg-muted-foreground/15 rounded-sm" />
                            <span className="text-muted-foreground">Dispersion</span>
                            <Info className="h-3 w-3 text-muted-foreground/60" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">Zone de dispersion des prix</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            La bande grisée entre P25 et P75 montre où se situent 50 % des annonces.
                          </p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    <span>
                      <strong>À retenir :</strong> 50 % des annonces se situent entre P25 et P75. 
                      Un prix proche de P25 est une bonne affaire, proche de P75 est cher.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Volume Tab */}
          <TabsContent value="volume">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Volume des annonces</h3>
                  <Badge variant="outline" className="text-xs">30 derniers jours</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <p className="text-muted-foreground">Chargement...</p>
                  </div>
                ) : priceHistory?.length ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={priceHistory.slice(-30)}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(v) => new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                          width={40}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const data = payload[0]?.payload;
                            return (
                              <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
                                <p className="font-semibold text-sm mb-2 pb-2 border-b border-border/50">
                                  {formatDate(String(label))}
                                </p>
                                <div className="flex justify-between items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                                    <span className="text-sm">Annonces actives</span>
                                  </div>
                                  <span className="font-bold">{data?.ads_count ?? data?.volume ?? 0}</span>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="volume"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          fill="url(#colorVolume)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground text-center mt-4 pt-3 border-t border-border">
                      Le volume indique le nombre d'annonces actives pour ce modèle au cours des 30 derniers jours. 
                      Un volume élevé signifie une bonne liquidité sur le marché.
                    </p>
                  </>
                ) : (
                  <div className="h-[250px] flex items-center justify-center">
                    <p className="text-muted-foreground">Aucune donnée de volume disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Activity Tab */}
          <TabsContent value="ads">
            <Card>
              <CardContent className="pt-6 space-y-5">
                {listingsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Skeleton className="h-24" />
                      <Skeleton className="h-24" />
                    </div>
                  </div>
                ) : listingsError || !listingsCount || listingsCount.total === 0 ? (
                  <div className="text-center py-10">
                    <Store className="h-9 w-9 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">
                      Données de marché en cours de collecte
                    </p>
                  </div>
                ) : (() => {
                  const platforms = aggregatePlatforms(listingsCount.by_platform);
                  const maxCount = Math.max(...platforms.map(p => p.count), 1);
                  return (
                    <>
                      {/* Header compact */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">Activité marché</h3>
                        <Badge variant="secondary" className="tabular-nums">
                          {listingsCount.total.toLocaleString("fr-FR")} observations · {listingsCount.period || "30j"}
                        </Badge>
                      </div>

                      {/* Platform cards grid */}
                      {platforms.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {platforms.map((p) => {
                            const visual = getPlatformVisual(p.key);
                            const Icon = visual.icon;
                            const pct = (p.count / maxCount) * 100;
                            return (
                              <div
                                key={p.key}
                                className={`rounded-lg border ${visual.borderClass} ${visual.bgClass} p-4 space-y-2`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${visual.colorClass}`} />
                                    <span className="font-semibold text-sm">{p.label}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground tabular-nums">
                                    ~{p.avg_price.toLocaleString("fr-FR")} €
                                  </span>
                                </div>
                                <div className="flex items-end justify-between gap-3">
                                  <span className="text-2xl font-bold tabular-nums">{p.count.toLocaleString("fr-FR")}</span>
                                  <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${visual.barClass}`}
                                      style={{ width: `${Math.max(pct, 4)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Conditions */}
                      {listingsCount.by_condition && listingsCount.by_condition.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Par état</h4>
                          <div className="flex flex-wrap gap-2">
                            {listingsCount.by_condition.map((c) => {
                              const style = CONDITION_STYLES[c.label.toLowerCase()] ?? "";
                              return (
                                <Badge key={c.condition} variant="outline" className={`text-xs py-1 px-2.5 ${style}`}>
                                  {c.label} ({c.count})
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Disclaimer */}
                      <p className="text-[11px] text-muted-foreground/50 italic">
                        Données agrégées — Monark ne stocke ni n'affiche les annonces individuelles des plateformes tierces.
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specs Tab */}
          {model.specs && (
            <TabsContent value="specs">
              <Card>
                <CardHeader>
                  <CardTitle>Spécifications techniques</CardTitle>
                  <CardDescription>Caractéristiques du {model.brand} {model.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Architecture */}
                  {(model.specs.chip || model.specs.architecture || model.specs.process_nm) && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Architecture</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {model.specs.chip && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Puce (GPU)</p>
                            <p className="font-semibold">{model.specs.chip}</p>
                          </div>
                        )}
                        {model.specs.architecture && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Architecture</p>
                            <p className="font-semibold">{model.specs.architecture}</p>
                          </div>
                        )}
                        {model.specs.process_nm && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Gravure</p>
                            <p className="font-semibold">{model.specs.process_nm} nm</p>
                          </div>
                        )}
                        {model.specs.cuda_cores && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Cœurs CUDA</p>
                            <p className="font-semibold">{model.specs.cuda_cores.toLocaleString('fr-FR')}</p>
                          </div>
                        )}
                        {model.specs.rt_cores && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">RT Cores</p>
                            <p className="font-semibold">{model.specs.rt_cores}</p>
                          </div>
                        )}
                        {model.specs.tensor_cores && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Tensor Cores</p>
                            <p className="font-semibold">{model.specs.tensor_cores}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mémoire */}
                  {(model.specs.vram_gb || model.specs.memory_type || model.specs.bus_width_bit || model.specs.memory_bandwidth_gbs) && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Mémoire</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {model.specs.vram_gb && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">VRAM</p>
                            <p className="font-semibold">{model.specs.vram_gb} Go</p>
                          </div>
                        )}
                        {model.specs.memory_type && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Type</p>
                            <p className="font-semibold">{model.specs.memory_type}</p>
                          </div>
                        )}
                        {model.specs.bus_width_bit && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Bus</p>
                            <p className="font-semibold">{model.specs.bus_width_bit} bits</p>
                          </div>
                        )}
                        {model.specs.memory_bandwidth_gbs && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Bande passante</p>
                            <p className="font-semibold">{model.specs.memory_bandwidth_gbs} Go/s</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fréquences */}
                  {(model.specs.base_clock_mhz || model.specs.boost_clock_mhz) && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Fréquences</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {model.specs.base_clock_mhz && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Fréquence de base</p>
                            <p className="font-semibold">{model.specs.base_clock_mhz} MHz</p>
                          </div>
                        )}
                        {model.specs.boost_clock_mhz && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Fréquence boost</p>
                            <p className="font-semibold">{model.specs.boost_clock_mhz} MHz</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alimentation & Interface */}
                  {(model.specs.tdp_w || model.specs.pcie_interface || model.specs.power_connectors || model.specs.outputs_count) && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Alimentation & Interface</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {model.specs.tdp_w && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">TDP</p>
                            <p className="font-semibold">{model.specs.tdp_w} W</p>
                          </div>
                        )}
                        {model.specs.pcie_interface && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Interface PCIe</p>
                            <p className="font-semibold">{model.specs.pcie_interface}</p>
                          </div>
                        )}
                        {model.specs.power_connectors && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Connecteurs</p>
                            <p className="font-semibold">{model.specs.power_connectors}</p>
                          </div>
                        )}
                        {model.specs.outputs_count && (
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Sorties vidéo</p>
                            <p className="font-semibold">{model.specs.outputs_count}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Technologies */}
                  {model.specs.technologies && model.specs.technologies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Technologies</h3>
                      <div className="flex flex-wrap gap-2">
                        {model.specs.technologies.map((tech: string) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Date de sortie */}
                  {model.specs.release_date && (
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Date de sortie : <span className="text-foreground">{formatDate(model.specs.release_date)}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          </Tabs>
        </section>

        {/* Constructor Variants Section */}
        {model.variants && model.variants.length > 0 && (
          <motion.section
            id="variants"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="scroll-mt-8"
          >
            <VariantsSection
              variants={model.variants}
              variantsCount={model.variants_count || model.variants.length}
            />
          </motion.section>
        )}

        {/* Modèles similaires - Section d'exploration */}
        {similarModels && similarModels.length > 0 && (
          <motion.section
            id="similar-models"
            aria-labelledby="similar-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="scroll-mt-8"
          >
            <Card>
              <CardHeader>
                <h2 id="similar-heading" className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Modèles similaires
                </h2>
                <p className="text-sm text-muted-foreground">
                  Comparez avec des modèles de même génération, performances proches ou prix comparable
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {similarModels.map((similar) => (
                    <Link
                      key={similar.id}
                      to={`/models/${similar.id}`}
                      className="group block"
                    >
                      <div className="p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-all">
                        {/* Raison de similarité */}
                        <Badge 
                          variant="outline" 
                          className="text-[9px] mb-2 w-full justify-center"
                        >
                          {similar.similarity_reason === 'generation' && 'Même génération'}
                          {similar.similarity_reason === 'performance' && 'Perfs proches'}
                          {similar.similarity_reason === 'price_range' && 'Prix comparable'}
                        </Badge>
                        
                        {/* Nom */}
                        <p className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                          {similar.brand} {similar.name}
                        </p>
                        
                        {/* Prix & Tendance */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-sm">{similar.median_price} €</span>
                          <span className={`text-xs flex items-center gap-0.5 ${
                            similar.var_30d_pct < 0 ? 'text-green-500' : 
                            similar.var_30d_pct > 0 ? 'text-red-500' : 'text-muted-foreground'
                          }`}>
                            {similar.var_30d_pct < 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : similar.var_30d_pct > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : null}
                            {formatPercent(similar.var_30d_pct)}
                          </span>
                        </div>
                        
                        {/* Bouton */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Voir le modèle
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Skeleton pour modèles similaires */}
        {similarLoading && (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
