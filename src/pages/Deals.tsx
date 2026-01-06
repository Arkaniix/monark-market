import { useState } from "react";
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
import { Flame, MapPin, Calendar, TrendingDown, Package, Truck, ExternalLink, RotateCcw, DollarSign, BarChart3, Sparkles, Star, Bell, Cpu, HardDrive, CircuitBoard, Monitor, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useDeals, useMarketSummary, useAddToWatchlist, type DealsFilters } from "@/hooks/useDeals";
import { DealsSkeleton, MarketSummarySkeleton } from "@/components/deals/DealsSkeleton";
import { DealCardImage } from "@/components/deals/DealCardImage";
import { PlatformBadge } from "@/components/deals/PlatformBadge";
import { toast } from "@/hooks/use-toast";
import { CreateAlertModal, type AlertTarget } from "@/components/alerts/CreateAlertModal";
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
  const addToWatchlist = useAddToWatchlist();
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
  const handleAddToWatchlist = async (adId: number, title: string) => {
    try {
      await addToWatchlist.mutateAsync(adId);
      toast({
        title: "Ajouté à la watchlist",
        description: `"${title}" a été ajouté à votre watchlist.`
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter à la watchlist.",
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
  return <div className="min-h-screen py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            💸 Les meilleures opportunités du moment
          </h1>
          <p className="text-muted-foreground mb-6">
            Découvrez les annonces les plus intéressantes selon nos analyses de marché.
          </p>

          {/* Market Summary */}
          {summaryLoading ? <MarketSummarySkeleton /> : summary ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              
              
              
              
            </div> : null}
        </div>

        {/* Filters */}
        <Card className="mb-6 border-border/50">
          <CardContent className="py-4">
            {/* Row 1: Main filters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Plateforme</Label>
                <Select value={platform} onValueChange={v => {
                setPlatform(v);
                setCurrentPage(1);
              }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Plateforme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="leboncoin">Leboncoin</SelectItem>
                    <SelectItem value="ebay">eBay</SelectItem>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="ldlc">LDLC</SelectItem>
                    <SelectItem value="facebook">FB Marketplace</SelectItem>
                    <SelectItem value="vinted">Vinted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Région</Label>
                <Select value={region} onValueChange={v => {
                setRegion(v);
                setCurrentPage(1);
              }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Région" />
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

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={itemType} onValueChange={v => {
                setItemType(v);
                setCurrentPage(1);
              }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="component">Composant</SelectItem>
                    <SelectItem value="pc">PC complet</SelectItem>
                    <SelectItem value="lot">Lot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">État</Label>
                <Select value={condition} onValueChange={v => {
                setCondition(v);
                setCurrentPage(1);
              }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="État" />
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

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Trier par</Label>
                <Select value={sortBy} onValueChange={v => {
                setSortBy(v as DealsFilters['sort_by']);
                setCurrentPage(1);
              }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Meilleur deal</SelectItem>
                    <SelectItem value="price_asc">Prix croissant</SelectItem>
                    <SelectItem value="price_desc">Prix décroissant</SelectItem>
                    <SelectItem value="date">Plus récents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Price range + Reset */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 mt-4 pt-4 border-t border-border/50">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Prix</Label>
                  <span className="text-xs font-medium text-primary">{priceRange[0]}€ - {priceRange[1]}€</span>
                </div>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    value={priceRange[0]} 
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val >= 0 && val <= priceRange[1]) {
                        setPriceRange([val, priceRange[1]]);
                        setCurrentPage(1);
                      }
                    }} 
                    min={0} 
                    max={priceRange[1]} 
                    className="h-9 w-24"
                  />
                  <Slider 
                    value={priceRange} 
                    onValueChange={v => {
                      setPriceRange(v);
                      setCurrentPage(1);
                    }} 
                    min={0} 
                    max={5000} 
                    step={50} 
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    value={priceRange[1]} 
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val >= priceRange[0] && val <= 5000) {
                        setPriceRange([priceRange[0], val]);
                        setCurrentPage(1);
                      }
                    }} 
                    min={priceRange[0]} 
                    max={5000}
                    className="h-9 w-24"
                  />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deals List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              <span className="text-primary">{totalItems}</span> opportunité{totalItems > 1 ? "s" : ""}
            </h2>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Par page:</Label>
              <Select value={itemsPerPage.toString()} onValueChange={v => {
              setItemsPerPage(Number(v));
              setCurrentPage(1);
            }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map(option => <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>)}
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
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dealsData.items.map(deal => {
              const discount = Math.abs(deal.deviation_pct);
              const perfBadge = getPerformanceBadge(deal.score);
              const isHighValue = discount >= 15;
              const ItemTypeIcon = getItemTypeIcon(deal.item_type);
              return <motion.div key={deal.id} variants={itemVariants}>
                      <Card className="hover:border-primary transition-all hover:shadow-xl group h-full flex flex-col overflow-hidden">
                        {/* Image slot */}
                        <DealCardImage
                          imageUrl={null}
                          modelName={deal.model_name}
                          category={deal.category}
                          alt={deal.title}
                          className="rounded-t-lg"
                        />
                        <CardHeader className="pt-3">
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
                            </div>
                            <div className="text-right flex-shrink-0">
                              <Badge variant="secondary" className="mb-2 text-xs">
                                {formatDistanceToNow(new Date(deal.publication_date), {
                            addSuffix: true,
                            locale: fr
                          })}
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
                              <Badge variant="secondary" className="gap-1">
                                <ItemTypeIcon className="h-3 w-3" />
                                {deal.category}
                              </Badge>
                              <Badge variant="outline">{deal.condition}</Badge>
                              <PlatformBadge platform={deal.platform} />
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                {deal.city}, {deal.region}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                {new Date(deal.publication_date).toLocaleDateString('fr-FR')}
                              </div>
                              {deal.delivery_possible && <div className="flex items-center gap-2 text-success">
                                  <Truck className="h-4 w-4 flex-shrink-0" />
                                  Livraison disponible
                                </div>}
                            </div>

                            <div className="pt-3 border-t flex items-center justify-between">
                              <div className="flex items-center gap-1 text-sm">
                                <TrendingDown className="h-4 w-4 text-success" />
                                <span className="font-medium text-success">-{discount}%</span>
                                <span className="text-xs text-muted-foreground">vs marché</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Économie: {deal.fair_value - deal.price}€
                              </span>
                            </div>

                            <div className="flex gap-2">
                              {deal.id ? <Button className="flex-1" variant="default" size="sm" asChild>
                                  <Link to={`/ads/${deal.id}`}>Voir annonce</Link>
                                </Button> : <Button className="flex-1" variant="default" size="sm" disabled>
                                  Voir annonce
                                </Button>}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => handleAddToWatchlist(deal.id, deal.title)} disabled={addToWatchlist.isPending || !deal.id}>
                                      <Star className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Suivre</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => openAlertModal(deal)} disabled={!deal.id}>
                                      <Bell className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Alerter</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {deal.url && <Button variant="outline" size="sm" asChild>
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

              {/* Pagination */}
              {totalPages > 1 && <div className="mt-6 flex justify-center">
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

              <p className="text-center text-xs text-muted-foreground mt-3 pb-2">
                {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems}
              </p>
            </>}
        </div>
      </div>

      {/* Alert Modal */}
      <CreateAlertModal open={alertModalOpen} onClose={() => setAlertModalOpen(false)} target={alertTarget} onSuccess={() => setAlertModalOpen(false)} />
    </div>;
}