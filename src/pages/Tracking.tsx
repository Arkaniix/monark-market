import { useState, useMemo } from "react";
import { Bell, Eye, Radar, Plus, Trash2, ExternalLink, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, CheckCircle2, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAlerts } from "@/hooks/useProviderData";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from "@/hooks/useNotifications";
import { TrackingSkeleton } from "@/components/tracking/TrackingSkeleton";
import { WatchlistTab } from "@/components/tracking/WatchlistTab";
import { AlertsTab } from "@/components/tracking/AlertsTab";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const ITEMS_PER_PAGE = 5;

export default function Tracking() {
  const [activeTab, setActiveTab] = useState("watchlist");
  
  // Filtres et pagination pour notifications
  const [notificationsFilter, setNotificationsFilter] = useState<string>("all");
  const [notificationsPage, setNotificationsPage] = useState(1);

  // Hooks pour les données
  const { data: watchlistData, isLoading: watchlistLoading, error: watchlistError, refetch: refetchWatchlist } = useWatchlist();
  const { data: alertsData, isLoading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useAlerts();
  const { data: notificationsData, isLoading: notificationsLoading, error: notificationsError, refetch: refetchNotifications } = useNotifications();

  // Mutations
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const watchlist = watchlistData?.items ?? [];
  const alerts = alertsData?.items ?? [];
  const notifications = notificationsData?.items ?? [];
  // Filtrage notifications
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
      case 'price_alert':
        return <Bell className="h-4 w-4 text-amber-500" />;
      case 'deal':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'system':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'success':
      case 'community':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Skeleton global
  const isInitialLoading = watchlistLoading && alertsLoading && notificationsLoading;
  if (isInitialLoading) {
    return <TrackingSkeleton />;
  }

  // Pagination component
  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    totalItems 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
    totalItems: number;
  }) => {
    if (totalPages <= 1) return null;
    
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
    
    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {start}-{end} sur {totalItems}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Skeleton liste
  const ListSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
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
            <WatchlistTab
              watchlist={watchlist}
              isLoading={watchlistLoading}
              error={watchlistError as Error | null}
              refetch={refetchWatchlist}
            />
          </TabsContent>

          {/* ============= ALERTS TAB ============= */}
          <TabsContent value="alerts">
            <AlertsTab
              alerts={alerts}
              isLoading={alertsLoading}
              error={alertsError as Error | null}
              refetch={refetchAlerts}
            />
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
                        ? "Vos notifications apparaîtront ici lorsque vos alertes seront déclenchées." 
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
                                title="Marquer comme lu"
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
