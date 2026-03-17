import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User, History, Signal, Coins, Shield, CalendarDays, Activity, Loader2, Ban, CheckCircle } from "lucide-react";
import { adminApiGet, adminApiFetch } from "@/lib/api/adminApi";
import { ADMIN } from "@/lib/api/endpoints";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserDetailModalProps {
  userId: string | null;
  onClose: () => void;
  onRefreshList: () => void;
  onOpenCreditAdjust: (user: { id: string; name: string; balance: number }) => void;
}

interface UserDetailData {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  current_plan: string;
  credits_balance: number;
  credits_received_total: number;
  credits_spent_total: number;
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  total_signals: number;
  signals_7d: number;
  signals_30d: number;
  deep_analyses_total: number;
  first_signal_at: string | null;
  last_signal_at: string | null;
  credit_history: CreditHistoryEntry[];
  recent_signals: RecentSignal[];
}

interface CreditHistoryEntry {
  date: string;
  delta: number;
  reason: string;
  details: string | null;
}

interface RecentSignal {
  date: string;
  model_name: string;
  price: number | null;
  platform: string;
  region: string | null;
  variant: string | null;
}

const REASON_LABELS: Record<string, string> = {
  deep_analysis: "Analyse profonde",
  monthly_renewal: "Renouvellement",
  admin_adjustment: "Ajustement admin",
  bonus: "Bonus",
  extension_passive: "Extension passive",
  compensation: "Compensation",
  correction: "Correction",
  signup_bonus: "Bonus inscription",
};

const PLAN_COLORS: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
  pro: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  standard: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  free: "bg-muted text-muted-foreground border-border",
};

