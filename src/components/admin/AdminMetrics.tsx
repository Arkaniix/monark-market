import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('model_daily_metrics')
        .select('*, hardware_models(name, brand)')
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les métriques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  const topGainers = [...metrics]
    .filter(m => m.var_7d_pct)
    .sort((a, b) => (b.var_7d_pct || 0) - (a.var_7d_pct || 0))
    .slice(0, 5);

  const topLosers = [...metrics]
    .filter(m => m.var_7d_pct)
    .sort((a, b) => (a.var_7d_pct || 0) - (b.var_7d_pct || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analyses de marché</h2>
        <p className="text-muted-foreground">Métriques et tendances par modèle</p>
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
                {topGainers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <TrendingUp className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Pas encore de données. Les métriques seront disponibles après plusieurs jours de scraping.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  topGainers.map((metric: any) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-medium">
                      {metric.hardware_models?.brand} {metric.hardware_models?.name}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      +{metric.var_7d_pct?.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
                )}
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
                {topLosers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <TrendingUp className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Pas encore de données. Les métriques seront disponibles après plusieurs jours de scraping.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  topLosers.map((metric: any) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-medium">
                      {metric.hardware_models?.brand} {metric.hardware_models?.name}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {metric.var_7d_pct?.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Métriques détaillées</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculer
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modèle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Prix Médian</TableHead>
                <TableHead>Annonces</TableHead>
                <TableHead>Nouvelles</TableHead>
                <TableHead>Disparues</TableHead>
                <TableHead>Var 7j</TableHead>
                <TableHead>Var 30j</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">
                    {metric.hardware_models?.brand} {metric.hardware_models?.name}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(metric.date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{metric.price_median ? `${metric.price_median}€` : 'N/A'}</TableCell>
                  <TableCell>{metric.ads_count}</TableCell>
                  <TableCell className="text-green-600">{metric.new_ads}</TableCell>
                  <TableCell className="text-red-600">{metric.disappeared_ads}</TableCell>
                  <TableCell className={metric.var_7d_pct > 0 ? 'text-green-600' : 'text-red-600'}>
                    {metric.var_7d_pct ? `${metric.var_7d_pct > 0 ? '+' : ''}${metric.var_7d_pct.toFixed(1)}%` : 'N/A'}
                  </TableCell>
                  <TableCell className={metric.var_30d_pct > 0 ? 'text-green-600' : 'text-red-600'}>
                    {metric.var_30d_pct ? `${metric.var_30d_pct > 0 ? '+' : ''}${metric.var_30d_pct.toFixed(1)}%` : 'N/A'}
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
