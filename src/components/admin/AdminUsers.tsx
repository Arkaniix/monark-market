import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Search, UserCog } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface User {
  user_id: string;
  display_name: string;
  created_at: string;
  role?: string;
  credits?: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (profilesError) throw profilesError;

      // Load roles for each user
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .single();

          return {
            ...profile,
            role: roleData?.role || 'user'
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      // First, delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id);

      // Then insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: selectedUser.user_id,
          role: newRole as 'admin' | 'user'
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Rôle mis à jour avec succès"
      });

      loadUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gestion des utilisateurs</h2>
        <p className="text-muted-foreground">Vue et gestion de tous les comptes utilisateurs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">
                    {user.display_name || 'Sans nom'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.credits || 0}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role || 'user');
                          }}
                        >
                          <UserCog className="h-3 w-3 mr-1" />
                          Gérer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Gérer l'utilisateur</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Nom d'affichage</Label>
                            <Input value={selectedUser?.display_name || ''} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label>ID Utilisateur</Label>
                            <Input value={selectedUser?.user_id || ''} disabled className="font-mono text-xs" />
                          </div>
                          <div className="space-y-2">
                            <Label>Rôle</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Utilisateur</SelectItem>
                                <SelectItem value="admin">Administrateur</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={updateUserRole} className="w-full">
                            Mettre à jour le rôle
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
