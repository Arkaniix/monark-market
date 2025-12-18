import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Activity, Database, Server, RefreshCw, Loader2, XCircle } from "lucide-react";
import { useHealthStatus } from "@/hooks/useAdmin";

export default function AdminHealth() {
  const { data, isLoading, isError, refetch, isFetching } = useHealthStatus();

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

      {/* Global Status */}
      <Card className={`border-2 ${
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
