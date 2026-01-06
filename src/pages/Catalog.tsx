import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, TrendingDown, LayoutGrid, List, Star, Bell, RotateCcw } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCategories, useBrands, useFamilies, useCatalogModels, useAddModelToWatchlist, type CatalogFilters } from "@/hooks/useCatalog";
import { CatalogSkeleton } from "@/components/catalog/CatalogSkeleton";
import { ModelCardImage } from "@/components/catalog/ModelCardImage";
import { ModelListRow } from "@/components/catalog/ModelListRow";
import { toast } from "@/hooks/use-toast";
import { CreateAlertModal, type AlertTarget } from "@/components/alerts/CreateAlertModal";
const ITEMS_PER_PAGE = 24;
const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02
    }
  }
};
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0
  }
};
export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [brand, setBrand] = useState(searchParams.get("brand") || "all");
  const [family, setFamily] = useState(searchParams.get("family") || "all");
  const [sortBy, setSortBy] = useState<CatalogFilters['sort_by']>(searchParams.get("sort") as CatalogFilters['sort_by'] || "fair_value_30d");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(searchParams.get("order") as 'asc' | 'desc' || "desc");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertTarget, setAlertTarget] = useState<AlertTarget | null>(null);

  // Build filters
  const filters: CatalogFilters = {
    category,
    brand,
    family,
    search: searchQuery || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    page: currentPage,
    limit: ITEMS_PER_PAGE
  };

  // API queries
  const {
    data: categories,
    isLoading: categoriesLoading
  } = useCategories();
  const {
    data: brands,
    isLoading: brandsLoading
  } = useBrands(category);
  const {
    data: families
  } = useFamilies(brand);
  const {
    data: modelsData,
    isLoading: modelsLoading,
    error: modelsError
  } = useCatalogModels(filters);
  const addToWatchlist = useAddModelToWatchlist();
  const openAlertModal = (model: {
    id: number;
    name: string;
    fair_value_30d?: number;
    price_median_30d?: number;
  }) => {
    setAlertTarget({
      type: "model",
      id: model.id,
      name: model.name,
      currentPrice: model.fair_value_30d || model.price_median_30d
    });
    setAlertModalOpen(true);
  };
  const resetFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setBrand("all");
    setFamily("all");
    setSortBy("fair_value_30d");
    setSortOrder("desc");
    setCurrentPage(1);
    setSearchParams({});
  };
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setBrand("all");
    setFamily("all");
    setCurrentPage(1);
  };
  const handleBrandChange = (value: string) => {
    setBrand(value);
    setFamily("all");
    setCurrentPage(1);
  };
  const handleAddToWatchlist = async (modelId: number, name: string) => {
    try {
      await addToWatchlist.mutateAsync(modelId);
      toast({
        title: "Ajouté à la watchlist",
        description: `"${name}" a été ajouté à votre watchlist.`
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter à la watchlist.",
        variant: "destructive"
      });
    }
  };
  const getLiquidityLabel = (liquidity: number) => {
    if (liquidity >= 0.75) return "Très liquide";
    if (liquidity >= 0.5) return "Liquide";
    if (liquidity >= 0.25) return "Peu liquide";
    return "Rare";
  };
  const getLiquidityColor = (liquidity: number) => {
    if (liquidity >= 0.75) return "default";
    if (liquidity >= 0.5) return "secondary";
    return "outline";
  };
  const totalPages = modelsData?.total_pages || 1;
  const totalItems = modelsData?.total || 0;
  return <div className="min-h-screen py-6">
      <div className="container max-w-7xl">
        {/* Header - Compact */}
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <span className="text-xl md:text-2xl">📦</span>
                Catalogue des modèles
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Explore et compare les composants d'occasion : prix, tendances et disponibilité
              </p>
            </div>
          </div>
        </div>

        {/* Filters - Compact single card */}
        <Card className="mb-4 border-border/50 bg-card/50">
          <CardContent className="py-3 px-4">
            {/* Search + Filters in one row on desktop */}
            <div className="flex flex-wrap items-end gap-2">
              {/* Search field */}
              <div className="w-full sm:w-auto sm:flex-1 sm:max-w-[280px]">
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Nom, marque, alias..." 
                    value={searchQuery} 
                    onChange={e => handleSearch(e.target.value)} 
                    className="h-8 pl-8 text-xs"
                  />
                </div>
              </div>

              {/* Category filter */}
              <div className="w-[120px]">
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">Catégorie</label>
                <Select value={category} onValueChange={handleCategoryChange} disabled={categoriesLoading}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories?.filter(cat => cat.name && cat.name.trim() !== "").map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand filter */}
              <div className="w-[120px]">
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">Marque</label>
                <Select value={brand} onValueChange={handleBrandChange} disabled={brandsLoading}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {brands?.filter(b => b && b.trim() !== "").map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Family filter */}
              <div className="w-[120px]">
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">Famille</label>
                <Select value={family} onValueChange={v => { setFamily(v); setCurrentPage(1); }} disabled={!families?.length}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {families?.filter(f => f && f.trim() !== "").map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="w-[150px]">
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">Trier par</label>
                <Select value={`${sortBy}_${sortOrder}`} onValueChange={v => {
                  const [sort, order] = v.split('_') as [CatalogFilters['sort_by'], 'asc' | 'desc'];
                  setSortBy(sort);
                  setSortOrder(order);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Trier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fair_value_30d_desc">Fair Value ↓</SelectItem>
                    <SelectItem value="fair_value_30d_asc">Fair Value ↑</SelectItem>
                    <SelectItem value="var_30d_asc">Variation 30j ↑</SelectItem>
                    <SelectItem value="var_30d_desc">Variation 30j ↓</SelectItem>
                    <SelectItem value="liquidity_desc">Liquidité ↓</SelectItem>
                    <SelectItem value="liquidity_asc">Liquidité ↑</SelectItem>
                    <SelectItem value="name_asc">Nom A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View mode + Reset */}
              <div className="flex items-center gap-1 ml-auto">
                <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode("grid")}>
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode("list")}>
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground" onClick={resetFilters}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count - compact */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{totalItems}</span> modèle{totalItems > 1 ? "s" : ""} trouvé{totalItems > 1 ? "s" : ""}
          </p>
        </div>

        {modelsLoading ? <CatalogSkeleton /> : modelsError ? <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <p className="mb-3 text-sm">Erreur lors du chargement du catalogue.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </Card> : !modelsData?.items.length ? <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <p className="mb-3 text-sm">Aucun modèle trouvé avec ces critères.</p>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          </Card> : <>
            {/* Grid View */}
            {viewMode === "grid" ? (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {modelsData.items.map(model => <motion.div key={model.id} variants={itemVariants}>
                    <Card className="hover:border-primary/50 transition-all hover:shadow-md group h-full overflow-hidden">
                      {/* Model Image */}
                      <ModelCardImage
                        imageUrl={model.image_url}
                        modelName={model.name}
                        brand={model.brand}
                        category={model.category}
                        aspectRatio="4/3"
                      />
                      <CardHeader className="p-3 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {model.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">{model.brand}</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">{model.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="space-y-2">
                          {/* Price & Variation */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold">
                                {model.fair_value_30d || model.price_median_30d || "N/A"}€
                              </p>
                              <p className="text-[10px] text-muted-foreground">Fair Value 30j</p>
                            </div>
                            {model.var_30d_pct !== null && <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className={`flex items-center gap-0.5 text-xs ${model.var_30d_pct < 0 ? "text-success" : "text-destructive"}`}>
                                      {model.var_30d_pct < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                                      <span className="font-medium">
                                        {model.var_30d_pct > 0 ? "+" : ""}{model.var_30d_pct.toFixed(1)}%
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>Variation sur 30 jours</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>}
                          </div>

                          {/* Badges */}
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant={getLiquidityColor(model.liquidity)} className="text-[10px] px-1.5 py-0">
                              {getLiquidityLabel(model.liquidity)}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{model.ads_count} ann.</Badge>
                          </div>

                          {/* Actions - compact */}
                          <div className="flex gap-1.5 pt-1">
                            {model.id ? <Button className="flex-1 h-7 text-xs" size="sm" asChild>
                                <Link to={`/models/${model.id}`}>Détails</Link>
                              </Button> : <Button className="flex-1 h-7 text-xs" size="sm" disabled>
                                Détails
                              </Button>}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => handleAddToWatchlist(model.id, model.name)} disabled={addToWatchlist.isPending || !model.id}>
                                    <Star className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Suivre</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => openAlertModal(model)} disabled={!model.id}>
                                    <Bell className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Alerter</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>)}
              </motion.div>
            ) : (
              /* List View */
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
                {modelsData.items.map(model => (
                  <motion.div key={model.id} variants={itemVariants}>
                    <ModelListRow
                      model={model}
                      onAddToWatchlist={handleAddToWatchlist}
                      onOpenAlert={openAlertModal}
                      isWatchlistPending={addToWatchlist.isPending}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination - compact */}
            {totalPages > 1 && <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={`h-8 ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`} />
                    </PaginationItem>
                    {Array.from({
                length: Math.min(5, totalPages)
              }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return <PaginationItem key={page}>
                          <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer h-8 w-8 text-xs">
                            {page}
                          </PaginationLink>
                        </PaginationItem>;
              })}
                    <PaginationItem>
                      <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={`h-8 ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>}

            <p className="text-center text-xs text-muted-foreground mt-3">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} sur {totalItems}
            </p>
          </>}
      </div>

      {/* Alert Modal */}
      <CreateAlertModal open={alertModalOpen} onClose={() => setAlertModalOpen(false)} target={alertTarget} onSuccess={() => setAlertModalOpen(false)} />
    </div>;
}