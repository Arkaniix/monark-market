import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Flame, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase.from('model_daily_metrics').select('*, hardware_models(name, brand)').order('date', { ascending: false }).limit(50);
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setMetrics([
          { id: 1, price_median: 1499, ads_count: 24, new_ads: 8, var_7d_pct: -8.2, var_30d_pct: -12.1, hardware_models: { name: 'RTX 4090', brand: 'NVIDIA' } },
          { id: 2, price_median: 849, ads_count: 12, new_ads: 1, var_7d_pct: 6.5, var_30d_pct: 4.3, hardware_models: { name: 'RX 7900 XTX', brand: 'AMD' } },
          { id: 3, price_median: 1099, ads_count: 31, new_ads: 5, var_7d_pct: 2.7, var_30d_pct: 1.2, hardware_models: { name: 'RTX 4080', brand: 'NVIDIA' } },
          { id: 4, price_median: 699, ads_count: 8, new_ads: 0, var_7d_pct: -6.2, var_30d_pct: -12.4, hardware_models: { name: 'RTX 3080 Ti', brand: 'NVIDIA' } },
        ]);
      } else {
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Erreur", description: "Impossible de charger les métriques", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  // Modèles sous pression: forte baisse prix + hausse stock
  const pressureModels = metrics.filter(m => (m.var_7d_pct || 0) < -5 && (m.new_ads || 0) > 3);
  // Modèles chauds: hausse prix + baisse stock
  const hotModels = metrics.filter(m => (m.var_7d_pct || 0) > 3 && (m.new_ads || 0) < 2);

  const topGainers = [...metrics].filter(m => m.var_7d_pct).sort((a, b) => (b.var_7d_pct || 0) - (a.var_7d_pct || 0)).slice(0, 5);
  const topLosers = [...metrics].filter(m => m.var_7d_pct).sort((a, b) => (a.var_7d_pct || 0) - (b.var_7d_pct || 0)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analyses de marché</h2>
        <p className="text-muted-foreground">Métriques et tendances par modèle</p>
      </div>

      {/* Strategic KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={pressureModels.length > 0 ? 'border-yellow-500/30' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Modèles sous pression ({pressureModels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Forte baisse prix + hausse stock</p>
            {pressureModels.length > 0 ? (
              <ul className="space-y-1">
                {pressureModels.map(m => (
                  <li key={m.id} className="text-sm">{m.hardware_models?.brand} {m.hardware_models?.name}: {m.var_7d_pct?.toFixed(1)}%</li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">Aucun modèle sous pression</p>}
          </CardContent>
        </Card>
        
        <Card className={hotModels.length > 0 ? 'border-orange-500/30' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Flame className="h-5 w-5" />
              Modèles chauds ({hotModels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Hausse prix + baisse stock</p>
            {hotModels.length > 0 ? (
              <ul className="space-y-1">
                {hotModels.map(m => (
                  <li key={m.id} className="text-sm">{m.hardware_models?.brand} {m.hardware_models?.name}: +{m.var_7d_pct?.toFixed(1)}%</li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">Aucun modèle chaud</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-green-600">Top Hausses (7j)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {topGainers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.hardware_models?.brand} {m.hardware_models?.name}</TableCell>
                    <TableCell className="text-right text-green-600">+{m.var_7d_pct?.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-red-600">Top Baisses (7j)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {topLosers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.hardware_models?.brand} {m.hardware_models?.name}</TableCell>
                    <TableCell className="text-right text-red-600">{m.var_7d_pct?.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Métriques détaillées</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchMetrics}><RefreshCw className="h-4 w-4 mr-2" />Recalculer</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modèle</TableHead>
                <TableHead>Prix Médian</TableHead>
                <TableHead>Annonces</TableHead>
                <TableHead>Nouvelles</TableHead>
                <TableHead>Var 7j</TableHead>
                <TableHead>Var 30j</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.hardware_models?.brand} {m.hardware_models?.name}</TableCell>
                  <TableCell>{m.price_median ? `${m.price_median}€` : 'N/A'}</TableCell>
                  <TableCell>{m.ads_count}</TableCell>
                  <TableCell className="text-green-600">{m.new_ads}</TableCell>
                  <TableCell className={m.var_7d_pct > 0 ? 'text-green-600' : 'text-red-600'}>
                    {m.var_7d_pct ? `${m.var_7d_pct > 0 ? '+' : ''}${m.var_7d_pct.toFixed(1)}%` : 'N/A'}
                  </TableCell>
                  <TableCell className={m.var_30d_pct > 0 ? 'text-green-600' : 'text-red-600'}>
                    {m.var_30d_pct ? `${m.var_30d_pct > 0 ? '+' : ''}${m.var_30d_pct.toFixed(1)}%` : 'N/A'}
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
