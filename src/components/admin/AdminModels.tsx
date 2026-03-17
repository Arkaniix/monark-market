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
import { Search, Plus, Edit, PieChart, RefreshCw, AlertCircle, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ModelFormModal } from "./models/ModelFormModal";
import { Category } from "./models/types";
import { qualityBadge } from "./adminHelpers";
import { VariantsPanel } from "./VariantsPanel";

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

// ---- Tier badge colors ----

const TIER_COLORS: Record<string, string> = {
  premium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  mid: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  entry: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  reference: "bg-white/10 text-white border-white/20",
};

function tierBadge(tier: string | null) {
  if (!tier) return <Badge variant="outline" className="text-[10px]">—</Badge>;
  const cls = TIER_COLORS[tier.toLowerCase()] || "bg-muted text-muted-foreground";
  return <Badge variant="outline" className={`text-[10px] capitalize ${cls}`}>{tier}</Badge>;
}

// ---- Variants expand panel ----

function VariantsPanel({ modelId, modelName }: { modelId: number; modelName: string }) {
  const [data, setData] = useState<ModelVariantsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApiGet<ModelVariantsResponse>(ADMIN.MODEL_VARIANTS(modelId));
        if (!cancelled) setData(res);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [modelId]);

  const formatPrice = (v: number | null) => v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`;

  if (loading) return (
    <TableRow>
      <TableCell colSpan={9} className="bg-muted/30 p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </TableCell>
    </TableRow>
  );

  if (error) return (
    <TableRow>
      <TableCell colSpan={9} className="bg-muted/30 p-4 text-destructive text-sm">
        <AlertCircle className="h-4 w-4 inline mr-2" />{error}
      </TableCell>
    </TableRow>
  );

  if (!data || data.variants.length === 0) return (
    <TableRow>
      <TableCell colSpan={9} className="bg-muted/30 p-4 text-center text-muted-foreground text-sm">
        Aucune variante trouvée pour {modelName}
      </TableCell>
    </TableRow>
  );

  return (
    <TableRow>
      <TableCell colSpan={9} className="bg-muted/30 p-0">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h4 className="text-sm font-semibold">Variantes de {modelName}</h4>
            <Badge variant="outline" className="text-xs">{data.total_variants} variantes</Badge>
            {Object.entries(data.tier_summary).map(([tier, count]) => (
              <Badge key={tier} variant="outline" className={`text-[10px] capitalize ${TIER_COLORS[tier.toLowerCase()] || "bg-muted text-muted-foreground"}`}>
                {tier}: {count}
              </Badge>
            ))}
          </div>
          <div className="rounded border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marque</TableHead>
                  <TableHead>Variante</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Delta prix</TableHead>
                  <TableHead className="text-right">Prix neuf EUR</TableHead>
                  <TableHead>Specs</TableHead>
                  <TableHead className="text-right">Observations</TableHead>
                  <TableHead className="text-right">Signaux</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TooltipProvider>
                  {data.variants.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-sm">{v.brand}</TableCell>
                      <TableCell className="font-medium text-sm">{v.variant_name}</TableCell>
                      <TableCell>{tierBadge(v.tier)}</TableCell>
                      <TableCell className="text-right">
                        {v.price_delta_pct != null ? (
                          <span className={v.price_delta_pct > 0 ? "text-emerald-400" : v.price_delta_pct < 0 ? "text-destructive" : "text-muted-foreground"}>
                            {v.price_delta_pct > 0 ? "+" : ""}{v.price_delta_pct.toFixed(1)}%
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {v.new_price_eur != null ? (
                          v.new_price_source ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">{formatPrice(v.new_price_eur)}</span>
                              </TooltipTrigger>
                              <TooltipContent>{v.new_price_source}</TooltipContent>
                            </Tooltip>
                          ) : formatPrice(v.new_price_eur)
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {[
                          v.boost_clock_mhz ? `${v.boost_clock_mhz} MHz` : null,
                          v.length_mm ? `${v.length_mm} mm` : null,
                        ].filter(Boolean).join(" · ") || "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm">{v.observations_count}</TableCell>
                      <TableCell className="text-right text-sm">{v.signals_count}</TableCell>
                    </TableRow>
                  ))}
                </TooltipProvider>
              </TableBody>
            </Table>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---- Main ----

export default function AdminModels() {
  const navigate = useNavigate();
  const [models, setModels] = useState<AdminModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<ModelsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModelId, setEditModelId] = useState<number | null>(null);
  const [expandedModelId, setExpandedModelId] = useState<number | null>(null);
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

  const toggleExpand = (modelId: number) => {
    setExpandedModelId(prev => prev === modelId ? null : modelId);
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
                    <TableHead className="w-8"></TableHead>
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
                    <>
                      <TableRow key={model.id}>
                        <TableCell className="w-8 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleExpand(model.id)}
                          >
                            {expandedModelId === model.id
                              ? <ChevronDown className="h-4 w-4" />
                              : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className="cursor-pointer hover:text-primary hover:underline transition-colors"
                            onClick={() => toggleExpand(model.id)}
                          >
                            {model.name}
                          </span>
                        </TableCell>
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
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditModelId(model.id); setIsAddModalOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/catalog/${model.id}`)}>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedModelId === model.id && (
                        <VariantsPanel modelId={model.id} modelName={model.name} />
                      )}
                    </>
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
