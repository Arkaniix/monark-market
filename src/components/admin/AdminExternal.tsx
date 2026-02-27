import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Play, RefreshCw, CheckCircle2, XCircle, Loader2, Plug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminExternal() {
  const [sources, setSources] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingSource, setFetchingSource] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sourcesRes, runsRes] = await Promise.all([
        supabase.from('external_sources').select('*').order('name'),
        supabase.from('external_fetch_runs').select('*, external_sources(name)').order('started_at', { ascending: false }).limit(20)
      ]);
      if (sourcesRes.error) throw sourcesRes.error;
      if (runsRes.error) throw runsRes.error;
      setSources(sourcesRes.data || []);
      setRuns(runsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Erreur", description: "Impossible de charger les sources externes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleManualFetch = async (sourceId: number, sourceName: string) => {
    setFetchingSource(sourceId);
    toast({ title: "Fetch lancé", description: `Le fetch pour "${sourceName}" a été déclenché — à connecter au backend` });
    setTimeout(() => setFetchingSource(null), 2000);
  };

  const activeSources = sources.filter(s => s.enabled).length;
  const recentSuccess = runs.filter(r => r.status === 'success').length;
  const recentFailed = runs.filter(r => r.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold mb-2">Intégrations externes</h2><p className="text-muted-foreground">Sources de données et historique des fetches</p></div>
        <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-2" />Rafraîchir</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6">{loading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{activeSources} / {sources.length}</p>}<p className="text-xs text-muted-foreground">Sources actives</p></CardContent></Card>
        <Card><CardContent className="pt-6">{loading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold text-green-500">{recentSuccess}</p>}<p className="text-xs text-muted-foreground">Fetches réussis</p></CardContent></Card>
        <Card><CardContent className="pt-6">{loading ? <Skeleton className="h-8 w-16" /> : <p className={`text-2xl font-bold ${recentFailed > 0 ? 'text-destructive' : ''}`}>{recentFailed}</p>}<p className="text-xs text-muted-foreground">Fetches échoués</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Sources configurées</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="space-y-2">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : sources.length === 0 ? (
            <div className="text-center py-12"><Plug className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucune source externe configurée</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>URL</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{source.base_url || '—'}</TableCell>
                    <TableCell><Badge variant={source.enabled ? "default" : "secondary"}>{source.enabled ? 'Actif' : 'Inactif'}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" disabled={!source.enabled || fetchingSource === source.id} onClick={() => handleManualFetch(source.id, source.name)}>
                        {fetchingSource === source.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        <span className="ml-2">Fetch</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Historique des fetches</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="space-y-2">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : runs.length === 0 ? (
            <div className="text-center py-8"><p className="text-muted-foreground">Aucun historique disponible</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Source</TableHead><TableHead>Date</TableHead><TableHead>Durée</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
              <TableBody>
                {runs.map((run) => {
                  const duration = run.ended_at ? Math.round((new Date(run.ended_at).getTime() - new Date(run.started_at).getTime()) / 1000) : null;
                  return (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">{run.external_sources?.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(run.started_at).toLocaleString('fr-FR')}</TableCell>
                      <TableCell>{duration ? `${duration}s` : <Loader2 className="h-4 w-4 animate-spin" />}</TableCell>
                      <TableCell>
                        <Badge variant={run.status === 'success' ? 'default' : 'destructive'} className="flex items-center gap-1 w-fit">
                          {run.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {run.status === 'success' ? 'Succès' : 'Échec'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
