import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Search, ChevronLeft, ChevronRight, Loader2, Users, Eye, Coins, CreditCard, Briefcase, Package } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdmin";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserDetail {
  id: string;
  display_name: string;
  email: string;
  role: string;
  plan_name: string;
  credits_remaining: number;
  created_at: string;
  last_sign_in_at: string | null;
}

// Mock data for user details (in real app, would fetch from API)
const mockCreditHistory = [
  { id: 1, delta: -5, reason: 'scrap_faible', created_at: '2024-01-15T14:30:00' },
  { id: 2, delta: 50, reason: 'monthly_refill', created_at: '2024-01-01T00:00:00' },
  { id: 3, delta: -10, reason: 'scrap_fort', created_at: '2023-12-28T11:20:00' },
  { id: 4, delta: 5, reason: 'contribution_bonus', created_at: '2023-12-25T16:45:00' },
];

const mockSubscriptions = [
  { id: 1, plan: 'Pro', status: 'active', started_at: '2024-01-01', expires_at: '2024-02-01' },
  { id: 2, plan: 'Basic', status: 'expired', started_at: '2023-10-01', expires_at: '2024-01-01' },
];

const mockRecentJobs = [
  { id: 1, keyword: 'RTX 4090', status: 'completed', ads_found: 48, created_at: '2024-01-14T10:30:00' },
  { id: 2, keyword: 'RX 7900 XTX', status: 'completed', ads_found: 32, created_at: '2024-01-12T15:20:00' },
  { id: 3, keyword: 'RTX 4080', status: 'failed', ads_found: 0, created_at: '2024-01-10T09:15:00' },
];

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const limit = 20;

  const { data, isLoading, isError } = useAdminUsers(page, limit, searchQuery || undefined);

  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Erreur lors du chargement des utilisateurs</p>
        </CardContent>
      </Card>
    );
  }

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  // Mock values for user detail
  const totalAdsGenerated = 156;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gestion des utilisateurs</h2>
        <p className="text-muted-foreground">Vue de tous les comptes utilisateurs (lecture seule)</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Utilisateurs ({total})
            </CardTitle>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
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
                <TableHead>Rôle</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {user.display_name || 'Sans nom'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.plan_name || 'Free'}</Badge>
                    </TableCell>
                    <TableCell>{user.credits_remaining}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(user.created_at), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.last_sign_in_at
                        ? format(new Date(user.last_sign_in_at), "dd MMM yyyy HH:mm", { locale: fr })
                        : 'Jamais'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedUser(user as UserDetail)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} sur {totalPages} ({total} utilisateurs)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Fiche utilisateur
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{selectedUser.display_name || 'Sans nom'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rôle</p>
                  <Badge variant={selectedUser.role === 'admin' ? 'default' : 'outline'}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan actuel</p>
                  <Badge variant="secondary">{selectedUser.plan_name || 'Free'}</Badge>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Crédits</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{selectedUser.credits_remaining}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Jobs</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{mockRecentJobs.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Annonces</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{totalAdsGenerated}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Credit History */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Historique crédits
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Delta</TableHead>
                      <TableHead>Raison</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCreditHistory.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell className={log.delta > 0 ? 'text-green-600' : 'text-red-600'}>
                          {log.delta > 0 ? '+' : ''}{log.delta}
                        </TableCell>
                        <TableCell className="text-sm">{log.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Subscription History */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Historique abonnements
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Début</TableHead>
                      <TableHead>Fin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.plan}</TableCell>
                        <TableCell>
                          <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{sub.started_at}</TableCell>
                        <TableCell className="text-sm">{sub.expires_at}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Recent Jobs */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Jobs récents
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mot-clé</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Annonces</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRecentJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.keyword}</TableCell>
                        <TableCell>
                          <Badge variant={job.status === 'completed' ? 'default' : 'destructive'}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{job.ads_found}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(job.created_at), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
