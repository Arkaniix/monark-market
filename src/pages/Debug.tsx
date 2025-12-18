import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Server, Database, Key, User, Loader2 } from "lucide-react";

const ENV_VARS = {
  VITE_DATA_PROVIDER: import.meta.env.VITE_DATA_PROVIDER || 'mock',
  VITE_API_URL: import.meta.env.VITE_API_URL || '(non défini)',
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '(non défini)',
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
};

type HealthStatus = 'idle' | 'checking' | 'ok' | 'error';

export default function Debug() {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('idle');
  const [healthMessage, setHealthMessage] = useState<string>('');
  const [healthLatency, setHealthLatency] = useState<number | null>(null);

  const activeProvider = ENV_VARS.VITE_DATA_PROVIDER;
  const apiUrl = ENV_VARS.VITE_API_URL;

  // Check if token exists in localStorage
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');

  const checkApiHealth = async () => {
    if (activeProvider !== 'api') {
      setHealthStatus('idle');
      setHealthMessage('Provider mock actif - pas de ping API');
      return;
    }

    setHealthStatus('checking');
    setHealthMessage('Vérification...');
    const start = performance.now();

    try {
      const response = await fetch(`${apiUrl}/health/ready`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const latency = Math.round(performance.now() - start);
      setHealthLatency(latency);

      if (response.ok) {
        const data = await response.json();
        setHealthStatus('ok');
        setHealthMessage(`API OK - ${JSON.stringify(data)}`);
      } else {
        setHealthStatus('error');
        setHealthMessage(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const latency = Math.round(performance.now() - start);
      setHealthLatency(latency);
      setHealthStatus('error');
      setHealthMessage(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  useEffect(() => {
    if (activeProvider === 'api') {
      checkApiHealth();
    }
  }, [activeProvider]);

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'checking': return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'ok': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-destructive" />;
      default: return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case 'checking': return <Badge variant="secondary">Checking...</Badge>;
      case 'ok': return <Badge className="bg-green-500">Reachable</Badge>;
      case 'error': return <Badge variant="destructive">Unreachable</Badge>;
      default: return <Badge variant="outline">N/A</Badge>;
    }
  };

  // Only show in dev mode or for admins
  const canView = ENV_VARS.DEV || isAdmin;

  if (authLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">Cette page est réservée aux administrateurs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Debug & Diagnostic</h1>
          <p className="text-muted-foreground">Variables d'environnement et état du système</p>
        </div>
        <Badge variant={ENV_VARS.DEV ? "default" : "secondary"}>
          {ENV_VARS.MODE}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Provider & API Config */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Provider
            </CardTitle>
            <CardDescription>Configuration du provider de données</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">VITE_DATA_PROVIDER</span>
              <Badge variant={activeProvider === 'api' ? 'default' : 'secondary'} className="font-mono">
                {activeProvider}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">VITE_API_URL</span>
              <code className="text-xs bg-background px-2 py-1 rounded border max-w-[200px] truncate">
                {apiUrl}
              </code>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">VITE_SUPABASE_URL</span>
              <code className="text-xs bg-background px-2 py-1 rounded border max-w-[200px] truncate">
                {ENV_VARS.VITE_SUPABASE_URL.substring(0, 30)}...
              </code>
            </div>
          </CardContent>
        </Card>

        {/* API Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              API Health
            </CardTitle>
            <CardDescription>État de connexion à l'API backend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {getStatusIcon(healthStatus)}
                <span className="font-medium">Status</span>
              </div>
              {getStatusBadge(healthStatus)}
            </div>
            {healthLatency !== null && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-medium">Latency</span>
                <Badge variant="outline">{healthLatency}ms</Badge>
              </div>
            )}
            {healthMessage && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground break-all">{healthMessage}</p>
              </div>
            )}
            <Button 
              onClick={checkApiHealth} 
              variant="outline" 
              className="w-full gap-2"
              disabled={healthStatus === 'checking'}
            >
              <RefreshCw className={`h-4 w-4 ${healthStatus === 'checking' ? 'animate-spin' : ''}`} />
              Ping /health
            </Button>
          </CardContent>
        </Card>

        {/* Auth State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              État Auth
            </CardTitle>
            <CardDescription>Statut d'authentification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">User Loaded</span>
              {user ? (
                <Badge className="bg-green-500">Oui</Badge>
              ) : (
                <Badge variant="secondary">Non</Badge>
              )}
            </div>
            {user && (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">User ID</span>
                  <code className="text-xs bg-background px-2 py-1 rounded border max-w-[150px] truncate">
                    {user.id}
                  </code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Email</span>
                  <code className="text-xs bg-background px-2 py-1 rounded border max-w-[150px] truncate">
                    {user.email}
                  </code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Is Admin</span>
                  {isAdmin ? (
                    <Badge className="bg-green-500">Oui</Badge>
                  ) : (
                    <Badge variant="secondary">Non</Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Tokens (localStorage)
            </CardTitle>
            <CardDescription>État des tokens JWT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">access_token</span>
              {accessToken ? (
                <Badge className="bg-green-500">Présent</Badge>
              ) : (
                <Badge variant="destructive">Absent</Badge>
              )}
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">refresh_token</span>
              {refreshToken ? (
                <Badge className="bg-green-500">Présent</Badge>
              ) : (
                <Badge variant="destructive">Absent</Badge>
              )}
            </div>
            {accessToken && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {accessToken.substring(0, 50)}...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raw ENV dump */}
      <Card>
        <CardHeader>
          <CardTitle>Variables d'environnement (raw)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
            {JSON.stringify(ENV_VARS, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
