import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, TrendingUp, TrendingDown, Eye, Coins, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

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

interface SubscriptionDetail extends Subscription {
  payments: Array<{ id: number; amount: number; date: string; status: string }>;
  creditInjections: Array<{ id: number; delta: number; date: string; reason: string }>;
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionDetail | null>(null);
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

  // Calculate MRR (Monthly Recurring Revenue)
  const mrr = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + (sub.subscription_plans?.price || 0), 0);

  // Calculate Churn (% of expired subscriptions last month)
  const lastMonth = subMonths(new Date(), 1);
  const expiredLastMonth = subscriptions.filter(sub => {
    if (sub.status !== 'expired' || !sub.expires_at) return false;
    const expiryDate = new Date(sub.expires_at);
    return expiryDate.getMonth() === lastMonth.getMonth() && 
           expiryDate.getFullYear() === lastMonth.getFullYear();
  }).length;
  
  const totalActiveLastMonth = subscriptions.filter(sub => {
    const startDate = new Date(sub.started_at);
    return startDate <= lastMonth;
  }).length;
  
  const churnRate = totalActiveLastMonth > 0 
    ? ((expiredLastMonth / totalActiveLastMonth) * 100).toFixed(1) 
    : '0';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleViewDetail = (sub: Subscription) => {
    // Mock payment and credit injection data
    const detail: SubscriptionDetail = {
      ...sub,
      payments: [
        { id: 1, amount: sub.subscription_plans?.price || 0, date: sub.started_at, status: 'completed' },
      ],
      creditInjections: [
        { id: 1, delta: 50, date: sub.started_at, reason: 'subscription_start' },
        { id: 2, delta: 50, date: sub.credits_reset_date || sub.started_at, reason: 'monthly_refill' },
      ]
    };
    setSelectedSubscription(detail);
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mrr.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">Revenu mensuel récurrent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Churn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnRate}%</div>
            <p className="text-xs text-muted-foreground">Expirés le mois dernier</p>
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Date début</TableHead>
                <TableHead>Date fin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
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
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleViewDetail(subscription)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subscription Detail Modal */}
      <Dialog open={!!selectedSubscription} onOpenChange={(open) => !open && setSelectedSubscription(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Détail abonnement
            </DialogTitle>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateur</p>
                  <p className="font-medium">{selectedSubscription.profiles?.display_name || 'Inconnu'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <Badge variant="secondary">{selectedSubscription.subscription_plans?.name || 'N/A'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Période</p>
                  <p className="text-sm">
                    {format(new Date(selectedSubscription.started_at), "dd/MM/yyyy", { locale: fr })}
                    {' → '}
                    {selectedSubscription.expires_at 
                      ? format(new Date(selectedSubscription.expires_at), "dd/MM/yyyy", { locale: fr })
                      : 'Illimité'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={getStatusColor(selectedSubscription.status)}>
                    {selectedSubscription.status}
                  </Badge>
                </div>
              </div>

              {/* Payments */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Paiements
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSubscription.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-sm">
                          {format(new Date(payment.date), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell className="font-medium">{payment.amount.toFixed(2)} €</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'destructive'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Credit Injections */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Crédits injectés
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
                    {selectedSubscription.creditInjections.map((injection) => (
                      <TableRow key={injection.id}>
                        <TableCell className="text-sm">
                          {format(new Date(injection.date), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell className="text-green-600">+{injection.delta}</TableCell>
                        <TableCell className="text-sm">{injection.reason}</TableCell>
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
