import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Download, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { adminApiFetch, adminApiDownload } from "@/lib/api/adminApi";
import { ADMIN } from "@/lib/api/endpoints";
import type { ClientListResponse, ClientRow, CreditHistoryEntry } from "@/types/admin";

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function timeAgo(d: string | null) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  canceled: "bg-red-500/20 text-red-400 border-red-500/30",
  expired: "bg-muted text-muted-foreground",
};

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
  pro: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  basic: "bg-muted text-muted-foreground",
};

export default function AdminCompta() {
  const [data, setData] = useState<ClientListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [creditHistory, setCreditHistory] = useState<CreditHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (planFilter !== "all") params.set("plan_filter", planFilter);
      if (statusFilter !== "all") params.set("status_filter", statusFilter);
      const res = await adminApiFetch<ClientListResponse>(`${ADMIN.BILLING_CLIENTS}?${params}`);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Erreur API");
    } finally {
      setLoading(false);
    }
  }, [search, planFilter, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchData, 400);
    return () => clearTimeout(debounce);
  }, [fetchData]);

  const openDetail = async (client: ClientRow) => {
    setSelectedClient(client);
    setHistoryLoading(true);
    try {
      const res = await adminApiFetch<{ history: CreditHistoryEntry[] }>(ADMIN.BILLING_CLIENT_HISTORY(client.user_id));
      setCreditHistory(res.history || []);
    } catch {
      setCreditHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const summary = data?.summary;

  const KPISkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comptabilité & Clients</h2>
          <p className="text-sm text-muted-foreground">Abonnements, crédits, revenus — Export comptable</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => adminApiDownload(ADMIN.BILLING_EXPORT, "monark_compta.csv")}>
            <Download className="h-4 w-4 mr-1" /> Exporter CSV Compta
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error} <Button variant="link" size="sm" onClick={fetchData}>Réessayer</Button></AlertDescription>
        </Alert>
      )}

      {/* KPIs */}
      {loading && !data ? <KPISkeleton /> : summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Clients total</p><p className="text-2xl font-bold">{summary.total_clients}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Abonnés actifs</p><p className="text-2xl font-bold text-green-400">{summary.active_subscribers}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Churn</p><p className="text-2xl font-bold">{summary.churned_subscribers}{summary.churned_subscribers > 0 && <Badge variant="destructive" className="ml-2 text-[10px]">!</Badge>}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">MRR estimé</p><p className="text-2xl font-bold">{summary.mrr_estimate_eur.toFixed(0)}€</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Revenu total estimé</p><p className="text-xl font-bold">{summary.total_revenue_estimate_eur.toFixed(0)}€</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Crédits émis</p><p className="text-xl font-bold">{summary.total_credits_issued.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Crédits consommés</p><p className="text-xl font-bold">{summary.total_credits_consumed.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Ventes de packs</p><p className="text-xl font-bold">{summary.credits_pack_sales}</p></CardContent></Card>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Rechercher email / nom…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Plan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading && !data ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : data && data.clients.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Aucun client trouvé</CardContent></Card>
      ) : data && (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead className="text-right">Cr/cycle</TableHead>
                <TableHead className="text-right text-green-400">Reçus</TableHead>
                <TableHead className="text-right text-red-400">Consommés</TableHead>
                <TableHead className="text-right font-bold">Solde</TableHead>
                <TableHead className="text-right">Packs</TableHead>
                <TableHead className="text-right">Revenu</TableHead>
                <TableHead>Inscrit</TableHead>
                <TableHead>Dernière co.</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.clients.map((c) => (
                <TableRow key={c.user_id}>
                  <TableCell className="font-medium max-w-[180px] truncate">{c.email}</TableCell>
                  <TableCell className="max-w-[120px] truncate">{c.display_name || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] ${ROLE_BADGE[c.role] || ROLE_BADGE.basic}`}>{c.role}</Badge></TableCell>
                  <TableCell>{c.current_plan_name ? <Badge variant="outline" className="text-[10px]">{c.current_plan_name}</Badge> : <span className="text-muted-foreground text-xs">Aucun</span>}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] ${STATUS_BADGE[c.subscription_status || ""] || STATUS_BADGE.expired}`}>{c.subscription_status || "—"}</Badge></TableCell>
                  <TableCell className="text-xs">{c.billing_cycle || "—"}</TableCell>
                  <TableCell className="text-right">{c.credits_per_cycle ?? "—"}</TableCell>
                  <TableCell className="text-right text-green-400">{c.credits_total_received}</TableCell>
                  <TableCell className="text-right text-red-400">{c.credits_total_consumed}</TableCell>
                  <TableCell className={`text-right font-bold ${c.credits_balance >= 0 ? "text-foreground" : "text-red-400"}`}>{c.credits_balance}</TableCell>
                  <TableCell className="text-right">{c.credit_packs_purchased > 0 ? <Badge variant="secondary" className="text-[10px]">{c.credit_packs_purchased}</Badge> : "—"}</TableCell>
                  <TableCell className="text-right">{c.estimated_revenue_eur != null ? `${c.estimated_revenue_eur.toFixed(0)}€` : "—"}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{formatDate(c.created_at)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(c.last_login)}</TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => openDetail(c)}>📋 Détail</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedClient.email}
                  {selectedClient.current_plan_name && <Badge variant="outline">{selectedClient.current_plan_name}</Badge>}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Subscription info */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Abonnement</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Plan :</span> {selectedClient.current_plan_name || "Aucun"}</div>
                    <div><span className="text-muted-foreground">Statut :</span> {selectedClient.subscription_status || "—"}</div>
                    <div><span className="text-muted-foreground">Cycle :</span> {selectedClient.billing_cycle || "—"}</div>
                    <div><span className="text-muted-foreground">Crédits/cycle :</span> {selectedClient.credits_per_cycle ?? "—"}</div>
                    <div><span className="text-muted-foreground">Début :</span> {formatDate(selectedClient.subscription_started_at)}</div>
                    <div><span className="text-muted-foreground">Expire :</span> {formatDate(selectedClient.subscription_expires_at)}</div>
                    {selectedClient.stripe_subscription_id && <div className="col-span-2"><span className="text-muted-foreground">Stripe :</span> <code className="text-xs">{selectedClient.stripe_subscription_id}</code></div>}
                  </div>
                </div>

                {/* Credit history */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Historique crédits</h4>
                  {historyLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
                  ) : creditHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun mouvement</p>
                  ) : (
                    <div className="rounded-lg border overflow-x-auto max-h-[300px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Delta</TableHead>
                            <TableHead>Raison</TableHead>
                            <TableHead>Détails</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {creditHistory.map((h) => (
                            <TableRow key={h.id}>
                              <TableCell className="text-xs whitespace-nowrap">{formatDate(h.created_at)}</TableCell>
                              <TableCell className={`text-right font-bold ${h.delta >= 0 ? "text-green-400" : "text-red-400"}`}>{h.delta >= 0 ? "+" : ""}{h.delta}</TableCell>
                              <TableCell className="text-xs">{h.reason}</TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{h.meta ? JSON.stringify(h.meta) : "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
