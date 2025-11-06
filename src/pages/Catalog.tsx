import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List,
  X,
  Package,
  Activity,
  Info,
  Heart,
  ExternalLink,
  BarChart3,
  Eye,
  Sparkles
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { catalogModels, catalogSummary, facetOptions } from "@/lib/catalogMockData";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ITEMS_PER_PAGE = 24;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.02 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [watchlist, setWatchlist] = useState<number[]>([]);

  // Filtres
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category")?.split(",") || []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brand")?.split(",") || []
  );
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>(
    searchParams.get("family")?.split(",") || []
  );
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("price_min") || "0"),
    parseInt(searchParams.get("price_max") || "2000")
  ]);
  const [variationRange, setVariationRange] = useState([
    parseInt(searchParams.get("var_min") || "-50"),
    parseInt(searchParams.get("var_max") || "50")
  ]);
  const [volumeRange, setVolumeRange] = useState([
    parseInt(searchParams.get("vol_min") || "0"),
    parseInt(searchParams.get("vol_max") || "500")
  ]);
  const [rarityRange, setRarityRange] = useState([
    parseFloat(searchParams.get("rarity_min") || "0"),
    parseFloat(searchParams.get("rarity_max") || "1")
  ]);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance");

  // Mettre à jour URL quand les filtres changent
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedCategories.length) params.category = selectedCategories.join(",");
    if (selectedBrands.length) params.brand = selectedBrands.join(",");
    if (selectedFamilies.length) params.family = selectedFamilies.join(",");
    if (priceRange[0] > 0) params.price_min = priceRange[0].toString();
    if (priceRange[1] < 2000) params.price_max = priceRange[1].toString();
    if (variationRange[0] > -50) params.var_min = variationRange[0].toString();
    if (variationRange[1] < 50) params.var_max = variationRange[1].toString();
    if (volumeRange[0] > 0) params.vol_min = volumeRange[0].toString();
    if (volumeRange[1] < 500) params.vol_max = volumeRange[1].toString();
    if (rarityRange[0] > 0) params.rarity_min = rarityRange[0].toString();
    if (rarityRange[1] < 1) params.rarity_max = rarityRange[1].toString();
    if (sortBy !== "relevance") params.sort = sortBy;
    
    setSearchParams(params);
  }, [
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedFamilies,
    priceRange,
    variationRange,
    volumeRange,
    rarityRange,
    sortBy,
    setSearchParams
  ]);

  const filteredModels = useMemo(() => {
    let filtered = [...catalogModels];

    // Recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.brand.toLowerCase().includes(query) ||
          m.family.toLowerCase().includes(query) ||
          m.aliases.some((a) => a.toLowerCase().includes(query))
      );
    }

    // Filtres par facettes
    if (selectedCategories.length) {
      filtered = filtered.filter((m) => selectedCategories.includes(m.category));
    }
    if (selectedBrands.length) {
      filtered = filtered.filter((m) => selectedBrands.includes(m.brand));
    }
    if (selectedFamilies.length) {
      filtered = filtered.filter((m) => selectedFamilies.includes(m.family));
    }

    // Filtres de range
    filtered = filtered.filter(
      (m) =>
        m.stats.price_median_30d >= priceRange[0] &&
        m.stats.price_median_30d <= priceRange[1] &&
        m.stats.var_30d_pct >= variationRange[0] &&
        m.stats.var_30d_pct <= variationRange[1] &&
        m.stats.ads_volume >= volumeRange[0] &&
        m.stats.ads_volume <= volumeRange[1] &&
        m.stats.rarity_index >= rarityRange[0] &&
        m.stats.rarity_index <= rarityRange[1]
    );

    // Tri
    if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.stats.price_median_30d - b.stats.price_median_30d);
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.stats.price_median_30d - a.stats.price_median_30d);
    } else if (sortBy === "var30") {
      filtered.sort((a, b) => a.stats.var_30d_pct - b.stats.var_30d_pct);
    } else if (sortBy === "volume") {
      filtered.sort((a, b) => b.stats.ads_volume - a.stats.ads_volume);
    } else if (sortBy === "rarity") {
      filtered.sort((a, b) => a.stats.rarity_index - b.stats.rarity_index);
    } else if (sortBy === "last_scan") {
      filtered.sort(
        (a, b) =>
          new Date(b.stats.last_scan_at).getTime() - new Date(a.stats.last_scan_at).getTime()
      );
    }

    return filtered;
  }, [
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedFamilies,
    priceRange,
    variationRange,
    volumeRange,
    rarityRange,
    sortBy
  ]);

  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedFamilies([]);
    setPriceRange([0, 2000]);
    setVariationRange([-50, 50]);
    setVolumeRange([0, 500]);
    setRarityRange([0, 1]);
    setSortBy("relevance");
    setCurrentPage(1);
  };

  const activeFiltersCount =
    selectedCategories.length +
    selectedBrands.length +
    selectedFamilies.length +
    (priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0) +
    (variationRange[0] > -50 || variationRange[1] < 50 ? 1 : 0) +
    (volumeRange[0] > 0 || volumeRange[1] < 500 ? 1 : 0) +
    (rarityRange[0] > 0 || rarityRange[1] < 1 ? 1 : 0);

  const removeFilter = (type: string, value?: string) => {
    if (type === "category") {
      setSelectedCategories((prev) => prev.filter((c) => c !== value));
    } else if (type === "brand") {
      setSelectedBrands((prev) => prev.filter((b) => b !== value));
    } else if (type === "family") {
      setSelectedFamilies((prev) => prev.filter((f) => f !== value));
    } else if (type === "price") {
      setPriceRange([0, 2000]);
    } else if (type === "variation") {
      setVariationRange([-50, 50]);
    } else if (type === "volume") {
      setVolumeRange([0, 500]);
    } else if (type === "rarity") {
      setRarityRange([0, 1]);
    }
  };

  const toggleWatchlist = (modelId: number) => {
    setWatchlist((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  };

  const getRarityLabel = (index: number) => {
    if (index < 0.25) return "Très rare";
    if (index < 0.5) return "Rare";
    if (index < 0.75) return "Peu courant";
    return "Commun";
  };

  const getRarityColor = (index: number) => {
    if (index < 0.25) return "destructive";
    if (index < 0.5) return "default";
    if (index < 0.75) return "secondary";
    return "outline";
  };

  const FiltersSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Catégorie</h3>
        <div className="space-y-2">
          {facetOptions.categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCategories([...selectedCategories, cat]);
                  } else {
                    setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Marque</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {facetOptions.brands.slice(0, 15).map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedBrands([...selectedBrands, brand]);
                  } else {
                    setSelectedBrands(selectedBrands.filter((b) => b !== brand));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Prix médian (€)</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{priceRange[0]}€</span>
            <span>{priceRange[1]}€</span>
          </div>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={2000}
            step={50}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Variation 30j (%)</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{variationRange[0]}%</span>
            <span>{variationRange[1]}%</span>
          </div>
          <Slider
            value={variationRange}
            onValueChange={setVariationRange}
            min={-50}
            max={50}
            step={5}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Volume d'annonces</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{volumeRange[0]}</span>
            <span>{volumeRange[1]}</span>
          </div>
          <Slider
            value={volumeRange}
            onValueChange={setVolumeRange}
            min={0}
            max={500}
            step={10}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Rareté</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Rare</span>
            <span>Commun</span>
          </div>
          <Slider
            value={rarityRange}
            onValueChange={setRarityRange}
            min={0}
            max={1}
            step={0.1}
          />
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={resetFilters}>
        Réinitialiser tous les filtres
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-7xl">
        {/* 1. EN-TÊTE */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Catalogue des composants</h1>
          <p className="text-muted-foreground mb-6">
            Explore, filtre et compare les composants d'occasion : prix médian, tendances et disponibilité.
          </p>

          {/* Indicateurs rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Prix médian global</p>
                </div>
                <div className="text-2xl font-bold">{catalogSummary.median_price_global}€</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-success" />
                  <p className="text-xs text-muted-foreground">Variation moyenne</p>
                </div>
                <div className={`text-2xl font-bold ${catalogSummary.avg_variation < 0 ? "text-success" : "text-destructive"}`}>
                  {catalogSummary.avg_variation > 0 ? "+" : ""}{catalogSummary.avg_variation}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-accent" />
                  <p className="text-xs text-muted-foreground">Annonces actives</p>
                </div>
                <div className="text-2xl font-bold">{catalogSummary.total_ads}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Modèles</p>
                </div>
                <div className="text-2xl font-bold">{catalogSummary.total_models}</div>
              </CardContent>
            </Card>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Dernier scan : {formatDistanceToNow(new Date(catalogSummary.last_scan), { addSuffix: true, locale: fr })}
          </p>
        </div>

        <Separator className="my-8" />

        {/* 2. RECHERCHE */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un modèle (ex: RTX 4060, Ryzen 7...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-6">
          {/* 3. FILTRES SIDEBAR (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Filtres</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="default">{activeFiltersCount}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FiltersSidebar />
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            {/* Filtres Mobile */}
            <div className="lg:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <Badge variant="default" className="ml-auto">{activeFiltersCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Chips filtres actifs */}
            {activeFiltersCount > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-1">
                    {cat}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFilter("category", cat)}
                    />
                  </Badge>
                ))}
                {selectedBrands.map((brand) => (
                  <Badge key={brand} variant="secondary" className="gap-1">
                    {brand}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFilter("brand", brand)}
                    />
                  </Badge>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                  <Badge variant="secondary" className="gap-1">
                    Prix: {priceRange[0]}-{priceRange[1]}€
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("price")} />
                  </Badge>
                )}
              </div>
            )}

            {/* 4. TRI & AFFICHAGE */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredModels.length} modèle{filteredModels.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Pertinence</SelectItem>
                    <SelectItem value="price_asc">Prix croissant</SelectItem>
                    <SelectItem value="price_desc">Prix décroissant</SelectItem>
                    <SelectItem value="var30">Variation 30j</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                    <SelectItem value="rarity">Rareté</SelectItem>
                    <SelectItem value="last_scan">Dernier scan</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 5. GRILLE/LISTE MODÈLES */}
            {paginatedModels.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <p className="mb-4">Aucun composant ne correspond à vos filtres.</p>
                  <Button variant="outline" onClick={resetFilters}>
                    Effacer filtres
                  </Button>
                </div>
              </Card>
            ) : viewMode === "grid" ? (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {paginatedModels.map((model) => (
                    <motion.div key={model.id} variants={itemVariants}>
                      <Card className="hover:border-primary transition-all hover:shadow-xl h-full flex flex-col">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline">{model.category}</Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant={getRarityColor(model.stats.rarity_index)}>
                                    {getRarityLabel(model.stats.rarity_index)}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Indice de rareté: {model.stats.rarity_index.toFixed(2)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <CardTitle className="text-lg leading-tight">{model.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{model.brand}</p>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-baseline justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">Prix médian</p>
                                <p className="text-2xl font-bold">{model.stats.price_median_30d}€</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Volume</p>
                                <p className="text-lg font-semibold">{model.stats.ads_volume}</p>
                              </div>
                            </div>

                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">Variation 30j</p>
                              <div
                                className={`flex items-center gap-1 font-medium ${
                                  model.stats.var_30d_pct < 0 ? "text-success" : "text-destructive"
                                }`}
                              >
                                {model.stats.var_30d_pct < 0 ? (
                                  <TrendingDown className="h-4 w-4" />
                                ) : (
                                  <TrendingUp className="h-4 w-4" />
                                )}
                                <span>
                                  {model.stats.var_30d_pct > 0 ? "+" : ""}
                                  {model.stats.var_30d_pct.toFixed(1)}%
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Évolution prix</p>
                              <ResponsiveContainer width="100%" height={50}>
                                <LineChart data={model.sparkline_30d.map((price, i) => ({ i, price }))}>
                                  <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke={
                                      model.stats.var_30d_pct < 0
                                        ? "hsl(var(--success))"
                                        : "hsl(var(--destructive))"
                                    }
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            <p className="text-xs text-muted-foreground pt-2 border-t">
                              Dernier scan :{" "}
                              {formatDistanceToNow(new Date(model.stats.last_scan_at), {
                                addSuffix: true,
                                locale: fr
                              })}
                            </p>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button variant="default" size="sm" className="flex-1" asChild>
                              <Link to={`/model/${model.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Fiche
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <Link to={`/deals?model_id=${model.id}`}>
                                <BarChart3 className="h-4 w-4 mr-1" />
                                Deals
                              </Link>
                            </Button>
                            <Button
                              variant={watchlist.includes(model.id) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleWatchlist(model.id)}
                            >
                              <Heart
                                className={`h-4 w-4 ${watchlist.includes(model.id) ? "fill-current" : ""}`}
                              />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* 7. PAGINATION */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className={
                              currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                            }
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
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}

                <p className="text-center text-sm text-muted-foreground mt-4">
                  Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredModels.length)} sur{" "}
                  {filteredModels.length}
                </p>
              </>
            ) : (
              // Mode Liste
              <div className="space-y-2">
                {paginatedModels.map((model) => (
                  <Card key={model.id} className="hover:border-primary transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                          <div className="col-span-2">
                            <Badge variant="outline" className="mb-1">
                              {model.category}
                            </Badge>
                            <p className="font-semibold">{model.name}</p>
                            <p className="text-xs text-muted-foreground">{model.brand}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{model.stats.price_median_30d}€</p>
                          </div>
                          <div className="text-center">
                            <p
                              className={`font-medium ${
                                model.stats.var_30d_pct < 0 ? "text-success" : "text-destructive"
                              }`}
                            >
                              {model.stats.var_30d_pct > 0 ? "+" : ""}
                              {model.stats.var_30d_pct.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p>{model.stats.ads_volume}</p>
                          </div>
                          <div>
                            <Badge variant={getRarityColor(model.stats.rarity_index)}>
                              {getRarityLabel(model.stats.rarity_index)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/model/${model.id}`}>Fiche</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/deals?model_id=${model.id}`}>Deals</Link>
                          </Button>
                          <Button
                            variant={watchlist.includes(model.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleWatchlist(model.id)}
                          >
                            <Heart
                              className={`h-4 w-4 ${watchlist.includes(model.id) ? "fill-current" : ""}`}
                            />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 8. BANDEAU MÉTHODOLOGIE */}
        <Card className="mt-12 bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Méthodologie & Données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              • Les métriques sont calculées à partir des données partagées par la communauté via l'extension
              (scraping manuel).
            </p>
            <p>
              • Prix médian = médiane des annonces actives sur la période 30j, hors outliers.
            </p>
            <p>
              • Rareté = ratio annonces récentes vs. historique / densité par région.
            </p>
            <div className="pt-2">
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link to="/trends">En savoir plus sur les tendances du marché →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
