import { useState } from "react";
import { Bell, Eye, Radar, Plus, Trash2, ExternalLink, TrendingDown, TrendingUp, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWatchlist, useRemoveFromWatchlist } from "@/hooks/useWatchlist";
import { useAlerts, useDeleteAlert } from "@/hooks/useProviderData";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function Tracking() {
  const [activeTab, setActiveTab] = useState("watchlist");

  // Hooks pour les données
  const { data: watchlistData, isLoading: watchlistLoading, error: watchlistError } = useWatchlist();
  const { data: alertsData, isLoading: alertsLoading, error: alertsError } = useAlerts();
  const { data: notificationsData, isLoading: notificationsLoading, error: notificationsError } = useNotifications();

  // Mutations
  const removeFromWatchlist = useRemoveFromWatchlist();
  const deleteAlert = useDeleteAlert();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const watchlist = watchlistData?.items ?? [];
  const alerts = alertsData?.items ?? [];
  const notifications = notificationsData?.items ?? [];

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
      case 'new_listing':
      case 'price_below':
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
        return <Package className="h-4 w-4 text-purple-500" />;
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
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
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
          <Card>
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Radar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadNotifications.length}</p>
                  <p className="text-sm text-muted-foreground">Non lues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="watchlist" className="gap-2">
              <Eye className="h-4 w-4" />
              Watchlist ({watchlist.length})
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              Alertes ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Radar className="h-4 w-4" />
              Notifications
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Modèles surveillés</span>
                  <Link to="/catalog">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>
                  Suivez l'évolution des prix des modèles qui vous intéressent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {watchlistLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : watchlistError ? (
                  <Alert variant="destructive">
                    <AlertDescription>Erreur lors du chargement de la watchlist</AlertDescription>
                  </Alert>
                ) : watchlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Eye className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Aucun modèle en surveillance</p>
                    <Link to="/catalog">
                      <Button>Explorer le catalogue</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {watchlist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link to={`/catalog/${item.target_id}`} className="font-medium hover:text-primary">
                              {item.name || `${item.brand} - ID ${item.target_id}`}
                            </Link>
                            {item.category && <Badge variant="outline">{item.category}</Badge>}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {item.current_price && <span>Prix médian : {formatPrice(item.current_price)}</span>}
                            {item.price_change_7d !== undefined && item.price_change_7d !== 0 && (
                              <span className={item.price_change_7d < 0 ? "text-green-500" : "text-red-500"}>
                                {item.price_change_7d > 0 ? "+" : ""}{item.price_change_7d}%
                              </span>
                            )}
                            {item.fair_value && <span>Juste prix : {formatPrice(item.fair_value)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/catalog/${item.target_id}`}>
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromWatchlist.mutate(item.id)}
                            disabled={removeFromWatchlist.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mes alertes</span>
                  <Link to="/catalog">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Créer une alerte
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>
                  Soyez notifié quand les conditions de vos alertes sont remplies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : alertsError ? (
                  <Alert variant="destructive">
                    <AlertDescription>Erreur lors du chargement des alertes</AlertDescription>
                  </Alert>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Aucune alerte configurée</p>
                    <Link to="/catalog">
                      <Button>Créer une alerte</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          alert.is_active ? 'bg-card hover:bg-muted/50' : 'bg-muted/30 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getAlertIcon(alert.alert_type)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{alert.target_name}</span>
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
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAlert.mutate(alert.id)}
                          disabled={deleteAlert.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadNotifications.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAllNotificationsRead.mutate()}
                      disabled={markAllNotificationsRead.isPending}
                    >
                      Tout marquer comme lu
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Historique de vos alertes et notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : notificationsError ? (
                  <Alert variant="destructive">
                    <AlertDescription>Erreur lors du chargement des notifications</AlertDescription>
                  </Alert>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Radar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune notification</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
                          notification.is_read ? 'bg-muted/30' : 'bg-card border-primary/20'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {!notification.is_read && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                            <span className="font-medium">{notification.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markNotificationRead.mutate(notification.id)}
                              disabled={markNotificationRead.isPending}
                            >
                              Marquer lu
                            </Button>
                          )}
                          {notification.link && (
                            <Link to={notification.link}>
                              <Button variant="ghost" size="icon">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification.mutate(notification.id)}
                            disabled={deleteNotification.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
