import { useState } from "react";
import { Bell, Eye, Radar, Crown, Infinity, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAlerts } from "@/hooks/useProviderData";
import { useNotifications } from "@/hooks/useNotifications";
import { useEntitlements } from "@/hooks/useEntitlements";
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
  
  // Entitlements pour les limites
  const { plan, limits, helpers } = useEntitlements();
  const activeAlertsCount = helpers.getActiveAlertsCount();
  const maxAlerts = limits.maxAlerts;
  const alertsLimitReached = activeAlertsCount >= maxAlerts;

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
    <div className="min-h-screen py-6">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <Radar className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Mon Suivi</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gérez votre watchlist, vos alertes et notifications
          </p>
        </div>

        {/* Stats rapides avec indication des limites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {/* Watchlist - Gratuit & Illimité */}
          <Card className="cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden" onClick={() => setActiveTab("watchlist")}>
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                <Infinity className="h-3 w-3 mr-0.5" />
                Illimité
              </Badge>
            </div>
            <CardContent className="pt-5 pb-4">
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

          {/* Alertes - Limité par plan */}
          <Card className="cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden" onClick={() => setActiveTab("alerts")}>
            <div className="absolute top-2 right-2">
              <Badge 
                variant="outline" 
                className={`text-[10px] ${alertsLimitReached ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : ''}`}
              >
                {alertsLimitReached && <Lock className="h-3 w-3 mr-0.5" />}
                {activeAlertsCount}/{maxAlerts}
              </Badge>
            </div>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Bell className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold">{activeAlertsCount}</p>
                  <p className="text-sm text-muted-foreground">Alertes actives</p>
                </div>
              </div>
              {/* Mini progress bar */}
              <Progress 
                value={(activeAlertsCount / maxAlerts) * 100} 
                className={`h-1 mt-3 ${alertsLimitReached ? '[&>div]:bg-amber-500' : ''}`}
              />
              {alertsLimitReached && plan !== "elite" && (
                <Link 
                  to="/account?tab=subscription" 
                  className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Crown className="h-3 w-3" />
                  Augmenter la limite
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Notifications - Toujours accessibles */}
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("notifications")}>
            <CardContent className="pt-5 pb-4">
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
          <TabsList className="w-full h-auto p-1 mb-5 grid grid-cols-3">
            <TabsTrigger value="watchlist" className="gap-2 py-2.5">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Watchlist</span>
              <Badge variant="secondary" className="ml-1">{watchlist.length}</Badge>
              <Badge variant="outline" className="ml-1 text-[10px] hidden lg:inline-flex bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                Gratuit
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2 py-2.5">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertes</span>
              <Badge 
                variant={alertsLimitReached ? "destructive" : "secondary"} 
                className="ml-1"
              >
                {activeAlertsCount}/{maxAlerts}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 py-2.5">
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
