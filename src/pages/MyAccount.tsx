import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { User, CreditCard, Eye, Bell, TrendingDown, TrendingUp, Trash2, Settings, Zap, AlertCircle, Plus, Crown, Building2, Calendar, Check, Activity, AlertTriangle, Clock, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";
import { mockModels } from "@/lib/mockData";
import ScrapModal from "@/components/ScrapModal";
type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];
type UserSubscription = Database["public"]["Tables"]["user_subscriptions"]["Row"] & {
  subscription_plans: SubscriptionPlan;
};
type Notification = Database["public"]["Tables"]["notifications"]["Row"];
interface WatchlistItem {
  modelId: string;
  addedAt: string;
  alertThreshold: number;
  alertType: "below" | "above" | "both";
  lastNotification?: string;
}
const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
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
export default function MyAccount() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Subscription states
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<UserSubscription[]>([]);

  // Notifications states
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Dashboard states
  const [showScrapModal, setShowScrapModal] = useState(false);
  const userCredits = 150;
  const maxCredits = 200;
  const creditPercentage = userCredits / maxCredits * 100;
  const scrapHistory = [{
    id: "1",
    type: "Manual",
    model: "RTX 4060 Ti",
    date: "2025-01-14",
    duration: "2m 34s",
    results: 89,
    creditChange: -5
  }, {
    id: "2",
    type: "Auto",
    model: "Ryzen 7 7800X3D",
    date: "2025-01-13",
    duration: "3m 12s",
    results: 124,
    creditChange: -8
  }];

  // Watchlist states
  const [selectedModelForScan, setSelectedModelForScan] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [selectedModelToAdd, setSelectedModelToAdd] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("10");
  const [alertType, setAlertType] = useState<"below" | "above" | "both">("below");
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([{
    modelId: "1",
    addedAt: "2025-01-10",
    alertThreshold: 10,
    alertType: "below",
    lastNotification: "2025-01-14"
  }, {
    modelId: "3",
    addedAt: "2025-01-08",
    alertThreshold: 5,
    alertType: "both"
  }]);
  const alerts = [{
    id: "1",
    modelId: "1",
    type: "price_drop",
    message: "RTX 4060 Ti a baissé de 12% cette semaine !",
    date: "2025-01-14",
    isNew: true
  }];
  useEffect(() => {
    checkAuth();
  }, []);
  useEffect(() => {
    if (user) {
      // Setup realtime subscription for notifications
      const channel = supabase.channel('notifications').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          if (!(payload.new as Notification).is_read) {
            setUnreadCount(prev => prev + 1);
          }
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n));
          loadNotifications(user.id);
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          loadNotifications(user.id);
        }
      }).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  const checkAuth = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
    loadData(user.id);
  };
  const loadData = async (userId: string) => {
    try {
      // Load subscription plans
      const {
        data: plansData,
        error: plansError
      } = await supabase.from("subscription_plans").select("*").eq("is_active", true).order("price", {
        ascending: true
      });
      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Load current subscription
      const {
        data: currentSub,
        error: currentError
      } = await supabase.from("user_subscriptions").select(`
          *,
          subscription_plans (*)
        `).eq("user_id", userId).eq("status", "active").order("started_at", {
        ascending: false
      }).limit(1).maybeSingle();
      if (currentError) throw currentError;
      setCurrentSubscription(currentSub);

      // Load subscription history
      const {
        data: historyData,
        error: historyError
      } = await supabase.from("user_subscriptions").select(`
          *,
          subscription_plans (*)
        `).eq("user_id", userId).order("started_at", {
        ascending: false
      });
      if (historyError) throw historyError;
      setSubscriptionHistory(historyData || []);

      // Load notifications
      await loadNotifications(userId);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const loadNotifications = async (userId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", {
        ascending: false
      }).limit(50);
      if (error) throw error;
      setNotifications(data || []);
      const unread = data?.filter(n => !n.is_read).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };
  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    try {
      const {
        error
      } = await supabase.from("user_subscriptions").insert({
        user_id: user.id,
        plan_id: planId,
        status: "active",
        started_at: new Date().toISOString()
      });
      if (error) throw error;
      toast({
        title: "Succès",
        description: "Abonnement activé avec succès"
      });
      loadData(user.id);
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Erreur",
        description: "Impossible de s'abonner",
        variant: "destructive"
      });
    }
  };
  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return <Zap className="h-6 w-6" />;
      case "pro":
        return <Crown className="h-6 w-6" />;
      case "elite":
        return <Building2 className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };
  const renderFeatures = (features: any) => {
    if (!features) return null;

    // Handle array of features (mockData format)
    if (Array.isArray(features)) {
      return features.map((feature, index) => <div key={index} className="flex items-center gap-3">
          <Check className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-sm">{feature}</span>
        </div>);
    }

    // Handle object of features from database (convert to readable format)
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
        // Skip if value is false or empty
        if (value === false || value === "" || value === null) return null;
        const label = featureLabels[key] || key;

        // For credits, show the number
        if (key === "credits" && typeof value === "number") {
          return <div key={key} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">{value} crédits/mois</span>
            </div>;
        }

        // For boolean true or "Inclus" value, just show the label
        if (value === true || value === "Inclus") {
          return <div key={key} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">{label}</span>
            </div>;
        }
        return null;
      }).filter(Boolean);
    }
    return null;
  };

  // Watchlist handlers
  const handleRemoveItem = (modelId: string) => {
    setWatchlistItems(watchlistItems.filter(item => item.modelId !== modelId));
  };
  const handleEditItem = (item: WatchlistItem) => {
    setEditingItem(item);
    setAlertThreshold(item.alertThreshold.toString());
    setAlertType(item.alertType);
    setShowEditDialog(true);
  };
  const handleSaveEdit = () => {
    if (editingItem) {
      setWatchlistItems(watchlistItems.map(item => item.modelId === editingItem.modelId ? {
        ...item,
        alertThreshold: parseFloat(alertThreshold),
        alertType
      } : item));
      setShowEditDialog(false);
      setEditingItem(null);
    }
  };
  const handleAddToWatchlist = () => {
    if (selectedModelToAdd && !watchlistItems.find(i => i.modelId === selectedModelToAdd)) {
      setWatchlistItems([...watchlistItems, {
        modelId: selectedModelToAdd,
        addedAt: new Date().toISOString().split("T")[0],
        alertThreshold: parseFloat(alertThreshold),
        alertType
      }]);
      setShowAddDialog(false);
      setSelectedModelToAdd("");
      setAlertThreshold("10");
      setAlertType("below");
    }
  };
  const handleLaunchScan = (modelId: string) => {
    setSelectedModelForScan(modelId);
    setShowScrapModal(true);
  };
  const availableModels = mockModels.filter(model => !watchlistItems.find(item => item.modelId === model.id));

  // Notification handlers
  const markAsRead = async (notificationId: string) => {
    try {
      const {
        error
      } = await supabase.from("notifications").update({
        is_read: true
      }).eq("id", notificationId);
      if (error) throw error;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive"
      });
    }
  };
  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const {
        error
      } = await supabase.from("notifications").update({
        is_read: true
      }).eq("user_id", user.id).eq("is_read", false);
      if (error) throw error;
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues"
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer les notifications comme lues",
        variant: "destructive"
      });
    }
  };
  const deleteNotification = async (notificationId: string) => {
    try {
      const {
        error
      } = await supabase.from("notifications").delete().eq("id", notificationId);
      if (error) throw error;
      toast({
        title: "Succès",
        description: "Notification supprimée"
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive"
      });
    }
  };
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "price_drop":
        return <TrendingDown className="h-5 w-5 text-success" />;
      case "price_increase":
        return <TrendingUp className="h-5 w-5 text-destructive" />;
      case "alert":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };
  if (loading) {
    return <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>;
  }
  return <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mon Compte</h1>
        <p className="text-muted-foreground">
          Gérez votre abonnement, vos crédits et votre watchlist
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
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
            {unreadCount > 0 && <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Credits Card */}
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
                <p className="text-sm text-muted-foreground">
                  Renouvellement dans 12 jours
                </p>
                <Button className="w-full">Obtenir plus de crédits</Button>
              </CardContent>
            </Card>

            {/* Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Activité ce mois
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scraps effectués</span>
                    <span className="font-bold">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Crédits gagnés</span>
                    <span className="font-bold text-success">+45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alertes reçues</span>
                    <span className="font-bold">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          

          {/* Scrap History */}
          <Card data-scrap-history>
            <CardHeader>
              <CardTitle>Historique des scraps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scrapHistory.map(scrap => <div key={scrap.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Badge variant={scrap.type === "Auto" ? "secondary" : "outline"}>
                        {scrap.type}
                      </Badge>
                      <div>
                        <p className="font-medium">{scrap.model}</p>
                        <p className="text-sm text-muted-foreground">
                          {scrap.date} • {scrap.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{scrap.results} résultats</p>
                      <p className="text-sm font-medium text-destructive">
                        {scrap.creditChange} crédits
                      </p>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-8">
          {currentSubscription && <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
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
                  <span>
                    Début: {format(new Date(currentSubscription.started_at), "dd MMMM yyyy", {
                  locale: fr
                })}
                  </span>
                </div>

                {currentSubscription.credits_remaining !== null && currentSubscription.credits_remaining !== undefined && <div className="space-y-3 p-4 rounded-lg bg-background/50 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Crédits restants</span>
                      </div>
                      <span className="text-2xl font-bold">{currentSubscription.credits_remaining}</span>
                    </div>
                    {currentSubscription.credits_reset_date && <p className="text-xs text-muted-foreground">
                        Renouvellement le {format(new Date(currentSubscription.credits_reset_date), "dd MMMM yyyy", {
                  locale: fr
                })}
                      </p>}
                  </div>}

                <div className="space-y-3">
                  {renderFeatures(currentSubscription.subscription_plans.features)}
                </div>
              </CardContent>
            </Card>}

          <div>
            <h2 className="text-2xl font-bold mb-6">Plans disponibles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map(plan => {
              const isCurrentPlan = currentSubscription?.plan_id === plan.id;
              const isPro = plan.name.toLowerCase() === "pro";
              return <Card key={plan.id} className={`relative transition-all hover:shadow-lg ${isCurrentPlan ? "border-primary shadow-md" : ""} ${isPro ? "border-primary/50" : ""}`}>
                    {isPro && <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary">Populaire</Badge>
                      </div>}
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
                    <CardContent className="space-y-3 pb-6">
                      {renderFeatures(plan.features)}
                    </CardContent>
                    <CardFooter>
                      {isCurrentPlan ? <Button disabled className="w-full" variant="secondary">
                          Plan actuel
                        </Button> : <Button onClick={() => handleSubscribe(plan.id)} className="w-full" variant={isPro ? "default" : "outline"}>
                          Choisir ce plan
                        </Button>}
                    </CardFooter>
                  </Card>;
            })}
            </div>
          </div>

          {subscriptionHistory.length > 0 && <div>
              <h2 className="text-2xl font-bold mb-4">Historique des abonnements</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {subscriptionHistory.map(sub => <div key={sub.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getPlanIcon(sub.subscription_plans.name)}
                          <div>
                            <p className="font-medium">{sub.subscription_plans.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(sub.started_at), "dd MMMM yyyy", {
                          locale: fr
                        })}
                              {sub.expires_at && ` - ${format(new Date(sub.expires_at), "dd MMMM yyyy", {
                          locale: fr
                        })}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                          {sub.status === "active" ? "Actif" : "Expiré"}
                        </Badge>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>}
        </TabsContent>

        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground">
                Suivez {watchlistItems.length} modèle{watchlistItems.length > 1 ? "s" : ""} et
                recevez des alertes personnalisées
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un modèle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter à la watchlist</DialogTitle>
                  <DialogDescription>
                    Sélectionnez un modèle et configurez vos alertes de prix
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="model-select">Modèle</Label>
                    <Select value={selectedModelToAdd} onValueChange={setSelectedModelToAdd}>
                      <SelectTrigger id="model-select" className="bg-background mt-2">
                        <SelectValue placeholder="Choisir un modèle..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50 max-h-[300px]">
                        {availableModels.map(model => <SelectItem key={model.id} value={model.id}>
                            {model.name} - {model.medianPrice}€
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="threshold">Seuil d'alerte (%)</Label>
                    <Input id="threshold" type="number" value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)} placeholder="10" className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Vous serez alerté si le prix varie de plus de ce pourcentage
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="alert-type">Type d'alerte</Label>
                    <Select value={alertType} onValueChange={v => setAlertType(v as any)}>
                      <SelectTrigger id="alert-type" className="bg-background mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="below">Baisse de prix uniquement</SelectItem>
                        <SelectItem value="above">Hausse de prix uniquement</SelectItem>
                        <SelectItem value="both">Baisse et hausse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleAddToWatchlist} disabled={!selectedModelToAdd} className="flex-1">
                      Ajouter
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {alerts.length > 0 && <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Alertes récentes ({alerts.filter(a => a.isNew).length} nouvelles)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map(alert => {
                const model = mockModels.find(m => m.id === alert.modelId);
                return <motion.div key={alert.id} initial={{
                  opacity: 0,
                  x: -20
                }} animate={{
                  opacity: 1,
                  x: 0
                }} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.isNew ? "bg-background border-primary/30" : "bg-muted/50"}`}>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${alert.type === "price_drop" ? "bg-success/10" : "bg-primary/10"}`}>
                          {alert.type === "price_drop" ? <TrendingDown className="h-5 w-5 text-success" /> : <AlertCircle className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{model?.name}</span>
                            {alert.isNew && <Badge variant="default" className="text-xs">
                                Nouveau
                              </Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleLaunchScan(alert.modelId)}>
                          Scanner
                        </Button>
                      </motion.div>;
              })}
                </div>
              </CardContent>
            </Card>}

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid lg:grid-cols-2 gap-6">
            {watchlistItems.map(item => {
            const model = mockModels.find(m => m.id === item.modelId);
            if (!model) return null;
            return <motion.div key={item.modelId} variants={itemVariants}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{model.category}</Badge>
                            <Badge variant={item.alertType === "below" ? "default" : item.alertType === "above" ? "destructive" : "secondary"} className="gap-1">
                              <Bell className="h-3 w-3" />
                              {item.alertType === "below" ? "Baisse" : item.alertType === "above" ? "Hausse" : "Les deux"}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg mb-1">{model.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{model.brand}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{model.medianPrice}€</div>
                          <div className={`text-sm font-medium flex items-center gap-1 justify-end ${model.priceChange7d < 0 ? "text-success" : "text-destructive"}`}>
                            {model.priceChange7d < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                            {model.priceChange7d.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Évolution du prix (30j)
                          </div>
                          <ResponsiveContainer width="100%" height={100}>
                            <LineChart data={model.priceHistory}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                              <XAxis dataKey="date" className="text-xs" hide />
                              <YAxis className="text-xs" hide />
                              <Tooltip contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)"
                          }} formatter={(value: number) => [`${value}€`, "Prix"]} />
                              <Line type="monotone" dataKey="price" stroke={model.priceChange30d < 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Seuil d'alerte</span>
                            <span className="font-semibold">±{item.alertThreshold}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Suivi depuis</span>
                            <span className="font-semibold">
                              {new Date(item.addedAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          {item.lastNotification && <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
                              <span className="text-muted-foreground">Dernière alerte</span>
                              <span className="font-semibold text-primary">
                                {new Date(item.lastNotification).toLocaleDateString("fr-FR")}
                              </span>
                            </div>}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => handleLaunchScan(item.modelId)}>
                            <Zap className="h-4 w-4" />
                            Scanner
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.modelId)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>;
          })}
          </motion.div>

          {/* Edit Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier les paramètres d'alerte</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-threshold">Seuil d'alerte (%)</Label>
                  <Input id="edit-threshold" type="number" value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)} className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="edit-alert-type">Type d'alerte</Label>
                  <Select value={alertType} onValueChange={v => setAlertType(v as any)}>
                    <SelectTrigger id="edit-alert-type" className="bg-background mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="below">Baisse de prix uniquement</SelectItem>
                      <SelectItem value="above">Hausse de prix uniquement</SelectItem>
                      <SelectItem value="both">Baisse et hausse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveEdit} className="flex-1">
                    Enregistrer
                  </Button>
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Notifications</h2>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Aucune notification non lue'}
              </p>
            </div>
            {unreadCount > 0 && <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>}
          </div>

          {notifications.length === 0 ? <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Aucune notification pour le moment
                </p>
              </CardContent>
            </Card> : <div className="space-y-3">
              {notifications.map(notification => <Card key={notification.id} className={`transition-colors ${!notification.is_read ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${!notification.is_read ? 'bg-primary/10' : 'bg-muted'}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold ${!notification.is_read ? 'text-primary' : ''}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.is_read && <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                                <Check className="h-4 w-4" />
                              </Button>}
                            <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notification.created_at), "dd MMM yyyy 'à' HH:mm", {
                        locale: fr
                      })}
                          </span>
                          
                          {notification.link && <Button size="sm" variant="link" className="h-auto p-0 text-xs" onClick={() => window.location.href = notification.link!}>
                              Voir détails →
                            </Button>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>}
        </TabsContent>
      </Tabs>

      <ScrapModal open={showScrapModal} onOpenChange={setShowScrapModal} preselectedModel={selectedModelForScan} />
    </div>;
}