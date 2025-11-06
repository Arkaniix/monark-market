import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  credits_remaining: number;
  started_at: string;
  expires_at: string | null;
  billing_cycle: string;
  checkout_ref: string | null;
  created_at: string;
  updated_at: string;
  credits_reset_date: string | null;
  profiles?: {
    display_name: string;
  } | null;
  subscription_plans?: {
    name: string;
    price: number;
  } | null;
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) throw error;
      
      // Enrichir avec les profils et plans
      const enrichedData = await Promise.all((data || []).map(async (sub: any) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', sub.user_id)
          .single();
        
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('name, price')
          .eq('id', sub.plan_id)
          .single();
        
        return {
          ...sub,
          profiles: profile,
          subscription_plans: plan
        };
      }));
      
      setSubscriptions(enrichedData);
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

  const exportToCSV = () => {
    const csv = [
      ['Référence', 'Utilisateur', 'Plan', 'Statut', 'Montant', 'Date début', 'Date fin', 'Crédits'].join(','),
      ...filteredSubscriptions.map(sub => [
        sub.checkout_ref || 'N/A',
        sub.profiles?.display_name || 'Inconnu',
        sub.subscription_plans?.name || 'N/A',
        sub.status,
        sub.subscription_plans?.price || 0,
        new Date(sub.started_at).toLocaleDateString('fr-FR'),
        sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('fr-FR') : 'N/A',
        sub.credits_remaining
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abonnements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = (sub.profiles?.display_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    
    let matchesMonth = true;
    if (monthFilter !== "all") {
      const subMonth = new Date(sub.started_at).getMonth();
      matchesMonth = subMonth === parseInt(monthFilter);
    }
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const totalRevenue = filteredSubscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + (sub.subscription_plans?.price || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'secondary';
      case 'cancelled': return 'destructive';
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Abonnements actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSubscriptions.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total abonnements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSubscriptions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche et filtres</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les mois</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {new Date(2024, i).toLocaleDateString('fr-FR', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Date début</TableHead>
                <TableHead>Date fin</TableHead>
                <TableHead>Cycle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-mono text-xs">
                    {subscription.checkout_ref || 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {subscription.profiles?.display_name || 'Inconnu'}
                  </TableCell>
                  <TableCell>{subscription.subscription_plans?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {subscription.subscription_plans?.price?.toFixed(2) || '0.00'} €
                  </TableCell>
                  <TableCell>{subscription.credits_remaining}</TableCell>
                  <TableCell>
                    {new Date(subscription.started_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {subscription.expires_at 
                      ? new Date(subscription.expires_at).toLocaleDateString('fr-FR')
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="capitalize">{subscription.billing_cycle}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
