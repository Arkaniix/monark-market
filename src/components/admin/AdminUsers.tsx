import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Shield, Search, ChevronLeft, ChevronRight, Loader2, Users, Eye, Coins, Plus } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { adminApiFetch } from "@/lib/api/adminApi";
import { ADMIN } from "@/lib/api/endpoints";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { UserDetailModal } from "./users/UserDetailModal";
import { AddUserDialog } from "./users/AddUserDialog";

const PLAN_COLORS: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
  pro: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  standard: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  free: "bg-muted text-muted-foreground border-border",
};

function CreditAdjustDialog({
  userId, userName, currentBalance, onSuccess, open, onOpenChange,
}: {
  userId: string; userName: string; currentBalance: number; onSuccess: () => void;
  open?: boolean; onOpenChange?: (open: boolean) => void;
}) {
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("admin_adjustment");
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  async function handleSubmit() {
    if (delta === 0) return;
    setLoading(true);
    try {
      await adminApiFetch(ADMIN.USER_CREDITS(userId), {
        method: "POST",
        body: JSON.stringify({ delta, reason }),
      });
      toast.success(`Crédits ajustés : ${delta > 0 ? "+" : ""}${delta} pour ${userName}`);
      setIsOpen(false);
      setDelta(0);
      onSuccess();
    } catch {
      toast.error("Erreur lors de l'ajustement des crédits");
    }
    setLoading(false);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Only show inline trigger when not externally controlled */}
      {open === undefined && (
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
          <Coins className="h-4 w-4 mr-1" />Ajuster
        </Button>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ajuster les crédits de {userName}</AlertDialogTitle>
          <AlertDialogDescription>Solde actuel : {currentBalance} crédits</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Montant (positif = ajouter, négatif = retirer)</Label>
            <Input type="number" value={delta} onChange={(e) => setDelta(parseInt(e.target.value) || 0)} placeholder="Ex: 100 ou -50" />
            {delta !== 0 && (
              <p className="text-sm text-muted-foreground mt-1">Nouveau solde : {Math.max(0, currentBalance + delta)} crédits</p>
            )}
          </div>
          <div>
            <Label>Raison</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin_adjustment">Ajustement admin</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
                <SelectItem value="compensation">Compensation</SelectItem>
                <SelectItem value="correction">Correction d'erreur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={delta === 0 || loading}>
            {loading ? "En cours..." : delta > 0 ? `Ajouter ${delta} crédits` : `Retirer ${Math.abs(delta)} crédits`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [creditAdjustTarget, setCreditAdjustTarget] = useState<{ id: string; name: string; balance: number } | null>(null);
  const limit = 20;
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useAdminUsers(page, limit, searchQuery || undefined);

  const handleSearch = () => { setSearchQuery(searchTerm); setPage(1); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSearch(); };
  const refetchUsers = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const planBadgeClass = (plan: string) => PLAN_COLORS[plan?.toLowerCase()] || PLAN_COLORS.free;

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (isError) return <Card><CardContent className="py-12 text-center"><p className="text-destructive">Erreur lors du chargement des utilisateurs</p></CardContent></Card>;

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground">Vue de tous les comptes utilisateurs</p>
        </div>
        <Button onClick={() => setShowAddUser(true)}>
          <Plus className="h-4 w-4 mr-2" />Ajouter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Utilisateurs ({total})</CardTitle>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par nom ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown} className="pl-10" />
            </div>
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun utilisateur trouvé</TableCell></TableRow>
              ) : users.map((user) => {
                const isInactive = (user as any).is_active === false;
                return (
                  <TableRow key={user.id} className={`cursor-pointer hover:bg-muted/50 ${isInactive ? "opacity-50" : ""}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.display_name || "Sans nom"}
                        {isInactive && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1.5 py-0">Inactif</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={planBadgeClass(user.plan_name || "free")}>
                        <Shield className="h-3 w-3 mr-1" />{user.plan_name || "Free"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(user.plan_name || "").toLowerCase() === "admin" ? (
                        <span className="text-emerald-500 font-medium">∞</span>
                      ) : (
                        <span>{user.credits_balance ?? user.credits_remaining}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{format(new Date(user.created_at), "dd MMM yyyy", { locale: fr })}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "dd MMM yyyy HH:mm", { locale: fr }) : "Jamais"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setDetailUserId(user.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.role !== "admin" && (
                          <CreditAdjustDialog
                            userId={user.id}
                            userName={user.display_name || user.email}
                            currentBalance={user.credits_balance ?? user.credits_remaining}
                            onSuccess={refetchUsers}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Page {page}/{totalPages} ({total})</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" />Précédent</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant<ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
        onRefreshList={refetchUsers}
        onOpenCreditAdjust={(user) => {
          setCreditAdjustTarget(user);
        }}
      />

      {/* Credit Adjust from detail modal */}
      {creditAdjustTarget && (
        <CreditAdjustDialog
          userId={creditAdjustTarget.id}
          userName={creditAdjustTarget.name}
          currentBalance={creditAdjustTarget.balance}
          onSuccess={() => { refetchUsers(); setCreditAdjustTarget(null); }}
          open={!!creditAdjustTarget}
          onOpenChange={(open) => { if (!open) setCreditAdjustTarget(null); }}
        />
      )}

      {/* Add User Dialog */}
      <AddUserDialog open={showAddUser} onOpenChange={setShowAddUser} onUserCreated={refetchUsers} />
    </div>
  );
}
