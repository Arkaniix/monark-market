import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, TrendingUp, TrendingDown, LayoutGrid, List, Package, Activity, Star, Bell, BarChart3, RotateCcw } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCategories, useBrands, useFamilies, useCatalogModels, useCatalogSummary, useAddModelToWatchlist, type CatalogFilters } from "@/hooks/useCatalog";
import { CatalogSkeleton, CatalogSummarySkeleton } from "@/components/catalog/CatalogSkeleton";
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
  const {
    data: summary,
    isLoading: summaryLoading
  } = useCatalogSummary();
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
  return <div className="min-h-screen py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Catalogue des composants</h1>
          <p className="text-muted-foreground mb-6">
            Explore, filtre et compare les composants d'occasion : prix médian, tendances et disponibilité.
          </p>

          {/* Summary */}
          {summaryLoading ? <CatalogSummarySkeleton /> : summary ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              
              
              
            </div> : null}
        </div>

        <Separator className="my-8" />

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Filtres & Recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un modèle (nom, marque, alias...)" value={searchQuery} onChange={e => handleSearch(e.target.value)} className="pl-10" />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={category} onValueChange={handleCategoryChange} disabled={categoriesLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes catégories</SelectItem>
                      {categories?.map(cat => <SelectItem key={cat.id} value={cat.name}>
                          {cat.name} ({cat.count})
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Marque</label>
                  <Select value={brand} onValueChange={handleBrandChange} disabled={brandsLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Marque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes marques</SelectItem>
                      {brands?.filter(b => b && b.trim() !== "").map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Famille</label>
                  <Select value={family} onValueChange={v => {
                  setFamily(v);
                  setCurrentPage(1);
                }} disabled={!families?.length}>
                    <SelectTrigger>
                      <SelectValue placeholder="Famille" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes familles</SelectItem>
                      {families?.filter(f => f && f.trim() !== "").map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Trier par</label>
                  <Select value={`${sortBy}_${sortOrder}`} onValueChange={v => {
                  const [sort, order] = v.split('_') as [CatalogFilters['sort_by'], 'asc' | 'desc'];
                  setSortBy(sort);
                  setSortOrder(order);
                  setCurrentPage(1);
                }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fair_value_30d_desc">Fair Value (décroissant)</SelectItem>
                      <SelectItem value="fair_value_30d_asc">Fair Value (croissant)</SelectItem>
                      <SelectItem value="var_30d_asc">Variation 30j (meilleure)</SelectItem>
                      <SelectItem value="var_30d_desc">Variation 30j (pire)</SelectItem>
                      <SelectItem value="liquidity_desc">Liquidité (haute)</SelectItem>
                      <SelectItem value="liquidity_asc">Liquidité (basse)</SelectItem>
                      <SelectItem value="name_asc">Nom (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            <span className="text-primary">{totalItems}</span> modèle{totalItems > 1 ? "s" : ""}
          </h2>
        </div>

        {modelsLoading ? <CatalogSkeleton /> : modelsError ? <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">Erreur lors du chargement du catalogue.</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </Card> : !modelsData?.items.length ? <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">Aucun modèle trouvé avec ces critères.</p>
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          </Card> : <>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4"}>
              {modelsData.items.map(model => <motion.div key={model.id} variants={itemVariants}>
                  <Card className="hover:border-primary transition-all hover:shadow-lg group h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">
                            {model.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{model.brand}</p>
                        </div>
                        <Badge variant="secondary">{model.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Price & Variation */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">
                              {model.fair_value_30d || model.price_median_30d || "N/A"}€
                            </p>
                            <p className="text-xs text-muted-foreground">Fair Value 30j</p>
                          </div>
                          {model.var_30d_pct !== null && <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className={`flex items-center gap-1 ${model.var_30d_pct < 0 ? "text-success" : "text-destructive"}`}>
                                    {model.var_30d_pct < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
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
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant={getLiquidityColor(model.liquidity)}>
                            {getLiquidityLabel(model.liquidity)}
                          </Badge>
                          <Badge variant="outline">{model.ads_count} annonces</Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          {model.id ? <Button className="flex-1" size="sm" asChild>
                              <Link to={`/models/${model.id}`}>Voir détails</Link>
                            </Button> : <Button className="flex-1" size="sm" disabled>
                              Voir détails
                            </Button>}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleAddToWatchlist(model.id, model.name)} disabled={addToWatchlist.isPending || !model.id}>
                                  <Star className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Suivre</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => openAlertModal(model)} disabled={!model.id}>
                                  <Bell className="h-4 w-4" />
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

            {/* Pagination */}
            {totalPages > 1 && <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
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
                          <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                            {page}
                          </PaginationLink>
                        </PaginationItem>;
              })}
                    <PaginationItem>
                      <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>}

            <p className="text-center text-sm text-muted-foreground mt-4">
              Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} sur {totalItems}
            </p>
          </>}
      </div>

      {/* Alert Modal */}
      <CreateAlertModal open={alertModalOpen} onClose={() => setAlertModalOpen(false)} target={alertTarget} onSuccess={() => setAlertModalOpen(false)} />
    </div>;
}