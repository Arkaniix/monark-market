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
      const [policiesRes, logsRes] = await Promise.all([
        supabase.from('scrape_policies').select('*'),
        supabase.from('credit_logs').select('*, profiles:user_id(display_name)').order('created_at', { ascending: false }).limit(50)
      ]);

      if (policiesRes.error) throw policiesRes.error;
      if (logsRes.error) throw logsRes.error;

      setPolicies(policiesRes.data || []);
      setCreditLogs(logsRes.data || []);
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
