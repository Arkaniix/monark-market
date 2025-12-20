import { useState, useMemo } from "react";
import { Bell, Eye, Radar, Plus, Trash2, ExternalLink, TrendingDown, TrendingUp, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWatchlist, useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { useAlerts, useDeleteAlert, useUpdateAlert } from "@/hooks/useProviderData";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from "@/hooks/useNotifications";
import { TrackingSkeleton } from "@/components/tracking/TrackingSkeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const ITEMS_PER_PAGE = 5;

export default function Tracking() {
  const [activeTab, setActiveTab] = useState("watchlist");
  
  // Filtres et pagination par onglet
  const [watchlistSearch, setWatchlistSearch] = useState("");
  const [watchlistCategory, setWatchlistCategory] = useState<string>("all");
  const [watchlistPage, setWatchlistPage] = useState(1);
  
  const [alertsFilter, setAlertsFilter] = useState<string>("all");
  const [alertsType, setAlertsType] = useState<string>("all");
  const [alertsPage, setAlertsPage] = useState(1);
  
  const [notificationsFilter, setNotificationsFilter] = useState<string>("all");
  const [notificationsPage, setNotificationsPage] = useState(1);

  // Hooks pour les données
  const { data: watchlistData, isLoading: watchlistLoading, error: watchlistError, refetch: refetchWatchlist } = useWatchlist();
  const { data: alertsData, isLoading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useAlerts();
  const { data: notificationsData, isLoading: notificationsLoading, error: notificationsError, refetch: refetchNotifications } = useNotifications();

  // Mutations
  const removeFromWatchlist = useRemoveFromWatchlist();
  const deleteAlert = useDeleteAlert();
  const updateAlert = useUpdateAlert();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const watchlist = watchlistData?.items ?? [];
  const alerts = alertsData?.items ?? [];
  const notifications = notificationsData?.items ?? [];

  // Filtrage et pagination watchlist
  const filteredWatchlist = useMemo(() => {
    return watchlist.filter(item => {
      const matchesSearch = !watchlistSearch || 
        (item.name?.toLowerCase().includes(watchlistSearch.toLowerCase())) ||
        (item.brand?.toLowerCase().includes(watchlistSearch.toLowerCase()));
      const matchesCategory = watchlistCategory === "all" || item.category === watchlistCategory;
      return matchesSearch && matchesCategory;
    });
  }, [watchlist, watchlistSearch, watchlistCategory]);

  const paginatedWatchlist = useMemo(() => {
    const start = (watchlistPage - 1) * ITEMS_PER_PAGE;
    return filteredWatchlist.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredWatchlist, watchlistPage]);

  const watchlistTotalPages = Math.ceil(filteredWatchlist.length / ITEMS_PER_PAGE);

  // Filtrage et pagination alertes
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesStatus = alertsFilter === "all" || 
        (alertsFilter === "active" && alert.is_active) ||
        (alertsFilter === "inactive" && !alert.is_active);
      const matchesType = alertsType === "all" || alert.alert_type === alertsType;
      return matchesStatus && matchesType;
    });
  }, [alerts, alertsFilter, alertsType]);

  const paginatedAlerts = useMemo(() => {
    const start = (alertsPage - 1) * ITEMS_PER_PAGE;
    return filteredAlerts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAlerts, alertsPage]);

  const alertsTotalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);

  // Filtrage et pagination notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      if (notificationsFilter === "all") return true;
      if (notificationsFilter === "unread") return !notif.is_read;
      if (notificationsFilter === "read") return notif.is_read;
      return true;
    });
  }, [notifications, notificationsFilter]);

  const paginatedNotifications = useMemo(() => {
    const start = (notificationsPage - 1) * ITEMS_PER_PAGE;
    return filteredNotifications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNotifications, notificationsPage]);

  const notificationsTotalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);

  const unreadNotifications = notifications.filter(n => !n.is_read);

  // Catégories uniques pour le filtre
  const watchlistCategories = useMemo(() => {
    const categories = new Set(watchlist.map(item => item.category).filter(Boolean));
    return Array.from(categories) as string[];
  }, [watchlist]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_drop':
      case 'deal_detected':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'price_above':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'price_below':
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertLabel = (type: string) => {
    switch (type) {
      case 'price_drop':
      case 'deal_detected':
        return 'Bonne affaire';
      case 'price_above':
        return 'Prix au-dessus';
      case 'price_below':
        return 'Prix en-dessous';
      default:
        return type;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <Bell className="h-4 w-4 text-amber-500" />;
      case 'deal':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'system':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Skeleton global si tout charge
  const isInitialLoading = watchlistLoading && alertsLoading && notificationsLoading;
  if (isInitialLoading) {
    return <TrackingSkeleton />;
  }

  // Composant de pagination réutilisable
  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    totalItems, 
    itemsPerPage 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  }) => {
    if (totalPages <= 1) return null;
    
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Affichage {start}-{end} sur {totalItems}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  // Composant skeleton pour liste
  const ListSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Radar className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Mon Suivi</h1>
          </div>
          <p className="text-muted-foreground">
            Gérez votre watchlist, vos alertes et notifications personnalisées
          </p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("watchlist")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{watchlist.length}</p>
                  <p className="text-sm text-muted-foreground">En surveillance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("alerts")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Bell className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{alerts.filter(a => a.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Alertes actives</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("notifications")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Radar className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{unreadNotifications.length}</p>
                  {unreadNotifications.length > 0 && (
                    <Badge variant="destructive" className="text-xs">Nouveau</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Non lues</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="watchlist" className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Watchlist</span>
              <Badge variant="secondary" className="ml-1">{watchlist.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertes</span>
              <Badge variant="secondary" className="ml-1">{alerts.filter(a => a.is_active).length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Radar className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-1">{unreadNotifications.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ============= WATCHLIST TAB ============= */}
          <TabsContent value="watchlist">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-500" />
                      Modèles surveillés
                      <Badge variant="outline">{filteredWatchlist.length}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Suivez l'évolution des prix des modèles qui vous intéressent
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => refetchWatchlist()}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Link to="/catalog">
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtres */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un modèle..."
                      value={watchlistSearch}
                      onChange={(e) => {
                        setWatchlistSearch(e.target.value);
                        setWatchlistPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>
                  <Select value={watchlistCategory} onValueChange={(v) => { setWatchlistCategory(v); setWatchlistPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes catégories</SelectItem>
                      {watchlistCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {watchlistLoading ? (
                  <ListSkeleton />
                ) : watchlistError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>
                      Impossible de charger la watchlist.
                      <Button variant="link" className="p-0 ml-2" onClick={() => refetchWatchlist()}>
                        Réessayer
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : filteredWatchlist.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                      <Eye className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {watchlist.length === 0 ? "Aucun modèle en surveillance" : "Aucun résultat"}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {watchlist.length === 0 
                        ? "Ajoutez des modèles à votre watchlist pour suivre leur évolution de prix et recevoir des alertes." 
                        : "Aucun modèle ne correspond à vos critères de recherche."}
                    </p>
                    {watchlist.length === 0 ? (
                      <Link to="/catalog">
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Explorer le catalogue
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" onClick={() => { setWatchlistSearch(""); setWatchlistCategory("all"); }}>
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedWatchlist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Link to={`/catalog/${item.target_id}`} className="font-medium hover:text-primary truncate">
                                {item.name || `${item.brand} - ID ${item.target_id}`}
                              </Link>
                              {item.category && <Badge variant="outline">{item.category}</Badge>}
                              {item.target_type === 'ad' && <Badge variant="secondary">Annonce</Badge>}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              {item.current_price && (
                                <span className="flex items-center gap-1">
                                  Prix : <span className="font-medium text-foreground">{formatPrice(item.current_price)}</span>
                                </span>
                              )}
                              {item.price_change_7d !== undefined && item.price_change_7d !== 0 && (
                                <span className={`flex items-center gap-1 ${item.price_change_7d < 0 ? "text-green-500" : "text-red-500"}`}>
                                  {item.price_change_7d < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                                  {item.price_change_7d > 0 ? "+" : ""}{item.price_change_7d}%
                                </span>
                              )}
                              {item.fair_value && (
                                <span>Juste prix : {formatPrice(item.fair_value)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link to={`/catalog/${item.target_id}`}>
                              <Button variant="ghost" size="icon" title="Voir le détail">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromWatchlist.mutate(item.id)}
                              disabled={removeFromWatchlist.isPending}
                              title="Retirer de la watchlist"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Pagination
                      currentPage={watchlistPage}
                      totalPages={watchlistTotalPages}
                      onPageChange={setWatchlistPage}
                      totalItems={filteredWatchlist.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============= ALERTS TAB ============= */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-amber-500" />
                      Mes alertes
                      <Badge variant="outline">{filteredAlerts.length}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Soyez notifié quand les conditions de vos alertes sont remplies
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => refetchAlerts()}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Link to="/catalog">
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Créer
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtres */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Select value={alertsFilter} onValueChange={(v) => { setAlertsFilter(v); setAlertsPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actives uniquement</SelectItem>
                      <SelectItem value="inactive">Inactives uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={alertsType} onValueChange={(v) => { setAlertsType(v); setAlertsPage(1); }}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="deal_detected">Bonne affaire</SelectItem>
                      <SelectItem value="price_below">Prix en-dessous</SelectItem>
                      <SelectItem value="price_above">Prix au-dessus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {alertsLoading ? (
                  <ListSkeleton />
                ) : alertsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>
                      Impossible de charger les alertes.
                      <Button variant="link" className="p-0 ml-2" onClick={() => refetchAlerts()}>
                        Réessayer
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : filteredAlerts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4">
                      <Bell className="h-8 w-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {alerts.length === 0 ? "Aucune alerte configurée" : "Aucun résultat"}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {alerts.length === 0 
                        ? "Créez des alertes pour être notifié quand un modèle atteint votre prix cible ou qu'une bonne affaire apparaît." 
                        : "Aucune alerte ne correspond à vos critères."}
                    </p>
                    {alerts.length === 0 ? (
                      <Link to="/catalog">
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Créer une alerte
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" onClick={() => { setAlertsFilter("all"); setAlertsType("all"); }}>
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors group ${
                            alert.is_active ? 'bg-card hover:bg-muted/50' : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg ${alert.is_active ? 'bg-amber-500/10' : 'bg-muted'}`}>
                              {getAlertIcon(alert.alert_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`font-medium truncate ${!alert.is_active && 'text-muted-foreground'}`}>
                                  {alert.target_name || `Modèle #${alert.target_id}`}
                                </span>
                                <Badge variant={alert.is_active ? "default" : "secondary"}>
                                  {alert.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">{getAlertLabel(alert.alert_type)}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {alert.alert_type === 'price_below' && `Notifier si prix < ${formatPrice(alert.price_threshold || 0)}`}
                                {alert.alert_type === 'price_above' && `Notifier si prix > ${formatPrice(alert.price_threshold || 0)}`}
                                {alert.alert_type === 'deal_detected' && 'Notifier pour les bonnes affaires'}
                                {alert.current_price && ` • Prix actuel : ${formatPrice(alert.current_price)}`}
                              </p>
                              {alert.last_triggered_at && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Dernière notification : {formatDistanceToNow(new Date(alert.last_triggered_at), { addSuffix: true, locale: fr })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateAlert.mutate({ id: alert.id, data: { is_active: !alert.is_active } })}
                              disabled={updateAlert.isPending}
                            >
                              {alert.is_active ? "Désactiver" : "Activer"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteAlert.mutate(alert.id)}
                              disabled={deleteAlert.isPending}
                              title="Supprimer l'alerte"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Pagination
                      currentPage={alertsPage}
                      totalPages={alertsTotalPages}
                      onPageChange={setAlertsPage}
                      totalItems={filteredAlerts.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============= NOTIFICATIONS TAB ============= */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Radar className="h-5 w-5 text-green-500" />
                      Notifications
                      {unreadNotifications.length > 0 && (
                        <Badge variant="destructive">{unreadNotifications.length} non lues</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Historique de vos alertes et notifications système
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => refetchNotifications()}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    {unreadNotifications.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAllNotificationsRead.mutate()}
                        disabled={markAllNotificationsRead.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Tout marquer lu
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtres */}
                <div className="flex gap-3 mb-6">
                  <Select value={notificationsFilter} onValueChange={(v) => { setNotificationsFilter(v); setNotificationsPage(1); }}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="unread">Non lues</SelectItem>
                      <SelectItem value="read">Lues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {notificationsLoading ? (
                  <ListSkeleton />
                ) : notificationsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>
                      Impossible de charger les notifications.
                      <Button variant="link" className="p-0 ml-2" onClick={() => refetchNotifications()}>
                        Réessayer
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                      <Radar className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {notifications.length === 0 ? "Aucune notification" : "Aucune notification correspondante"}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {notifications.length === 0 
                        ? "Vos notifications apparaîtront ici lorsque vos alertes seront déclenchées ou que des événements importants se produiront." 
                        : "Aucune notification ne correspond au filtre sélectionné."}
                    </p>
                    {notifications.length > 0 && (
                      <Button variant="outline" onClick={() => setNotificationsFilter("all")}>
                        Voir toutes les notifications
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {paginatedNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-3 p-4 rounded-lg border transition-colors group ${
                            notification.is_read ? 'bg-muted/30' : 'bg-card border-primary/20 shadow-sm'
                          }`}
                        >
                          <div className={`p-2 rounded-lg flex-shrink-0 ${notification.is_read ? 'bg-muted' : 'bg-primary/10'}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {!notification.is_read && (
                                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                              )}
                              <span className={`font-medium truncate ${notification.is_read ? 'text-muted-foreground' : ''}`}>
                                {notification.title}
                              </span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markNotificationRead.mutate(notification.id)}
                                disabled={markNotificationRead.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {notification.link && (
                              <Link to={notification.link}>
                                <Button variant="ghost" size="icon" title="Voir le détail">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification.mutate(notification.id)}
                              disabled={deleteNotification.isPending}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Pagination
                      currentPage={notificationsPage}
                      totalPages={notificationsTotalPages}
                      onPageChange={setNotificationsPage}
                      totalItems={filteredNotifications.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
