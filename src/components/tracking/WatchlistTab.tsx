import { useState, useMemo, useEffect } from "react";
import { Eye, Plus, Search, Filter, ChevronLeft, ChevronRight, Package, Tag, DollarSign, TrendingDown, TrendingUp, ArrowDownRight, ArrowUpRight, Infinity } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { useDataProvider } from "@/providers";
import { useToast } from "@/hooks/use-toast";
import { CreateAlertModal, type AlertTarget } from "@/components/alerts/CreateAlertModal";
import { WatchlistItemCard } from "./WatchlistItemCard";
import type { WatchlistEntry, PriceHistoryPoint } from "@/providers/types";
const ITEMS_PER_PAGE = 6;
interface WatchlistTabProps {
  watchlist: WatchlistEntry[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Portfolio Overview Card - Valeur totale et économies potentielles
function WatchlistPortfolioCard({
  watchlist
}: {
  watchlist: WatchlistEntry[];
}) {
  const models = watchlist.filter(item => item.target_type === 'model');

  // Calculer les métriques réelles
  const totalCurrentValue = models.reduce((sum, item) => sum + (item.current_price || 0), 0);
  const totalFairValue = models.reduce((sum, item) => sum + (item.fair_value || item.current_price || 0), 0);
  const potentialSavings = totalFairValue - totalCurrentValue;
  const itemsWithDrops = models.filter(item => (item.price_change_7d || 0) < 0);
  const itemsWithRises = models.filter(item => (item.price_change_7d || 0) > 0);
  const avgVariation = models.length > 0 ? models.reduce((sum, item) => sum + (item.price_change_7d || 0), 0) / models.length : 0;
  const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price);
  if (models.length === 0) return null;
  return;
}
export function WatchlistTab({
  watchlist,
  isLoading,
  error,
  refetch
}: WatchlistTabProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertTarget, setAlertTarget] = useState<AlertTarget | null>(null);
  const [priceHistories, setPriceHistories] = useState<Record<number, {
    price: number;
    date?: string;
  }[]>>({});
  const [loadingHistories, setLoadingHistories] = useState<Set<number>>(new Set());
  const removeFromWatchlist = useRemoveFromWatchlist();
  const provider = useDataProvider();

  // Séparer modèles et annonces
  const models = useMemo(() => watchlist.filter(item => item.target_type === 'model'), [watchlist]);
  const ads = useMemo(() => watchlist.filter(item => item.target_type === 'ad'), [watchlist]);

