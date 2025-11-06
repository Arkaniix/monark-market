import { useParams, useNavigate, Link } from "react-router-dom";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, TrendingUp, TrendingDown, Bell, Star, GitCompare, Calculator, Play, ChevronDown, MapPin, Clock, Info, ExternalLink, Cpu, Activity, BarChart3, Map, Sparkles, History, ChevronUp } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { toast } from "sonner";
import { mockModelInfo, mockModelSeries, mockRegionStats, mockDeals, mockSpecs, mockInsights, mockRelatedModels, estimateScrap, type ModelDeal, type ScrapEstimation } from "@/lib/modelDetailMockData";
export default function ModelDetail() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();

  // State
  const [selectedPeriod, setSelectedPeriod] = useState<"7" | "30" | "90">("30");
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showScrapDialog, setShowScrapDialog] = useState(false);
  const [scrapType, setScrapType] = useState<"faible" | "fort">("faible");
  const [scrapEstimation, setScrapEstimation] = useState<ScrapEstimation | null>(null);
  const [showSpecsJson, setShowSpecsJson] = useState(false);

  // Mock data - in real app would fetch based on id
  const model = mockModelInfo;
  const series = mockModelSeries;
  const regions = mockRegionStats;
  const deals = mockDeals;
  const specs = mockSpecs;
  const insights = mockInsights;
  const relatedModels = mockRelatedModels;

  // Filter data by period
  const getFilteredPriceData = () => {
    const days = selectedPeriod === "7" ? 7 : selectedPeriod === "30" ? 30 : 90;
    return series.price_median.slice(-days);
  };
  const getFilteredVolumeData = () => {
    const days = selectedPeriod === "7" ? 7 : selectedPeriod === "30" ? 30 : 90;
    return series.volume.slice(-days);
  };
  const priceData = getFilteredPriceData();
  const volumeData = getFilteredVolumeData();

  // Filter deals by region
  const filteredDeals = selectedRegion === "all" ? deals : deals.filter(d => d.region === selectedRegion);

  // Comparison data for bar chart
  const comparisonData = [{
    label: "Prix médian marché",
    value: model.kpi.median_30d,
    fill: "hsl(var(--chart-1))"
  }, {
    label: "Fair Value 30j",
    value: insights.fair_value_30d,
    fill: "hsl(var(--chart-2))"
  }, {
    label: "Prix achat conseillé",
    value: Math.round(insights.fair_value_30d * 0.94),
    fill: "hsl(var(--chart-3))"
  }];

  // Handlers
  const handleToggleWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    toast.success(isInWatchlist ? "Retiré de la watchlist" : "Ajouté à la watchlist");
  };
  const handleCreateAlert = () => {
    setShowAlertDialog(false);
    toast.success("Alerte créée avec succès");
  };
  const handleLaunchScrap = (type: "faible" | "fort") => {
    setScrapType(type);
    const estimation = estimateScrap(type);
    setScrapEstimation(estimation);
    setShowScrapDialog(true);
  };
  const handleConfirmScrap = () => {
    setShowScrapDialog(false);
    toast.success(`Scrap ${scrapType} lancé ! Ouverture de l'onglet...`);
    // In real app, would open new tab with filtered search
  };
  const handleCompare = () => {
    navigate(`/catalog?compare=${model.id}`);
  };
  const handleEstimate = () => {
    navigate(`/estimator?model=${model.id}`);
  };

  // Format helpers
  const formatPrice = (price: number) => `${price} €`;
  const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit"
    });
  };
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "il y a quelques minutes";
    if (diffHours < 24) return `il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `il y a ${diffDays}j`;
  };
  const getStateColor = (state: string) => {
    switch (state) {
      case "neuf":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "comme_neuf":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "bon":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "à_réparer":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };
  const getTrendIcon = (value: number) => {
    return value < 0 ? <TrendingDown className="h-4 w-4 text-green-500" /> : <TrendingUp className="h-4 w-4 text-red-500" />;
  };
  return <div className="min-h-screen py-8">
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

        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-3">{model.brand} {model.name}</h1>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{model.category}</Badge>
              <Badge variant="outline">{model.family}</Badge>
              <Badge variant="outline">{model.generation}</Badge>
              {model.is_popular && <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  <Star className="h-3 w-3 mr-1" />
                  Populaire
                </Badge>}
            </div>
          </div>

          <p className="text-muted-foreground">
            Ces données sont recalculées quotidiennement à partir des contributions de la communauté.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Prix médian 30j</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(model.kpi.median_30d)}</div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(model.kpi.var_30d_pct)}
                <span className={model.kpi.var_30d_pct < 0 ? "text-green-500" : "text-red-500"}>
                  {formatPercent(model.kpi.var_30d_pct)}
                </span>
              </div>
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
                <div className="bg-primary h-2 rounded-full transition-all" style={{
                width: `${model.kpi.rarity_index * 100}%`
              }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dernier scan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatRelativeTime(model.kpi.last_scan_at)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confiance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(model.kpi.confidence * 100).toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground mt-1">mapping modèle</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fair Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(insights.fair_value_30d)}</div>
              <p className="text-xs text-muted-foreground mt-1">30j hors outliers</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Tools */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Outils rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant={isInWatchlist ? "default" : "outline"} onClick={handleToggleWatchlist}>
                  <Bell className="h-4 w-4 mr-2" />
                  {isInWatchlist ? "Dans la watchlist" : "Ajouter à la watchlist"}
                </Button>

                <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Bell className="h-4 w-4 mr-2" />
                      Créer une alerte
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
                        <Input id="price-max" type="number" placeholder="260" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="var-pct">Variation minimale (%)</Label>
                        <Input id="var-pct" type="number" placeholder="-5" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="new-deals" />
                        <Label htmlFor="new-deals">Notifier pour nouveaux deals</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAlertDialog(false)}>Annuler</Button>
                      <Button onClick={handleCreateAlert}>Créer l'alerte</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={handleCompare}>
                  <GitCompare className="h-4 w-4 mr-2" />
                  Comparer
                </Button>

                <Button variant="outline" onClick={handleEstimate}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Estimer
                </Button>

                <Dialog open={showScrapDialog} onOpenChange={setShowScrapDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => handleLaunchScrap("faible")}>
                      <Play className="h-4 w-4 mr-2" />
                      Lancer un scrap
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Lancer un scrap pour {model.name}</DialogTitle>
                      <DialogDescription>
                        Scannez les annonces pour mettre à jour les données
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Type de scrap</Label>
                        <Select value={scrapType} onValueChange={(v: any) => {
                        setScrapType(v);
                        setScrapEstimation(estimateScrap(v));
                      }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="faible">Scrap FAIBLE (sans filtres)</SelectItem>
                            <SelectItem value="fort">Scrap FORT (avec filtres)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {scrapEstimation && <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Estimation</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Pages estimées</span>
                              <span className="font-medium">{scrapEstimation.estimated_pages}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Durée estimée</span>
                              <span className="font-medium">~{scrapEstimation.estimated_duration_min} min</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Nouvelles annonces</span>
                              <span className="font-medium">{scrapEstimation.expected_new_ads}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Mises à jour</span>
                              <span className="font-medium">{scrapEstimation.expected_updates}</span>
                            </div>
                          </CardContent>
                        </Card>}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowScrapDialog(false)}>Annuler</Button>
                      <Button onClick={handleConfirmScrap}>
                        <Play className="h-4 w-4 mr-2" />
                        Lancer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" asChild>
                  
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="space-y-6">
          {/* Period Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-2">
                  <Button variant={selectedPeriod === "7" ? "default" : "outline"} size="sm" onClick={() => setSelectedPeriod("7")}>
                    7j
                  </Button>
                  <Button variant={selectedPeriod === "30" ? "default" : "outline"} size="sm" onClick={() => setSelectedPeriod("30")}>
                    30j
                  </Button>
                  <Button variant={selectedPeriod === "90" ? "default" : "outline"} size="sm" onClick={() => setSelectedPeriod("90")}>
                    90j
                  </Button>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center space-x-2">
                  <Switch id="moving-avg" checked={showMovingAverage} onCheckedChange={setShowMovingAverage} />
                  <Label htmlFor="moving-avg">Moyenne mobile 7j</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Evolution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Évolution du prix médian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tickFormatter={formatDateShort} className="text-xs" />
                    <YAxis tickFormatter={value => `${value}€`} className="text-xs" />
                    <Tooltip formatter={(value: any) => [`${value}€`, '']} labelFormatter={formatDate} />
                    <Legend />
                    <Area type="monotone" dataKey="p75" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.1} name="P75" />
                    <Area type="monotone" dataKey="p25" stroke="none" fill="hsl(var(--background))" fillOpacity={1} name="P25" />
                    <Line type="monotone" dataKey="median" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Médiane" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Volume d'annonces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tickFormatter={formatDateShort} className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip labelFormatter={formatDate} />
                      <Legend />
                      <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Annonces actives" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Price Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribution des prix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series.histogram}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="bucket" tickFormatter={value => `${value}€`} className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip formatter={(value: any) => [`${value} annonces`, '']} labelFormatter={value => `~${value}€`} />
                      <Bar dataKey="count" fill="hsl(var(--chart-3))" name="Annonces" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Comparatif prix médian vs estimations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tickFormatter={value => `${value}€`} className="text-xs" />
                    <YAxis type="category" dataKey="label" width={150} className="text-xs" />
                    <Tooltip formatter={(value: any) => [`${value}€`, '']} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {comparisonData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Regional Map */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4
      }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Prix moyens par région
              </CardTitle>
              <CardDescription>
                Filtrer les opportunités par région
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regions.map(region => <div key={region.code} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setSelectedRegion(region.code)}>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{region.name}</p>
                        <p className="text-xs text-muted-foreground">{region.volume} annonces</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatPrice(region.median)}</p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(region.var_30d_pct)}
                        <span className={`text-xs ${region.var_30d_pct < 0 ? "text-green-500" : "text-red-500"}`}>
                          {formatPercent(region.var_30d_pct)}
                        </span>
                      </div>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Opportunities */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Meilleures opportunités
                </CardTitle>
                {selectedRegion !== "all" && <Button variant="outline" size="sm" onClick={() => setSelectedRegion("all")}>
                    Afficher toutes les régions
                  </Button>}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prix</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map(deal => <TableRow key={deal.ad_id}>
                      <TableCell>
                        <div className="font-bold text-lg">{formatPrice(deal.price)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{deal.city}</p>
                            <p className="text-xs text-muted-foreground">{deal.region}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStateColor(deal.state)}>{deal.state.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${getScoreColor(deal.score)}`}>{deal.score}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(deal.published_at)}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" asChild>
                          <a href={deal.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Voir
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Specs & Insights */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.6
      }} className="grid md:grid-cols-2 gap-6">
          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Spécifications techniques
              </CardTitle>
              <CardDescription>Source : {specs.source}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(specs.specs_core).map(([key, value]) => <div key={key} className="space-y-1">
                    <p className="text-xs text-muted-foreground">{key.replace(/_/g, " ")}</p>
                    <p className="font-medium">{value}</p>
                  </div>)}
              </div>

              <Collapsible open={showSpecsJson} onOpenChange={setShowSpecsJson}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    {showSpecsJson ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                    {showSpecsJson ? "Masquer" : "Voir"} specs complètes (JSON)
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                    {JSON.stringify(specs.specs_json, null, 2)}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Analyses & Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Fair Value 30j</p>
                  <p className="text-2xl font-bold">{formatPrice(insights.fair_value_30d)}</p>
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Score moyen des deals</p>
                  <p className="text-2xl font-bold">{insights.deal_score_avg}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Var 7j</p>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(insights.var_7d_pct)}
                      <span className={`font-medium ${insights.var_7d_pct < 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatPercent(insights.var_7d_pct)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Var 90j</p>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(insights.var_90d_pct)}
                      <span className={`font-medium ${insights.var_90d_pct < 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatPercent(insights.var_90d_pct)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Probabilité revente rapide</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{
                        width: `${insights.resell_probability * 100}%`
                      }} />
                      </div>
                    </div>
                    <span className="font-bold">{(insights.resell_probability * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm font-medium mb-2">💡 Recommandation</p>
                <p className="text-sm text-muted-foreground">{insights.advice}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Models */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.7
      }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Modèles similaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedModels.map(related => <Link key={related.id} to={`/model/${related.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                      <CardHeader className="pb-3">
                        <Badge variant="outline" className="w-fit mb-2">{related.category}</Badge>
                        <CardTitle className="text-base leading-tight">{related.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{related.brand}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs text-muted-foreground">Prix médian</span>
                            <span className="font-bold">{formatPrice(related.median_30d)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Volume</span>
                            <span className="font-medium">{related.volume}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Var 30j</span>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(related.var_30d_pct)}
                              <span className={`text-sm font-medium ${related.var_30d_pct < 0 ? "text-green-500" : "text-red-500"}`}>
                                {formatPercent(related.var_30d_pct)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Methodology */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.8
      }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Méthodologie & RGPD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Prix calculés à partir d'annonces collectées via extension (scraping manuel)</p>
              <p>• Médiane calculée hors outliers (MAD ou bornes P10-P90)</p>
              <p>• Aucune exposition publique des titres/descriptions/images scrappées</p>
              <p>• Les spécifications proviennent de sources externes fiables</p>
              <div className="pt-2">
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link to="/trends">En savoir plus sur notre méthodologie →</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>;
}