import { useState, useMemo, useEffect } from "react";
import { Eye, Plus, Trash2, ExternalLink, TrendingDown, TrendingUp, Bell, Search, Filter, ChevronLeft, ChevronRight, Package, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { useCreateAlert } from "@/hooks/useProviderData";
import { useDataProvider } from "@/providers";
import { useToast } from "@/hooks/use-toast";
import type { WatchlistEntry, PriceHistoryPoint, CreateAlertPayload } from "@/providers/types";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
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

// Alert creation modal
function CreateAlertModal({
  open,
  onClose,
  item,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  item: WatchlistEntry | null;
  onSuccess: () => void;
}) {
  const [alertType, setAlertType] = useState<'deal_detected' | 'price_below' | 'price_above'>('deal_detected');
  const [threshold, setThreshold] = useState<string>('');
  const createAlert = useCreateAlert();
  const { toast } = useToast();

  useEffect(() => {
    if (item?.current_price) {
      setThreshold(Math.round(item.current_price * 0.9).toString());
    }
  }, [item]);

  const handleSubmit = () => {
    if (!item) return;

    const payload: CreateAlertPayload = {
      target_type: item.target_type,
      target_id: item.target_id,
      alert_type: alertType,
      price_threshold: alertType !== 'deal_detected' ? parseFloat(threshold) : undefined,
    };

    createAlert.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Alerte créée",
          description: `Vous serez notifié pour ${item.name || 'cet élément'}`,
        });
        onSuccess();
        onClose();
      },
      onError: () => {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'alerte",
          variant: "destructive",
        });
      },
    });
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            Créer une alerte
          </DialogTitle>
          <DialogDescription>
            Configurez une alerte pour <span className="font-medium text-foreground">{item.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Prix actuel */}
          {item.current_price && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Prix actuel</span>
              <span className="font-semibold">{item.current_price.toLocaleString('fr-FR')} €</span>
            </div>
          )}

          {/* Type d'alerte */}
          <div className="space-y-2">
            <Label>Type d'alerte</Label>
            <RadioGroup value={alertType} onValueChange={(v) => setAlertType(v as typeof alertType)}>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="deal_detected" id="deal" />
                <Label htmlFor="deal" className="flex-1 cursor-pointer">
                  <div className="font-medium">Bonne affaire</div>
                  <div className="text-xs text-muted-foreground">Notifié quand une bonne affaire est détectée</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="price_below" id="below" />
                <Label htmlFor="below" className="flex-1 cursor-pointer">
                  <div className="font-medium">Prix en dessous de...</div>
                  <div className="text-xs text-muted-foreground">Notifié quand le prix passe sous un seuil</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="price_above" id="above" />
                <Label htmlFor="above" className="flex-1 cursor-pointer">
                  <div className="font-medium">Prix au dessus de...</div>
                  <div className="text-xs text-muted-foreground">Notifié quand le prix dépasse un seuil</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Seuil de prix */}
          {alertType !== 'deal_detected' && (
            <div className="space-y-2">
              <Label htmlFor="threshold">Seuil de prix (€)</Label>
              <div className="relative">
                <Input
                  id="threshold"
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="Ex: 350"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              </div>
              {item.current_price && (
                <p className="text-xs text-muted-foreground">
                  {alertType === 'price_below' 
                    ? `Actuellement ${((1 - parseFloat(threshold || '0') / item.current_price) * 100).toFixed(0)}% en dessous du prix actuel`
                    : `Actuellement ${((parseFloat(threshold || '0') / item.current_price - 1) * 100).toFixed(0)}% au dessus du prix actuel`
                  }
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createAlert.isPending || (alertType !== 'deal_detected' && !threshold)}
          >
            {createAlert.isPending ? "Création..." : "Créer l'alerte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WatchlistTab({ watchlist, isLoading, error, refetch }: WatchlistTabProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WatchlistEntry | null>(null);
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
    setSelectedItem(item);
    setAlertModalOpen(true);
  };

  // Item component
  const WatchlistItem = ({ item, isModel }: { item: WatchlistEntry; isModel: boolean }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Icône type */}
        <div className={`p-2 rounded-lg flex-shrink-0 ${isModel ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
          {isModel ? <Package className="h-4 w-4 text-blue-500" /> : <Tag className="h-4 w-4 text-purple-500" />}
        </div>

        {/* Infos principales */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link 
              to={isModel ? `/catalog/${item.target_id}` : `/ad/${item.target_id}`} 
              className="font-medium hover:text-primary truncate"
            >
              {item.name || `${item.brand || 'Inconnu'} #${item.target_id}`}
            </Link>
            {item.category && <Badge variant="outline" className="text-xs">{item.category}</Badge>}
            {item.brand && <span className="text-xs text-muted-foreground">{item.brand}</span>}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            {item.current_price && (
              <span className="flex items-center gap-1">
                <span className="font-medium text-foreground">{formatPrice(item.current_price)}</span>
              </span>
            )}
            {item.fair_value && item.fair_value !== item.current_price && (
              <span className="text-xs">
                Juste prix : {formatPrice(item.fair_value)}
              </span>
            )}
            {item.price_change_7d !== undefined && item.price_change_7d !== 0 && (
              <span className={`flex items-center gap-1 ${item.price_change_7d < 0 ? "text-green-500" : "text-red-500"}`}>
                {item.price_change_7d < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {item.price_change_7d > 0 ? "+" : ""}{item.price_change_7d.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Sparkline (modèles uniquement) */}
        {isModel && (
          <div className="hidden md:block">
            <PriceSparkline 
              data={priceHistories[item.target_id] || []} 
              isLoading={loadingHistories.has(item.target_id)} 
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => openAlertModal(item)}
          title="Créer une alerte"
        >
          <Bell className="h-4 w-4" />
          <span className="hidden lg:inline">Alerte</span>
        </Button>
        <Link to={isModel ? `/catalog/${item.target_id}` : `/ad/${item.target_id}`}>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" title="Voir">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFromWatchlist.mutate(item.id)}
          disabled={removeFromWatchlist.isPending}
          title="Retirer"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

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
                  <div className="space-y-2">
                    {filteredModels.map(item => (
                      <WatchlistItem key={item.id} item={item} isModel={true} />
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
                  <div className="space-y-2">
                    {filteredAds.map(item => (
                      <WatchlistItem key={item.id} item={item} isModel={false} />
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
        item={selectedItem}
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