  // Filtrer
  const filteredModels = useMemo(() => {
    return models.filter(item => {
      const matchesSearch = !search || item.name?.toLowerCase().includes(search.toLowerCase()) || item.brand?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [models, search, category]);
  const filteredAds = useMemo(() => {
    return ads.filter(item => {
      const matchesSearch = !search || item.name?.toLowerCase().includes(search.toLowerCase()) || item.brand?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [ads, search, category]);

  // Pagination globale
  const allFiltered = [...filteredModels, ...filteredAds];
  const totalPages = Math.ceil(allFiltered.length / ITEMS_PER_PAGE);

  // Catégories uniques
  const categories = useMemo(() => {
    const cats = new Set(watchlist.map(item => item.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [watchlist]);

  // Charger les historiques de prix pour les modèles
  useEffect(() => {
    models.forEach(async item => {
      if (priceHistories[item.target_id] || loadingHistories.has(item.target_id)) return;
      setLoadingHistories(prev => new Set(prev).add(item.target_id));
      try {
        const history = await provider.getModelPriceHistory(item.target_id.toString(), "30");
        if (history && history.length > 0) {
          setPriceHistories(prev => ({
            ...prev,
            [item.target_id]: history.slice(-20).map((p: PriceHistoryPoint) => ({
              price: p.price_median,
              date: p.date
            }))
          }));
        } else {
          // Générer mock si pas de données
          const mockHistory = generateMockSparkline(item.current_price || 300);
          setPriceHistories(prev => ({
            ...prev,
            [item.target_id]: mockHistory
          }));
        }
      } catch {
        // Générer mock en cas d'erreur
        const mockHistory = generateMockSparkline(item.current_price || 300);
        setPriceHistories(prev => ({
          ...prev,
          [item.target_id]: mockHistory
        }));
      } finally {
        setLoadingHistories(prev => {
          const next = new Set(prev);
          next.delete(item.target_id);
          return next;
        });
      }
    });
  }, [models, provider, priceHistories, loadingHistories]);
  const formatPrice = (price: number) => new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
  const openAlertModal = (item: WatchlistEntry) => {
    setAlertTarget({
      type: item.target_type,
      id: item.target_id,
      name: item.name || `${item.target_type === 'model' ? 'Modèle' : 'Annonce'} #${item.target_id}`,
      category: item.category,
      currentPrice: item.current_price
    });
    setAlertModalOpen(true);
  };
  const {
    toast
  } = useToast();
  const handleRemove = (item: WatchlistEntry) => {
    removeFromWatchlist.mutate(item.id, {
      onSuccess: () => {
        toast({
          title: "Retiré de la watchlist",
          description: `${item.name || 'Élément'} a été retiré de votre watchlist.`
        });
      }
    });
  };

  // Skeleton
  const ListSkeleton = () => <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-24 hidden md:block" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>)}
    </div>;
  if (isLoading) {
    return <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
          <ListSkeleton />
        </CardContent>
      </Card>;
  }
  if (error) {
    return <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Impossible de charger la watchlist.
              <Button variant="link" className="p-0 ml-2" onClick={refetch}>Réessayer</Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>;
  }
  return <>
      {/* Dashboard résumé */}
      <WatchlistPortfolioCard watchlist={watchlist} />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-blue-500" />
                Ma Watchlist
                <Badge variant="outline">{watchlist.length}</Badge>
                <Badge variant="secondary" className="text-[10px] gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                  <Infinity className="h-3 w-3" />
                  Gratuit
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                {models.length} modèle{models.length > 1 ? 's' : ''} • {ads.length} annonce{ads.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Link to="/catalog">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }} className="pl-9 h-9" />
            </div>
            <Select value={category} onValueChange={v => {
            setCategory(v);
            setPage(1);
          }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {watchlist.length === 0 ? <EmptyState /> : allFiltered.length === 0 ? <NoResults onReset={() => {
          setSearch("");
          setCategory("all");
        }} /> : <div className="space-y-6">
              {/* Section Modèles */}
              {filteredModels.length > 0 && <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4 text-blue-500" />
                    <h3 className="font-semibold">Modèles suivis</h3>
                    <Badge variant="secondary">{filteredModels.length}</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredModels.map(item => <WatchlistItemCard key={item.id} item={item} isModel={true} priceHistory={priceHistories[item.target_id] || []} isLoadingHistory={loadingHistories.has(item.target_id)} onCreateAlert={() => openAlertModal(item)} onRemove={() => handleRemove(item)} isRemoving={removeFromWatchlist.isPending} />)}
                  </div>
                </div>}

              {/* Section Annonces */}
              {filteredAds.length > 0 && <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-purple-500" />
                    <h3 className="font-semibold">Annonces suivies</h3>
                    <Badge variant="secondary">{filteredAds.length}</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredAds.map(item => <WatchlistItemCard key={item.id} item={item} isModel={false} priceHistory={[]} isLoadingHistory={false} onCreateAlert={() => openAlertModal(item)} onRemove={() => handleRemove(item)} isRemoving={removeFromWatchlist.isPending} />)}
                  </div>
                </div>}

              {/* Pagination (si beaucoup d'éléments) */}
              {totalPages > 1 && <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {allFiltered.length} élément{allFiltered.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>}
            </div>}
        </CardContent>
      </Card>

      <CreateAlertModal open={alertModalOpen} onClose={() => setAlertModalOpen(false)} target={alertTarget} onSuccess={refetch} />
    </>;
}

// Empty state component
function EmptyState() {
  return <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 mb-3">
        <Eye className="h-7 w-7 text-blue-500" />
      </div>
      <h3 className="text-base font-semibold mb-1">Votre watchlist est vide</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        Ajoutez des modèles ou annonces pour suivre leur évolution.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/catalog">
          <Button className="gap-2">
            <Package className="h-4 w-4" />
            Explorer le catalogue
          </Button>
        </Link>
        <Link to="/deals">
          <Button variant="outline" className="gap-2">
            <Tag className="h-4 w-4" />
            Voir les annonces
          </Button>
        </Link>
      </div>
    </div>;
}

// No results component
function NoResults({
  onReset
}: {
  onReset: () => void;
}) {
  return <div className="text-center py-10">
      <Search className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
      <h3 className="text-base font-semibold mb-1">Aucun résultat</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Aucun élément ne correspond à vos critères.
      </p>
      <Button variant="outline" size="sm" onClick={onReset}>
        Réinitialiser les filtres
      </Button>
    </div>;
}

// Mock sparkline generator with dates
function generateMockSparkline(basePrice: number): {
  price: number;
  date: string;
}[] {
  const points: {
    price: number;
    date: string;
  }[] = [];
  let price = basePrice * (0.9 + Math.random() * 0.2);
  const now = new Date();
  for (let i = 19; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 0.04;
    price = price * (1 + change);
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    points.push({
      price: Math.round(price),
      date: date.toISOString().split('T')[0]
    });
  }
  return points;
}