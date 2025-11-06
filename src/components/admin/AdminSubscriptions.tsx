import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Search, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      // Données factices pour démonstration
      const mockData = [
        {
          id: '1',
          user_id: 'b9d133e5-3bab-4140-ad4d-98115e932ab0',
          plan_id: '1',
          status: 'active',
          credits_remaining: 120,
          started_at: '2024-01-01T00:00:00',
          expires_at: '2024-02-01T00:00:00',
          profiles: { display_name: 'Etienne' },
          subscription_plans: { name: 'Pro', price: 19.99 }
        },
        {
          id: '2',
          user_id: 'da1fbc02-5140-4321-b36d-38d3c5ac8a4c',
          plan_id: '2',
          status: 'active',
          credits_remaining: 380,
          started_at: '2024-01-10T00:00:00',
          expires_at: '2024-02-10T00:00:00',
          profiles: { display_name: 'Emre' },
          subscription_plans: { name: 'Elite', price: 39.99 }
        },
        {
          id: '3',
          user_id: 'user-3',
          plan_id: '3',
          status: 'expired',
          credits_remaining: 0,
          started_at: '2023-12-01T00:00:00',
          expires_at: '2024-01-01T00:00:00',
          profiles: { display_name: 'Jean Dupont' },
          subscription_plans: { name: 'Basic', price: 9.99 }
        },
        {
          id: '4',
          user_id: 'user-4',
          plan_id: '1',
          status: 'canceled',
          credits_remaining: 45,
          started_at: '2024-01-05T00:00:00',
          expires_at: '2024-02-05T00:00:00',
          profiles: { display_name: 'Marie Martin' },
          subscription_plans: { name: 'Pro', price: 19.99 }
        }
      ];
      
      setSubscriptions(mockData);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les abonnements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'secondary';
      case 'canceled': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Abonnements & Paiements</h2>
        <p className="text-muted-foreground">Gestion des plans et transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des abonnements ({filteredSubscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="canceled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    {sub.profiles?.display_name || 'Utilisateur'}
                  </TableCell>
                  <TableCell>{sub.subscription_plans?.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(sub.status)}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{sub.credits_remaining}</TableCell>
                  <TableCell>
                    {new Date(sub.started_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('fr-FR') : 'N/A'}
                  </TableCell>
                  <TableCell>{sub.subscription_plans?.price}€</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Détails</Button>
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
