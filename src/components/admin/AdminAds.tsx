import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Search, ExternalLink, RefreshCw, FileText, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminApiGet } from "@/lib/api/adminApi";
import { subDays } from "date-fns";

export default function AdminAds() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => { fetchAds(); }, []);

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApiGet<any>('/v1/ads?limit=100&offset=0');
      setAds(data?.items || data || []);
    } catch (err: any) {
      setError(err.message);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = (ad.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (ad.platform_ad_id || '').includes(searchTerm);
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
    const matchesPlatform = platformFilter === "all" || ad.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const orphanAds = ads.filter(a => !a.model_id).length;
  const thirtyDaysAgo = subDays(new Date(), 30);
  const staleAds = ads.filter(a => new Date(a.last_seen_at) < thirtyDaysAgo).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Annonces</h2>
        <p className="text-muted-foreground">Gestion et modération des annonces</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{ads.length}</div>}
            <p className="text-xs text-muted-foreground">Total annonces</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{ads.filter(a => a.status === 'active').length}</div>}
            <p className="text-xs text-muted-foreground">Actives</p>
          </CardContent>
        </Card>
        <Card className={orphanAds > 0 ? 'border-yellow-500/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${orphanAds > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{orphanAds}</div>}
            </div>
            <p className="text-xs text-muted-foreground">Non catégorisées</p>
          </CardContent>
        </Card>
        <Card className={staleAds > 0 ? 'border-yellow-500/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${staleAds > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{staleAds}</div>}
            </div>
            <p className="text-xs text-muted-foreground">Non vues &gt; 30j</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Liste des annonces ({filteredAds.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par titre ou ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archivée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="leboncoin">LeBonCoin</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="ebay">eBay</SelectItem>
                <SelectItem value="vinted">Vinted</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchAds}><RefreshCw className="h-4 w-4" /></Button>
          </div>

          {error ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">API indisponible : {error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchAds}>Réessayer</Button>
            </div>
          ) : loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Modèle</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Plateforme</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Dernière vue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Aucune annonce disponible</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAds.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-mono text-xs">{ad.platform_ad_id || ad.id}</TableCell>
                    <TableCell className="max-w-xs truncate">{ad.title}</TableCell>
                    <TableCell>
                      {ad.model_id ? (
                        <span className="text-xs">{ad.model_name || `#${ad.model_id}`}</span>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Non catégorisé</Badge>
                      )}
                    </TableCell>
                    <TableCell>{ad.price ? `${ad.price}€` : '—'}</TableCell>
                    <TableCell><Badge variant="outline">{ad.platform}</Badge></TableCell>
                    <TableCell><Badge variant={getStatusColor(ad.status)}>{ad.status}</Badge></TableCell>
                    <TableCell>{ad.city || '—'}</TableCell>
                    <TableCell className="text-xs">{ad.last_seen_at ? new Date(ad.last_seen_at).toLocaleDateString('fr-FR') : '—'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={ad.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
