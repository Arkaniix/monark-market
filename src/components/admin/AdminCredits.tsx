import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Settings, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCredits() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [creditLogs, setCreditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

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

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Crédits & Politiques d'usage</h2>
        <p className="text-muted-foreground">Configuration des règles de scraping et crédits</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Politiques de scraping</CardTitle>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Pages List Max</TableHead>
                <TableHead>Pages Open Max</TableHead>
                <TableHead>Délai Min (ms)</TableHead>
                <TableHead>Délai Max (ms)</TableHead>
                <TableHead>Jobs Comm./Jour</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.site}</TableCell>
                  <TableCell>{policy.list_only_pages_max}</TableCell>
                  <TableCell>{policy.open_new_pages_max}</TableCell>
                  <TableCell>{policy.min_delay_page_ms}</TableCell>
                  <TableCell>{policy.max_delay_page_ms}</TableCell>
                  <TableCell>{policy.max_comm_jobs_per_day}</TableCell>
                </TableRow>
              ))}
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
