import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, CreditCard, Eye, Bell, TrendingDown, TrendingUp, Trash2, Settings, Zap, AlertCircle, Plus, Crown, Building2, Calendar, Check, Activity, AlertTriangle, Clock, CheckCircle2, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";
import ScrapModal from "@/components/ScrapModal";
import { useWatchlist, useRemoveFromWatchlist, useAddToWatchlist } from "@/hooks/useWatchlist";
import { useAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert } from "@/hooks/useAlerts";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from "@/hooks/useNotifications";
import { useModelsAutocomplete } from "@/hooks/useEstimator";
import { Link } from "react-router-dom";

type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];
type UserSubscription = Database["public"]["Tables"]["user_subscriptions"]["Row"] & {
  subscription_plans: SubscriptionPlan;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function MyAccount() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const defaultTab = searchParams.get('tab') || 'dashboard';

  // Subscription states
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<UserSubscription[]>([]);

  // Dashboard states
  const [showScrapModal, setShowScrapModal] = useState(false);
  const userCredits = currentSubscription?.credits_remaining ?? 0;
  const maxCredits = 200;
  const creditPercentage = Math.min((userCredits / maxCredits) * 100, 100);

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    loadData(user.id);
  };

  const loadData = async (userId: string) => {
    try {
      const { data: plansData } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });
      setPlans(plansData || []);

      const { data: currentSub } = await supabase
        .from("user_subscriptions")
        .select(`*, subscription_plans (*)`)
        .eq("user_id", userId)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setCurrentSubscription(currentSub);

      const { data: historyData } = await supabase
        .from("user_subscriptions")
        .select(`*, subscription_plans (*)`)
        .eq("user_id", userId)
        .order("started_at", { ascending: false });
      setSubscriptionHistory(historyData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("user_subscriptions").insert({
        user_id: user.id,
        plan_id: planId,
        status: "active",
        started_at: new Date().toISOString()
      });
      if (error) throw error;
      toast({ title: "Succès", description: "Abonnement activé avec succès" });
      loadData(user.id);
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({ title: "Erreur", description: "Impossible de s'abonner", variant: "destructive" });
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic": return <Zap className="h-6 w-6" />;
      case "pro": return <Crown className="h-6 w-6" />;
      case "elite": return <Building2 className="h-6 w-6" />;
      default: return <CreditCard className="h-6 w-6" />;
    }
  };

  const renderFeatures = (features: any) => {
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
        rapports_mensuels: "Rapports mensuels"
      };
      return Object.entries(features as Record<string, any>).map(([key, value]) => {
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
      alert_type: alertType,
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

  if (loading) {
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
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Crédits disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{userCredits}</span>
                  <span className="text-muted-foreground">/ {maxCredits}</span>
                </div>
                <Progress value={creditPercentage} className="h-2" />
                {currentSubscription?.credits_reset_date && (
                  <p className="text-sm text-muted-foreground">
                    Renouvellement le {format(new Date(currentSubscription.credits_reset_date), "dd MMMM yyyy", { locale: fr })}
                  </p>
                )}
                <Button className="w-full" onClick={() => setShowScrapModal(true)}>Lancer un scrap</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Activité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Watchlist</span>
                    <span className="font-bold">{watchlistItems.length} éléments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alertes actives</span>
                    <span className="font-bold">{alerts.filter(a => a.is_active).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Notifications non lues</span>
                    <span className="font-bold">{unreadCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-8">
          {currentSubscription && (
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                      {getPlanIcon(currentSubscription.subscription_plans.name)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Abonnement actuel</CardTitle>
                      <CardDescription className="text-base mt-1">
                        Vous êtes abonné au plan {currentSubscription.subscription_plans.name}
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
                      <p className="text-xs text-muted-foreground">
                        Renouvellement le {format(new Date(currentSubscription.credits_reset_date), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-3">{renderFeatures(currentSubscription.subscription_plans.features)}</div>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-6">Plans disponibles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map(plan => {
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
                        <Button onClick={() => handleSubscribe(plan.id)} className="w-full" variant={isPro ? "default" : "outline"}>
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
                      <div className="max-h-32 overflow-y-auto space-y-1 border rounded-lg p-2">
                        {modelsData.map((model) => (
                          <div
                            key={model.id}
                            className={`p-2 rounded cursor-pointer hover:bg-muted ${selectedModelId === model.id ? 'bg-primary/10 border border-primary/30' : ''}`}
                            onClick={() => setSelectedModelId(model.id)}
                          >
                            <p className="font-medium text-sm">{model.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div>
                      <Label>Type d'alerte</Label>
                      <Select value={alertType} onValueChange={(v) => setAlertType(v as any)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deal_detected">Bonne affaire détectée</SelectItem>
                          <SelectItem value="price_below">Prix inférieur à</SelectItem>
                          <SelectItem value="price_above">Prix supérieur à</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(alertType === 'price_below' || alertType === 'price_above') && (
                      <div>
                        <Label>Seuil de prix (€)</Label>
                        <Input
                          type="number"
                          placeholder="200"
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

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <Card className="border-warning/20 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-warning" />
                  Alertes configurées ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center justify-between p-3 rounded-lg border ${alert.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${alert.is_active ? 'bg-warning/10' : 'bg-muted'}`}>
                          <Bell className={`h-5 w-5 ${alert.is_active ? 'text-warning' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{alert.target_name || `#${alert.target_id}`}</p>
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
                        <Button
                          size="sm"
                          variant={alert.is_active ? "outline" : "default"}
                          onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                          disabled={updateAlert.isPending}
                        >
                          {alert.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteAlert(alert.id)}
                          disabled={deleteAlert.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Watchlist Items */}
          {loadingWatchlist ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : watchlistItems.length > 0 ? (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid lg:grid-cols-2 gap-4">
              {watchlistItems.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <Link to={item.target_type === 'model' ? `/models/${item.target_id}` : `/ads/${item.target_id}`} className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{item.category || item.target_type}</Badge>
                            {item.brand && <Badge variant="secondary">{item.brand}</Badge>}
                          </div>
                          <h3 className="font-semibold mb-1">{item.name || `#${item.target_id}`}</h3>
                          {item.current_price && (
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-bold">{item.current_price}€</span>
                              {item.price_change_7d !== undefined && (
                                <span className={`text-sm font-medium flex items-center gap-1 ${item.price_change_7d < 0 ? 'text-success' : 'text-destructive'}`}>
                                  {item.price_change_7d < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                                  {item.price_change_7d.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          )}
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveFromWatchlist(item.id)}
                          disabled={removeFromWatchlist.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Watchlist vide</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Ajoutez des modèles pour suivre leurs prix
                </p>
                <Button onClick={() => setShowAddWatchlistDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un modèle
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les notifications sont lues'}
            </p>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={markAllRead.isPending}>
                {markAllRead.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Tout marquer comme lu
              </Button>
            )}
          </div>

          {loadingNotifications ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length > 0 ? (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  variants={itemVariants}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${!notif.is_read ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${!notif.is_read ? 'bg-primary/10' : 'bg-muted'}`}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{notif.title}</h4>
                      {!notif.is_read && <Badge variant="default" className="text-xs">Nouveau</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notif.is_read && (
                      <Button size="icon" variant="ghost" onClick={() => handleMarkAsRead(notif.id)} disabled={markRead.isPending}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    {notif.link && (
                      <Link to={notif.link}>
                        <Button size="sm" variant="outline">Voir</Button>
                      </Link>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteNotification(notif.id)} disabled={deleteNotification.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
                <p className="text-muted-foreground text-center">
                  Vos notifications apparaîtront ici
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ScrapModal open={showScrapModal} onOpenChange={setShowScrapModal} />
    </div>
  );
}
