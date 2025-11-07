import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Boxes } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminModels() {
  const [models, setModels] = useState<any[]>([]);
  const [specs, setSpecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modelsRes, specsRes] = await Promise.all([
        supabase.from('hardware_models').select('*, hardware_categories(name)').order('brand'),
        supabase.from('hardware_model_specs').select('*, hardware_models(name, brand)').limit(50)
      ]);

      if (modelsRes.error) throw modelsRes.error;
      if (specsRes.error) throw specsRes.error;

      setModels(modelsRes.data || []);
      setSpecs(specsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modèles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter(model => 
    model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Modèles & Spécifications</h2>
        <p className="text-muted-foreground">Gestion du catalogue hardware</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{models.length}</div>
            <p className="text-xs text-muted-foreground">Modèles totaux</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{specs.length}</div>
            <p className="text-xs text-muted-foreground">Fiches specs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {[...new Set(models.map(m => m.brand))].length}
            </div>
            <p className="text-xs text-muted-foreground">Marques</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Modèles matériels ({filteredModels.length})</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter modèle
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou marque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marque</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Famille</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Alias</TableHead>
                <TableHead>Dernière MAJ</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Boxes className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? "Aucun modèle ne correspond à la recherche"
                          : "Aucun modèle disponible. Les modèles seront ajoutés automatiquement lors du scraping."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.brand}</TableCell>
                  <TableCell>{model.name}</TableCell>
                  <TableCell>{model.family || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {model.hardware_categories?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {model.aliases?.join(', ') || 'Aucun'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(model.updated_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spécifications récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modèle</TableHead>
                <TableHead>Chip</TableHead>
                <TableHead>VRAM</TableHead>
                <TableHead>TDP</TableHead>
                <TableHead>Bus Width</TableHead>
                <TableHead>Mémoire</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specs.map((spec) => (
                <TableRow key={spec.id}>
                  <TableCell className="font-medium">
                    {spec.hardware_models?.brand} {spec.hardware_models?.name}
                  </TableCell>
                  <TableCell>{spec.chip || 'N/A'}</TableCell>
                  <TableCell>{spec.vram_gb ? `${spec.vram_gb} GB` : 'N/A'}</TableCell>
                  <TableCell>{spec.tdp_w ? `${spec.tdp_w}W` : 'N/A'}</TableCell>
                  <TableCell>{spec.bus_width_bit ? `${spec.bus_width_bit}-bit` : 'N/A'}</TableCell>
                  <TableCell>{spec.memory_type || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
