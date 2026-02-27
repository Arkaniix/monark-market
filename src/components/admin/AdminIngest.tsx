import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, XCircle, Eye, ArrowRight, RefreshCw, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminApiGet } from "@/lib/api/adminApi";

export default function AdminIngest() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedErrors, setSelectedErrors] = useState<any[] | null>(null);
  const [rejectStats, setRejectStats] = useState<{ total: number; unreviewed: number } | null>(null);
  const [coverageRate, setCoverageRate] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: batchesData, error: batchErr } = await supabase
        .from('ingest_batches')
        .select('*, jobs(keyword, type)')
        .order('received_at', { ascending: false })
        .limit(50);

      if (batchErr) throw batchErr;
      setBatches(batchesData || []);

      // Coverage rate from Supabase
      const [totalAds, mappedAds] = await Promise.all([
        supabase.from('ads').select('*', { count: 'exact', head: true }),
        supabase.from('ads').select('*', { count: 'exact', head: true }).not('model_id', 'is', null),
      ]);
      const total = totalAds.count || 0;
      const mapped = mappedAds.count || 0;
      setCoverageRate(total > 0 ? ((mapped / total) * 100).toFixed(1) : '0');

      // Rejects stats from API (graceful)
      try {
        const stats = await adminApiGet<any>('/v1/admin/rejects/stats');
        setRejectStats({ total: stats.total, unreviewed: stats.unreviewed });
      } catch {
        setRejectStats(null);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const totalItems = batches.reduce((sum, b) => sum + b.items_count, 0);
  const emptyBatches = batches.filter(b => b.items_count === 0);
  const emptyRate = batches.length > 0 ? ((emptyBatches.length / batches.length) * 100).toFixed(1) : '0';
  const errorBatches = batches.filter(b => b.notes?.toLowerCase().includes('error'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ingestion & Qualité des données</h2>
        <p className="text-muted-foreground">Validation, monitoring et couverture</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{coverageRate}%</div>}
            <p className="text-xs text-muted-foreground">Couverture (annonces avec modèle)</p>
          </CardContent>
        </Card>
        <Card className={(rejectStats?.unreviewed ?? 0) > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className={(rejectStats?.unreviewed ?? 0) > 0 ? "h-4 w-4 text-destructive" : "h-4 w-4 text-muted-foreground"} />
              {loading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-2xl font-bold">{rejectStats?.unreviewed ?? '—'}</div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Rejets non reviewés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{totalItems}</div>}
            <p className="text-xs text-muted-foreground">Items ingérés (récent)</p>
          </CardContent>
        </Card>
        <Card className={parseFloat(emptyRate) > 10 ? 'border-yellow-500/30' : ''}>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{emptyRate}%</div>}
            <p className="text-xs text-muted-foreground">Taux batchs vides</p>
          </CardContent>
        </Card>
      </div>

      {/* Batchs table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Derniers batchs d'ingestion</CardTitle>
          <div className="flex gap-2">
            {errorBatches.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setSelectedErrors(errorBatches)}>
                <Eye className="h-4 w-4 mr-2" />Erreurs ({errorBatches.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : batches.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun batch d'ingestion disponible</p>
            </div>
          ) : (
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
                    <TableCell>{batch.jobs?.keyword || '—'}</TableCell>
                    <TableCell>{batch.items_count}</TableCell>
                    <TableCell>{batch.latency_ms ? `${batch.latency_ms}ms` : '—'}</TableCell>
                    <TableCell className="text-xs">{new Date(batch.received_at).toLocaleString('fr-FR')}</TableCell>
                    <TableCell>
                      {batch.items_count > 0 ? (
                        <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />OK</Badge>
                      ) : (
                        <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Vide</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedErrors} onOpenChange={(open) => !open && setSelectedErrors(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Erreurs d'ingestion</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {selectedErrors?.map((batch) => (
              <div key={batch.id} className="p-3 bg-destructive/10 rounded-lg">
                <p className="font-medium">Batch #{batch.batch_seq} - {batch.jobs?.keyword}</p>
                <p className="text-sm text-destructive">{batch.notes}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
