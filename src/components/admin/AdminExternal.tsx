import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Play, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminExternal() {
  const [sources, setSources] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

      setSources(sourcesRes.data || []);
      setRuns(runsRes.data || []);
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

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Intégrations externes</h2>
        <p className="text-muted-foreground">Gestion des APIs et sources externes</p>
      </div>

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
                <TableHead>Date création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Key className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Aucune source externe configurée. Contactez un administrateur système.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell className="font-mono text-xs">{source.base_url || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={source.enabled} />
                      <Badge variant={source.enabled ? "default" : "secondary"}>
                        {source.enabled ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(source.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des fetches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Play className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Aucun historique de fetch disponible.
                      </p>
                    </div>
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
                    <TableCell className="text-xs">
                      {new Date(run.started_at).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-xs">
                      {run.ended_at ? new Date(run.ended_at).toLocaleString('fr-FR') : 'En cours...'}
                    </TableCell>
                    <TableCell>
                      {duration ? `${duration}s` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={run.status === 'success' ? 'default' : 'destructive'}>
                        {run.status || 'Inconnu'}
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
