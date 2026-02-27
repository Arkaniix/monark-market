import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Zap, Minus, RefreshCw, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MarketRegime {
  id: number;
  model_id: number;
  regime: string;
  confidence: number;
  volatility: number;
  detected_at: string;
  model_name?: string;
  model_brand?: string;
  category_name?: string;
}

const REGIME_CONFIG: Record<string, { label: string; icon: any; className: string }> = {
  stable: { label: "Stable", icon: Minus, className: "bg-green-500/20 text-green-600 border-green-500/30" },
  uptrend: { label: "Hausse", icon: TrendingUp, className: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
  downtrend: { label: "Baisse", icon: TrendingDown, className: "bg-red-500/20 text-red-600 border-red-500/30" },
  shock: { label: "Choc", icon: Zap, className: "bg-orange-500/20 text-orange-600 border-orange-500/30 animate-pulse" },
};

export default function AdminRegimes() {
  const [regimes, setRegimes] = useState<MarketRegime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [regimeFilter, setRegimeFilter] = useState("all");
  const { toast } = useToast();

  const fetchRegimes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try Supabase first (same VPS PG exposed via Supabase)
      // If table doesn't exist, show placeholder
      const { data, error: dbError } = await supabase
        .from('model_daily_metrics' as any)
        .select('*, hardware_models(name, brand, hardware_categories(name))')
        .order('date', { ascending: false })
        .limit(200);

      if (dbError) throw dbError;

      // Simulate regime detection from metrics data
      const mappedRegimes: MarketRegime[] = (data || []).map((m: any) => {
        let regime = 'stable';
        const v7 = m.var_7d_pct || 0;
        const v30 = m.var_30d_pct || 0;
        if (Math.abs(v7) > 15 || Math.abs(v30) > 25) regime = 'shock';
        else if (v7 > 5) regime = 'uptrend';
        else if (v7 < -5) regime = 'downtrend';

        return {
          id: m.id,
          model_id: m.model_id,
          regime,
          confidence: Math.min(100, Math.abs(v7) * 10 + 30),
          volatility: Math.abs(v7),
          detected_at: m.date,
          model_name: m.hardware_models?.name,
          model_brand: m.hardware_models?.brand,
          category_name: m.hardware_models?.hardware_categories?.name,
        };
      });

      // Deduplicate by model_id (keep most recent)
      const seen = new Set<number>();
      const unique = mappedRegimes.filter(r => {
        if (seen.has(r.model_id)) return false;
        seen.add(r.model_id);
        return true;
      });

      setRegimes(unique);
    } catch {
      setError("Données indisponibles — lancez `detect_regimes.py` pour alimenter la table model_market_regimes");
      setRegimes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegimes(); }, []);

  const filtered = regimes.filter(r => {
    if (categoryFilter !== "all" && r.category_name?.toLowerCase() !== categoryFilter) return false;
    if (regimeFilter !== "all" && r.regime !== regimeFilter) return false;
    return true;
  });

  const counts = {
    stable: regimes.filter(r => r.regime === 'stable').length,
    uptrend: regimes.filter(r => r.regime === 'uptrend').length,
    downtrend: regimes.filter(r => r.regime === 'downtrend').length,
    shock: regimes.filter(r => r.regime === 'shock').length,
  };

  const shockModels = filtered.filter(r => r.regime === 'shock');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Régimes de marché</h2>
          <p className="text-muted-foreground">Détection automatique des tendances, chocs et marchés morts</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRegimes}>
          <RefreshCw className="h-4 w-4 mr-2" />Rafraîchir
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["stable", "uptrend", "downtrend", "shock"] as const).map((r) => {
          const cfg = REGIME_CONFIG[r];
          const Icon = cfg.icon;
          return (
            <Card key={r} className={r === 'shock' && counts.shock > 0 ? 'border-orange-500/50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{counts[r]}</div>}
                </div>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Shock alert */}
      {shockModels.length > 0 && (
        <Card className="border-2 border-orange-500/50 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Zap className="h-5 w-5" />
              Modèles en régime CHOC ({shockModels.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {shockModels.map(m => (
                <li key={m.id} className="text-sm">
                  <span className="font-medium">{m.model_brand} {m.model_name}</span>
                  <span className="text-muted-foreground"> — volatilité {m.volatility.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Détail par modèle</CardTitle>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="gpu">GPU</SelectItem>
                  <SelectItem value="cpu">CPU</SelectItem>
                  <SelectItem value="ram">RAM</SelectItem>
                  <SelectItem value="ssd">SSD</SelectItem>
                </SelectContent>
              </Select>
              <Select value={regimeFilter} onValueChange={setRegimeFilter}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous régimes</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="uptrend">Hausse</SelectItem>
                  <SelectItem value="downtrend">Baisse</SelectItem>
                  <SelectItem value="shock">Choc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune donnée de régime disponible</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modèle</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Régime</TableHead>
                  <TableHead>Confiance</TableHead>
                  <TableHead>Volatilité</TableHead>
                  <TableHead>Détection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const cfg = REGIME_CONFIG[r.regime] || REGIME_CONFIG.stable;
                  const Icon = cfg.icon;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.model_brand} {r.model_name}</TableCell>
                      <TableCell><Badge variant="outline">{r.category_name || '—'}</Badge></TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${cfg.className}`}>
                          <Icon className="h-3 w-3" />{cfg.label}
                        </span>
                      </TableCell>
                      <TableCell>{r.confidence.toFixed(0)}%</TableCell>
                      <TableCell>{r.volatility.toFixed(1)}%</TableCell>
                      <TableCell className="text-xs">{new Date(r.detected_at).toLocaleDateString('fr-FR')}</TableCell>
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
