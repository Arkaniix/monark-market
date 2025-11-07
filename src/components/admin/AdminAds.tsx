import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Search, ExternalLink, Eye, EyeOff, RefreshCw, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminAds() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*, hardware_models(name, brand)')
        .order('last_seen_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Si pas de données, utiliser des données factices
      if (!data || data.length === 0) {
        setAds([
          {
            id: 1,
            platform: 'leboncoin',
            platform_ad_id: '2345678901',
            title: 'RTX 4090 Founders Edition - Comme neuve',
            status: 'active',
            city: 'Paris',
            last_seen_at: new Date().toISOString(),
            hardware_models: { name: 'RTX 4090', brand: 'NVIDIA' }
          },
          {
            id: 2,
            platform: 'leboncoin',
            platform_ad_id: '2345678902',
            title: 'RX 7900 XTX Red Devil - État impeccable',
            status: 'active',
            city: 'Lyon',
            last_seen_at: new Date(Date.now() - 3600000).toISOString(),
            hardware_models: { name: 'RX 7900 XTX', brand: 'AMD' }
          },
          {
            id: 3,
            platform: 'leboncoin',
            platform_ad_id: '2345678903',
            title: 'RTX 4080 ASUS TUF Gaming',
            status: 'sold',
            city: 'Marseille',
            last_seen_at: new Date(Date.now() - 86400000).toISOString(),
            hardware_models: { name: 'RTX 4080', brand: 'NVIDIA' }
          },
          {
            id: 4,
            platform: 'leboncoin',
            platform_ad_id: '2345678904',
            title: 'RTX 3080 Ti MSI Gaming X Trio',
            status: 'active',
            city: 'Toulouse',
            last_seen_at: new Date(Date.now() - 7200000).toISOString(),
            hardware_models: { name: 'RTX 3080 Ti', brand: 'NVIDIA' }
          },
          {
            id: 5,
            platform: 'leboncoin',
            platform_ad_id: '2345678905',
            title: 'RX 6800 XT Sapphire Nitro+',
            status: 'inactive',
            city: 'Nice',
            last_seen_at: new Date(Date.now() - 172800000).toISOString(),
            hardware_models: { name: 'RX 6800 XT', brand: 'AMD' }
          }
        ]);
      } else {
        setAds(data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.platform_ad_id?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
    const matchesPlatform = platformFilter === "all" || ad.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Annonces & Modération</h2>
        <p className="text-muted-foreground">Gestion et modération des annonces</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{ads.length}</div>
            <p className="text-xs text-muted-foreground">Total annonces</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{ads.filter(a => a.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{ads.filter(a => a.status === 'inactive').length}</div>
            <p className="text-xs text-muted-foreground">Inactives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{ads.filter(a => a.hardware_models).length}</div>
            <p className="text-xs text-muted-foreground">Avec modèle</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des annonces ({filteredAds.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou ID..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archivée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes plateformes</SelectItem>
                <SelectItem value="leboncoin">LeBonCoin</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchAds}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Modèle</TableHead>
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
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== "all" || platformFilter !== "all"
                          ? "Aucune annonce ne correspond aux filtres"
                          : "Aucune annonce disponible. Lancez un job de scraping pour commencer."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAds.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-mono text-xs">{ad.platform_ad_id}</TableCell>
                  <TableCell className="max-w-xs truncate">{ad.title}</TableCell>
                  <TableCell>
                    {ad.hardware_models ? (
                      <span className="text-xs">
                        {ad.hardware_models.brand} {ad.hardware_models.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Non mappé</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ad.platform}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(ad.status)}>{ad.status}</Badge>
                  </TableCell>
                  <TableCell>{ad.city || 'N/A'}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(ad.last_seen_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={ad.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
