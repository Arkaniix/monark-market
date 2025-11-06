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
      const [jobsRes, shardsRes] = await Promise.all([
        supabase.from('jobs').select('*, profiles:user_id(display_name)').order('created_at', { ascending: false }).limit(100),
        supabase.from('job_shards').select('*, jobs(keyword, type)').limit(50)
      ]);

      if (jobsRes.error) throw jobsRes.error;
      if (shardsRes.error) throw shardsRes.error;

      setJobs(jobsRes.data || []);
      setShards(shardsRes.data || []);
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
                <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
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
