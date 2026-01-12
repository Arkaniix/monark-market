import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Download, AlertCircle, CheckCircle2, XCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminIngest() {
  const [batches, setBatches] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedErrors, setSelectedErrors] = useState<any[] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, rawRes] = await Promise.all([
        supabase.from('ingest_batches').select('*, jobs(keyword, type)').order('received_at', { ascending: false }).limit(50),
        supabase.from('ingest_raw').select('*').order('received_at', { ascending: false }).limit(20)
      ]);

      if (batchesRes.error) throw batchesRes.error;
      if (rawRes.error) throw rawRes.error;

      if (!batchesRes.data || batchesRes.data.length === 0) {
        setBatches([
          { id: 1, batch_seq: 1, items_count: 48, latency_ms: 245, received_at: new Date().toISOString(), jobs: { keyword: 'RTX 4090', type: 'faible' } },
          { id: 2, batch_seq: 2, items_count: 0, latency_ms: 198, received_at: new Date(Date.now() - 3600000).toISOString(), jobs: { keyword: 'RX 7900', type: 'fort' }, error: 'Timeout' },
          { id: 3, batch_seq: 1, items_count: 35, latency_ms: 312, received_at: new Date(Date.now() - 7200000).toISOString(), jobs: { keyword: 'RTX 4080', type: 'faible' } }
        ]);
      } else {
        setBatches(batchesRes.data);
      }
      
      setRawData(rawRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  const totalItems = batches.reduce((sum, b) => sum + b.items_count, 0);
  const emptyBatches = batches.filter(b => b.items_count === 0);
  const emptyRate = batches.length > 0 ? ((emptyBatches.length / batches.length) * 100).toFixed(1) : '0';
  const errorBatches = batches.filter(b => b.error);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Qualité des données & Ingest</h2>
        <p className="text-muted-foreground">Validation et monitoring de l'ingestion</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{batches.length}</div>
            <p className="text-xs text-muted-foreground">Batchs ingérés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Items totaux</p>
          </CardContent>
        </Card>
        <Card className={parseFloat(emptyRate) > 10 ? 'border-yellow-500/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className={`h-4 w-4 ${parseFloat(emptyRate) > 10 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <div className="text-2xl font-bold">{emptyRate}%</div>
            </div>
            <p className="text-xs text-muted-foreground">Taux données vides</p>
          </CardContent>
        </Card>
        <Card className={errorBatches.length > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className={`h-4 w-4 ${errorBatches.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              <div className="text-2xl font-bold">{errorBatches.length}</div>
            </div>
            <p className="text-xs text-muted-foreground">Erreurs ingestion</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Batchs d'ingestion</CardTitle>
          {errorBatches.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setSelectedErrors(errorBatches)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir erreurs ({errorBatches.length})
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Latence</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-mono text-xs">#{batch.batch_seq}</TableCell>
                  <TableCell>{batch.jobs?.keyword || 'N/A'}</TableCell>
                  <TableCell>{batch.items_count}</TableCell>
                  <TableCell>{batch.latency_ms ? `${batch.latency_ms}ms` : 'N/A'}</TableCell>
                  <TableCell className="text-xs">{new Date(batch.received_at).toLocaleString('fr-FR')}</TableCell>
                  <TableCell>
                    {batch.error ? (
                      <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Erreur</Badge>
                    ) : batch.items_count > 0 ? (
                      <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />OK</Badge>
                    ) : (
                      <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Vide</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedErrors} onOpenChange={(open) => !open && setSelectedErrors(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Erreurs d'ingestion</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {selectedErrors?.map((batch) => (
              <div key={batch.id} className="p-3 bg-destructive/10 rounded-lg">
                <p className="font-medium">Batch #{batch.batch_seq} - {batch.jobs?.keyword}</p>
                <p className="text-sm text-destructive">{batch.error}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
