import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Flame, AlertTriangle, Zap, FileX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('model_daily_metrics')
        .select('*, hardware_models(name, brand)')
        .order('date', { ascending: false })
        .limit(50);
      if (dbError) throw dbError;
      setMetrics(data || []);
    } catch (err: any) {
      setError(err.message);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  // Determine regimes from metrics
  const getRegime = (m: any) => {
    const v7 = m.var_7d_pct || 0;
    if (Math.abs(v7) > 15) return 'shock';
    if (v7 > 5) return 'uptrend';
    if (v7 < -5) return 'downtrend';
    return 'stable';
  };

  const shockModels = metrics.filter(m => getRegime(m) === 'shock');
  const pressureModels = metrics.filter(m => (m.var_7d_pct || 0) < -5 && (m.new_ads || 0) > 3);
  const hotModels = metrics.filter(m => (m.var_7d_pct || 0) > 3 && (m.new_ads || 0) < 2);

  const topGainers = [...metrics].filter(m => m.var_7d_pct).sort((a, b) => (b.var_7d_pct || 0) - (a.var_7d_pct || 0)).slice(0, 5);
  const topLosers = [...metrics].filter(m => m.var_7d_pct).sort((a, b) => (a.var_7d_pct || 0) - (b.var_7d_pct || 0)).slice(0, 5);

  const REGIME_BADGE: Record<string, { label: string; className: string }> = {
    stable: { label: "Stable", className: "bg-green-500/20 text-green-600 border-green-500/30" },
    uptrend: { label: "↑", className: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
    downtrend: { label: "↓", className: "bg-red-500/20 text-red-600 border-red-500/30" },
    shock: { label: "⚡", className: "bg-orange-500/20 text-orange-600 border-orange-500/30" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Analyses de marché</h2>
          <p className="text-muted-foreground">Métriques et tendances par modèle</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMetrics}><RefreshCw className="h-4 w-4 mr-2" />Recalculer</Button>
      </div>

      {/* Shock alert */}
      {shockModels.length > 0 && (
        <Card className="border-2 border-orange-500/50 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Zap className="h-5 w-5" />Modèles en régime CHOC ({shockModels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {shockModels.map(m => (
                <li key={m.id} className="text-sm">{m.hardware_models?.brand} {m.hardware_models?.name}: {m.var_7d_pct?.toFixed(1)}% (7j)</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Strategic KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={pressureModels.length > 0 ? 'border-yellow-500/30' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600"><AlertTriangle className="h-5 w-5" />Sous pression ({pressureModels.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Forte baisse prix + hausse stock</p>
            {pressureModels.length > 0 ? (
              <ul className="space-y-1">{pressureModels.map(m => <li key={m.id} className="text-sm">{m.hardware_models?.brand} {m.hardware_models?.name}: {m.var_7d_pct?.toFixed(1)}%</li>)}</ul>
            ) : <p className="text-sm text-muted-foreground">Aucun</p>}
          </CardContent>
        </Card>
        <Card className={hotModels.length > 0 ? 'border-orange-500/30' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600"><Flame className="h-5 w-5" />Modèles chauds ({hotModels.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Hausse prix + baisse stock</p>
            {hotModels.length > 0 ? (
              <ul className="space-y-1">{hotModels.map(m => <li key={m.id} className="text-sm">{m.hardware_models?.brand} {m.hardware_models?.name}: +{m.var_7d_pct?.toFixed(1)}%</li>)}</ul>
            ) : <p className="text-sm text-muted-foreground">Aucun</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-green-600">Top Hausses (7j)</CardTitle><TrendingUp className="h-4 w-4 text-green-600" /></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-24 w-full" /> : topGainers.length === 0 ? <p className="text-sm text-muted-foreground">Aucune donnée</p> : (
              <Table><TableBody>{topGainers.map(m => <TableRow key={m.id}><TableCell className="font-medium">{m.hardware_models?.brand} {m.hardware_models?.name}</TableCell><TableCell className="text-right text-green-600">+{m.var_7d_pct?.toFixed(1)}%</TableCell></TableRow>)}</TableBody></Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-red-600">Top Baisses (7j)</CardTitle><TrendingDown className="h-4 w-4 text-red-600" /></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-24 w-full" /> : topLosers.length === 0 ? <p className="text-sm text-muted-foreground">Aucune donnée</p> : (
              <Table><TableBody>{topLosers.map(m => <TableRow key={m.id}><TableCell className="font-medium">{m.hardware_models?.brand} {m.hardware_models?.name}</TableCell><TableCell className="text-right text-red-600">{m.var_7d_pct?.toFixed(1)}%</TableCell></TableRow>)}</TableBody></Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Métriques détaillées</CardTitle></CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-12"><FileX className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p className="text-muted-foreground">{error}</p></div>
          ) : loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : metrics.length === 0 ? (
            <div className="text-center py-12"><p className="text-muted-foreground">Aucune métrique disponible</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modèle</TableHead>
                  <TableHead>Prix Médian</TableHead>
                  <TableHead>Annonces</TableHead>
                  <TableHead>Nouvelles</TableHead>
                  <TableHead>Var 7j</TableHead>
                  <TableHead>Var 30j</TableHead>
                  <TableHead>Régime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((m) => {
                  const regime = getRegime(m);
                  const cfg = REGIME_BADGE[regime];
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.hardware_models?.brand} {m.hardware_models?.name}</TableCell>
                      <TableCell>{m.price_median ? `${m.price_median}€` : '—'}</TableCell>
                      <TableCell>{m.ads_count}</TableCell>
                      <TableCell className="text-green-600">{m.new_ads}</TableCell>
                      <TableCell className={(m.var_7d_pct || 0) > 0 ? 'text-green-600' : 'text-red-600'}>
                        {m.var_7d_pct ? `${m.var_7d_pct > 0 ? '+' : ''}${m.var_7d_pct.toFixed(1)}%` : '—'}
                      </TableCell>
                      <TableCell className={(m.var_30d_pct || 0) > 0 ? 'text-green-600' : 'text-red-600'}>
                        {m.var_30d_pct ? `${m.var_30d_pct > 0 ? '+' : ''}${m.var_30d_pct.toFixed(1)}%` : '—'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${cfg.className}`}>{cfg.label}</span>
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
