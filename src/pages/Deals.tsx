import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Flame,
  MapPin,
  Calendar,
  TrendingDown,
  TrendingUp,
  Package,
  Truck,
  ExternalLink,
  RotateCcw,
  Info,
  Sparkles,
  BarChart3,
  Heart,
  DollarSign,
  Activity,
  User,
  Building2,
  ArrowUp,
  ArrowDown,
  Cpu,
  HardDrive,
  CircuitBoard,
  MemoryStick,
  Download
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { marketDeals, marketSummary, topModels, marketTrendData, volumeData } from "@/lib/marketMockData";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Deals() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterDelivery, setFilterDelivery] = useState("all");
  const [filterNewness, setFilterNewness] = useState("all");
  const [filterDiscount, setFilterDiscount] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState("score");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [chartPeriod, setChartPeriod] = useState("30");
  const [chartMode, setChartMode] = useState<"value" | "percent">("value");
  const [strongScrapOnly, setStrongScrapOnly] = useState(false);

  const filteredDeals = useMemo(() => {
    let filtered = [...marketDeals];

    // Filtres
    if (filterCategory !== "all") {
      filtered = filtered.filter(d => d.category === filterCategory);
    }
    if (filterState !== "all") {
      filtered = filtered.filter(d => d.state === filterState);
    }
    if (filterRegion !== "all") {
      filtered = filtered.filter(d => d.region === filterRegion);
    }
    if (filterDelivery !== "all") {
      filtered = filtered.filter(d => filterDelivery === "yes" ? d.delivery_possible : !d.delivery_possible);
    }
    if (filterNewness !== "all") {
      const hours = parseInt(filterNewness);
      filtered = filtered.filter(d => {
        const pubDate = new Date(d.publication_date);
        const hoursDiff = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= hours;
      });
    }
    if (filterDiscount !== "all") {
      const discountPct = parseInt(filterDiscount);
      filtered = filtered.filter(d => {
        const discount = ((d.fair_value - d.price) / d.fair_value) * 100;
        return discount >= discountPct;
      });
    }
    filtered = filtered.filter(d => d.price >= priceRange[0] && d.price <= priceRange[1]);

    // Tri
    if (sortBy === "score") {
      filtered.sort((a, b) => b.score - a.score);
    } else if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime());
    }

    return filtered;
  }, [filterCategory, filterState, filterRegion, filterDelivery, filterNewness, filterDiscount, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  const paginatedDeals = filteredDeals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setFilterCategory("all");
    setFilterState("all");
    setFilterRegion("all");
    setFilterDelivery("all");
    setFilterNewness("all");
    setFilterDiscount("all");
    setPriceRange([0, 2000]);
    setSortBy("score");
    setCurrentPage(1);
    setStrongScrapOnly(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "outline";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Correct";
    return "Standard";
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 85) return { label: "Top deal", variant: "default" as const };
    if (score >= 70) return { label: "Bon plan", variant: "secondary" as const };
    return { label: "À surveiller", variant: "outline" as const };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "GPU": return Cpu;
      case "CPU": return Cpu;
      case "RAM": return MemoryStick;
      case "SSD": return HardDrive;
      case "Motherboard": return CircuitBoard;
      default: return Package;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-7xl">
        {/* 1. EN-TÊTE */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            💸 Les meilleures opportunités du moment
          </h1>
          <p className="text-muted-foreground mb-6">
            Découvrez les annonces les plus intéressantes selon nos analyses de marché, mises à jour grâce aux contributions de la communauté.
          </p>

          {/* Indicateurs synthétiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Prix médian 7j</p>
                </div>
                <div className="text-2xl font-bold">{marketSummary.median_price_7d}€</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help">
                          {marketSummary.price_variation < 0 ? (
                            <TrendingDown className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-destructive" />
                          )}
                          <p className="text-xs text-muted-foreground">Variation</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Basé sur la moyenne glissante 7 jours</p>
                        <p className="text-xs">Actualisé quotidiennement</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className={`text-2xl font-bold ${marketSummary.price_variation < 0 ? 'text-success' : 'text-destructive'}`}>
                  {marketSummary.price_variation}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-accent" />
                  <p className="text-xs text-muted-foreground">Annonces actives</p>
                </div>
                <div className="text-2xl font-bold">{marketSummary.total_active_ads}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Nouveaux deals</p>
                </div>
                <div className="text-2xl font-bold">{marketSummary.new_deals_today}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              Dernière mise à jour : {formatDistanceToNow(new Date(marketSummary.last_update), { addSuffix: true, locale: fr })}
            </p>
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 20, repeat: Infinity }}
              />
            </div>
            <p className="text-xs text-muted-foreground">auto-refresh dans 20 min</p>
          </div>
        </div>

        <Separator className="my-8" />

        {/* 2. FILTRES RAPIDES ET TRI */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Filtres & Tri</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    <SelectItem value="GPU">GPU</SelectItem>
                    <SelectItem value="CPU">CPU</SelectItem>
                    <SelectItem value="RAM">RAM</SelectItem>
                    <SelectItem value="SSD">SSD</SelectItem>
                    <SelectItem value="Motherboard">Carte mère</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>État</Label>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger>
                    <SelectValue placeholder="État" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous états</SelectItem>
                    <SelectItem value="Neuf">Neuf</SelectItem>
                    <SelectItem value="Comme neuf">Comme neuf</SelectItem>
                    <SelectItem value="Bon">Bon</SelectItem>
                    <SelectItem value="À réparer">À réparer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Région</Label>
                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Région" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes régions</SelectItem>
                    <SelectItem value="Île-de-France">Île-de-France</SelectItem>
                    <SelectItem value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</SelectItem>
                    <SelectItem value="Provence-Alpes-Côte d'Azur">PACA</SelectItem>
                    <SelectItem value="Occitanie">Occitanie</SelectItem>
                    <SelectItem value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Livraison</Label>
                <Select value={filterDelivery} onValueChange={setFilterDelivery}>
                  <SelectTrigger>
                    <SelectValue placeholder="Livraison" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Peu importe</SelectItem>
                    <SelectItem value="yes">Oui</SelectItem>
                    <SelectItem value="no">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Nouveautés</Label>
                <Select value={filterNewness} onValueChange={setFilterNewness}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nouveautés" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="24">&lt;24h</SelectItem>
                    <SelectItem value="72">&lt;3 jours</SelectItem>
                    <SelectItem value="168">&lt;7 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sous-évaluées</Label>
                <Select value={filterDiscount} onValueChange={setFilterDiscount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sous-évaluées" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="10">&gt;10%</SelectItem>
                    <SelectItem value="20">&gt;20%</SelectItem>
                    <SelectItem value="30">&gt;30%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trier par</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Meilleur deal</SelectItem>
                    <SelectItem value="price_asc">Prix croissant</SelectItem>
                    <SelectItem value="price_desc">Prix décroissant</SelectItem>
                    <SelectItem value="recent">Plus récents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Prix</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-primary">{priceRange[0]}€</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-sm font-medium text-primary">{priceRange[1]}€</span>
                </div>
              </div>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={2000}
                step={50}
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 0 && val <= priceRange[1]) {
                      setPriceRange([val, priceRange[1]]);
                    }
                  }}
                  min={0}
                  max={priceRange[1]}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= priceRange[0] && val <= 2000) {
                      setPriceRange([priceRange[0], val]);
                    }
                  }}
                  min={priceRange[0]}
                  max={2000}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="strong-scrap"
                  checked={strongScrapOnly}
                  onCheckedChange={setStrongScrapOnly}
                />
                <Label htmlFor="strong-scrap" className="cursor-pointer">Scrap fort uniquement</Label>
              </div>
              <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 3. LISTE DES DEALS */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              <span className="text-primary">{filteredDeals.length}</span> / {marketDeals.length} opportunité{filteredDeals.length > 1 ? "s" : ""}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Par page:</Label>
                <Select value={itemsPerPage.toString()} onValueChange={(v) => {
                  setItemsPerPage(Number(v));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map(option => (
                      <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {filterCategory !== "all" || filterState !== "all" || filterRegion !== "all" ? (
            <p className="text-sm text-muted-foreground mb-4">
              Filtres actifs: {filterCategory !== "all" && `${filterCategory} • `}
              {filterState !== "all" && `${filterState} • `}
              {filterRegion !== "all" && `${filterRegion} • `}
              Tri: {sortBy === "score" ? "Meilleur deal" : sortBy === "price_asc" ? "Prix croissant" : sortBy === "price_desc" ? "Prix décroissant" : "Plus récents"}
            </p>
          ) : null}

          {paginatedDeals.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <p className="mb-4">Aucun deal trouvé avec ces critères.</p>
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {paginatedDeals.map((deal) => {
                  const discount = Math.round(((deal.fair_value - deal.price) / deal.fair_value) * 100);
                  const perfBadge = getPerformanceBadge(deal.score);
                  const isHighValue = discount >= 15;
                  
                  return (
                    <motion.div key={deal.ad_id} variants={itemVariants}>
                      <Card className="hover:border-primary transition-all hover:shadow-xl group h-full flex flex-col">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant={perfBadge.variant} className="gap-1">
                                {perfBadge.label}
                              </Badge>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant={getScoreColor(deal.score)} className="gap-1">
                                      {deal.score >= 85 && <Flame className="h-3 w-3" />}
                                      {deal.score}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getScoreLabel(deal.score)}</p>
                                    <p className="text-xs">-{discount}% vs prix marché</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {deal.labels.map((label, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <Badge variant="secondary" className="mb-2 text-xs">
                                {formatDistanceToNow(new Date(deal.publication_date), { addSuffix: true, locale: fr })}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {isHighValue && <span className="text-lg">⚡</span>}
                                <div className="text-2xl font-bold">{deal.price}€</div>
                              </div>
                              <div className="text-xs text-muted-foreground line-through">
                                {deal.fair_value}€
                              </div>
                            </div>
                          </div>
                          <CardTitle className="text-base leading-tight line-clamp-2">
                            {deal.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2 text-sm flex-wrap">
                              <Badge variant="secondary">{deal.category}</Badge>
                              <Badge variant="outline">{deal.state}</Badge>
                              <Badge variant="outline" className="gap-1">
                                {deal.seller_type === "particulier" ? (
                                  <User className="h-3 w-3" />
                                ) : (
                                  <Building2 className="h-3 w-3" />
                                )}
                                {deal.seller_type}
                              </Badge>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                {deal.city}, {deal.region}
                              </div>
                              {deal.delivery_possible && (
                                <div className="flex items-center gap-2 text-success">
                                  <Truck className="h-4 w-4 flex-shrink-0" />
                                  Livraison disponible
                                </div>
                              )}
                            </div>

                            <div className="pt-3 border-t flex items-center justify-between">
                              <div className="flex items-center gap-1 text-sm">
                                <TrendingDown className="h-4 w-4 text-success" />
                                <span className="font-medium text-success">
                                  -{discount}%
                                </span>
                                <span className="text-xs text-muted-foreground">vs marché</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Économie: {deal.fair_value - deal.price}€
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <Button className="flex-1" variant="default" size="sm" asChild>
                                <Link to={`/ad/${deal.ad_id}`}>
                                  Voir détails
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a href={deal.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* 6. PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-4">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
                {Math.min(currentPage * itemsPerPage, filteredDeals.length)} sur {filteredDeals.length}
              </p>
            </>
          )}
        </div>

        <Separator className="my-12" />

        {/* 4. APERÇU DU MARCHÉ */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Aperçu du marché
            </h2>
            <div className="flex items-center gap-4">
              <Select value={chartPeriod} onValueChange={setChartPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  variant={chartMode === "value" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartMode("value")}
                >
                  Valeur
                </Button>
                <Button
                  variant={chartMode === "percent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartMode("percent")}
                >
                  %
                </Button>
              </div>
            </div>
          </div>

          {/* Graphiques globaux */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Prix médians par catégorie ({chartPeriod}j)</CardTitle>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={marketTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "12px" }} />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="gpu" stroke="hsl(var(--primary))" name="GPU" strokeWidth={2} />
                    <Line type="monotone" dataKey="cpu" stroke="hsl(var(--accent))" name="CPU" strokeWidth={2} />
                    <Line type="monotone" dataKey="ram" stroke="hsl(var(--success))" name="RAM" strokeWidth={2} />
                    <Line type="monotone" dataKey="ssd" stroke="hsl(var(--muted-foreground))" name="SSD" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Volume d'annonces actives ({chartPeriod}j)</CardTitle>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "12px" }} />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="Annonces" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top modèles */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Top modèles du moment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Modèle</th>
                      <th className="text-left p-2">Catégorie</th>
                      <th className="text-right p-2">Prix médian</th>
                      <th className="text-right p-2">Variation 30j</th>
                      <th className="text-right p-2">Score moyen</th>
                      <th className="text-right p-2">Annonces</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topModels.map((model, idx) => {
                      const CategoryIcon = getCategoryIcon(model.category);
                      return (
                        <tr 
                          key={idx} 
                          className="border-b hover:bg-muted/50 cursor-pointer transition-colors group"
                          onClick={() => window.location.href = `/catalog?search=${model.model}`}
                        >
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium group-hover:text-primary">{model.model}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant="secondary">{model.category}</Badge>
                          </td>
                          <td className="p-2 text-right font-bold">{model.current_price}€</td>
                          <td className="p-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <div 
                                className={`h-1 w-12 rounded-full ${model.variation_30d < 0 ? 'bg-success' : 'bg-destructive'}`}
                                style={{ 
                                  opacity: Math.abs(model.variation_30d) / 20,
                                }}
                              />
                              {model.variation_30d < 0 ? (
                                <ArrowDown className="h-3 w-3 text-success" />
                              ) : (
                                <ArrowUp className="h-3 w-3 text-destructive" />
                              )}
                              <span className={model.variation_30d < 0 ? "text-success" : "text-destructive"}>
                                {model.variation_30d > 0 ? "+" : ""}{model.variation_30d.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant={getScoreColor(model.avg_score)} className="cursor-help">
                                    {model.avg_score}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Score calculé selon fiabilité du vendeur,</p>
                                  <p className="text-xs">état et économie moyenne</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="p-2 text-right text-muted-foreground">{model.ads_count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/trends">Voir toutes les tendances</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5. MÉTHODOLOGIE */}
        <Card className="mb-8 bg-muted/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ℹ️ À propos de nos données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              • Les prix et indices sont calculés à partir des données collectées par les utilisateurs via notre extension navigateur.
            </p>
            <p>
              • Les prix médians sont recalculés chaque jour à partir des annonces actives.
            </p>
            <p>
              • Les scores de deals sont obtenus en comparant le prix de l'annonce à la valeur de marché estimée (Fair Value).
            </p>
            <p>
              • Les données sont anonymisées et agrégées conformément au RGPD.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link to="/community">Apprenez à contribuer →</Link>
              </Button>
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link to="/faq">Voir comment les données sont calculées →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7. CTA COMMUNAUTÉ */}
      <Link to="/scrap">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
        >
          <Button
            size="lg"
            className="fixed bottom-8 right-8 shadow-2xl gap-2 z-50 hover:scale-110 transition-transform"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🟢
            </motion.div>
            <Heart className="h-5 w-5" />
            Scrap communautaire disponible
          </Button>
        </motion.div>
      </Link>
    </div>
  );
}
