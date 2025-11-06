import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogs() {
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Données factices pour les logs système
      const mockSystemLogs = [
        {
          id: 1,
          level: 'info',
          message: 'Démarrage du service de scraping',
          created_at: '2024-01-15T08:00:00',
          context: { service: 'scraper', version: '2.1.0' }
        },
        {
          id: 2,
          level: 'warn',
          message: 'Latence élevée détectée sur l\'API LeBonCoin',
          created_at: '2024-01-15T14:23:00',
          context: { latency_ms: 2500, threshold: 2000 }
        },
        {
          id: 3,
          level: 'error',
          message: 'Échec de connexion à la base de données',
          created_at: '2024-01-15T14:25:00',
          context: { error: 'Connection timeout', retry_count: 3 }
        },
        {
          id: 4,
          level: 'info',
          message: 'Recalcul des deal scores terminé',
          created_at: '2024-01-15T03:15:00',
          context: { ads_processed: 1247, duration_seconds: 45 }
        }
      ];

      // Données factices pour les logs d'actions utilisateur
      const mockActionLogs = [
        {
          id: 1,
          user_id: 'b9d133e5-3bab-4140-ad4d-98115e932ab0',
          action: 'job_created',
          target_type: 'job',
          target_id: '1',
          created_at: '2024-01-15T14:30:00',
          ip_address: '192.168.1.10',
          profiles: { display_name: 'Etienne' }
        },
        {
          id: 2,
          user_id: 'da1fbc02-5140-4321-b36d-38d3c5ac8a4c',
          action: 'subscription_upgraded',
          target_type: 'subscription',
          target_id: '2',
          created_at: '2024-01-15T10:15:00',
          ip_address: '192.168.1.25',
          profiles: { display_name: 'Emre' }
        },
        {
          id: 3,
          user_id: 'b9d133e5-3bab-4140-ad4d-98115e932ab0',
          action: 'profile_updated',
          target_type: 'profile',
          target_id: 'b9d133e5-3bab-4140-ad4d-98115e932ab0',
          created_at: '2024-01-14T16:45:00',
          ip_address: '192.168.1.10',
          profiles: { display_name: 'Etienne' }
        },
        {
          id: 4,
          user_id: 'user-3',
          action: 'ad_viewed',
          target_type: 'ad',
          target_id: '567',
          created_at: '2024-01-14T12:30:00',
          ip_address: '192.168.1.42',
          profiles: { display_name: 'Jean Dupont' }
        }
      ];

      setSystemLogs(mockSystemLogs);
      setActionLogs(mockActionLogs);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSystemLogs = systemLogs.filter(log => {
    const matchesSearch = log.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'default';
      case 'warn': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Logs & Audit</h2>
        <p className="text-muted-foreground">Historique système et actions utilisateurs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs système ({filteredSystemLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous niveaux</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Niveau</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSystemLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant={getLevelColor(log.level)}>
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-lg truncate">{log.message}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actionLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.profiles?.display_name || 'Utilisateur'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.target_type}: {log.target_id}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
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
