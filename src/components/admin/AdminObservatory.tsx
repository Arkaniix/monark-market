import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Download, AlertTriangle, Search, Zap, TrendingUp, TrendingDown, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { adminApiFetch, adminApiDownload } from "@/lib/api/adminApi";
import { ADMIN } from "@/lib/api/endpoints";
import type { ObservatoryResponse, ObservatoryModel } from "@/types/admin";
import { VariantsPanel } from "./VariantsPanel";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

const CATEGORY_COLORS: Record<string, string> = {
  GPU: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CPU: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  RAM: "bg-green-500/20 text-green-400 border-green-500/30",
  SSD: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const REGIME_BADGE: Record<string, { label: string; cls: string; icon?: React.ReactNode }> = {
  stable: { label: "Stable", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
  uptrend: { label: "Hausse", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <TrendingUp className="h-3 w-3" /> },
  downtrend: { label: "Baisse", cls: "bg-red-500/20 text-red-400 border-red-500/30", icon: <TrendingDown className="h-3 w-3" /> },
  shock: { label: "Shock", cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse", icon: <Zap className="h-3 w-3" /> },
};

export default function AdminObservatory() {
  const [data, setData] = useState<ObservatoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("ads_active");
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [missionModal, setMissionModal] = useState<ObservatoryModel | null>(null);
  const [missionPlatform, setMissionPlatform] = useState("leboncoin");
  const [missionPages, setMissionPages] = useState(3);
  const [missionKeyword, setMissionKeyword] = useState("");
  const [missionLoading, setMissionLoading] = useState(false);
  const [expandedModelId, setExpandedModelId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ sort_by: sortBy, sort_order: "desc", limit: "200" });
      if (category !== "all") params.set("category", category);
      const res = await adminApiFetch<ObservatoryResponse>(`${ADMIN.OBSERVATORY}?${params}`);
      setData(res);
      setLastRefresh(Date.now());
    } catch (e: any) {
      setError(e.message || "Erreur API");
    } finally {
      setLoading(false);
    }
  }, [category, sortBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh 60s
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const openMission = (m: ObservatoryModel) => {
    setMissionModal(m);
    setMissionKeyword(`${m.manufacturer || ""} ${m.model_name}`.trim());
    setMissionPlatform("leboncoin");
    setMissionPages(3);
  };

  const launchMission = async () => {
    if (!missionModal) return;
    setMissionLoading(true);
    try {
      const res = await adminApiFetch<{ job_id: number }>(ADMIN.OBSERVATORY_MISSION, {
        method: "POST",
        body: JSON.stringify({ model_id: missionModal.model_id, platform: missionPlatform, keyword: missionKeyword, pages_target: missionPages }),
      });
      toast({ title: "Mission lancée", description: `Job #${res.job_id} créé` });
      setMissionModal(null);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setMissionLoading(false);
    }
  };

  const summary = data?.summary;

  const KPISkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
      ))}
    </div>
  );

  const TableSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Observatoire des composants</h2>
          <p className="text-sm text-muted-foreground">Vue temps réel de la couverture et qualité des données par composant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => adminApiDownload(ADMIN.OBSERVATORY_EXPORT, "observatory.csv")}>
            <Download className="h-4 w-4 mr-1" /> Exporter CSV
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Dernière MAJ : {timeAgo(new Date(lastRefresh).toISOString())}</p>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error} <Button variant="link" size="sm" onClick={fetchData}>Réessayer</Button></AlertDescription>
        </Alert>
      )}

      {/* KPIs */}
      {loading && !data ? <KPISkeleton /> : summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Modèles total</p><p className="text-2xl font-bold">{summary.total_models}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Avec données marché</p><p className="text-2xl font-bold">{summary.models_with_market_data}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Sans annonces</p><p className="text-2xl font-bold flex items-center gap-2">{summary.models_no_ads}{summary.models_no_ads > summary.total_models * 0.1 && <Badge variant="destructive" className="text-[10px]">⚠</Badge>}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Annonces actives</p><p className="text-2xl font-bold">{summary.total_active_ads.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Régimes SHOCK</p><p className="text-2xl font-bold flex items-center gap-2">{summary.regimes_shock}{summary.regimes_shock > 0 && <Badge variant="destructive" className="text-[10px]">!</Badge>}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Qualité moyenne</p><Progress value={summary.avg_data_quality} className="mt-2 h-2" /><p className="text-sm font-bold mt-1">{summary.avg_data_quality}%</p></CardContent></Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="GPU">GPU</SelectItem>
            <SelectItem value="CPU">CPU</SelectItem>
            <SelectItem value="RAM">RAM</SelectItem>
            <SelectItem value="SSD">SSD</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Trier par" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ads_active">Annonces actives</SelectItem>
            <SelectItem value="price_median">Prix médian</SelectItem>
            <SelectItem value="trend_7d_pct">Tendance 7j</SelectItem>
            <SelectItem value="data_quality_score">Qualité données</SelectItem>
            <SelectItem value="name">Nom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading && !data ? <TableSkeleton /> : data && data.models.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Aucun composant trouvé</CardContent></Card>
      ) : data && (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modèle</TableHead>
                <TableHead>Cat.</TableHead>
                <TableHead className="text-right">Annonces</TableHead>
                <TableHead className="text-right">Outliers</TableHead>
                <TableHead>Confiance</TableHead>
                <TableHead className="text-right">Prix médian</TableHead>
                <TableHead className="text-right">P25–P75</TableHead>
                <TableHead className="text-right">7j</TableHead>
                <TableHead className="text-right">30j</TableHead>
                <TableHead>Régime</TableHead>
                <TableHead className="text-right">Prix neuf</TableHead>
                <TableHead>Qualité</TableHead>
                <TableHead>Dernier scan</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.models.map((m) => {
                const regime = m.regime ? REGIME_BADGE[m.regime] : null;
                const catCls = CATEGORY_COLORS[m.category] || "bg-muted text-muted-foreground";
                const rowCls = m.ads_active === 0 ? "bg-red-500/5" : m.regime === "shock" ? "bg-yellow-500/5" : "";
                return (
                  <TableRow key={m.model_id} className={rowCls}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {(m.data_quality_score ?? 100) < 30 && <AlertTriangle className="h-3 w-3 text-yellow-400 inline mr-1" />}
                      {m.manufacturer} {m.model_name}
                    </TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${catCls}`}>{m.category}</Badge></TableCell>
                    <TableCell className={`text-right ${m.ads_active === 0 ? "text-red-400 font-bold" : ""}`}>{m.ads_active}/{m.ads_total}</TableCell>
                    <TableCell className="text-right">{m.ads_outlier_count > 0 ? <Badge variant="destructive" className="text-[10px]">{m.ads_outlier_count}</Badge> : "—"}</TableCell>
                    <TableCell className="min-w-[80px]">
                      {m.avg_model_confidence != null ? (
                        <Progress value={m.avg_model_confidence * 100} className="h-2" />
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">{m.price_median != null ? `${m.price_median.toFixed(0)}€` : "—"}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{m.price_p25 != null && m.price_p75 != null ? `${m.price_p25.toFixed(0)}€ – ${m.price_p75.toFixed(0)}€` : "—"}</TableCell>
                    <TableCell className="text-right">
                      {m.trend_7d_pct != null ? (
                        <span className={m.trend_7d_pct >= 0 ? "text-green-400" : "text-red-400"}>
                          {m.trend_7d_pct >= 0 ? "↑" : "↓"}{Math.abs(m.trend_7d_pct).toFixed(1)}%
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.trend_30d_pct != null ? (
                        <span className={m.trend_30d_pct >= 0 ? "text-green-400" : "text-red-400"}>
                          {m.trend_30d_pct >= 0 ? "↑" : "↓"}{Math.abs(m.trend_30d_pct).toFixed(1)}%
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {regime ? (
                        <Badge variant="outline" className={`text-[10px] gap-1 ${regime.cls}`}>{regime.icon}{regime.label}</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.new_price_eur != null ? (
                        <div>
                          <span>{m.new_price_eur.toFixed(0)}€</span>
                          {m.new_price_source && <p className="text-[9px] text-muted-foreground">{m.new_price_source}</p>}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="min-w-[70px]">
                      {m.data_quality_score != null ? (
                        <Progress value={m.data_quality_score} className="h-2" />
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(m.last_ad_seen_at)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openMission(m)}>
                        <Search className="h-3 w-3 mr-1" /> Scanner
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mission Modal */}
      <Dialog open={!!missionModal} onOpenChange={() => setMissionModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lancer un scan — {missionModal?.manufacturer} {missionModal?.model_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Plateforme</Label>
              <Select value={missionPlatform} onValueChange={setMissionPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="leboncoin">Leboncoin</SelectItem>
                  <SelectItem value="ebay">eBay</SelectItem>
                  <SelectItem value="vinted">Vinted</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Keyword</Label>
              <Input value={missionKeyword} onChange={(e) => setMissionKeyword(e.target.value)} />
            </div>
            <div>
              <Label>Pages à scanner</Label>
              <Input type="number" value={missionPages} onChange={(e) => setMissionPages(Number(e.target.value))} min={1} max={20} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMissionModal(null)}>Annuler</Button>
            <Button onClick={launchMission} disabled={missionLoading}>
              {missionLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Lancer la mission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
