import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Truck,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Flame,
  Heart,
  Bell,
  Share2,
  Info,
  Clock,
  Cpu,
  Monitor,
  Package,
  Calculator,
} from "lucide-react";
import { useAdDetail, useAdPriceHistory, useAddAdToWatchlist, useCreateAdAlert } from "@/hooks/useAdDetail";
import { AdDetailSkeleton } from "@/components/ad/AdDetailSkeleton";
import { ReportAdModal } from "@/components/ad/ReportAdModal";
import { DealCardImage } from "@/components/deals/DealCardImage";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdDetail() {
  const { id } = useParams();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertType, setAlertType] = useState<'deal_detected' | 'price_below'>('price_below');
  const [priceThreshold, setPriceThreshold] = useState("");

  // API queries
  const { data: ad, isLoading: adLoading, error: adError } = useAdDetail(id);
  const { data: priceHistory, isLoading: historyLoading } = useAdPriceHistory(id);
  const addToWatchlist = useAddAdToWatchlist();
  const createAlert = useCreateAdAlert();

  const handleToggleWatchlist = async () => {
    if (!ad) return;
    try {
      await addToWatchlist.mutateAsync(ad.id);
      setIsInWatchlist(true);
      toast({
        title: "Ajouté à la watchlist",
        description: "L'annonce a été ajoutée à votre watchlist.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter à la watchlist.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAlert = async () => {
    if (!ad) return;
    try {
      await createAlert.mutateAsync({
        target_type: 'ad',
        target_id: ad.id,
        alert_type: alertType,
        price_threshold: priceThreshold ? Number(priceThreshold) : undefined,
      });
      setShowAlertDialog(false);
      toast({
        title: "Alerte créée",
        description: alertType === 'price_below' 
          ? `Vous serez notifié si le prix passe sous ${priceThreshold}€.`
          : "Vous serez notifié si un deal est détecté.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'alerte.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Lien copié",
      description: "Le lien a été copié dans le presse-papier.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', variant: 'default' as const };
      case 'sold':
        return { label: 'Vendue', variant: 'secondary' as const };
      case 'expired':
        return { label: 'Expirée', variant: 'outline' as const };
      default:
        return { label: status, variant: 'outline' as const };
    }
  };

  const getConditionLabel = (condition: string | null) => {
    if (!condition) return 'Non spécifié';
    const labels: Record<string, string> = {
      'neuf': 'Neuf',
      'comme_neuf': 'Comme neuf',
      'bon': 'Bon état',
      'correct': 'État correct',
      'à_réparer': 'À réparer',
    };
    return labels[condition] || condition;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (adLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-7xl">
          <Button variant="ghost" className="mb-6 gap-2" asChild>
            <Link to="/deals">
              <ArrowLeft className="h-4 w-4" />
              Retour aux deals
            </Link>
          </Button>
          <AdDetailSkeleton />
        </div>
      </div>
    );
  }

  if (adError || !ad) {
    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-7xl">
          <Button variant="ghost" className="mb-6 gap-2" asChild>
            <Link to="/deals">
              <ArrowLeft className="h-4 w-4" />
              Retour aux deals
            </Link>
          </Button>
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">Annonce non trouvée.</p>
              <Button variant="outline" asChild>
                <Link to="/deals">Retour aux deals</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(ad.status);
  const priceDiff = ad.fair_value && ad.deviation_pct 
    ? { percent: ad.deviation_pct, isGoodDeal: ad.deviation_pct < 0 }
    : null;

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 gap-2" asChild>
          <Link to="/deals">
            <ArrowLeft className="h-4 w-4" />
            Retour aux deals
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image + Header Combined */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden">
                <DealCardImage
                  imageUrl={(ad as any).image_url}
                  modelName={ad.model_name}
                  category={ad.category || 'Composant'}
                  alt={ad.title}
                  className="aspect-[16/9]"
                />
                <CardHeader className="pb-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {ad.category && <Badge variant="outline">{ad.category}</Badge>}
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    {ad.score && (
                      <Badge variant={ad.score >= 80 ? "default" : "secondary"}>
                        {ad.score >= 85 && <Flame className="h-3 w-3 mr-1" />}
                        Score: {ad.score}/100
                      </Badge>
                    )}
                    {ad.item_type !== 'component' && (
                      <Badge variant="secondary" className="gap-1">
                        {ad.item_type === 'pc' ? <Monitor className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                        {ad.item_type === 'pc' ? 'PC complet' : 'Lot'}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold">{ad.title}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span>{ad.platform}</span>
                    <span>•</span>
                    <span>#{ad.platform_ad_id}</span>
                  </div>
                  {ad.model_name && (
                    <Link
                      to={`/models/${ad.model_id}`}
                      className="text-primary hover:underline flex items-center gap-1 text-sm mt-2"
                    >
                      Voir fiche modèle: {ad.model_name}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </CardHeader>
              </Card>
            </motion.div>


            {/* Description */}
            {ad.description && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{ad.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Price History */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Historique des prix
                  </CardTitle>
                  {priceHistory && (
                    <CardDescription>
                      {priceHistory.price_drops_count} baisse{priceHistory.price_drops_count > 1 ? 's' : ''} de prix détectée{priceHistory.price_drops_count > 1 ? 's' : ''}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="h-[200px] flex items-center justify-center">
                      <p className="text-muted-foreground">Chargement...</p>
                    </div>
                  ) : priceHistory?.items.length ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={priceHistory.items}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis
                            dataKey="seen_at"
                            tickFormatter={(v) => new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                            className="text-xs"
                          />
                          <YAxis className="text-xs" />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (!active || !payload?.length) return null;
                              const data = payload[0]?.payload;
                              return (
                                <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl min-w-[180px]">
                                  <p className="font-semibold text-sm mb-2 pb-2 border-b border-border/50 text-foreground">
                                    {formatDate(String(label))}
                                  </p>
                                  <div className="flex justify-between items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                      <span className="text-sm text-foreground">Prix</span>
                                    </div>
                                    <span className="font-bold text-primary">{data?.price} €</span>
                                  </div>
                                  {data?.price_drop && (
                                    <p className="text-xs text-success mt-2 flex items-center gap-1">
                                      <TrendingDown className="h-3 w-3" />
                                      Baisse de prix détectée
                                    </p>
                                  )}
                                </div>
                              );
                            }}
                          />
                          <Line
                            type="stepAfter"
                            dataKey="price"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={(props) => {
                              const { cx, cy, payload } = props;
                              if (payload.price_drop) {
                                return (
                                  <circle cx={cx} cy={cy} r={6} fill="hsl(var(--success))" stroke="white" strokeWidth={2} />
                                );
                              }
                              return <circle cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" />;
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span>Prix initial: {priceHistory.initial_price}€</span>
                        <span>•</span>
                        <span>Prix actuel: {priceHistory.current_price}€</span>
                        {priceHistory.initial_price > priceHistory.current_price && (
                          <>
                            <span>•</span>
                            <span className="text-success">
                              Économie: {priceHistory.initial_price - priceHistory.current_price}€
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Historique des prix indisponible pour cette annonce.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Components (for PC/lot) */}
            {(ad.item_type === 'pc' || ad.item_type === 'lot') && ad.components && ad.components.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      Composants {ad.item_type === 'pc' ? 'du PC' : 'du lot'}
                    </CardTitle>
                    <CardDescription>
                      {ad.components.length} composant{ad.components.length > 1 ? 's' : ''} identifié{ad.components.length > 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ad.components.map((comp, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="shrink-0">{comp.role}</Badge>
                            <div>
                              {comp.model_id ? (
                                <Link 
                                  to={`/models/${comp.model_id}`}
                                  className="font-medium text-primary hover:underline"
                                >
                                  {comp.model_name}
                                </Link>
                              ) : (
                                <p className="font-medium">{comp.model_name}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {comp.brand} • {comp.category}
                              </p>
                            </div>
                          </div>
                          {comp.model_id && (
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                              <Link to={`/models/${comp.model_id}`}>
                                Voir la fiche
                                <ExternalLink className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {ad.item_type === 'pc' && (
                      <Alert className="mt-4">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          L'estimation individuelle n'est pas disponible pour les PC complets. Consultez les fiches de chaque composant pour connaître leur valeur.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Détails de l'annonce</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Localisation</p>
                          <p className="font-medium">
                            {[ad.city, ad.postal_code, ad.region].filter(Boolean).join(', ') || 'Non spécifié'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Condition</p>
                          <p className="font-medium">{getConditionLabel(ad.condition)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Publiée le</p>
                          <p className="font-medium">
                            {ad.published_at ? formatDate(ad.published_at) : 'Non spécifié'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Dernière mise à jour</p>
                          <p className="font-medium">
                            {formatDistanceToNow(new Date(ad.last_seen_at), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        {ad.delivery_possible ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>Livraison {ad.delivery_possible ? 'disponible' : 'non disponible'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {ad.secured_payment ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>Paiement sécurisé {ad.secured_payment ? 'disponible' : 'non disponible'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Sticky */}
          <div className="lg:sticky lg:top-8 space-y-5 self-start">
            {/* Price & Deal Card */}
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">{ad.price} €</div>
                  {ad.fair_value && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Fair value: <span className="line-through">{ad.fair_value} €</span>
                    </div>
                  )}
                  {priceDiff && (
                    <Badge 
                      variant={priceDiff.isGoodDeal ? "default" : "destructive"} 
                      className="mt-3"
                    >
                      {priceDiff.isGoodDeal ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {priceDiff.percent > 0 ? '+' : ''}{priceDiff.percent.toFixed(1)}% vs marché
                    </Badge>
                  )}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">État</span>
                    <span className="font-medium">{getConditionLabel(ad.condition)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Localisation</span>
                    <span className="font-medium">{ad.city || ad.region || 'Non spécifié'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full gap-2" asChild>
                  <a href={ad.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Voir l'annonce originale
                  </a>
                </Button>

                {ad.item_type === 'pc' ? (
                  <Button className="w-full gap-2" variant="secondary" disabled title="L'estimation n'est pas disponible pour les PC complets">
                    <Calculator className="h-4 w-4" />
                    Estimer (non disponible)
                  </Button>
                ) : (
                  <Button className="w-full gap-2" variant="secondary" asChild>
                    <Link to={`/estimator?ad_id=${ad.id}&model_id=${ad.model_id || ''}&model_name=${encodeURIComponent(ad.model_name || '')}&category=${encodeURIComponent(ad.category || '')}&price=${ad.price}&platform=${encodeURIComponent(ad.platform)}&condition=${encodeURIComponent(ad.condition || '')}&region=${encodeURIComponent(ad.region || '')}&city=${encodeURIComponent(ad.city || '')}`}>
                      <Calculator className="h-4 w-4" />
                      Estimer
                    </Link>
                  </Button>
                )}

                <Button
                  variant={isInWatchlist ? "secondary" : "outline"}
                  className="w-full gap-2"
                  onClick={handleToggleWatchlist}
                  disabled={addToWatchlist.isPending}
                >
                  <Heart className={`h-4 w-4 ${isInWatchlist ? 'fill-current' : ''}`} />
                  {isInWatchlist ? 'Dans la watchlist' : 'Ajouter à la watchlist'}
                </Button>

                <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <Bell className="h-4 w-4" />
                      Créer une alerte
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer une alerte</DialogTitle>
                      <DialogDescription>
                        Soyez notifié des changements sur cette annonce
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Type d'alerte</Label>
                        <Select value={alertType} onValueChange={(v: 'deal_detected' | 'price_below') => setAlertType(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price_below">Prix en dessous de...</SelectItem>
                            <SelectItem value="deal_detected">Deal détecté</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {alertType === 'price_below' && (
                        <div className="space-y-2">
                          <Label htmlFor="price-threshold">Seuil de prix (€)</Label>
                          <Input
                            id="price-threshold"
                            type="number"
                            placeholder={String(Math.round(ad.price * 0.9))}
                            value={priceThreshold}
                            onChange={(e) => setPriceThreshold(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateAlert} disabled={createAlert.isPending}>
                        Créer l'alerte
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" className="flex-1 gap-1" onClick={handleShare}>
                    <Share2 className="h-3 w-3" />
                    Partager
                  </Button>
                  <ReportAdModal adId={id!} adTitle={ad.title} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