const PLATFORM_COLORS: Record<string, string> = {
  leboncoin: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ebay: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  vinted: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  rakuten: "bg-red-500/20 text-red-400 border-red-500/30",
  backmarket: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function UserDetailModal({ userId, onClose, onRefreshList, onOpenCreditAdjust }: UserDetailModalProps) {
  const [detail, setDetail] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  useEffect(() => {
    if (userId) fetchDetail();
    else setDetail(null);
  }, [userId]);

  const fetchDetail = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await adminApiGet<UserDetailData>(ADMIN.USER_DETAIL_FULL(userId));
      setDetail(data);
    } catch {
      toast.error("Erreur lors du chargement de la fiche utilisateur");
      onClose();
    }
    setLoading(false);
  };

  const handleUpdateUser = async (changes: Record<string, unknown>) => {
    if (!userId) return;
    const fieldName = Object.keys(changes)[0];
    setUpdatingField(fieldName);
    try {
      await adminApiFetch(ADMIN.USER_UPDATE(userId), {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      toast.success("Utilisateur mis à jour");
      fetchDetail();
      onRefreshList();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la mise à jour");
    }
    setUpdatingField(null);
  };

  const roleBadgeClass = (role: string) => ROLE_COLORS[role] || ROLE_COLORS.basic;
  const platformBadgeClass = (p: string) => PLATFORM_COLORS[p.toLowerCase()] || "bg-muted text-muted-foreground border-border";

  return (
    <>
      <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {loading ? "Chargement..." : detail ? `${detail.display_name || detail.email}` : "Fiche utilisateur"}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : detail ? (
            <Tabs defaultValue="profile" className="mt-2">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="profile" className="gap-1.5"><User className="h-4 w-4" />Profil</TabsTrigger>
                <TabsTrigger value="credits" className="gap-1.5"><History className="h-4 w-4" />Historique crédits</TabsTrigger>
                <TabsTrigger value="signals" className="gap-1.5"><Signal className="h-4 w-4" />Signaux récents</TabsTrigger>
              </TabsList>

              {/* === PROFILE TAB === */}
              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Identity */}
                  <Card>
                    <CardContent className="pt-4 space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Identité</h4>
                      <div className="space-y-2">
                        <div><span className="text-xs text-muted-foreground">Nom</span><p className="font-medium text-sm">{detail.display_name || "Sans nom"}</p></div>
                        <div><span className="text-xs text-muted-foreground">Email</span><p className="font-medium text-sm">{detail.email}</p></div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Rôle</span>
                          <Select
                            value={detail.role}
                            onValueChange={(val) => handleUpdateUser({ role: val })}
                            disabled={!!updatingField}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="elite">Elite</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Plan</span>
                          <Select
                            value={detail.current_plan}
                            onValueChange={(val) => handleUpdateUser({ current_plan: val })}
                            disabled={!!updatingField}
                          >
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="standard">Standard (11.99€)</SelectItem>
                              <SelectItem value="pro">Pro (22.99€)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Inscription</span>
                          <p className="text-sm">{format(new Date(detail.created_at), "dd MMM yyyy", { locale: fr })}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Credits */}
                  <Card>
                    <CardContent className="pt-4 space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><Coins className="h-3.5 w-3.5" />Crédits</h4>
                      <p className="text-3xl font-bold">
                        {detail.role === "admin" ? <span className="text-emerald-500">∞</span> : detail.credits_balance}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-xs text-muted-foreground">Reçus total</span><p className="text-emerald-400 font-medium">+{detail.credits_received_total ?? 0}</p></div>
                        <div><span className="text-xs text-muted-foreground">Dépensés total</span><p className="text-destructive font-medium">-{detail.credits_spent_total ?? 0}</p></div>
                      </div>
                      {detail.role !== "admin" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => onOpenCreditAdjust({ id: detail.id, name: detail.display_name || detail.email, balance: detail.credits_balance })}
                        >
                          <Coins className="h-3.5 w-3.5 mr-1.5" />Ajuster crédits
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Activity */}
                  <Card>
                    <CardContent className="pt-4 space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" />Activité</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-xs text-muted-foreground">Total signaux</span><p className="font-medium">{detail.total_signals ?? 0}</p></div>
                        <div><span className="text-xs text-muted-foreground">Signaux 7j</span><p className="font-medium">{detail.signals_7d ?? 0}</p></div>
                        <div><span className="text-xs text-muted-foreground">Signaux 30j</span><p className="font-medium">{detail.signals_30d ?? 0}</p></div>
                        <div><span className="text-xs text-muted-foreground">Analyses profondes</span><p className="font-medium">{detail.deep_analyses_total ?? 0}</p></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status */}
                  <Card>
                    <CardContent className="pt-4 space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Statut</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Statut</span>
                          <Badge className={detail.is_active !== false ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                            {detail.is_active !== false ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        <div><span className="text-xs text-muted-foreground">Dernière connexion</span><p>{detail.last_sign_in_at ? format(new Date(detail.last_sign_in_at), "dd MMM yyyy HH:mm", { locale: fr }) : "Jamais"}</p></div>
                        <div><span className="text-xs text-muted-foreground">Premier signal</span><p>{detail.first_signal_at ? format(new Date(detail.first_signal_at), "dd MMM yyyy", { locale: fr }) : "—"}</p></div>
                        <div><span className="text-xs text-muted-foreground">Dernier signal</span><p>{detail.last_signal_at ? format(new Date(detail.last_signal_at), "dd MMM yyyy", { locale: fr }) : "—"}</p></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Deactivate button */}
                <div className="pt-2 border-t">
                  <Button
                    variant={detail.is_active !== false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setShowDeactivateConfirm(true)}
                  >
                    {detail.is_active !== false ? <><Ban className="h-4 w-4 mr-1.5" />Désactiver le compte</> : <><CheckCircle className="h-4 w-4 mr-1.5" />Réactiver le compte</>}
                  </Button>
                </div>
              </TabsContent>

              {/* === CREDIT HISTORY TAB === */}
              <TabsContent value="credits" className="mt-4">
                {(!detail.credit_history || detail.credit_history.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">Aucun historique de crédits</p>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Raison</TableHead>
                          <TableHead>Détails</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.credit_history.map((entry, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">{format(new Date(entry.date), "dd MMM yyyy HH:mm", { locale: fr })}</TableCell>
                            <TableCell className={`font-medium ${entry.delta > 0 ? "text-emerald-400" : "text-destructive"}`}>
                              {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                            </TableCell>
                            <TableCell className="text-sm">{REASON_LABELS[entry.reason] || entry.reason}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{entry.details || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* === SIGNALS TAB === */}
              <TabsContent value="signals" className="mt-4">
                {(!detail.recent_signals || detail.recent_signals.length === 0) ? (
                  <p className="text-center text-muted-foreground py-8">Aucun signal récent</p>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Modèle</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Plateforme</TableHead>
                          <TableHead>Région</TableHead>
                          <TableHead>Variante</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.recent_signals.map((sig, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">{format(new Date(sig.date), "dd MMM yyyy HH:mm", { locale: fr })}</TableCell>
                            <TableCell className="font-medium text-sm">{sig.model_name || "—"}</TableCell>
                            <TableCell className="text-sm">{sig.price != null ? `${sig.price} €` : "—"}</TableCell>
                            <TableCell>
                              <Badge className={platformBadgeClass(sig.platform)}>{sig.platform}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{sig.region || "—"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{sig.variant || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation */}
      <AlertDialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {detail?.is_active !== false ? "Désactiver ce compte ?" : "Réactiver ce compte ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {detail?.is_active !== false
                ? `Êtes-vous sûr de vouloir désactiver le compte de ${detail?.email} ? L'utilisateur ne pourra plus se connecter.`
                : `Êtes-vous sûr de vouloir réactiver le compte de ${detail?.email} ?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className={detail?.is_active !== false ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={() => {
                handleUpdateUser({ is_active: detail?.is_active === false });
                setShowDeactivateConfirm(false);
              }}
            >
              {detail?.is_active !== false ? "Désactiver" : "Réactiver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
