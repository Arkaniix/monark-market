import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, PieChart, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddModelModal } from "./models/AddModelModal";
import { Category } from "./models/types";

export default function AdminModels() {
  const [models, setModels] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalAds, setTotalAds] = useState(0);
  const [mappedAds, setMappedAds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [modelsRes, categoriesRes, adsCountRes, mappedAdsRes] = await Promise.all([
        supabase.from('hardware_models').select('*, hardware_categories(name)').order('brand'),
        supabase.from('hardware_categories').select('id, name').order('name'),
        supabase.from('ads').select('*', { count: 'exact', head: true }),
        supabase.from('ads').select('*', { count: 'exact', head: true }).not('model_id', 'is', null),
      ]);

      if (modelsRes.error) throw modelsRes.error;
      setCategories(categoriesRes.data || []);
      setModels(modelsRes.data || []);
      setTotalAds(adsCountRes.count || 0);
      setMappedAds(mappedAdsRes.count || 0);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Erreur", description: "Impossible de charger les modèles", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleModelAdded = (newModel: any) => {
    setModels(prev => [...prev, newModel]);
  };

  const filteredModels = models.filter(model =>
    (model.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (model.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (model.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const coverageRate = totalAds > 0 ? ((mappedAds / totalAds) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Modèles & Catalogue</h2>
        <p className="text-muted-foreground">Gestion du catalogue hardware</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{models.length}</div>}
            <p className="text-xs text-muted-foreground">Modèles totaux</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{[...new Set(models.map(m => m.brand))].length}</div>}
            <p className="text-xs text-muted-foreground">Marques</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{[...new Set(models.map(m => m.hardware_categories?.name).filter(Boolean))].length}</div>}
            <p className="text-xs text-muted-foreground">Catégories</p>
          </CardContent>
        </Card>
        <Card className={parseFloat(coverageRate) < 80 ? 'border-yellow-500/30' : 'border-green-500/30'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <PieChart className={`h-4 w-4 ${parseFloat(coverageRate) >= 80 ? 'text-green-500' : 'text-yellow-500'}`} />
              {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{coverageRate}%</div>}
            </div>
            <p className="text-xs text-muted-foreground">Couverture annonces</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Modèles matériels ({filteredModels.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4" /></Button>
            <Button onClick={() => setIsAddModalOpen(true)}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
          </div>
        </CardHeader>
        <AddModelModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} categories={categories} onModelAdded={handleModelAdded} />
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-12"><p className="text-muted-foreground">Aucun modèle trouvé</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marque</TableHead>
                  <TableHead>Fabricant</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Famille</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Dernière MAJ</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.brand}</TableCell>
                    <TableCell className="text-muted-foreground">{model.manufacturer || '—'}</TableCell>
                    <TableCell>{model.name}</TableCell>
                    <TableCell>{model.family || '—'}</TableCell>
                    <TableCell><Badge variant="outline">{model.hardware_categories?.name || '—'}</Badge></TableCell>
                    <TableCell className="text-xs">{new Date(model.updated_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></TableCell>
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
