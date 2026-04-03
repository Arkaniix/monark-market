import { useState, useCallback, useRef } from "react";
import { Package, TrendingUp, TrendingDown, Clock, Tag, ShoppingCart, MoreHorizontal, Plus, Download, Search, Pencil, Trash2, ArrowDownToLine, DollarSign, CheckCircle, Receipt } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useInventoryList, useInventoryStats, useDeleteItem, useUnlistItem, useTransactionList, useDeleteTransaction } from "@/hooks/useInventory";
import { useEntitlements } from "@/hooks/useEntitlements";
import AddEditItemModal from "@/components/inventory/AddEditItemModal";
import ListItemModal from "@/components/inventory/ListItemModal";
import SellItemModal from "@/components/inventory/SellItemModal";
import AddTransactionModal from "@/components/inventory/AddTransactionModal";
import type { InventoryItem, InventoryStatus, InventoryCategory, InventorySort, InventoryFilters, Transaction, TransactionType, TransactionCategory, TransactionFilters } from "@/types/inventory";
import { CATEGORY_LABELS, CATEGORY_COLORS, STATUS_LABELS, STATUS_COLORS, SORT_OPTIONS, TRANSACTION_CATEGORY_LABELS } from "@/types/inventory";

const PAGE_SIZE = 20;

