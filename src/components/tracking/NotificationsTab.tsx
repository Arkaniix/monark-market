import { useMemo } from "react";
import { Bell, Trash2, RefreshCw, AlertCircle, CheckCircle2, ExternalLink, Inbox, Calendar, TrendingDown, BarChart3, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, isToday, isYesterday, subDays, startOfWeek, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from "@/hooks/useNotifications";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { Notification } from "@/providers/types";

// Types de notifications considérées comme "premium"
const PREMIUM_NOTIFICATION_TYPES = ['deal_detected', 'price_analysis', 'market_insight', 'exclusive_deal'];

// Helper pour déterminer si une notification est premium
const isPremiumNotification = (notification: Notification): boolean => {
  return PREMIUM_NOTIFICATION_TYPES.includes(notification.type) || notification.title?.toLowerCase().includes('exclusi') || notification.title?.toLowerCase().includes('analyse') || notification.message?.toLowerCase().includes('opportunité rare');
};
interface NotificationsTabProps {
  notifications: Notification[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Analyser les notifications pour des statistiques réelles
const analyzeNotifications = (notifications: Notification[]) => {
  const now = new Date();
  const weekAgo = subDays(now, 7);

  // Notifications des 7 derniers jours par jour
  const last7Days: Record<string, {
    date: string;
    fullDate: string;
    deals: number;
    alerts: number;
    community: number;
    total: number;
  }> = {};
  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    const key = format(date, 'yyyy-MM-dd');
    last7Days[key] = {
      date: format(date, 'EEE', {
        locale: fr
      }),
      fullDate: format(date, 'dd/MM'),
      deals: 0,
      alerts: 0,
      community: 0,
      total: 0
    };
  }

  // Compter les notifications par type et par jour
  let totalDeals = 0;
  let totalAlerts = 0;
  let totalCommunity = 0;
  notifications.forEach(notif => {
    const createdAt = new Date(notif.created_at);
    const key = format(createdAt, 'yyyy-MM-dd');
    if (last7Days[key]) {
      last7Days[key].total++;
      if (notif.type === 'deal' || notif.type === 'deal_detected') {
        last7Days[key].deals++;
        totalDeals++;
      } else if (notif.type === 'price_alert' || notif.type === 'alert') {
        last7Days[key].alerts++;
        totalAlerts++;
      } else if (notif.type === 'community' || notif.type === 'community_reward') {
        last7Days[key].community++;
        totalCommunity++;
      }
    }

    // Compter même si hors graphique
    if (createdAt >= weekAgo) {
      if (notif.type === 'deal' || notif.type === 'deal_detected') totalDeals++;else if (notif.type === 'price_alert' || notif.type === 'alert') totalAlerts++;else if (notif.type === 'community' || notif.type === 'community_reward') totalCommunity++;
    }
  });
  return {
    chartData: Object.values(last7Days),
    totalDeals,
    totalAlerts,
    totalCommunity,
    total7Days: Object.values(last7Days).reduce((sum, d) => sum + d.total, 0),
    unreadCount: notifications.filter(n => !n.is_read).length,
    readRate: notifications.length > 0 ? (notifications.filter(n => n.is_read).length / notifications.length * 100).toFixed(0) : '0'
  };
};
type DateGroup = 'today' | 'yesterday' | 'thisWeek' | 'older';
interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}
export function NotificationsTab({
  notifications,
  isLoading,
  error,
  refetch
}: NotificationsTabProps) {
  const navigate = useNavigate();
  const {
    plan
  } = useEntitlements();
  const isPro = plan === 'pro' || plan === 'elite';

  // Mutations
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  // Analyse des notifications (données réelles)
  const notifStats = useMemo(() => analyzeNotifications(notifications), [notifications]);

  // Séparer lues / non lues
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  // Grouper par date
  const groupByDate = (items: Notification[]): GroupedNotifications => {
    const now = new Date();
    const weekStart = startOfWeek(now, {
      weekStartsOn: 1
    });
    return items.reduce<GroupedNotifications>((groups, notif) => {
      const date = new Date(notif.created_at);
      if (isToday(date)) {
        groups.today.push(notif);
      } else if (isYesterday(date)) {
        groups.yesterday.push(notif);
      } else if (isWithinInterval(date, {
        start: weekStart,
        end: now
      })) {
        groups.thisWeek.push(notif);
      } else {
        groups.older.push(notif);
      }
      return groups;
    }, {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    });
  };
  const groupedUnread = useMemo(() => groupByDate(unreadNotifications), [unreadNotifications]);
  const groupedRead = useMemo(() => groupByDate(readNotifications), [readNotifications]);
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
  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lu si non lu
    if (!notification.is_read) {
      markNotificationRead.mutate(notification.id);
    }

    // Navigation selon le lien ou le type
    if (notification.link) {
      navigate(notification.link);
    }
  };
  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm', {
      locale: fr
    });
  };

  // Skeleton
  const ListSkeleton = () => <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="flex items-center gap-3 p-4 rounded-lg border">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>)}
    </div>;

  // Rendu d'un groupe de notifications
  const renderGroup = (label: string, items: Notification[], isRead: boolean) => {
    if (items.length === 0) return null;
    return <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
          <Badge variant="outline" className="text-xs">{items.length}</Badge>
        </div>
        <div className="space-y-2">
          {items.map(notification => {
          const isPremium = isPremiumNotification(notification);
          return <div key={notification.id} onClick={() => handleNotificationClick(notification)} className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer group ${isRead ? 'bg-muted/30 hover:bg-muted/50' : 'bg-card border-primary/20 shadow-sm hover:shadow-md hover:border-primary/40'} ${isPremium ? 'ring-1 ring-primary/10' : ''}`}>
                <div className={`p-2 rounded-lg flex-shrink-0 ${isRead ? 'bg-muted' : 'bg-primary/10'}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {!isRead && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />}
                    <span className={`font-medium truncate ${isRead ? 'text-muted-foreground' : ''}`}>
                      {notification.title}
                    </span>
                    {/* Badge PRO pour notifications premium */}
                    {isPremium && <Badge variant="outline" className="text-[10px] gap-0.5 bg-primary/5 text-primary border-primary/20">
                        <Crown className="h-2.5 w-2.5" />
                        PRO
                      </Badge>}
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {!isRead && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => {
                e.stopPropagation();
                markNotificationRead.mutate(notification.id);
              }} title="Marquer comme lu">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>}
                  {notification.link && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => {
                e.stopPropagation();
                navigate(notification.link!);
              }} title="Voir le détail">
                    <ExternalLink className="h-4 w-4" />
                  </Button>}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={e => {
                e.stopPropagation();
                deleteNotification.mutate(notification.id);
              }} title="Supprimer">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>;
        })}
        </div>
      </div>;
  };

  // Rendu des groupes pour une section (lue ou non lue)
  const renderGroupedNotifications = (grouped: GroupedNotifications, isRead: boolean) => {
    const hasAny = grouped.today.length > 0 || grouped.yesterday.length > 0 || grouped.thisWeek.length > 0 || grouped.older.length > 0;
    if (!hasAny) return null;
    return <>
        {renderGroup("Aujourd'hui", grouped.today, isRead)}
        {renderGroup("Hier", grouped.yesterday, isRead)}
        {renderGroup("Cette semaine", grouped.thisWeek, isRead)}
        {renderGroup("Plus ancien", grouped.older, isRead)}
      </>;
  };
  return <div className="space-y-6">
      {/* Dashboard notifications - Stats réelles */}
      

      {/* Liste notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-green-500" />
                Inbox
                {unreadNotifications.length > 0 && <Badge variant="destructive">{unreadNotifications.length} non lues</Badge>}
              </CardTitle>
              <CardDescription className="mt-1">
                Vos alertes et notifications système
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={refetch}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              {unreadNotifications.length > 0 && <Button variant="outline" size="sm" onClick={() => markAllNotificationsRead.mutate()} disabled={markAllNotificationsRead.isPending} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Tout marquer lu
                </Button>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <ListSkeleton /> : error ? <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                Impossible de charger les notifications.
                <Button variant="link" className="p-0 ml-2" onClick={refetch}>
                  Réessayer
                </Button>
              </AlertDescription>
            </Alert> : notifications.length === 0 ? <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                <Inbox className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Inbox vide</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Vos notifications apparaîtront ici lorsque vos alertes seront déclenchées ou que vous recevrez des messages système.
              </p>
            </div> : <div>
              {/* Section non lues */}
              {unreadNotifications.length > 0 && <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="font-semibold">Non lues</h3>
                    <Badge>{unreadNotifications.length}</Badge>
                  </div>
                  {renderGroupedNotifications(groupedUnread, false)}
                </div>}

              {/* Section lues */}
              {readNotifications.length > 0 && <div>
                  {unreadNotifications.length > 0 && <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-muted-foreground">Déjà lues</h3>
                      <Badge variant="outline">{readNotifications.length}</Badge>
                    </div>}
                  {renderGroupedNotifications(groupedRead, true)}
                </div>}
            </div>}
        </CardContent>
      </Card>
    </div>;
}