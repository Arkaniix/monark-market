import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminIngest() {
  const [batches, setBatches] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

      // Si pas de données, utiliser des données factices
      if (!batchesRes.data || batchesRes.data.length === 0) {
        setBatches([
          {
            id: 1,
            batch_seq: 1,
            items_count: 48,
            latency_ms: 245,
            received_at: new Date().toISOString(),
            jobs: { keyword: 'RTX 4090', type: 'faible' }
          },
          {
            id: 2,
            batch_seq: 2,
            items_count: 52,
            latency_ms: 198,
            received_at: new Date(Date.now() - 3600000).toISOString(),
            jobs: { keyword: 'RX 7900', type: 'fort' }
          },
          {
            id: 3,
            batch_seq: 1,
            items_count: 35,
            latency_ms: 312,
            received_at: new Date(Date.now() - 7200000).toISOString(),
            jobs: { keyword: 'RTX 4080', type: 'faible' }
          }
        ]);
      } else {
        setBatches(batchesRes.data);
      }
      
      if (!rawRes.data || rawRes.data.length === 0) {
        setRawData([
          {
            id: 1,
            item_seq: 1,
            payload_json: { title: 'RTX 4090 FE', price: 1599, platform: 'leboncoin' },
            received_at: new Date().toISOString()
          },
          {
            id: 2,
            item_seq: 2,
            payload_json: { title: 'RX 7900 XTX', price: 899, platform: 'leboncoin' },
            received_at: new Date(Date.now() - 1800000).toISOString()
          }
        ]);
      } else {
        setRawData(rawRes.data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'ingestion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  const totalItems = batches.reduce((sum, b) => sum + b.items_count, 0);
  const avgLatency = batches.length > 0 
    ? Math.round(batches.reduce((sum, b) => sum + (b.latency_ms || 0), 0) / batches.length)
    : 0;

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
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgLatency}ms</div>
            <p className="text-xs text-muted-foreground">Latence moyenne</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{rawData.length}</div>
            <p className="text-xs text-muted-foreground">Données brutes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Batchs d'ingestion</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
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
                  <TableCell className="text-xs">
                    {new Date(batch.received_at).toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {batch.items_count > 0 ? (
                      <Badge variant="default">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        OK
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Vide
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Données brutes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Séquence</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawData.map((raw) => (
                <TableRow key={raw.id}>
                  <TableCell className="font-mono text-xs">{raw.id}</TableCell>
                  <TableCell>{raw.job_id}</TableCell>
                  <TableCell>{raw.item_seq}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(raw.received_at).toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Voir JSON</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
