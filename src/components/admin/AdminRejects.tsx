import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ExternalLink, Check, X, Download, ChevronLeft, ChevronRight, RefreshCw, FileX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminApiGet, adminApiPatch, adminApiDownload } from "@/lib/api/adminApi";

interface RejectStats {
  total: number;
  unreviewed: number;
  by_reason: Record<string, number>;
}

interface Reject {
  id: number;
  platform: string;
  title: string;
  price: number | null;
  url: string;
  reason: string;
  reviewed: boolean;
  created_at: string;
}

interface RejectsResponse {
  items: Reject[];
  total: number;
  limit: number;
  offset: number;
}

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  price_zero: { label: "Prix à discuter", color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
  no_model_match: { label: "Non reconnu", color: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
  price_outlier_low: { label: "Prix trop bas", color: "bg-red-500/20 text-red-600 border-red-500/30" },
  price_outlier_high: { label: "Prix trop haut", color: "bg-red-500/20 text-red-600 border-red-500/30" },
  missing_platform: { label: "Incomplet", color: "bg-muted text-muted-foreground border-muted-foreground/30" },
  missing_ad_id: { label: "Incomplet", color: "bg-muted text-muted-foreground border-muted-foreground/30" },
  missing_price: { label: "Sans prix", color: "bg-muted text-muted-foreground border-muted-foreground/30" },
};

const PLATFORMS = ["leboncoin", "ebay", "vinted", "facebook", "amazon", "ldlc"];
const REASONS = Object.keys(REASON_LABELS);

export default function AdminRejects() {
  const [stats, setStats] = useState<RejectStats | null>(null);
  const [rejects, setRejects] = useState<Reject[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Filters
  const [reasonFilter, setReasonFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [unreviewedOnly, setUnreviewedOnly] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 50;

  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await adminApiGet<RejectStats>('/v1/admin/rejects/stats');
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchRejects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (reasonFilter !== "all") params.set("reason", reasonFilter);
      if (platformFilter !== "all") params.set("platform", platformFilter);
      if (unreviewedOnly) params.set("reviewed", "false");
      params.set("limit", limit.toString());
      params.set("offset", ((page - 1) * limit).toString());

      const data = await adminApiGet<RejectsResponse>(`/v1/admin/rejects?${params}`);
      setRejects(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Impossible de charger les rejets");
      setRejects([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [reasonFilter, platformFilter, unreviewedOnly, page]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchRejects(); }, [fetchRejects]);

  const handleReview = async (id: number, action: 'force_integrate' | 'confirm_reject') => {
    setActionLoading(id);
    try {
      await adminApiPatch(`/v1/admin/rejects/${id}/review?action=${action}`);
      toast({ title: action === 'force_integrate' ? "Annonce intégrée" : "Rejet confirmé" });
      setRejects(prev => prev.filter(r => r.id !== id));
      setTotal(prev => prev - 1);
      fetchStats();
    } catch {
      toast({ title: "Erreur", description: "Action impossible", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    try {
      await adminApiDownload('/v1/admin/rejects/export/csv', 'rejets-ingestion.csv');
      toast({ title: "Export téléchargé" });
    } catch {
      toast({ title: "Erreur", description: "Export impossible", variant: "destructive" });
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Rejets d'ingestion</h2>
        <p className="text-muted-foreground">Annonces scannées mais non intégrées — vérifiez que nous ne passons pas à côté de bonnes affaires</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.total ?? '—'}</div>
            )}
            <p className="text-xs text-muted-foreground">Total des rejets</p>
          </CardContent>
        </Card>
        <Card className={(stats?.unreviewed ?? 0) > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className={(stats?.unreviewed ?? 0) > 0 ? "h-4 w-4 text-destructive" : "h-4 w-4 text-muted-foreground"} />
              {statsLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-2xl font-bold">{stats?.unreviewed ?? '—'}</div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Non reviewés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {statsLoading ? <Skeleton className="h-20 w-full" /> : stats?.by_reason ? (
              <div className="space-y-1">
                {Object.entries(stats.by_reason).slice(0, 4).map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{REASON_LABELS[reason]?.label || reason}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Pas de données</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Répartition par raison</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Rejets ({total})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchRejects(); }}>
                <RefreshCw className="h-4 w-4 mr-1" />Rafraîchir
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <Select value={reasonFilter} onValueChange={(v) => { setReasonFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Raison" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes raisons</SelectItem>
                {REASONS.map(r => <SelectItem key={r} value={r}>{REASON_LABELS[r].label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={(v) => { setPlatformFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Plateforme" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch checked={unreviewedOnly} onCheckedChange={(c) => { setUnreviewedOnly(c); setPage(1); }} />
              <Label className="text-sm">Non reviewés seulement</Label>
            </div>
          </div>

          {error ? (
            <div className="text-center py-12">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{error}</p>
              <p className="text-xs text-muted-foreground mt-1">Endpoint : /v1/admin/rejects — à implémenter sur le backend</p>
              <Button variant="outline" className="mt-4" onClick={fetchRejects}>Réessayer</Button>
            </div>
          ) : loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : rejects.length === 0 ? (
            <div className="text-center py-12">
              <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">Aucun rejet à traiter 🎉</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plateforme</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Reviewé</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejects.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell><Badge variant="outline">{r.platform}</Badge></TableCell>
                      <TableCell className="max-w-[200px] truncate">{r.title}</TableCell>
                      <TableCell>{r.price != null ? `${r.price}€` : '—'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${REASON_LABELS[r.reason]?.color || ''}`}>
                          {REASON_LABELS[r.reason]?.label || r.reason}
                        </span>
                      </TableCell>
                      <TableCell>
                        {r.reviewed ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-muted-foreground" />}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={r.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            disabled={actionLoading === r.id}
                            onClick={() => handleReview(r.id, 'force_integrate')}
                            title="Forcer l'intégration"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            disabled={actionLoading === r.id}
                            onClick={() => handleReview(r.id, 'confirm_reject')}
                            title="Confirmer le rejet"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Page {page}/{totalPages} ({total})</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
