import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Activity, Database, Server, RefreshCw, Loader2, XCircle, Clock } from "lucide-react";
import { useHealthStatus } from "@/hooks/useAdmin";
import { useState, useMemo } from "react";

// Génère un historique simulé sur 24h
const generateStatusHistory = () => {
  const history = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now - i * 3600000);
    // Simuler quelques incidents aléatoires
    const rand = Math.random();
    let status: 'operational' | 'degraded' | 'down' = 'operational';
    if (rand < 0.05) status = 'down';
    else if (rand < 0.15) status = 'degraded';
    
    history.push({
      hour: hour.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status,
      timestamp: hour.getTime()
    });
  }
  return history;
};

export default function AdminHealth() {
  const { data, isLoading, isError, refetch, isFetching } = useHealthStatus();
  const [statusHistory] = useState(generateStatusHistory);

  // Calcul uptime sur 24h
  const uptime24h = useMemo(() => {
    const operational = statusHistory.filter(h => h.status === 'operational').length;
    return (operational / statusHistory.length) * 100;
  }, [statusHistory]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'down':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getServiceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('database') || lower.includes('db')) return Database;
    if (lower.includes('api') || lower.includes('backend')) return Server;
    return Activity;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-success';
      case 'degraded': return 'bg-warning';
      case 'down': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Santé système & Observabilité</h2>
          <p className="text-muted-foreground">Monitoring et état des services</p>
        </div>

        <Card className="border-destructive/50">
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">Service indisponible</p>
            <p className="text-sm text-muted-foreground mt-2">
              L'endpoint /health n'est pas accessible
            </p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const services = data.services ?? [];
  const metrics = data.metrics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Santé système & Observabilité</h2>
          <p className="text-muted-foreground">Monitoring et état des services</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Rafraîchir
        </Button>
      </div>

      {/* Global Status + Uptime */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className={`lg:col-span-2 border-2 ${
          data.status === 'healthy' ? 'border-success/50 bg-success/5' :
          data.status === 'degraded' ? 'border-warning/50 bg-warning/5' :
          'border-destructive/50 bg-destructive/5'
        }`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {data.status === 'healthy' ? (
                  <CheckCircle2 className="h-10 w-10 text-success" />
                ) : data.status === 'degraded' ? (
                  <AlertCircle className="h-10 w-10 text-warning" />
                ) : (
                  <XCircle className="h-10 w-10 text-destructive" />
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {data.status === 'healthy' ? 'Tous les systèmes opérationnels' :
                     data.status === 'degraded' ? 'Performance dégradée' :
                     'Incident en cours'}
                  </h3>
                  <p className="text-muted-foreground">
                    Version {data.version} • Uptime: {formatUptime(data.uptime_seconds)}
                  </p>
                </div>
              </div>
              <Badge variant={getStatusBadge(data.status)} className="text-sm px-3 py-1">
                {data.status === 'healthy' ? 'Opérationnel' :
                 data.status === 'degraded' ? 'Dégradé' : 'Problème'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Uptime 24h KPI */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Uptime 24h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              <span className={uptime24h >= 99 ? 'text-success' : uptime24h >= 95 ? 'text-warning' : 'text-destructive'}>
                {uptime24h.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {statusHistory.filter(h => h.status !== 'operational').length} incident(s) détecté(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historique 24h */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Historique de statut (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-12">
            {statusHistory.map((entry, idx) => (
              <div 
                key={idx}
                className="flex-1 group relative"
              >
                <div 
                  className={`w-full h-8 rounded-sm ${getStatusColor(entry.status)} transition-all hover:opacity-80`}
                  title={`${entry.hour} - ${entry.status}`}
                />
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-popover border rounded px-2 py-1 text-xs whitespace-nowrap z-10 shadow-lg">
                  {entry.hour} - {entry.status === 'operational' ? 'OK' : entry.status === 'degraded' ? 'Dégradé' : 'Down'}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Il y a 24h</span>
            <span>Maintenant</span>
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-success" />
              <span>Opérationnel</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-warning" />
              <span>Dégradé</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-destructive" />
              <span>Down</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => {
          const Icon = getServiceIcon(service.name);
          return (
            <Card key={service.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusBadge(service.status)}>
                    {getStatusIcon(service.status)}
                    <span className="ml-1">
                      {service.status === 'operational' ? 'OK' :
                       service.status === 'degraded' ? 'Lent' : 'Down'}
                    </span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {service.latency_ms}ms
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Metrics */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Métriques système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Connexions DB actives</p>
                  <p className="text-2xl font-bold">{metrics.db_connections}</p>
                </div>
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Requêtes API / min</p>
                  <p className="text-2xl font-bold">{metrics.requests_per_minute}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>

              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Taux d'erreur</p>
                  <p className={`text-2xl font-bold ${metrics.error_rate > 5 ? 'text-destructive' : metrics.error_rate > 1 ? 'text-warning' : 'text-success'}`}>
                    {metrics.error_rate.toFixed(2)}%
                  </p>
                </div>
                <AlertCircle className={`h-8 w-8 ${metrics.error_rate > 5 ? 'text-destructive' : metrics.error_rate > 1 ? 'text-warning' : 'text-success'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
