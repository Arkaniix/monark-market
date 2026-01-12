import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, TrendingDown, LayoutGrid, List, RotateCcw } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCategories, useBrands, useFamilies, useCatalogModels, useAddModelToWatchlist, type CatalogFilters } from "@/hooks/useCatalog";
import { useWatchlist, useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { useAlerts, useDeleteAlert } from "@/hooks/useProviderData";
import { CatalogSkeleton } from "@/components/catalog/CatalogSkeleton";
import { ModelCardImage } from "@/components/catalog/ModelCardImage";
import { ModelListRow } from "@/components/catalog/ModelListRow";
import { toast } from "@/hooks/use-toast";
import { CreateAlertModal, type AlertTarget } from "@/components/alerts/CreateAlertModal";
import { WatchlistActionButton } from "@/components/common/WatchlistActionButton";
import { AlertActionButton } from "@/components/common/AlertActionButton";
import { cn } from "@/lib/utils";
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
  const removeFromWatchlist = useRemoveFromWatchlist();
  
  // Get watchlist and alerts to check if models are tracked
  const { data: watchlistData } = useWatchlist();
  const { data: alertsData } = useAlerts();
  const deleteAlert = useDeleteAlert();
  
  // Create lookup sets for fast checking
  const watchlistModelIds = useMemo(() => {
    if (!watchlistData?.items) return new Set<number>();
    return new Set(
      watchlistData.items
        .filter(item => item.target_type === 'model')
        .map(item => item.target_id)
    );
  }, [watchlistData]);
  
  const alertedModelIds = useMemo(() => {
    if (!alertsData?.items) return new Set<number>();
    return new Set(
      alertsData.items
        .filter(item => item.target_type === 'model' && item.is_active)
        .map(item => item.target_id)
    );
  }, [alertsData]);

  // Get alerts by model id (multiple alerts per model possible)
  const alertsByModelId = useMemo(() => {
    const map = new Map<number, typeof alertsData.items>();
    if (!alertsData?.items) return map;
    alertsData.items
      .filter(alert => alert.target_type === 'model' && alert.is_active)
      .forEach(alert => {
        const existing = map.get(alert.target_id) || [];
        existing.push(alert);
        map.set(alert.target_id, existing);
      });
    return map;
  }, [alertsData]);
  
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

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await deleteAlert.mutateAsync(alertId);
      toast({
        title: "Alerte supprimée",
        description: "L'alerte a été supprimée avec succès."
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'alerte.",
        variant: "destructive"
      });
    }
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
  
  const handleToggleWatchlist = async (modelId: number, name: string, isInWatchlist: boolean) => {
    try {
      if (isInWatchlist) {
        // Find the watchlist entry to remove
        const entry = watchlistData?.items.find(
          item => item.target_type === 'model' && item.target_id === modelId
        );
        if (entry) {
          await removeFromWatchlist.mutateAsync(entry.id);
          toast({
            title: "Retiré de la watchlist",
            description: `"${name}" a été retiré de votre watchlist.`
          });
        }
      } else {
        await addToWatchlist.mutateAsync(modelId);
        toast({
          title: "Ajouté à la watchlist",
          description: `"${name}" a été ajouté à votre watchlist.`
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la watchlist.",
        variant: "destructive"
      });
    }
  };
  const getLiquidityLabel = (liquidity: number) => {
    if (liquidity >= 0.75) return "Se vend vite";
    if (liquidity >= 0.5) return "Demande correcte";
    if (liquidity >= 0.25) return "Vente lente";
    return "Rare sur le marché";
  };
  const getLiquidityColor = (liquidity: number) => {
    if (liquidity >= 0.75) return "default";
    if (liquidity >= 0.5) return "secondary";
    return "outline";
  };
  const getLiquidityTooltip = (liquidity: number) => {
    const percentage = Math.round(liquidity * 100);
    if (liquidity >= 0.75) {
      return `Liquidité ${percentage}% — Ce modèle se vend rapidement. Fort volume d'annonces et rotation élevée.`;
    }
    if (liquidity >= 0.5) {
      return `Liquidité ${percentage}% — Demande modérée. Délai de vente raisonnable.`;
    }
    if (liquidity >= 0.25) {
      return `Liquidité ${percentage}% — Peu de demande. La vente peut prendre du temps.`;
    }
    return `Liquidité ${percentage}% — Très peu d'annonces. Modèle rare ou peu recherché.`;
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
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {modelsData.items.map(model => {
                  const isInWatchlist = watchlistModelIds.has(model.id);
                  const hasAlert = alertedModelIds.has(model.id);
                  const existingAlerts = alertsByModelId.get(model.id) || [];
                  return (
                    <motion.div key={model.id} variants={itemVariants}>
                      <Card className="hover:border-primary/50 transition-all hover:shadow-md group h-full overflow-hidden flex flex-col min-h-[380px]">
                        {/* Model Image */}
                        <ModelCardImage
                          imageUrl={model.image_url}
                          modelName={model.name}
                          brand={model.brand}
                          category={model.category}
                          aspectRatio="16/9"
                        />
                        <CardHeader className="p-4 pb-2 flex-shrink-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                                {model.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {model.brand}{model.manufacturer ? ` • ${model.manufacturer}` : ''}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 shrink-0">{model.category}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex flex-col flex-1">
                          <div className="space-y-3 flex-1">
                            {/* Price & Variation */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xl font-bold">
                                  {model.fair_value_30d || model.price_median_30d || "N/A"}€
                                </p>
                                <p className="text-xs text-muted-foreground">Fair Value 30j</p>
                              </div>
                              {model.var_30d_pct !== null && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className={`flex items-center gap-1 text-sm ${model.var_30d_pct < 0 ? "text-success" : "text-destructive"}`}>
                                        {model.var_30d_pct < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                                        <span className="font-semibold">
                                          {model.var_30d_pct > 0 ? "+" : ""}{model.var_30d_pct.toFixed(1)}%
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-sm">Variation sur 30 jours</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>

                            {/* Badges with Liquidity Tooltip */}
                            <div className="flex gap-1.5 flex-wrap items-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="inline-flex items-center gap-2 cursor-help">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-muted-foreground">Liquidité:</span>
                                        <span className={`text-xs font-semibold ${
                                          model.liquidity >= 0.7 ? 'text-green-500' : 
                                          model.liquidity >= 0.4 ? 'text-amber-500' : 'text-red-500'
                                        }`}>
                                          {Math.round(model.liquidity * 100)}%
                                        </span>
                                      </div>
                                      <div className="w-20 h-2.5 bg-muted rounded-full overflow-hidden border border-border/50 relative">
                                        <div 
                                          className={`h-full rounded-full transition-all ${
                                            model.liquidity >= 0.7 ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                                            model.liquidity >= 0.4 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                                          }`}
                                          style={{ width: `${Math.round(model.liquidity * 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[220px] text-sm">
                                    {getLiquidityTooltip(model.liquidity)}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <Badge variant="outline" className="text-xs px-2 py-0.5">{model.ads_count} ann.</Badge>
                            </div>
                          </div>

                          {/* Actions - always at bottom */}
                          <div className="flex gap-2 pt-3 mt-auto border-t border-border/30">
                            {model.id ? (
                              <Button className="flex-1 h-9 text-sm" size="default" asChild>
                                <Link to={`/models/${model.id}`}>Détails</Link>
                              </Button>
                            ) : (
                              <Button className="flex-1 h-9 text-sm" size="default" disabled>
                                Détails
                              </Button>
                            )}
                            <WatchlistActionButton
                              isInWatchlist={isInWatchlist}
                              onToggle={() => handleToggleWatchlist(model.id, model.name, isInWatchlist)}
                              disabled={addToWatchlist.isPending || removeFromWatchlist.isPending || !model.id}
                              size="sm"
                            />
                            <AlertActionButton
                              targetId={model.id}
                              targetType="model"
                              existingAlerts={existingAlerts}
                              onCreateAlert={() => openAlertModal(model)}
                              onDeleteAlert={handleDeleteAlert}
                              disabled={!model.id}
                              size="sm"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              /* List View - compact spacing */
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
                {modelsData.items.map(model => (
                  <motion.div key={model.id} variants={itemVariants}>
                    <ModelListRow
                      model={model}
                      onToggleWatchlist={handleToggleWatchlist}
                      onOpenAlert={openAlertModal}
                      onDeleteAlert={handleDeleteAlert}
                      isWatchlistPending={addToWatchlist.isPending || removeFromWatchlist.isPending}
                      isInWatchlist={watchlistModelIds.has(model.id)}
                      existingAlerts={alertsByModelId.get(model.id) || []}
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