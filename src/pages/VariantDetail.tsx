import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { TrendingDown, TrendingUp, Clock, Info, Sparkles, ExternalLink } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { useDataProvider } from "@/providers";
import { ModelCardImage } from "@/components/catalog/ModelCardImage";

export default function VariantDetail() {
  const { id } = useParams();
  const provider = useDataProvider();

  // Fetch parent model data to find variant info
  // For now, we search across all models for a variant with this id
  const { data: variant, isLoading, error } = useQuery({
    queryKey: ['variant-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No variant id');

      // Try API endpoint first
      try {
        const { apiFetch } = await import("@/lib/api");
        const response = await apiFetch<any>(`/v1/variants/${id}`);
        if (response) {
          return {
            id: response.id || parseInt(id),
            brand: response.brand || '',
            variant_name: response.variant_name || '',
            boost_clock_mhz: response.boost_clock_mhz ?? null,
            core_clock_mhz: response.core_clock_mhz ?? null,
            memory_gb: response.memory_gb ?? null,
            length_mm: response.length_mm ?? null,
            color: response.color ?? null,
            price_usd: response.price_usd ?? null,
            image_url: response.image_url ?? null,
            parent_model: {
              id: response.model_id || response.parent_model?.id || 0,
              name: response.model_name || response.parent_model?.name || '',
              brand: response.manufacturer || response.parent_model?.brand || '',
              category: response.category || response.parent_model?.category || '',
              image_url: response.model_image_url || response.parent_model?.image_url || null,
            },
            market: {
              median_price: response.median_price ?? 0,
              fair_value_30d: response.fair_value_30d ?? 0,
              volume_active: response.volume_active ?? 0,
              rarity_index: response.rarity_index ?? 0,
              var_30d_pct: response.var_30d_pct ?? 0,
              median_days_to_sell: response.median_days_to_sell ?? 0,
              last_scan_at: response.last_scan_at || new Date().toISOString(),
            },
          };
        }
      } catch {
        // API not available, use mock fallback
      }

      // Mock fallback: build variant from id
      const variantId = parseInt(id);
      return {
        id: variantId,
        brand: 'N/A',
        variant_name: `Variante #${variantId}`,
        boost_clock_mhz: null,
        core_clock_mhz: null,
        memory_gb: null,
        length_mm: null,
        color: null,
        price_usd: null,
        image_url: null,
        parent_model: {
          id: 0,
          name: 'Modèle inconnu',
          brand: '',
          category: 'GPU',
          image_url: null,
        },
        market: {
          median_price: 0,
          fair_value_30d: 0,
          volume_active: 0,
          rarity_index: 0,
          var_30d_pct: 0,
          median_days_to_sell: 0,
          last_scan_at: new Date().toISOString(),
        },
      };
    },
    enabled: !!id,
    retry: false,
  });

  const formatPrice = (price: number) => price > 0 ? `${price} €` : 'N/A';
  const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const fmt = (val: number | null | undefined, suffix: string) =>
    val != null ? `${val.toLocaleString("fr-FR")} ${suffix}` : "—";

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-7xl space-y-6">
          <Skeleton className="h-6 w-96" />
          <div className="flex gap-6">
            <Skeleton className="w-[400px] h-[300px] rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-10 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !variant) {
    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-7xl">
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">Variante non trouvée.</p>
              <Button variant="outline" asChild>
                <Link to="/catalog">Retour au catalogue</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const displayName = `${variant.brand} ${variant.variant_name} ${variant.parent_model.name}`;
  const imageUrl = variant.image_url || variant.parent_model.image_url;

  return (
    <div className="min-h-screen py-8 scroll-smooth">
      <div className="container max-w-7xl space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Accueil</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/catalog">Catalogue</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/catalog?category=${variant.parent_model.category}`}>
                    {variant.parent_model.category}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/catalog?brand=${variant.parent_model.brand}`}>
                    {variant.parent_model.brand}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/models/${variant.parent_model.id}`}>
                    {variant.parent_model.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{variant.brand} {variant.variant_name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-6 items-start"
        >
          {/* Image */}
          <div className="hidden sm:block flex-shrink-0 w-[400px]">
            {imageUrl ? (
              <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                <div className="aspect-[4/3] bg-muted/30">
                  <img
                    src={imageUrl}
                    alt={displayName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="bg-muted/50 text-center py-1 border-t border-border/30">
                  <span className="text-[9px] text-muted-foreground/60 italic">
                    Image non contractuelle
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                <ModelCardImage
                  imageUrl={null}
                  modelName={variant.variant_name}
                  brand={variant.brand}
                  category={variant.parent_model.category}
                  aspectRatio="4/3"
                  size="lg"
                />
              </div>
            )}
          </div>

          {/* Title & Badges */}
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{displayName}</h1>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="default" className="bg-primary/90">
                {variant.brand}
              </Badge>
              <Badge variant="secondary">
                <Link to={`/models/${variant.parent_model.id}`}>
                  {variant.parent_model.name}
                </Link>
              </Badge>
              <Badge variant="outline">{variant.parent_model.category}</Badge>
            </div>

            {/* Specs summary */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Boost Clock</span>
                <p className="font-semibold tabular-nums">{fmt(variant.boost_clock_mhz, "MHz")}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Core Clock</span>
                <p className="font-semibold tabular-nums">{fmt(variant.core_clock_mhz, "MHz")}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Mémoire</span>
                <p className="font-semibold tabular-nums">{fmt(variant.memory_gb, "GB")}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Longueur</span>
                <p className="font-semibold tabular-nums">{fmt(variant.length_mm, "mm")}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Couleur</span>
                <p className="font-semibold">{variant.color || "—"}</p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">MSRP</span>
                <p className="font-semibold tabular-nums">
                  {variant.price_usd != null ? `~${Math.round(variant.price_usd)} $` : "—"}
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* KPI Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Prix médian 30j</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(variant.market.median_price)}</div>
                {variant.market.var_30d_pct !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {variant.market.var_30d_pct < 0 
                      ? <TrendingDown className="h-4 w-4 text-success" />
                      : <TrendingUp className="h-4 w-4 text-destructive" />}
                    <span className={variant.market.var_30d_pct < 0 ? "text-success" : "text-destructive"}>
                      {formatPercent(variant.market.var_30d_pct)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 cursor-help">
                        Juste prix <Info className="h-3 w-3" />
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">Prix estimé raisonnable basé sur la médiane des 30 derniers jours.</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(variant.market.fair_value_30d)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Annonces actives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{variant.market.volume_active}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 cursor-help">
                        Rareté <Info className="h-3 w-3" />
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">Indicateur de disponibilité. Plus le % est élevé, moins il y a d'annonces.</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(variant.market.rarity_index * 100).toFixed(0)}%</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${variant.market.rarity_index * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Délai de vente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {variant.market.median_days_to_sell > 0 ? `${variant.market.median_days_to_sell} jours` : 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Mis à jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(variant.market.last_scan_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Données marché de la variante</p>
                  <p className="text-xs text-muted-foreground">
                    Les données de prix et volume spécifiques à cette variante constructeur seront bientôt disponibles.
                    En attendant, consultez les données du{" "}
                    <Link to={`/models/${variant.parent_model.id}`} className="text-primary hover:underline">
                      modèle parent ({variant.parent_model.name})
                    </Link>
                    {" "}pour une vue d'ensemble du marché.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Actions rapides
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild className="gap-2">
                  <Link to={`/models/${variant.parent_model.id}`}>
                    <ExternalLink className="h-4 w-4" />
                    Voir le modèle parent
                  </Link>
                </Button>
                <Button variant="outline" asChild className="gap-2">
                  <Link to={`/estimator?model_id=${variant.parent_model.id}&model_name=${encodeURIComponent(variant.parent_model.brand + ' ' + variant.parent_model.name)}`}>
                    <Sparkles className="h-4 w-4" />
                    Estimer
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
