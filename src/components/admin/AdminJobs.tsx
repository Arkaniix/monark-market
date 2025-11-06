import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Search, RefreshCw, XCircle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [shards, setShards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Données factices pour les jobs
      const mockJobs = [
        {
          id: 1,
          user_id: 'b9d133e5-3bab-4140-ad4d-98115e932ab0',
          keyword: 'RTX 4090',
          type: 'fort',
          status: 'completed',
          pages_scanned: 50,
          pages_target: 50,
          ads_found: 142,
          created_at: '2024-01-15T14:30:00',
          profiles: { display_name: 'Etienne' }
        },
        {
          id: 2,
          user_id: 'da1fbc02-5140-4321-b36d-38d3c5ac8a4c',
          keyword: 'RTX 3080',
          type: 'faible',
          status: 'running',
          pages_scanned: 15,
          pages_target: 30,
          ads_found: 38,
          created_at: '2024-01-15T16:00:00',
          profiles: { display_name: 'Emre' }
        },
        {
          id: 3,
          user_id: 'user-3',
          keyword: 'GTX 1080 Ti',
          type: 'communautaire',
          status: 'completed',
          pages_scanned: 30,
          pages_target: 30,
          ads_found: 95,
          created_at: '2024-01-14T10:20:00',
          profiles: { display_name: 'Jean Dupont' }
        },
        {
          id: 4,
          user_id: 'b9d133e5-3bab-4140-ad4d-98115e932ab0',
          keyword: 'AMD RX 7900 XTX',
          type: 'faible',
          status: 'failed',
          pages_scanned: 5,
          pages_target: 20,
          ads_found: 2,
          created_at: '2024-01-14T08:45:00',
          profiles: { display_name: 'Etienne' }
        },
        {
          id: 5,
          user_id: 'da1fbc02-5140-4321-b36d-38d3c5ac8a4c',
          keyword: 'RTX 4070 Ti',
          type: 'fort',
          status: 'pending',
          pages_scanned: 0,
          pages_target: 40,
          ads_found: 0,
          created_at: '2024-01-15T17:00:00',
          profiles: { display_name: 'Emre' }
        }
      ];

      // Données factices pour les shards
      const mockShards = [
        {
          id: 1,
          job_id: 3,
          shard_kind: 'page_range',
          shard_from: 1,
          shard_to: 5,
          region_code: null,
          price_min: null,
          price_max: null,
          jobs: { keyword: 'GTX 1080 Ti', type: 'communautaire' }
        },
        {
          id: 2,
          job_id: 3,
          shard_kind: 'page_range',
          shard_from: 6,
          shard_to: 10,
          region_code: null,
          price_min: null,
          price_max: null,
          jobs: { keyword: 'GTX 1080 Ti', type: 'communautaire' }
        },
        {
          id: 3,
          job_id: 3,
          shard_kind: 'region',
          shard_from: null,
          shard_to: null,
          region_code: 'ile-de-france',
          price_min: 200,
          price_max: 500,
          jobs: { keyword: 'GTX 1080 Ti', type: 'communautaire' }
        }
      ];

      setJobs(mockJobs);
      setShards(mockShards);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les jobs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.keyword?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'communautaire': return 'default';
      case 'faible': return 'secondary';
      case 'fort': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Scraps & Jobs</h2>
        <p className="text-muted-foreground">Gestion des jobs de scraping et shards communautaires</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jobs ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par mot-clé ou utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="running">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="communautaire">Communautaire</SelectItem>
                <SelectItem value="faible">Faible</SelectItem>
                <SelectItem value="fort">Fort</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Mot-clé</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Annonces</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.profiles?.display_name || 'Utilisateur'}</TableCell>
                  <TableCell className="font-medium">{job.keyword}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeColor(job.type)}>{job.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
                  </TableCell>
                  <TableCell>{job.pages_scanned}/{job.pages_target || '-'}</TableCell>
                  <TableCell>{job.ads_found}</TableCell>
                  <TableCell>{new Date(job.created_at).toLocaleDateString('fr-FR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shards Communautaires ({shards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Plage</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Prix Min</TableHead>
                <TableHead>Prix Max</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shards.map((shard) => (
                <TableRow key={shard.id}>
                  <TableCell>{shard.jobs?.keyword}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{shard.shard_kind}</Badge>
                  </TableCell>
                  <TableCell>
                    {shard.shard_from} - {shard.shard_to}
                  </TableCell>
                  <TableCell>{shard.region_code || 'N/A'}</TableCell>
                  <TableCell>{shard.price_min || '-'}€</TableCell>
                  <TableCell>{shard.price_max || '-'}€</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
