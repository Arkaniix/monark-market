import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
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
  Heart
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

const ITEMS_PER_PAGE = 12;

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

  const totalPages = Math.ceil(filteredDeals.length / ITEMS_PER_PAGE);
  const paginatedDeals = filteredDeals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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
                  <TrendingDown className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Prix médian 7j</p>
                </div>
                <div className="text-2xl font-bold">{marketSummary.median_price_7d}€</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-success" />
                  <p className="text-xs text-muted-foreground">Variation</p>
                </div>
                <div className="text-2xl font-bold text-success">{marketSummary.price_variation}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-accent" />
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

          <p className="text-xs text-muted-foreground">
            Dernière mise à jour : {formatDistanceToNow(new Date(marketSummary.last_update), { addSuffix: true, locale: fr })}
          </p>
        </div>

        <Separator className="my-8" />

        {/* 2. FILTRES RAPIDES ET TRI */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Filtres & Tri</span>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
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

            <div className="grid md:grid-cols-3 gap-4 mb-4">
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

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Prix: {priceRange[0]}€ - {priceRange[1]}€
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={2000}
                step={50}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. LISTE DES DEALS */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {filteredDeals.length} opportunité{filteredDeals.length > 1 ? "s" : ""} disponible{filteredDeals.length > 1 ? "s" : ""}
          </h2>

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
                  
                  return (
                    <motion.div key={deal.ad_id} variants={itemVariants}>
                      <Card className="hover:border-primary transition-all hover:shadow-xl group">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex gap-2 flex-wrap">
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
                            <div className="text-right">
                              <div className="text-2xl font-bold">{deal.price}€</div>
                              <div className="text-xs text-muted-foreground line-through">
                                {deal.fair_value}€
                              </div>
                            </div>
                          </div>
                          <CardTitle className="text-base leading-tight line-clamp-2">
                            {deal.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm flex-wrap">
                              <Badge variant="secondary">{deal.category}</Badge>
                              <Badge variant="outline">{deal.state}</Badge>
                              <Badge variant="outline" className="gap-1">
                                <Package className="h-3 w-3" />
                                {deal.seller_type}
                              </Badge>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                {deal.city}, {deal.region}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                {formatDistanceToNow(new Date(deal.publication_date), { addSuffix: true, locale: fr })}
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
                Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredDeals.length)} sur {filteredDeals.length}
              </p>
            </>
          )}
        </div>

        <Separator className="my-12" />

        {/* 4. APERÇU DU MARCHÉ */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Aperçu du marché
          </h2>

          {/* Graphiques globaux */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Prix médians par catégorie (30j)</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>Volume d'annonces actives (30j)</CardTitle>
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
          <Card>
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
                    {topModels.map((model, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{model.model}</td>
                        <td className="p-2">
                          <Badge variant="secondary">{model.category}</Badge>
                        </td>
                        <td className="p-2 text-right font-bold">{model.current_price}€</td>
                        <td className="p-2 text-right">
                          <span className={model.variation_30d < 0 ? "text-success" : "text-destructive"}>
                            {model.variation_30d > 0 ? "+" : ""}{model.variation_30d.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <Badge variant={getScoreColor(model.avg_score)}>{model.avg_score}</Badge>
                        </td>
                        <td className="p-2 text-right text-muted-foreground">{model.ads_count}</td>
                      </tr>
                    ))}
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
        <Card className="mb-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              À propos de nos données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
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
            <div className="pt-2">
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link to="/community">Apprenez à contribuer →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7. CTA COMMUNAUTÉ */}
      <Link to="/community">
        <Button
          size="lg"
          className="fixed bottom-8 right-8 shadow-2xl gap-2 z-50 animate-pulse hover:animate-none"
        >
          <Heart className="h-5 w-5" />
          Contribue aux deals
        </Button>
      </Link>
    </div>
  );
}
