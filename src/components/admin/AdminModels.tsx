import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { adminApiGet } from "@/lib/api/adminApi";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, PieChart, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModelFormModal } from "./models/ModelFormModal";
import { Category } from "./models/types";
import { qualityBadge } from "./adminHelpers";

// ---- Types ----

interface AdminModel {
  id: number;
  name: string;
  brand: string | null;
  manufacturer: string | null;
  family: string | null;
  category_id: number;
  category_name: string;
  aliases: string[] | null;
  image_url: string | null;
  new_price_eur: number | null;
  new_price_source: string | null;
  observations_count: number;
  signals_count: number;
  market_median: number | null;
  data_quality: string | null;
  updated_at: string | null;
}

interface ModelsSummary {
  total_models: number;
  unique_manufacturers: number;
  categories_count: number;
  models_with_stats: number;
  models_with_new_price: number;
}

interface ModelsResponse {
  models: AdminModel[];
  total: number;
  page: number;
  page_size: number;
  summary: ModelsSummary;
}

interface CategoriesResponse {
  categories: { id: number; name: string; models_count: number }[];
}

// ---- Category badge colors ----

function categoryBadge(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("gpu"))
    return <Badge className="bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 uppercase text-[10px]">{name}</Badge>;
  if (lower.includes("cpu"))
    return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 uppercase text-[10px]">{name}</Badge>;
  if (lower.includes("ram"))
    return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 uppercase text-[10px]">{name}</Badge>;
  if (lower.includes("ssd"))
    return <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20 uppercase text-[10px]">{name}</Badge>;
  return <Badge variant="outline" className="uppercase text-[10px]">{name}</Badge>;
}

export default function AdminModels() {
  const [models, setModels] = useState<AdminModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<ModelsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModelId, setEditModelId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: "1", page_size: "500" });

      const [modelsRes, categoriesRes] = await Promise.all([
        adminApiGet<ModelsResponse>(`/v1/admin/models?${params}`),
        adminApiGet<CategoriesResponse>('/v1/admin/categories'),
      ]);

      setModels(modelsRes.models);
      setCategories(categoriesRes.categories.map(c => ({ id: c.id, name: c.name })));
      setSummary(modelsRes.summary);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || "Impossible de charger les modèles");
      toast({ title: "Erreur", description: "Impossible de charger les modèles", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleModelSaved = () => {
    setIsAddModalOpen(false);
    setEditModelId(null);
    fetchData();
  };

  const filteredModels = models.filter(model => {
    const matchesSearch =
      (model.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (model.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (model.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || model.category_name?.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const coverageRate = summary && summary.total_models > 0
    ? ((summary.models_with_stats / summary.total_models) * 100).toFixed(1)
    : '0';

  const formatPrice = (price: number | null) => {
    if (price == null) return "—";
    return `${Math.round(price)} €`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Modèles & Catalogue</h2>
        <p className="text-muted-foreground">Gestion du catalogue hardware</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{summary?.total_models ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Modèles totaux</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{summary?.unique_manufacturers ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Fabricants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{summary?.categories_count ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Catégories</p>
          </CardContent>
        </Card>
        <Card className={parseFloat(coverageRate) >= 20 ? 'border-green-500/30' : 'border-yellow-500/30'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <PieChart className={`h-4 w-4 ${parseFloat(coverageRate) >= 20 ? 'text-green-500' : 'text-yellow-500'}`} />
              {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{coverageRate}%</div>}
            </div>
            <p className="text-xs text-muted-foreground">Couverture stats</p>
          </CardContent>
        </Card>
      </div>

      {/* Error state */}
      {error && !loading && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="ml-auto">Réessayer</Button>
          </CardContent>
        </Card>
      )}

      {/* Models Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Modèles matériels ({filteredModels.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4" /></Button>
            <Button onClick={() => { setEditModelId(null); setIsAddModalOpen(true); }}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
          </div>
        </CardHeader>
        <ModelFormModal
          open={isAddModalOpen}
          onOpenChange={(v) => { setIsAddModalOpen(v); if (!v) setEditModelId(null); }}
          modelId={editModelId}
          categories={categories}
          onModelSaved={handleModelSaved}
        />
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-12"><p className="text-muted-foreground">Aucun modèle trouvé</p></div>
          ) : (
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Fabricant</TableHead>
                    <TableHead className="text-right">Prix neuf</TableHead>
                    <TableHead className="text-right">Médiane marché</TableHead>
                    <TableHead className="text-right">Observations</TableHead>
                    <TableHead className="text-right">Signaux</TableHead>
                    <TableHead>Qualité</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>{categoryBadge(model.category_name || '—')}</TableCell>
                      <TableCell className="text-muted-foreground">{model.manufacturer || '—'}</TableCell>
                      <TableCell className="text-right">
                        {model.new_price_eur != null ? (
                          model.new_price_source ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">{formatPrice(model.new_price_eur)}</span>
                              </TooltipTrigger>
                              <TooltipContent>{model.new_price_source}</TooltipContent>
                            </Tooltip>
                          ) : (
                            formatPrice(model.new_price_eur)
                          )
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-right">{formatPrice(model.market_median)}</TableCell>
                      <TableCell className="text-right">{model.observations_count}</TableCell>
                      <TableCell className="text-right">{model.signals_count}</TableCell>
                      <TableCell>{model.data_quality ? qualityBadge(model.data_quality) : "—"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => { setEditModelId(model.id); setIsAddModalOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
