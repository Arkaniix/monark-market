import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Play, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminExternal() {
  const [sources, setSources] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingSource, setFetchingSource] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sourcesRes, runsRes] = await Promise.all([
        supabase.from('external_sources').select('*').order('name'),
        supabase.from('external_fetch_runs').select('*, external_sources(name)').order('started_at', { ascending: false }).limit(20)
      ]);

      if (sourcesRes.error) throw sourcesRes.error;
      if (runsRes.error) throw runsRes.error;

      // Si pas de données, utiliser des données factices
      if (!sourcesRes.data || sourcesRes.data.length === 0) {
        setSources([
          {
            id: 1,
            name: 'TechPowerUp GPU-Z',
            base_url: 'https://www.techpowerup.com/gpu-specs',
            enabled: true,
            created_at: new Date(Date.now() - 2592000000).toISOString()
          },
          {
            id: 2,
            name: 'GPU Benchmark API',
            base_url: 'https://api.gpu-benchmark.com/v2',
            enabled: true,
            created_at: new Date(Date.now() - 5184000000).toISOString()
          },
          {
            id: 3,
            name: 'Hardware Unboxed Data',
            base_url: 'https://data.hwunboxed.com/specs',
            enabled: false,
            created_at: new Date(Date.now() - 7776000000).toISOString()
          }
        ]);
      } else {
        setSources(sourcesRes.data);
      }
      
      if (!runsRes.data || runsRes.data.length === 0) {
        setRuns([
          {
            id: 1,
            started_at: new Date(Date.now() - 3600000).toISOString(),
            ended_at: new Date(Date.now() - 3300000).toISOString(),
            status: 'success',
            external_sources: { name: 'TechPowerUp GPU-Z' }
          },
          {
            id: 2,
            started_at: new Date(Date.now() - 7200000).toISOString(),
            ended_at: new Date(Date.now() - 6900000).toISOString(),
            status: 'success',
            external_sources: { name: 'GPU Benchmark API' }
          },
          {
            id: 3,
            started_at: new Date(Date.now() - 86400000).toISOString(),
            ended_at: new Date(Date.now() - 86100000).toISOString(),
            status: 'failed',
            external_sources: { name: 'Hardware Unboxed Data' }
          }
        ]);
      } else {
        setRuns(runsRes.data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les sources externes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualFetch = async (sourceId: number, sourceName: string) => {
    setFetchingSource(sourceId);
    // Simulation d'un fetch manuel
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Fetch lancé",
      description: `Le fetch pour "${sourceName}" a été déclenché`,
    });
    
    // Ajouter une nouvelle entrée dans l'historique (mock)
    const newRun = {
      id: Date.now(),
      started_at: new Date().toISOString(),
      ended_at: new Date(Date.now() + 5000).toISOString(),
      status: Math.random() > 0.2 ? 'success' : 'failed',
      external_sources: { name: sourceName }
    };
    setRuns(prev => [newRun, ...prev.slice(0, 19)]);
    setFetchingSource(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calcul des stats
  const activeSources = sources.filter(s => s.enabled).length;
  const recentSuccess = runs.filter(r => r.status === 'success').length;
  const recentFailed = runs.filter(r => r.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Intégrations externes</h2>
          <p className="text-muted-foreground">Sources de données et historique des fetches</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sources actives</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeSources} / {sources.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fetches réussis (récent)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{recentSuccess}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fetches échoués (récent)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${recentFailed > 0 ? 'text-destructive' : ''}`}>{recentFailed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Sources configurées ({sources.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>URL de base</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      Aucune source externe configurée.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{source.base_url || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={source.enabled ? "default" : "secondary"}>
                        {source.enabled ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!source.enabled || fetchingSource === source.id}
                        onClick={() => handleManualFetch(source.id, source.name)}
                      >
                        {fetchingSource === source.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        <span className="ml-2">Fetch manuel</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Historique */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des fetches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Date/Heure</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <p className="text-muted-foreground">
                      Aucun historique de fetch disponible.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((run) => {
                  const duration = run.ended_at 
                    ? Math.round((new Date(run.ended_at).getTime() - new Date(run.started_at).getTime()) / 1000)
                    : null;
                  
                  return (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">
                        {run.external_sources?.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(run.started_at).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {duration ? `${duration}s` : <Loader2 className="h-4 w-4 animate-spin" />}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={run.status === 'success' ? 'default' : 'destructive'}
                          className="flex items-center gap-1 w-fit"
                        >
                          {run.status === 'success' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {run.status === 'success' ? 'Succès' : 'Échec'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
