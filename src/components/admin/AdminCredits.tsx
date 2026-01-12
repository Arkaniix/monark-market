import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { History, Calculator, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCredits() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [creditLogs, setCreditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Simulator state
  const [simPlatform, setSimPlatform] = useState("leboncoin");
  const [simType, setSimType] = useState("faible");
  const [simPages, setSimPages] = useState(10);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Calculate estimated cost when inputs change
    calculateCost();
  }, [simPlatform, simType, simPages]);

  const fetchData = async () => {
    try {
      const policiesRes = await supabase.from('scrape_policies').select('*');
      
      // Données factices pour les logs de crédits
      const mockLogs = [
        {
          id: 1,
          user_id: 'b9d133e5-3bab-4140-ad4d-98115e932ab0',
          delta: -15,
          reason: 'scrap_fort',
          created_at: '2024-01-15T14:30:00',
          profiles: { display_name: 'Etienne' }
        },
        {
          id: 2,
          user_id: 'da1fbc02-5140-4321-b36d-38d3c5ac8a4c',
          delta: 50,
          reason: 'monthly_refill',
          created_at: '2024-01-15T10:00:00',
          profiles: { display_name: 'Emre' }
        },
        {
          id: 3,
          user_id: 'b9d133e5-3bab-4140-ad4d-98115e932ab0',
          delta: -5,
          reason: 'scrap_faible',
          created_at: '2024-01-14T16:20:00',
          profiles: { display_name: 'Etienne' }
        },
        {
          id: 4,
          user_id: 'user-3',
          delta: 10,
          reason: 'scrap_communautaire_bonus',
          created_at: '2024-01-14T12:45:00',
          profiles: { display_name: 'Jean Dupont' }
        },
        {
          id: 5,
          user_id: 'da1fbc02-5140-4321-b36d-38d3c5ac8a4c',
          delta: -20,
          reason: 'scrap_fort',
          created_at: '2024-01-13T09:15:00',
          profiles: { display_name: 'Emre' }
        }
      ];

      if (policiesRes.error) throw policiesRes.error;

      setPolicies(policiesRes.data || []);
      setCreditLogs(mockLogs);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = () => {
    // Cost calculation based on type
    let cost = 0;
    
    switch (simType) {
      case 'communautaire':
        cost = 0;
        break;
      case 'faible':
        cost = Math.max(5, Math.ceil(simPages / 10));
        break;
      case 'fort':
        cost = Math.max(10, Math.ceil(simPages / 5));
        break;
      default:
        cost = 5;
    }
    
    setEstimatedCost(cost);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Crédits & Politiques d'usage</h2>
        <p className="text-muted-foreground">Configuration des règles de scraping et crédits</p>
      </div>

      {/* Cost Simulator */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulateur de coût
          </CardTitle>
          <CardDescription>
            Estimez le coût en crédits d'un job avant de le lancer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Plateforme</Label>
              <Select value={simPlatform} onValueChange={setSimPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leboncoin">LeBonCoin</SelectItem>
                  <SelectItem value="facebook">Facebook Marketplace</SelectItem>
                  <SelectItem value="ebay">eBay</SelectItem>
                  <SelectItem value="vinted">Vinted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Type de scrap</Label>
              <Select value={simType} onValueChange={setSimType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="communautaire">Communautaire</SelectItem>
                  <SelectItem value="faible">Faible</SelectItem>
                  <SelectItem value="fort">Fort</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Pages cibles</Label>
              <Select value={simPages.toString()} onValueChange={(v) => setSimPages(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 pages</SelectItem>
                  <SelectItem value="10">10 pages</SelectItem>
                  <SelectItem value="25">25 pages</SelectItem>
                  <SelectItem value="50">50 pages</SelectItem>
                  <SelectItem value="100">100 pages</SelectItem>
                  <SelectItem value="200">200 pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="flex items-center justify-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {estimatedCost !== null ? estimatedCost : '-'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">crédits estimés</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <strong>Formules :</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><span className="font-medium">Communautaire</span> : 0 crédit (gratuit)</li>
              <li><span className="font-medium">Faible</span> : max(5, pages/10) crédits</li>
              <li><span className="font-medium">Fort</span> : max(10, pages/5) crédits</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Politiques de scraping par plateforme</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plateforme</TableHead>
                <TableHead>Pages (liste)</TableHead>
                <TableHead>Pages (détail)</TableHead>
                <TableHead>Délai item (ms)</TableHead>
                <TableHead>Délai page (ms)</TableHead>
                <TableHead>Cooldown (min)</TableHead>
                <TableHead>Max jobs/jour</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium capitalize">{policy.site}</TableCell>
                  <TableCell>{policy.list_only_pages_max}</TableCell>
                  <TableCell>{policy.open_new_pages_max}</TableCell>
                  <TableCell>
                    {policy.min_delay_item_ms} - {policy.max_delay_item_ms}
                  </TableCell>
                  <TableCell>
                    {policy.min_delay_page_ms} - {policy.max_delay_page_ms}
                  </TableCell>
                  <TableCell>{policy.min_cooldown_minutes}</TableCell>
                  <TableCell>{policy.max_comm_jobs_per_day}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Marketplace Facebook</TableCell>
                <TableCell>30</TableCell>
                <TableCell>15</TableCell>
                <TableCell>800 - 2500</TableCell>
                <TableCell>1500 - 4000</TableCell>
                <TableCell>45</TableCell>
                <TableCell>8</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">eBay</TableCell>
                <TableCell>40</TableCell>
                <TableCell>25</TableCell>
                <TableCell>600 - 1800</TableCell>
                <TableCell>1200 - 3500</TableCell>
                <TableCell>35</TableCell>
                <TableCell>12</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Vinted</TableCell>
                <TableCell>35</TableCell>
                <TableCell>18</TableCell>
                <TableCell>700 - 2200</TableCell>
                <TableCell>1400 - 3800</TableCell>
                <TableCell>40</TableCell>
                <TableCell>10</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historique des crédits</CardTitle>
          <History className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.profiles?.display_name || 'Utilisateur'}</TableCell>
                  <TableCell className={log.delta > 0 ? 'text-green-600' : 'text-red-600'}>
                    {log.delta > 0 ? '+' : ''}{log.delta}
                  </TableCell>
                  <TableCell>{log.reason}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleDateString('fr-FR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
