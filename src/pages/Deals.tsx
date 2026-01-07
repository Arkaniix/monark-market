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
import { Flame, MapPin, TrendingDown, Package, Truck, ExternalLink, RotateCcw, Cpu, Monitor, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useDeals, useMarketSummary, type DealsFilters } from "@/hooks/useDeals";
import { useWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { useAlerts, useDeleteAlert } from "@/hooks/useProviderData";
import { DealsSkeleton } from "@/components/deals/DealsSkeleton";
import { DealCardImage } from "@/components/deals/DealCardImage";
import { PlatformBadge, AVAILABLE_PLATFORMS } from "@/components/deals/PlatformBadge";
import { toast } from "@/hooks/use-toast";
import { CreateAlertModal, type AlertTarget } from "@/components/alerts/CreateAlertModal";
import { WatchlistActionButton } from "@/components/common/WatchlistActionButton";
import { AlertActionButton } from "@/components/common/AlertActionButton";

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];

const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
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
export default function Deals() {
  // Filters state
  const [platform, setPlatform] = useState("all");
  const [region, setRegion] = useState("all");
  const [itemType, setItemType] = useState("all");
  const [condition, setCondition] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState<DealsFilters['sort_by']>("score");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Alert modal state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertTarget, setAlertTarget] = useState<AlertTarget | null>(null);

  // Build filters object
  const filters: DealsFilters = {
    platform,
    region,
    item_type: itemType,
    condition,
    price_min: priceRange[0],
    price_max: priceRange[1],
    sort_by: sortBy,
    page: currentPage,
    limit: itemsPerPage
  };

  // API queries
  const {
    data: dealsData,
    isLoading: dealsLoading,
    error: dealsError
  } = useDeals(filters);
  const {
    data: summary,
    isLoading: summaryLoading
  } = useMarketSummary();
  
  // Watchlist & Alerts hooks
  const { data: watchlistData } = useWatchlist();
  const { data: alertsData } = useAlerts();
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const deleteAlert = useDeleteAlert();

  // Create lookup sets for fast checking
  const watchlistAdIds = useMemo(() => {
    if (!watchlistData?.items) return new Set<number>();
    return new Set(
      watchlistData.items
        .filter(item => item.target_type === 'ad')
        .map(item => item.target_id)
    );
  }, [watchlistData]);

  // Get alerts by ad id (multiple alerts per ad possible)
  const alertsByAdId = useMemo(() => {
    const map = new Map<number, typeof alertsData.items>();
    if (!alertsData?.items) return map;
    alertsData.items
      .filter(alert => alert.target_type === 'ad' && alert.is_active)
      .forEach(alert => {
        const existing = map.get(alert.target_id) || [];
        existing.push(alert);
        map.set(alert.target_id, existing);
      });
    return map;
  }, [alertsData]);

  const openAlertModal = (deal: {
    id: number;
    title: string;
    price: number;
  }) => {
    setAlertTarget({
      type: "ad",
      id: deal.id,
      name: deal.title,
      currentPrice: deal.price
    });
    setAlertModalOpen(true);
  };
  const resetFilters = () => {
    setPlatform("all");
    setRegion("all");
    setItemType("all");
    setCondition("all");
    setPriceRange([0, 2000]);
    setSortBy("score");
    setCurrentPage(1);
  };
  
  const handleToggleWatchlist = async (adId: number, title: string, isInWatchlist: boolean) => {
    try {
      if (isInWatchlist) {
        const entry = watchlistData?.items.find(
          item => item.target_type === 'ad' && item.target_id === adId
        );
        if (entry) {
          await removeFromWatchlist.mutateAsync(entry.id);
          toast({
            title: "Retiré de la watchlist",
            description: `"${title}" a été retiré de votre watchlist.`
          });
        }
      } else {
        await addToWatchlist.mutateAsync({ target_type: 'ad', target_id: adId });
        toast({
          title: "Ajouté à la watchlist",
          description: `"${title}" a été ajouté à votre watchlist.`
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
    if (score >= 85) return {
      label: "Top deal",
      variant: "default" as const
    };
    if (score >= 70) return {
      label: "Bon plan",
      variant: "secondary" as const
    };
    return {
      label: "À surveiller",
      variant: "outline" as const
    };
  };
  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "pc":
        return Monitor;
      case "lot":
        return Package;
      default:
        return Cpu;
    }
  };
  const totalPages = dealsData?.total_pages || 1;
  const totalItems = dealsData?.total || 0;
  return <div className="min-h-screen py-6">
      <div className="container max-w-7xl">
        {/* Header - Compact */}
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <span className="text-xl md:text-2xl">💸</span>
                Les meilleures opportunités
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Annonces analysées et classées par potentiel d'économie
              </p>
            </div>
          </div>
        </div>

        {/* Filters - Compact */}
        <Card className="mb-4 border-border/50 bg-card/50">
          <CardContent className="py-3 px-4">
            {/* All filters in one row on desktop */}
            <div className="flex flex-wrap items-end gap-2">
              {/* Main filters */}
              <div className="flex flex-wrap gap-2 flex-1">
                <div className="w-[130px]">
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">Plateforme</Label>
                  <Select value={platform} onValueChange={v => { setPlatform(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {AVAILABLE_PLATFORMS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[140px]">
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">Région</Label>
                  <Select value={region} onValueChange={v => { setRegion(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="ile-de-france">Île-de-France</SelectItem>
                      <SelectItem value="auvergne-rhone-alpes">Auvergne-Rhône-Alpes</SelectItem>
                      <SelectItem value="paca">PACA</SelectItem>
                      <SelectItem value="occitanie">Occitanie</SelectItem>
                      <SelectItem value="nouvelle-aquitaine">Nouvelle-Aquitaine</SelectItem>
                      <SelectItem value="bretagne">Bretagne</SelectItem>
                      <SelectItem value="pays-de-la-loire">Pays de la Loire</SelectItem>
                      <SelectItem value="grand-est">Grand Est</SelectItem>
                      <SelectItem value="hauts-de-france">Hauts-de-France</SelectItem>
                      <SelectItem value="normandie">Normandie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[110px]">
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">Type</Label>
                  <Select value={itemType} onValueChange={v => { setItemType(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="component">Composant</SelectItem>
                      <SelectItem value="pc">PC complet</SelectItem>
                      <SelectItem value="lot">Lot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[110px]">
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">État</Label>
                  <Select value={condition} onValueChange={v => { setCondition(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="neuf">Neuf</SelectItem>
                      <SelectItem value="comme-neuf">Comme neuf</SelectItem>
                      <SelectItem value="bon">Bon état</SelectItem>
                      <SelectItem value="correct">État correct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[130px]">
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">Trier par</Label>
                  <Select value={sortBy} onValueChange={v => { setSortBy(v as DealsFilters['sort_by']); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Meilleur deal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">Meilleur deal</SelectItem>
                      <SelectItem value="price_asc">Prix ↑</SelectItem>
                      <SelectItem value="price_desc">Prix ↓</SelectItem>
                      <SelectItem value="date">Plus récents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price range with inputs */}
                <div className="flex items-end gap-2">
                  <div>
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">Prix min</Label>
                    <Input
                      type="number"
                      min={0}
                      max={priceRange[1]}
                      step={10}
                      value={priceRange[0]}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value) || 0, priceRange[1]);
                        setPriceRange([val, priceRange[1]]);
                        setCurrentPage(1);
                      }}
                      className="h-8 w-[80px] text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">Prix max</Label>
                    <Input
                      type="number"
                      min={priceRange[0]}
                      max={10000}
                      step={10}
                      value={priceRange[1]}
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value) || 0, priceRange[0]);
                        setPriceRange([priceRange[0], val]);
                        setCurrentPage(1);
                      }}
                      className="h-8 w-[80px] text-xs"
                    />
                  </div>
                  <div className="w-[120px] pb-1">
                    <Slider 
                      value={priceRange} 
                      onValueChange={v => { setPriceRange(v); setCurrentPage(1); }} 
                      min={0} 
                      max={5000} 
                      step={50}
                    />
                  </div>
                </div>
              </div>

              {/* Reset button */}
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deals List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{totalItems}</span> opportunité{totalItems > 1 ? "s" : ""} trouvée{totalItems > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">Afficher:</Label>
              <Select value={itemsPerPage.toString()} onValueChange={v => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-16 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map(option => <SelectItem key={option} value={option.toString()}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {dealsLoading ? <DealsSkeleton /> : dealsError ? <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <p className="mb-4">Erreur lors du chargement des deals.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              </div>
            </Card> : !dealsData?.items.length ? <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <p className="mb-4">Aucun deal trouvé avec ces critères.</p>
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            </Card> : <>
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {dealsData.items.map(deal => {
              const discount = Math.abs(deal.deviation_pct);
              const perfBadge = getPerformanceBadge(deal.score);
              const isHighValue = discount >= 15;
              const ItemTypeIcon = getItemTypeIcon(deal.item_type);
              const isInWatchlist = watchlistAdIds.has(deal.id);
              const existingAlerts = alertsByAdId.get(deal.id) || [];
              return <motion.div key={deal.id} variants={itemVariants}>
                      <Card className="deal-card hover:border-primary/50 transition-all hover:shadow-lg group h-full flex flex-col overflow-hidden">
                        {/* Image zone - fixed aspect ratio */}
                        <DealCardImage
                          imageUrl={deal.image_url}
                          modelImageUrl={deal.model_image_url}
                          modelName={deal.model_name}
                          category={deal.category}
                          alt={deal.title}
                          aspectRatio="4/3"
                          className="rounded-t-lg"
                        />
                        <CardHeader className="deal-card__header p-4 pb-3 space-y-3">
                          {/* Title and price */}
                          <div className="deal-card__title-price flex items-start justify-between gap-3">
                            <CardTitle className="deal-card__title text-base font-semibold leading-tight line-clamp-2 flex-1">
                              {deal.title}
                            </CardTitle>
                            <div className="deal-card__price-block text-right flex-shrink-0">
                              <div className="flex items-center gap-1">
                                {isHighValue && <span className="text-lg">⚡</span>}
                                <div className="text-2xl font-bold">{deal.price}€</div>
                              </div>
                              {deal.fair_value && (
                                <div className="text-sm text-muted-foreground line-through">{deal.fair_value}€</div>
                              )}
                            </div>
                          </div>
                          {/* Badges */}
                          <div className="deal-card__badges flex gap-1.5 flex-wrap">
                            <Badge variant={perfBadge.variant} className="text-xs px-2 py-0.5 h-6">
                              {perfBadge.label}
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant={getScoreColor(deal.score)} className="text-xs px-2 py-0.5 h-6 gap-1">
                                    {deal.score >= 85 && <Flame className="h-3.5 w-3.5" />}
                                    {deal.score}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{getScoreLabel(deal.score)}</p>
                                  <p className="text-xs">-{discount}% vs marché</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Badge variant="outline" className="text-xs px-2 py-0.5 h-6">
                              {formatDistanceToNow(new Date(deal.publication_date), { addSuffix: true, locale: fr })}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="deal-card__content flex-1 flex flex-col p-4 pt-0">
                          <div className="deal-card__body space-y-3 flex-1">
                            {/* Category & platform tags */}
                            <div className="deal-card__tags flex items-center gap-1.5 flex-wrap">
                              <Badge variant="secondary" className="text-xs px-2 py-0.5 h-6 gap-1">
                                <ItemTypeIcon className="h-3.5 w-3.5" />
                                {deal.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs px-2 py-0.5 h-6">{deal.condition}</Badge>
                              <PlatformBadge platform={deal.platform} size="sm" />
                            </div>

                            {/* Location */}
                            <div className="deal-card__meta text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{deal.city}</span>
                              {deal.delivery_possible && (
                                <span className="flex items-center gap-1 text-success ml-auto">
                                  <Truck className="h-4 w-4" />
                                </span>
                              )}
                            </div>

                            {/* Price comparison strip */}
                            <div className="deal-card__savings pt-3 mt-auto border-t border-border/50 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <TrendingDown className="h-4 w-4 text-success" />
                                <span className="text-sm font-semibold text-success">-{discount}%</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                -{deal.fair_value - deal.price}€
                              </span>
                            </div>

                            {/* Actions row */}
                            <div className="deal-card__actions flex gap-2 mt-3">
                              {deal.id ? <Button className="flex-1 h-9 text-sm" variant="default" size="sm" asChild>
                                  <Link to={`/ads/${deal.id}`}>Voir</Link>
                                </Button> : <Button className="flex-1 h-9 text-sm" variant="default" size="sm" disabled>
                                  Voir
                                </Button>}
                              <WatchlistActionButton
                                isInWatchlist={isInWatchlist}
                                onToggle={() => handleToggleWatchlist(deal.id, deal.title, isInWatchlist)}
                                disabled={addToWatchlist.isPending || removeFromWatchlist.isPending || !deal.id}
                                size="sm"
                              />
                              <AlertActionButton
                                targetId={deal.id}
                                targetType="ad"
                                existingAlerts={existingAlerts}
                                onCreateAlert={() => openAlertModal(deal)}
                                onDeleteAlert={handleDeleteAlert}
                                disabled={!deal.id}
                                size="sm"
                              />
                              {deal.url && <Button variant="outline" size="sm" className="h-9 w-9 p-0" asChild>
                                  <a href={deal.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>;
            })}
              </motion.div>

              {/* Pagination - compact */}
              {totalPages > 1 && <div className="mt-5 flex flex-col items-center gap-2">
                  <Pagination>
                    <PaginationContent className="gap-1">
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={`h-8 ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`} />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                  <p className="text-[10px] text-muted-foreground">
                    {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems}
                  </p>
                </div>}
            </>}
        </div>
      </div>

      {/* Alert Modal */}
      <CreateAlertModal open={alertModalOpen} onClose={() => setAlertModalOpen(false)} target={alertTarget} onSuccess={() => setAlertModalOpen(false)} />
    </div>;
}