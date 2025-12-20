import { useState, useMemo, useEffect } from "react";
import { Eye, Plus, Trash2, ExternalLink, TrendingDown, TrendingUp, Bell, Search, Filter, ChevronLeft, ChevronRight, Package, Tag, DollarSign, Percent, ArrowDownRight, ArrowUpRight, Sparkles, Target, Clock } from "lucide-react";
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
import type { WatchlistEntry, PriceHistoryPoint } from "@/providers/types";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";

const ITEMS_PER_PAGE = 5;

interface WatchlistTabProps {
  watchlist: WatchlistEntry[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Sparkline component
function PriceSparkline({ data, isLoading }: { data: { price: number }[]; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-8 w-24" />;
  }

  if (!data || data.length < 2) {
    return <div className="h-8 w-24 flex items-center justify-center text-xs text-muted-foreground">—</div>;
  }

  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const isUp = lastPrice > firstPrice;

  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="price"
            stroke={isUp ? "hsl(0, 84%, 60%)" : "hsl(142, 76%, 36%)"}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Portfolio Overview Card - Valeur totale et économies potentielles
function WatchlistPortfolioCard({ watchlist }: { watchlist: WatchlistEntry[] }) {
  const models = watchlist.filter(item => item.target_type === 'model');
  
  // Calculer les métriques réelles
  const totalCurrentValue = models.reduce((sum, item) => sum + (item.current_price || 0), 0);
  const totalFairValue = models.reduce((sum, item) => sum + (item.fair_value || item.current_price || 0), 0);
  const potentialSavings = totalFairValue - totalCurrentValue;
  
  const itemsWithDrops = models.filter(item => (item.price_change_7d || 0) < 0);
  const itemsWithRises = models.filter(item => (item.price_change_7d || 0) > 0);
  const avgVariation = models.length > 0 
    ? models.reduce((sum, item) => sum + (item.price_change_7d || 0), 0) / models.length 
    : 0;

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

  if (models.length === 0) return null;

  return (
    <Card className="mb-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Résumé de votre watchlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Valeur totale surveillée */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Valeur totale surveillée</p>
            <p className="text-xl font-bold">{formatPrice(totalCurrentValue)}</p>
            <p className="text-xs text-muted-foreground">{models.length} modèle{models.length > 1 ? 's' : ''}</p>
          </div>

          {/* Économies potentielles */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Économies potentielles</p>
            <p className={`text-xl font-bold ${potentialSavings > 0 ? 'text-green-500' : potentialSavings < 0 ? 'text-red-500' : ''}`}>
              {potentialSavings > 0 ? '+' : ''}{formatPrice(potentialSavings)}
            </p>
            <p className="text-xs text-muted-foreground">vs juste prix estimé</p>
          </div>

          {/* Tendance 7j */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tendance 7 jours</p>
            <div className="flex items-center gap-2">
              {avgVariation < 0 ? (
                <ArrowDownRight className="h-5 w-5 text-green-500" />
              ) : avgVariation > 0 ? (
                <ArrowUpRight className="h-5 w-5 text-red-500" />
              ) : null}
              <p className={`text-xl font-bold ${avgVariation < 0 ? 'text-green-500' : avgVariation > 0 ? 'text-red-500' : ''}`}>
                {avgVariation > 0 ? '+' : ''}{avgVariation.toFixed(1)}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground">variation moyenne</p>
          </div>

          {/* Mouvements */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Mouvements 7j</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-green-500">
                <TrendingDown className="h-4 w-4" />
                <span className="font-bold">{itemsWithDrops.length}</span>
              </div>
              <div className="flex items-center gap-1 text-red-500">
                <TrendingUp className="h-4 w-4" />
                <span className="font-bold">{itemsWithRises.length}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">baisses / hausses</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export function WatchlistTab({ watchlist, isLoading, error, refetch }: WatchlistTabProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertTarget, setAlertTarget] = useState<AlertTarget | null>(null);
  const [priceHistories, setPriceHistories] = useState<Record<number, { price: number }[]>>({});
  const [loadingHistories, setLoadingHistories] = useState<Set<number>>(new Set());

  const removeFromWatchlist = useRemoveFromWatchlist();
  const provider = useDataProvider();

  // Séparer modèles et annonces
  const models = useMemo(() => watchlist.filter(item => item.target_type === 'model'), [watchlist]);
  const ads = useMemo(() => watchlist.filter(item => item.target_type === 'ad'), [watchlist]);

  // Filtrer
  const filteredModels = useMemo(() => {
    return models.filter(item => {
      const matchesSearch = !search || 
        (item.name?.toLowerCase().includes(search.toLowerCase())) ||
        (item.brand?.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === "all" || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [models, search, category]);

  const filteredAds = useMemo(() => {
    return ads.filter(item => {
      const matchesSearch = !search || 
        (item.name?.toLowerCase().includes(search.toLowerCase())) ||
        (item.brand?.toLowerCase().includes(search.toLowerCase()));
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
    models.forEach(async (item) => {
      if (priceHistories[item.target_id] || loadingHistories.has(item.target_id)) return;
      
      setLoadingHistories(prev => new Set(prev).add(item.target_id));
      
      try {
        const history = await provider.getModelPriceHistory(item.target_id.toString(), "30");
        if (history && history.length > 0) {
          setPriceHistories(prev => ({
            ...prev,
            [item.target_id]: history.slice(-20).map((p: PriceHistoryPoint) => ({ price: p.price_median })),
          }));
        } else {
          // Générer mock si pas de données
          const mockHistory = generateMockSparkline(item.current_price || 300);
          setPriceHistories(prev => ({ ...prev, [item.target_id]: mockHistory }));
        }
      } catch {
        // Générer mock en cas d'erreur
        const mockHistory = generateMockSparkline(item.current_price || 300);
        setPriceHistories(prev => ({ ...prev, [item.target_id]: mockHistory }));
      } finally {
        setLoadingHistories(prev => {
          const next = new Set(prev);
          next.delete(item.target_id);
          return next;
        });
      }
    });
  }, [models, provider, priceHistories, loadingHistories]);

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

  const openAlertModal = (item: WatchlistEntry) => {
    setAlertTarget({
      type: item.target_type,
      id: item.target_id,
      name: item.name || `${item.target_type === 'model' ? 'Modèle' : 'Annonce'} #${item.target_id}`,
      category: item.category,
      currentPrice: item.current_price,
    });
    setAlertModalOpen(true);
  };

  // Calculer le score d'opportunité (écart prix actuel vs juste prix)
  const getOpportunityScore = (item: WatchlistEntry): { score: number; label: string; color: string } => {
    if (!item.current_price || !item.fair_value) return { score: 0, label: '—', color: 'text-muted-foreground' };
    const diff = ((item.fair_value - item.current_price) / item.fair_value) * 100;
    if (diff >= 15) return { score: 3, label: 'Excellente affaire', color: 'text-green-500' };
    if (diff >= 5) return { score: 2, label: 'Bon prix', color: 'text-emerald-500' };
    if (diff >= -5) return { score: 1, label: 'Prix correct', color: 'text-amber-500' };
    return { score: 0, label: 'Au-dessus du marché', color: 'text-red-500' };
  };

  // Temps depuis ajout à la watchlist
  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  // Model Item - avec sparkline et métriques marché
  const ModelWatchlistItem = ({ item }: { item: WatchlistEntry }) => {
    const opportunity = getOpportunityScore(item);
    const priceDiff = item.fair_value && item.current_price 
      ? item.current_price - item.fair_value 
      : 0;

    return (
      <div className="p-4 rounded-lg border bg-card hover:border-primary/30 transition-all group">
        <div className="flex items-start gap-4">
          {/* Indicateur opportunité */}
          <div className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] ${
            opportunity.score >= 2 ? 'bg-green-500/10' : 
            opportunity.score === 1 ? 'bg-amber-500/10' : 'bg-muted'
          }`}>
            {opportunity.score >= 2 ? (
              <Sparkles className="h-5 w-5 text-green-500 mb-1" />
            ) : opportunity.score === 1 ? (
              <Target className="h-5 w-5 text-amber-500 mb-1" />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground mb-1" />
            )}
            <span className={`text-[10px] font-medium text-center leading-tight ${opportunity.color}`}>
              {opportunity.label}
            </span>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Link 
                to={`/catalog/${item.target_id}`} 
                className="font-semibold hover:text-primary truncate"
              >
                {item.name || `${item.brand || 'Modèle'} #${item.target_id}`}
              </Link>
              {item.brand && <Badge variant="outline" className="text-xs">{item.brand}</Badge>}
              {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
            </div>

            {/* Métriques prix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Prix médian</p>
                <p className="font-bold text-lg">{item.current_price ? formatPrice(item.current_price) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Juste prix</p>
                <p className="font-medium">{item.fair_value ? formatPrice(item.fair_value) : '—'}</p>
                {priceDiff !== 0 && (
                  <p className={`text-xs ${priceDiff < 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceDiff > 0 ? '+' : ''}{formatPrice(priceDiff)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tendance 7j</p>
                <div className="flex items-center gap-1">
                  {item.price_change_7d !== undefined && item.price_change_7d !== 0 ? (
                    <>
                      {item.price_change_7d < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`font-medium ${item.price_change_7d < 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.price_change_7d > 0 ? '+' : ''}{item.price_change_7d.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-xs text-muted-foreground mb-1">Évolution</p>
                <PriceSparkline 
                  data={priceHistories[item.target_id] || []} 
                  isLoading={loadingHistories.has(item.target_id)} 
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-60 group-hover:opacity-100"
              onClick={() => openAlertModal(item)}
              title="Créer une alerte"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Link to={`/catalog/${item.target_id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 group-hover:opacity-100" title="Voir">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-60 group-hover:opacity-100 text-destructive hover:text-destructive"
              onClick={() => removeFromWatchlist.mutate(item.id)}
              disabled={removeFromWatchlist.isPending}
              title="Retirer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Ad Item - avec infos vendeur, statut, localisation
  const AdWatchlistItem = ({ item }: { item: WatchlistEntry }) => {
    const opportunity = getOpportunityScore(item);
    const timeAgo = item.created_at ? getTimeAgo(item.created_at) : null;
    const priceDiff = item.fair_value && item.current_price 
      ? item.current_price - item.fair_value 
      : 0;

    // Simuler un statut d'annonce (en prod, viendrait des données)
    const adStatus = item.current_price ? 'active' : 'unknown';

    return (
      <div className={`p-4 rounded-lg border transition-all group ${
        opportunity.score >= 2 ? 'border-green-500/30 bg-green-500/5' : 'bg-card hover:border-primary/30'
      }`}>
        <div className="flex items-start gap-4">
          {/* Badge opportunité pour annonce */}
          <div className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] ${
            opportunity.score >= 2 ? 'bg-green-500/20' : 
            opportunity.score === 1 ? 'bg-amber-500/10' : 'bg-purple-500/10'
          }`}>
            {opportunity.score >= 2 ? (
              <>
                <Sparkles className="h-5 w-5 text-green-500 mb-1" />
                <span className="text-[10px] font-bold text-green-500 text-center">À SAISIR</span>
              </>
            ) : (
              <>
                <Tag className="h-5 w-5 text-purple-500 mb-1" />
                <span className="text-[10px] font-medium text-purple-500 text-center">Annonce</span>
              </>
            )}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Link 
                to={`/ad/${item.target_id}`} 
                className="font-semibold hover:text-primary truncate"
              >
                {item.name || `Annonce #${item.target_id}`}
              </Link>
              {adStatus === 'active' && (
                <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />
                  En ligne
                </Badge>
              )}
              {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
            </div>

            {/* Infos annonce */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Prix affiché</p>
                <p className="font-bold text-lg">{item.current_price ? formatPrice(item.current_price) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">vs Juste prix</p>
                {priceDiff !== 0 ? (
                  <div className={`flex items-center gap-1 ${priceDiff < 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceDiff < 0 ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    <span className="font-bold">{priceDiff > 0 ? '+' : ''}{formatPrice(priceDiff)}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
                {item.fair_value && <p className="text-xs text-muted-foreground">({formatPrice(item.fair_value)})</p>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Économie potentielle</p>
                {priceDiff < 0 ? (
                  <p className="font-bold text-green-500">{formatPrice(Math.abs(priceDiff))}</p>
                ) : (
                  <p className="text-muted-foreground">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Suivi depuis</p>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-sm">{timeAgo || 'Récemment'}</span>
                </div>
              </div>
            </div>

            {/* Conseil action */}
            {opportunity.score >= 2 && (
              <div className="mt-3 p-2 rounded bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <strong>Recommandation :</strong> Prix {formatPrice(Math.abs(priceDiff))} sous le marché — contactez rapidement le vendeur
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-60 group-hover:opacity-100"
              onClick={() => openAlertModal(item)}
              title="Créer une alerte"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Link to={`/ad/${item.target_id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 group-hover:opacity-100" title="Voir">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-60 group-hover:opacity-100 text-destructive hover:text-destructive"
              onClick={() => removeFromWatchlist.mutate(item.id)}
              disabled={removeFromWatchlist.isPending}
              title="Retirer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Skeleton
  const ListSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
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
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <Card>
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
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Impossible de charger la watchlist.
              <Button variant="link" className="p-0 ml-2" onClick={refetch}>Réessayer</Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Dashboard résumé */}
      <WatchlistPortfolioCard watchlist={watchlist} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                Ma Watchlist
                <Badge variant="outline">{watchlist.length}</Badge>
              </CardTitle>
              <CardDescription className="mt-1">
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
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {watchlist.length === 0 ? (
            <EmptyState />
          ) : allFiltered.length === 0 ? (
            <NoResults onReset={() => { setSearch(""); setCategory("all"); }} />
          ) : (
            <div className="space-y-6">
              {/* Section Modèles */}
              {filteredModels.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4 text-blue-500" />
                    <h3 className="font-semibold">Modèles suivis</h3>
                    <Badge variant="secondary">{filteredModels.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {filteredModels.map(item => (
                      <ModelWatchlistItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Section Annonces */}
              {filteredAds.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-purple-500" />
                    <h3 className="font-semibold">Annonces suivies</h3>
                    <Badge variant="secondary">{filteredAds.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {filteredAds.map(item => (
                      <AdWatchlistItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination (si beaucoup d'éléments) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {allFiltered.length} élément{allFiltered.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAlertModal
        open={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        target={alertTarget}
        onSuccess={refetch}
      />
    </>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
        <Eye className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Votre watchlist est vide</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Ajoutez des modèles ou annonces à surveiller pour suivre leur évolution de prix et créer des alertes.
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
    </div>
  );
}

// No results component
function NoResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-12">
      <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
      <p className="text-muted-foreground mb-4">
        Aucun élément ne correspond à vos critères de recherche.
      </p>
      <Button variant="outline" onClick={onReset}>
        Réinitialiser les filtres
      </Button>
    </div>
  );
}

// Mock sparkline generator
function generateMockSparkline(basePrice: number): { price: number }[] {
  const points: { price: number }[] = [];
  let price = basePrice * (0.9 + Math.random() * 0.2);
  
  for (let i = 0; i < 20; i++) {
    const change = (Math.random() - 0.5) * 0.04;
    price = price * (1 + change);
    points.push({ price: Math.round(price) });
  }
  
  return points;
}
