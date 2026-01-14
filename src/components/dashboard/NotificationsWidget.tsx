import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bell, Eye, AlertCircle, TrendingDown, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useWatchlist, useAlerts } from "@/hooks/useProviderData";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function NotificationsWidget() {
  const { data: notificationsData, isLoading: loadingNotifs } = useNotifications(3);
  const { data: watchlistData, isLoading: loadingWatchlist } = useWatchlist();
  const { data: alertsData, isLoading: loadingAlerts } = useAlerts();
  const markRead = useMarkNotificationRead();

  const notifications = notificationsData?.items ?? [];
  const unreadCount = notificationsData?.unread_count ?? 0;
  const watchlistCount = watchlistData?.total ?? 0;
  const activeAlerts = alertsData?.items?.filter(a => a.is_active) ?? [];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "price_drop":
        return <TrendingDown className="h-4 w-4 text-success" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  return (
    <section className="py-4">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Notifications récentes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notifications
                </CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 px-2">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingNotifs ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length > 0 ? (
                <>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                        !notif.is_read ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                      }`}
                    >
                      {getNotificationIcon(notif.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{notif.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleMarkRead(notif.id)}
                          disabled={markRead.isPending}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Link to="/tracking?tab=notifications">
                    <Button variant="outline" size="sm" className="w-full gap-2 mt-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/50 dark:hover:bg-primary/20">
                      Voir toutes
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune notification
                </p>
              )}
            </CardContent>
          </Card>

          {/* Alertes actives */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  Alertes actives
                </CardTitle>
                {activeAlerts.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-2">
                    {activeAlerts.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingAlerts ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : activeAlerts.length > 0 ? (
                <>
                  {activeAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-warning/5 border border-warning/20 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{alert.target_name || `#${alert.target_id}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.alert_type === 'price_below' && alert.price_threshold
                            ? `Prix < ${alert.price_threshold}€`
                            : alert.alert_type === 'price_above' && alert.price_threshold
                            ? `Prix > ${alert.price_threshold}€`
                            : 'Deal détecté'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {alert.target_type === 'model' ? 'Modèle' : 'Annonce'}
                      </Badge>
                    </div>
                  ))}
                  <Link to="/tracking?tab=alerts">
                    <Button variant="outline" size="sm" className="w-full gap-2 mt-2 border-warning/30 text-warning hover:bg-warning/10 hover:text-warning dark:border-warning/50 dark:hover:bg-warning/20">
                      Gérer mes alertes
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">Aucune alerte configurée</p>
                  <Link to="/catalog">
                    <Button variant="outline" size="sm">Configurer une alerte</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Watchlist */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-accent" />
                  Watchlist
                </CardTitle>
                <Badge variant="secondary" className="h-5 px-2">
                  {watchlistCount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingWatchlist ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : watchlistData && watchlistData.items.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {watchlistData.items.slice(0, 3).map((item) => (
                      <Link
                        key={item.id}
                        to={item.target_type === 'model' ? `/models/${item.target_id}` : `/ads/${item.target_id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-2 rounded-lg bg-success/5 border border-success/20 hover:bg-success/10 transition-colors text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name || `#${item.target_id}`}</p>
                            {item.category && (
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            )}
                          </div>
                          {item.current_price && (
                            <span className="font-semibold shrink-0">{item.current_price}€</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link to="/tracking?tab=watchlist">
                    <Button variant="outline" size="sm" className="w-full gap-2 mt-2 border-success/30 text-success hover:bg-success/10 hover:text-success dark:border-success/50 dark:hover:bg-success/20">
                      Voir ma watchlist
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">Watchlist vide</p>
                  <Link to="/catalog">
                    <Button variant="outline" size="sm">Explorer le catalogue</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