export default function Inventory() {
  const { toast } = useToast();
  const { plan } = useEntitlements();

  // Active tab
  const [activeTab, setActiveTab] = useState("components");

  // ============= Component Filters =============
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<InventorySort>("date_desc");
  const [page, setPage] = useState(0);
  const [statsDays, setStatsDays] = useState(90);

  // ============= Transaction Filters =============
  const [txTypeFilter, setTxTypeFilter] = useState<TransactionType | "all">("all");
  const [txCategoryFilter, setTxCategoryFilter] = useState<TransactionCategory | "all">("all");
  const [txPage, setTxPage] = useState(0);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedSearch(val); setPage(0); }, 300);
  }, []);

  const filters: InventoryFilters = {
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    search: debouncedSearch || undefined,
    sort,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const txFilters: TransactionFilters = {
    type: txTypeFilter === "all" ? undefined : txTypeFilter,
    category: txCategoryFilter === "all" ? undefined : txCategoryFilter,
    limit: PAGE_SIZE,
    offset: txPage * PAGE_SIZE,
  };

  const { data: listData, isLoading: listLoading } = useInventoryList(filters);
  const { data: stats, isLoading: statsLoading } = useInventoryStats(statsDays);
  const { data: txData, isLoading: txLoading } = useTransactionList(txFilters);
  const deleteMutation = useDeleteItem();
  const unlistMutation = useUnlistItem();
  const deleteTxMutation = useDeleteTransaction();

  // Modals
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [listModalItem, setListModalItem] = useState<InventoryItem | null>(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellModalItem, setSellModalItem] = useState<InventoryItem | null>(null);
  const [deleteDialogItem, setDeleteDialogItem] = useState<InventoryItem | null>(null);
  const [unlistDialogItem, setUnlistDialogItem] = useState<InventoryItem | null>(null);

  // Transaction modals
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTxDialog, setDeleteTxDialog] = useState<Transaction | null>(null);

  const items = listData?.items ?? [];
  const total = listData?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

  const txItems = txData?.items ?? [];
  const txTotal = txData?.total ?? 0;
  const txTotalPages = Math.ceil(txTotal / PAGE_SIZE);
  const txFrom = txPage * PAGE_SIZE + 1;
  const txTo = Math.min((txPage + 1) * PAGE_SIZE, txTotal);

  // Actions
  const handleDelete = async () => {
    if (!deleteDialogItem) return;
    try {
      await deleteMutation.mutateAsync(deleteDialogItem.id);
      toast({ title: "Supprimé" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
    setDeleteDialogItem(null);
  };

  const handleUnlist = async () => {
    if (!unlistDialogItem) return;
    try {
      await unlistMutation.mutateAsync(unlistDialogItem.id);
      toast({ title: "Retiré de la vente" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
    setUnlistDialogItem(null);
  };

  const handleDeleteTx = async () => {
    if (!deleteTxDialog) return;
    try {
      await deleteTxMutation.mutateAsync(deleteTxDialog.id);
      toast({ title: "Transaction supprimée" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
    setDeleteTxDialog(null);
  };

  const handleExport = async (fmt: "csv" | "json") => {
    if (plan === "free") {
      toast({ title: "Export indisponible", description: "Disponible à partir du plan Standard.", variant: "destructive" });
      return;
    }
    if (fmt === "json" && plan !== "pro") {
      toast({ title: "Export JSON indisponible", description: "Disponible avec le plan Pro.", variant: "destructive" });
      return;
    }
    try {
      const resp = await fetch(`https://api.monark-market.fr/v1/inventory/export/${fmt}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("monark_access_token")}` },
      });
      if (!resp.ok) throw new Error("Erreur export");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventaire.${fmt}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: `Export ${fmt.toUpperCase()} téléchargé` });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const openEdit = (item: InventoryItem) => { setEditItem(item); setAddEditOpen(true); };
  const openAdd = () => { setEditItem(null); setAddEditOpen(true); };
  const openAddTx = () => { setEditTx(null); setTxModalOpen(true); };
  const openEditTx = (tx: Transaction) => { setEditTx(tx); setTxModalOpen(true); };

  // Profit display logic
  const profitDisplay = stats?.real_profit_net ?? stats?.total_profit_net;
  const hasCustomTx = (stats?.custom_expenses ?? 0) > 0 || (stats?.custom_income ?? 0) > 0;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mon Stock</h1>
          <p className="text-muted-foreground text-sm">Gérez votre inventaire de composants PC</p>
        </div>
      </div>

      {/* ============= KPI Cards ============= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard icon={Package} label="En stock" value={stats?.in_stock_count} suffix="items" sub={stats ? `${(stats.in_stock_value ?? 0).toFixed(0)} €` : undefined} loading={statsLoading} />
        <KpiCard icon={Tag} label="En vente" value={stats?.listed_count} suffix="items" sub={stats ? `${(stats.listed_value ?? 0).toFixed(0)} €` : undefined} loading={statsLoading} />
        <KpiCard icon={ShoppingCart} label={`Vendus (${statsDays}j)`} value={stats?.sold_count} suffix="items" loading={statsLoading} />
        <KpiCard
          icon={TrendingUp}
          label="Profit net"
          value={profitDisplay != null ? `${profitDisplay.toFixed(0)} €` : undefined}
          color={(profitDisplay ?? 0) >= 0 ? "green" : "red"}
          loading={statsLoading}
          sub={hasCustomTx ? `Composants: ${(stats?.total_profit_net ?? 0).toFixed(0)}€ | Autres: +${(stats?.custom_income ?? 0).toFixed(0)}€ / -${(stats?.custom_expenses ?? 0).toFixed(0)}€` : undefined}
        />
        <KpiCard icon={TrendingDown} label="Marge moy." value={stats?.avg_margin_pct != null ? `${stats.avg_margin_pct.toFixed(1)}%` : undefined} color={(stats?.avg_margin_pct ?? 0) >= 0 ? "green" : "red"} loading={statsLoading} />
        <KpiCard icon={Clock} label="Délai moy." value={stats?.avg_hold_days != null ? `${stats.avg_hold_days.toFixed(0)}j` : undefined} loading={statsLoading} />
      </div>

      {/* Period + deals */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(statsDays)} onValueChange={(v) => setStatsDays(Number(v))}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 jours</SelectItem>
            <SelectItem value="90">90 jours</SelectItem>
            <SelectItem value="365">1 an</SelectItem>
            <SelectItem value="0">Tout</SelectItem>
          </SelectContent>
        </Select>
        {stats?.best_deal && (
          <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400 text-xs">
            🏆 Meilleur : {stats.best_deal.model_name} +{(stats.best_deal.profit_net ?? 0).toFixed(0)} € ({stats.best_deal.platform})
          </Badge>
        )}
        {stats?.worst_deal && (
          <Badge variant="outline" className="border-red-500 text-red-500 text-xs">
            📉 Pire : {stats.worst_deal.model_name} {(stats.worst_deal.profit_net ?? 0).toFixed(0)} € ({stats.worst_deal.platform})
          </Badge>
        )}
      </div>

      {/* ============= Tabs: Composants / Dépenses & Gains ============= */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="components">Composants</TabsTrigger>
            <TabsTrigger value="transactions">Dépenses & Gains</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            {activeTab === "components" && (
              <>
                {plan !== "free" && (
                  plan === "pro" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Exporter</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExport("csv")}>CSV</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport("json")}>JSON</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleExport("csv")}><Download className="h-4 w-4 mr-1" />CSV</Button>
                  )
                )}
                {plan === "free" && (
                  <Button variant="outline" size="sm" disabled className="opacity-50" title="Disponible à partir du plan Standard"><Download className="h-4 w-4 mr-1" />Export</Button>
                )}
                <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
              </>
            )}
            {activeTab === "transactions" && (
              <Button size="sm" variant="outline" onClick={openAddTx}><Receipt className="h-4 w-4 mr-1" />Dépense / Gain</Button>
            )}
          </div>
        </div>

        {/* ============= Components Tab ============= */}
        <TabsContent value="components">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchInput} onChange={(e) => handleSearchChange(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setPage(0); }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="in_stock">En stock</SelectItem>
                <SelectItem value="listed">En vente</SelectItem>
                <SelectItem value="sold">Vendus</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v as any); setPage(0); }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="gpu">Carte Graphique</SelectItem>
                <SelectItem value="cpu">Processeur</SelectItem>
                <SelectItem value="motherboard">Carte Mère</SelectItem>
                <SelectItem value="ram">Mémoire RAM</SelectItem>
                <SelectItem value="ssd">SSD</SelectItem>
                <SelectItem value="psu">Alimentation</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => { setSort(v as InventorySort); setPage(0); }}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border bg-card">
            {listLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucun composant dans votre stock</p>
                <p className="text-sm mt-1">Commencez par ajouter un composant avec le bouton ci-dessus.</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Composant</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Achat</TableHead>
                        <TableHead>Plateforme</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Prix vente</TableHead>
                        <TableHead className="text-right">Frais</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                        <TableHead className="text-right">Jours</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{item.model_name || item.custom_name || "—"}</TableCell>
                          <TableCell><Badge variant="secondary" className={CATEGORY_COLORS[item.category] || ""}>{CATEGORY_LABELS[item.category] || item.category}</Badge></TableCell>
                          <TableCell className="text-right">{item.buy_price.toFixed(2)} €</TableCell>
                          <TableCell className="text-xs">{item.buy_platform || "—"}</TableCell>
                          <TableCell className="text-xs">{format(new Date(item.buy_date), "dd/MM/yyyy")}</TableCell>
                          <TableCell><Badge variant="secondary" className={STATUS_COLORS[item.status]}>{STATUS_LABELS[item.status]}</Badge></TableCell>
                          <TableCell className="text-right">
                            {item.status === "sold" && item.sell_price != null ? `${item.sell_price.toFixed(2)} €` :
                             item.status === "listed" && item.listed_price != null ? `${item.listed_price.toFixed(2)} €` : "—"}
                          </TableCell>
                          <TableCell className="text-right">{(item.fees_eur ?? 0) > 0 ? `${item.fees_eur.toFixed(2)} €` : "—"}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.status === "sold" && item.profit_net_eur != null ? (
                              <span className={item.profit_net_eur >= 0 ? "text-green-600" : "text-red-500"}>
                                {item.profit_net_eur >= 0 ? "+" : ""}{item.profit_net_eur.toFixed(2)} €
                              </span>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-right">{item.status === "sold" && item.hold_days != null ? `${item.hold_days}j` : "—"}</TableCell>
                          <TableCell>
                            {item.status !== "sold" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {item.status === "in_stock" && (
                                    <>
                                      <DropdownMenuItem onClick={() => { setListModalItem(item); setListModalOpen(true); }}><Tag className="h-4 w-4 mr-2" />Mettre en vente</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => { setSellModalItem(item); setSellModalOpen(true); }}><CheckCircle className="h-4 w-4 mr-2" />Marquer vendu</DropdownMenuItem>
                                    </>
                                  )}
                                  {item.status === "listed" && (
                                    <>
                                      <DropdownMenuItem onClick={() => { setSellModalItem(item); setSellModalOpen(true); }}><DollarSign className="h-4 w-4 mr-2" />Marquer vendu</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setUnlistDialogItem(item)}><ArrowDownToLine className="h-4 w-4 mr-2" />Retirer de la vente</DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem onClick={() => openEdit(item)}><Pencil className="h-4 w-4 mr-2" />Modifier</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialogItem(item)}><Trash2 className="h-4 w-4 mr-2" />Supprimer</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{item.model_name || item.custom_name || "—"}</p>
                          <div className="flex gap-1.5 mt-1">
                            <Badge variant="secondary" className={`text-[10px] ${CATEGORY_COLORS[item.category]}`}>{CATEGORY_LABELS[item.category]}</Badge>
                            <Badge variant="secondary" className={`text-[10px] ${STATUS_COLORS[item.status]}`}>{STATUS_LABELS[item.status]}</Badge>
                          </div>
                        </div>
                        {item.status !== "sold" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {item.status === "in_stock" && (
                                <>
                                  <DropdownMenuItem onClick={() => { setListModalItem(item); setListModalOpen(true); }}>Mettre en vente</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setSellModalItem(item); setSellModalOpen(true); }}>Marquer vendu</DropdownMenuItem>
                                </>
                              )}
                              {item.status === "listed" && (
                                <>
                                  <DropdownMenuItem onClick={() => { setSellModalItem(item); setSellModalOpen(true); }}>Marquer vendu</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setUnlistDialogItem(item)}>Retirer de la vente</DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => openEdit(item)}>Modifier</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDialogItem(item)}>Supprimer</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <span className="text-muted-foreground">Achat</span>
                        <span className="text-right">{item.buy_price.toFixed(2)} €</span>
                        {item.status === "sold" && item.sell_price != null && (
                          <>
                            <span className="text-muted-foreground">Vente</span>
                            <span className="text-right">{item.sell_price.toFixed(2)} €</span>
                          </>
                        )}
                        {item.status === "listed" && item.listed_price != null && (
                          <>
                            <span className="text-muted-foreground">Prix affiché</span>
                            <span className="text-right">{item.listed_price.toFixed(2)} €</span>
                          </>
                        )}
                        {item.status === "sold" && item.profit_net_eur != null && (
                          <>
                            <span className="text-muted-foreground">Profit</span>
                            <span className={`text-right font-medium ${item.profit_net_eur >= 0 ? "text-green-600" : "text-red-500"}`}>
                              {item.profit_net_eur >= 0 ? "+" : ""}{item.profit_net_eur.toFixed(2)} €
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <span className="text-sm text-muted-foreground">{from}–{to} sur {total}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Précédent</Button>
                      <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Suivant</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        {/* ============= Transactions Tab ============= */}
        <TabsContent value="transactions">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Select value={txTypeFilter} onValueChange={(v) => { setTxTypeFilter(v as any); setTxPage(0); }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="expense">Dépenses</SelectItem>
                <SelectItem value="income">Gains</SelectItem>
              </SelectContent>
            </Select>
            <Select value={txCategoryFilter} onValueChange={(v) => { setTxCategoryFilter(v as any); setTxPage(0); }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="shipping">Port / Livraison</SelectItem>
                <SelectItem value="supplies">Fournitures</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="platform_fee">Frais plateforme</SelectItem>
                <SelectItem value="subscription">Abonnement</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border bg-card">
            {txLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : txItems.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucune transaction</p>
                <p className="text-sm mt-1">Ajoutez vos dépenses et gains annexes (port, fournitures, etc.).</p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Plateforme</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {txItems.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <Badge variant="secondary" className={tx.type === "expense" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"}>
                              {tx.type === "expense" ? "Dépense" : "Gain"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium max-w-[250px] truncate">{tx.description}</TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={tx.type === "expense" ? "text-red-500" : "text-green-600"}>
                              {tx.type === "expense" ? "-" : "+"}{tx.amount.toFixed(2)} €
                            </span>
                          </TableCell>
                          <TableCell>
                            {tx.category ? (
                              <Badge variant="outline" className="text-xs">{TRANSACTION_CATEGORY_LABELS[tx.category] || tx.category}</Badge>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="text-xs">{tx.platform || "—"}</TableCell>
                          <TableCell className="text-xs">{format(new Date(tx.transaction_date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditTx(tx)}><Pencil className="h-4 w-4 mr-2" />Modifier</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTxDialog(tx)}><Trash2 className="h-4 w-4 mr-2" />Supprimer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y">
                  {txItems.map((tx) => (
                    <div key={tx.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <div className="flex gap-1.5 mt-1">
                            <Badge variant="secondary" className={`text-[10px] ${tx.type === "expense" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"}`}>
                              {tx.type === "expense" ? "Dépense" : "Gain"}
                            </Badge>
                            {tx.category && (
                              <Badge variant="outline" className="text-[10px]">{TRANSACTION_CATEGORY_LABELS[tx.category] || tx.category}</Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditTx(tx)}>Modifier</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTxDialog(tx)}>Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{format(new Date(tx.transaction_date), "dd/MM/yyyy")}</span>
                        <span className={`font-medium ${tx.type === "expense" ? "text-red-500" : "text-green-600"}`}>
                          {tx.type === "expense" ? "-" : "+"}{tx.amount.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {txTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <span className="text-sm text-muted-foreground">{txFrom}–{txTo} sur {txTotal}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={txPage === 0} onClick={() => setTxPage(txPage - 1)}>Précédent</Button>
                      <Button variant="outline" size="sm" disabled={txPage >= txTotalPages - 1} onClick={() => setTxPage(txPage + 1)}>Suivant</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddEditItemModal open={addEditOpen} onOpenChange={(o) => { setAddEditOpen(o); if (!o) setEditItem(null); }} editItem={editItem} />
      <ListItemModal open={listModalOpen} onOpenChange={setListModalOpen} item={listModalItem} />
      <SellItemModal open={sellModalOpen} onOpenChange={setSellModalOpen} item={sellModalItem} />
      <AddTransactionModal open={txModalOpen} onOpenChange={(o) => { setTxModalOpen(o); if (!o) setEditTx(null); }} editTransaction={editTx} />

      {/* Delete item confirmation */}
      <AlertDialog open={!!deleteDialogItem} onOpenChange={(o) => !o && setDeleteDialogItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {deleteDialogItem?.model_name || deleteDialogItem?.custom_name} ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlist confirmation */}
      <AlertDialog open={!!unlistDialogItem} onOpenChange={(o) => !o && setUnlistDialogItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer de la vente ?</AlertDialogTitle>
            <AlertDialogDescription>{unlistDialogItem?.model_name || unlistDialogItem?.custom_name} repassera en stock.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlist}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete transaction confirmation */}
      <AlertDialog open={!!deleteTxDialog} onOpenChange={(o) => !o && setDeleteTxDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette transaction ?</AlertDialogTitle>
            <AlertDialogDescription>"{deleteTxDialog?.description}" — {(deleteTxDialog?.amount ?? 0).toFixed(2)} €. Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTx} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============= KPI Card sub-component =============
function KpiCard({ icon: Icon, label, value, suffix, sub, color, loading }: {
  icon: any; label: string; value?: number | string | null; suffix?: string; sub?: string; color?: "green" | "red"; loading?: boolean;
}) {
  if (loading) return (
    <Card><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-16" /></CardContent></Card>
  );

  const displayValue = value != null ? (typeof value === "number" ? value : value) : "—";
  const colorClass = color === "green" ? "text-green-600 dark:text-green-400" : color === "red" ? "text-red-500" : "";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className={`text-lg font-bold ${colorClass}`}>
          {displayValue}{suffix ? <span className="text-xs font-normal text-muted-foreground ml-1">{suffix}</span> : null}
        </p>
        {sub && <p className="text-[10px] text-muted-foreground leading-tight mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
