import { useState } from "react";
import { Bell, Eye, Radar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAlerts } from "@/hooks/useProviderData";
import { useNotifications } from "@/hooks/useNotifications";
import { TrackingSkeleton } from "@/components/tracking/TrackingSkeleton";
import { WatchlistTab } from "@/components/tracking/WatchlistTab";
import { AlertsTab } from "@/components/tracking/AlertsTab";
import { NotificationsTab } from "@/components/tracking/NotificationsTab";

export default function Tracking() {
  const [activeTab, setActiveTab] = useState("watchlist");

  // Hooks pour les données
  const { data: watchlistData, isLoading: watchlistLoading, error: watchlistError, refetch: refetchWatchlist } = useWatchlist();
  const { data: alertsData, isLoading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useAlerts();
  const { data: notificationsData, isLoading: notificationsLoading, error: notificationsError, refetch: refetchNotifications } = useNotifications();

  const watchlist = watchlistData?.items ?? [];
  const alerts = alertsData?.items ?? [];
  const notifications = notificationsData?.items ?? [];

  const unreadNotifications = notifications.filter(n => !n.is_read);

  // Skeleton global
  const isInitialLoading = watchlistLoading && alertsLoading && notificationsLoading;
  if (isInitialLoading) {
    return <TrackingSkeleton />;
  }

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
            <NotificationsTab
              notifications={notifications}
              isLoading={notificationsLoading}
              error={notificationsError as Error | null}
              refetch={refetchNotifications}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
