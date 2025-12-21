import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, CreditCard, Eye, Bell, TrendingDown, TrendingUp, Trash2, Settings, Zap, AlertCircle, Plus, Crown, Building2, Calendar, Check, Activity, AlertTriangle, Clock, CheckCircle2, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import ScrapModal from "@/components/ScrapModal";
import { useAuth } from "@/context/AuthContext";
import { AccountSummary } from "@/components/account/AccountSummary";
import { CreditResetInfo as CreditResetInfoComponent } from "@/components/credits/CreditResetInfo";
import {
  useWatchlist,
  useRemoveFromWatchlist,
  useAddToWatchlist,
  useAlerts,
  useCreateAlert,
  useUpdateAlert,
  useDeleteAlert,
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useModelsAutocomplete,
  useSubscriptionPlans,
  useUserSubscription,
  useSubscriptionHistory,
  useSubscribe,
} from "@/hooks/useProviderData";
import type { SubscriptionPlan } from "@/providers/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function MyAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const defaultTab = searchParams.get('tab') || 'dashboard';

  // Dashboard states
  const [showScrapModal, setShowScrapModal] = useState(false);

  // Provider hooks for subscriptions
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: subscriptionLoading } = useUserSubscription();
  const { data: subscriptionHistory } = useSubscriptionHistory();
  const subscribeMutation = useSubscribe();

  // Watchlist & Alerts hooks
  const { data: watchlistData, isLoading: loadingWatchlist } = useWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const addToWatchlist = useAddToWatchlist();
  const { data: alertsData, isLoading: loadingAlerts } = useAlerts();
  const createAlert = useCreateAlert();
  const updateAlert = useUpdateAlert();
  const deleteAlert = useDeleteAlert();

  // Notifications hooks
  const { data: notificationsData, isLoading: loadingNotifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  // Models autocomplete for adding to watchlist
  const [modelSearch, setModelSearch] = useState("");
  const { data: modelsData } = useModelsAutocomplete(modelSearch);

  // Dialog states
  const [showAddWatchlistDialog, setShowAddWatchlistDialog] = useState(false);
  const [showAddAlertDialog, setShowAddAlertDialog] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [alertType, setAlertType] = useState<'deal_detected' | 'price_below' | 'price_above'>('price_below');
  const [priceThreshold, setPriceThreshold] = useState("");

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }


  const handleSubscribe = async (planId: string) => {
    subscribeMutation.mutate(planId, {
      onSuccess: () => {
        toast({ title: "Succès", description: "Abonnement activé avec succès" });
      },
      onError: () => {
        toast({ title: "Erreur", description: "Impossible de s'abonner", variant: "destructive" });
      }
    });
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic": return <Zap className="h-6 w-6" />;
      case "pro": return <Crown className="h-6 w-6" />;
      case "elite": return <Building2 className="h-6 w-6" />;
      default: return <CreditCard className="h-6 w-6" />;
    }
  };

  const renderFeatures = (features: SubscriptionPlan['features']) => {
    if (!features) return null;
    if (Array.isArray(features)) {
      return features.map((feature, index) => (
        <div key={index} className="flex items-center gap-3">
          <Check className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-sm">{feature}</span>
        </div>
      ));
    }
    if (typeof features === 'object') {
      const featureLabels: Record<string, string> = {
        credits_mensuels: "Crédits mensuels",
        catalogue_complet: "Catalogue complet",
        alertes_email: "Alertes email",
        historique_prix: "Historique des prix",
        acces_estimator: "Accès estimator",
        alertes_temps_reel: "Alertes temps réel",
        analyses_detaillees: "Analyses détaillées",
        comparateur_modeles: "Comparateur de modèles",
        acces_complet: "Accès complet",
        scrap_personnel: "Scrap personnel",
        publication_anticipee: "Publication anticipée",
        exports_personnalises: "Exports personnalisés",
        support_prioritaire: "Support prioritaire",
        alertes_instantanees: "Alertes instantanées",
        rapports_mensuels: "Rapports mensuels",
        credits: "Crédits",
      };
      return Object.entries(features as Record<string, unknown>).map(([key, value]) => {
        if (value === false || value === "" || value === null) return null;
        const label = featureLabels[key] || key;
        if (key === "credits" && typeof value === "number") {
          return (
            <div key={key} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">{value} crédits/mois</span>
            </div>
          );
        }
        if (value === true || value === "Inclus") {
          return (
            <div key={key} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">{label}</span>
            </div>
          );
        }
        return null;
      }).filter(Boolean);
    }
    return null;
  };

  // Watchlist handlers
  const handleRemoveFromWatchlist = (id: number) => {
    removeFromWatchlist.mutate(id, {
      onSuccess: () => toast({ title: "Supprimé", description: "Élément retiré de la watchlist" }),
      onError: () => toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" })
    });
  };

  const handleAddToWatchlist = () => {
    if (!selectedModelId) return;
    addToWatchlist.mutate({ target_type: 'model', target_id: selectedModelId }, {
      onSuccess: () => {
        toast({ title: "Ajouté", description: "Modèle ajouté à la watchlist" });
        setShowAddWatchlistDialog(false);
        setSelectedModelId(null);
        setModelSearch("");
      },
      onError: () => toast({ title: "Erreur", description: "Impossible d'ajouter", variant: "destructive" })
    });
  };

  // Alert handlers
  const handleCreateAlert = () => {
    if (!selectedModelId) return;
    createAlert.mutate({
      target_type: 'model',
      target_id: selectedModelId,
      alert_type: alertType as 'deal_detected' | 'price_below' | 'price_above',
      price_threshold: priceThreshold ? parseFloat(priceThreshold) : undefined
    }, {
      onSuccess: () => {
        toast({ title: "Alerte créée", description: "Vous serez notifié" });
        setShowAddAlertDialog(false);
        setSelectedModelId(null);
        setPriceThreshold("");
      },
      onError: () => toast({ title: "Erreur", description: "Impossible de créer l'alerte", variant: "destructive" })
    });
  };

  const handleDeleteAlert = (id: number) => {
    deleteAlert.mutate(id, {
      onSuccess: () => toast({ title: "Supprimée", description: "Alerte supprimée" }),
      onError: () => toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" })
    });
  };

  const handleToggleAlert = (id: number, isActive: boolean) => {
    updateAlert.mutate({ id, data: { is_active: !isActive } }, {
      onSuccess: () => toast({ title: "Mis à jour", description: `Alerte ${!isActive ? 'activée' : 'désactivée'}` })
    });
  };

  // Notification handlers
  const handleMarkAsRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => toast({ title: "Succès", description: "Toutes les notifications ont été marquées comme lues" })
    });
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification.mutate(id, {
      onSuccess: () => toast({ title: "Supprimée", description: "Notification supprimée" })
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "price_drop": return <TrendingDown className="h-5 w-5 text-success" />;
      case "price_increase": return <TrendingUp className="h-5 w-5 text-destructive" />;
      case "alert": return <AlertCircle className="h-5 w-5 text-warning" />;
      case "success": return <CheckCircle2 className="h-5 w-5 text-success" />;
      default: return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  if (authLoading || plansLoading || subscriptionLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const watchlistItems = watchlistData?.items ?? [];
  const alerts = alertsData?.items ?? [];
  const notifications = notificationsData?.items ?? [];
  const unreadCount = notificationsData?.unread_count ?? 0;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mon Compte</h1>
        <p className="text-muted-foreground">Gérez votre abonnement, vos crédits et votre watchlist</p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Abonnement
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="gap-2">
            <Eye className="h-4 w-4" />
            Watchlist
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 relative">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <AccountSummary onLaunchScrap={() => setShowScrapModal(true)} />
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-8">
          {currentSubscription && (
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                      {getPlanIcon(currentSubscription.plan.name)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Abonnement actuel</CardTitle>
                      <CardDescription className="text-base mt-1">
                        Vous êtes abonné au plan {currentSubscription.plan.name}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="default" className="px-3 py-1">Actif</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Début: {format(new Date(currentSubscription.started_at), "dd MMMM yyyy", { locale: fr })}</span>
                </div>
                {currentSubscription.credits_remaining !== null && (
                  <div className="space-y-3 p-4 rounded-lg bg-background/50 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Crédits restants</span>
                      </div>
                      <span className="text-2xl font-bold">{currentSubscription.credits_remaining}</span>
                    </div>
                    {currentSubscription.credits_reset_date && (
                      <CreditResetInfoComponent
                        resetDate={currentSubscription.credits_reset_date}
                        creditsRemaining={currentSubscription.credits_remaining}
                        variant="default"
                      />
                    )}
                  </div>
                )}
                <div className="space-y-3">{renderFeatures(currentSubscription.plan.features)}</div>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-6">Plans disponibles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {(plans || []).map(plan => {
                const isCurrentPlan = currentSubscription?.plan_id === plan.id;
                const isPro = plan.name.toLowerCase() === "pro";
                return (
                  <Card key={plan.id} className={`relative transition-all hover:shadow-lg ${isCurrentPlan ? "border-primary shadow-md" : ""} ${isPro ? "border-primary/50" : ""}`}>
                    {isPro && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary">Populaire</Badge>
                      </div>
                    )}
                    <CardHeader className="space-y-4 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${plan.name.toLowerCase() === "basic" ? "bg-muted" : plan.name.toLowerCase() === "pro" ? "bg-primary/10" : "bg-accent/10"}`}>
                          {getPlanIcon(plan.name)}
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                      </div>
                      <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                      <div className="pt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">{plan.price}€</span>
                          <span className="text-muted-foreground">/mois</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-6">{renderFeatures(plan.features)}</CardContent>
                    <CardFooter>
                      {isCurrentPlan ? (
                        <Button disabled className="w-full" variant="secondary">Plan actuel</Button>
                      ) : (
                        <Button 
                          onClick={() => handleSubscribe(plan.id)} 
                          className="w-full" 
                          variant={isPro ? "default" : "outline"}
                          disabled={subscribeMutation.isPending}
                        >
                          {subscribeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Choisir ce plan
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground">
                Suivez {watchlistItems.length} élément{watchlistItems.length > 1 ? "s" : ""} et configurez vos alertes
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showAddWatchlistDialog} onOpenChange={setShowAddWatchlistDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" />Ajouter à la watchlist</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter à la watchlist</DialogTitle>
                    <DialogDescription>Recherchez un modèle à suivre</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Rechercher un modèle</Label>
                      <Input
                        placeholder="RTX 4060, Ryzen 7..."
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    {modelsData && modelsData.length > 0 && (
                      <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                        {modelsData.map((model) => (
                          <div
                            key={model.id}
                            className={`p-2 rounded cursor-pointer hover:bg-muted ${selectedModelId === model.id ? 'bg-primary/10 border border-primary/30' : ''}`}
                            onClick={() => setSelectedModelId(model.id)}
                          >
                            <p className="font-medium">{model.name}</p>
                            <p className="text-xs text-muted-foreground">{model.brand} • {model.category}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleAddToWatchlist} disabled={!selectedModelId || addToWatchlist.isPending} className="flex-1">
                        {addToWatchlist.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Ajouter
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddWatchlistDialog(false)}>Annuler</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showAddAlertDialog} onOpenChange={setShowAddAlertDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2"><Bell className="h-4 w-4" />Créer une alerte</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une alerte</DialogTitle>
                    <DialogDescription>Soyez notifié quand les conditions sont remplies</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Rechercher un modèle</Label>
                      <Input
                        placeholder="RTX 4060, Ryzen 7..."
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    {modelsData && modelsData.length > 0 && (
                      <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                        {modelsData.map((model) => (
                          <div
                            key={model.id}
                            className={`p-2 rounded cursor-pointer hover:bg-muted ${selectedModelId === model.id ? 'bg-primary/10 border border-primary/30' : ''}`}
                            onClick={() => setSelectedModelId(model.id)}
                          >
                            <p className="font-medium">{model.name}</p>
                            <p className="text-xs text-muted-foreground">{model.brand} • {model.category}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div>
                      <Label>Type d'alerte</Label>
                      <Select value={alertType} onValueChange={(v) => setAlertType(v as typeof alertType)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price_below">Prix inférieur à</SelectItem>
                          <SelectItem value="price_above">Prix supérieur à</SelectItem>
                          <SelectItem value="deal_detected">Bonne affaire détectée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(alertType === 'price_below' || alertType === 'price_above') && (
                      <div>
                        <Label>Seuil de prix (€)</Label>
                        <Input
                          type="number"
                          placeholder="350"
                          value={priceThreshold}
                          onChange={(e) => setPriceThreshold(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    )}
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleCreateAlert} disabled={!selectedModelId || createAlert.isPending} className="flex-1">
                        {createAlert.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Créer l'alerte
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddAlertDialog(false)}>Annuler</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loadingWatchlist ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : watchlistItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">Votre watchlist est vide</p>
                <Button className="mt-4" onClick={() => setShowAddWatchlistDialog(true)}>
                  Ajouter un modèle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2">
              {watchlistItems.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <Link to={item.target_type === 'model' ? `/model/${item.target_id}` : `/ad/${item.target_id}`} className="hover:underline">
                            <h3 className="font-semibold">{item.name}</h3>
                          </Link>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.category}</Badge>
                            {item.brand && <span className="text-sm text-muted-foreground">{item.brand}</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFromWatchlist(item.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        {item.current_price && (
                          <span className="text-lg font-bold">{item.current_price}€</span>
                        )}
                        {item.price_change_7d !== undefined && (
                          <Badge variant={item.price_change_7d < 0 ? "default" : "secondary"}>
                            {item.price_change_7d > 0 ? "+" : ""}{item.price_change_7d}%
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Alerts Section */}
          <div className="pt-8">
            <h2 className="text-xl font-bold mb-4">Mes alertes</h2>
            {loadingAlerts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : alerts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Bell className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Aucune alerte configurée</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={!alert.is_active ? "opacity-60" : ""}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className={`h-5 w-5 ${alert.is_active ? "text-primary" : "text-muted-foreground"}`} />
                          <div>
                            <p className="font-medium">{alert.target_name || 'Alerte'}</p>
                            <p className="text-sm text-muted-foreground">
                              {alert.alert_type === 'price_below' && alert.price_threshold
                                ? `Prix < ${alert.price_threshold}€`
                                : alert.alert_type === 'price_above' && alert.price_threshold
                                ? `Prix > ${alert.price_threshold}€`
                                : 'Deal détecté'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleAlert(alert.id, alert.is_active)}>
                            {alert.is_active ? "Désactiver" : "Activer"}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAlert(alert.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}` : "Toutes les notifications sont lues"}
            </p>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                Tout marquer comme lu
              </Button>
            )}
          </div>

          {loadingNotifications ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune notification</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
              {notifications.map((notification) => (
                <motion.div key={notification.id} variants={itemVariants}>
                  <Card className={`transition-all ${!notification.is_read ? "border-primary/50 bg-primary/5" : ""}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.is_read && (
                                <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(notification.id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteNotification(notification.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                            </span>
                            {notification.link && (
                              <Link to={notification.link} className="text-xs text-primary hover:underline ml-2">
                                Voir détails
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <ScrapModal open={showScrapModal} onOpenChange={setShowScrapModal} />
    </div>
  );
}
