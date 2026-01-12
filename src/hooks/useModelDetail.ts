import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataProvider } from "@/providers";

export function useModelDetail(modelId: string | undefined) {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['model-detail', modelId],
    queryFn: async () => {
      if (!modelId) throw new Error('No modelId provided');
      const model = await provider.getModelDetail(modelId);
      return {
        id: model.id,
        name: model.name,
        brand: model.brand,
        manufacturer: model.manufacturer,
        family: model.family,
        category: model.category,
        aliases: model.aliases,
        specs: model.specs,
        kpi: {
          median_30d: model.market.median_price,
          var_7d_pct: model.market.var_7d_pct,
          var_30d_pct: model.market.var_30d_pct,
          var_90d_pct: model.market.var_90d_pct,
          fair_value_30d: Math.round(model.market.median_price * 0.95),
          volume_active: model.market.volume,
          rarity_index: Math.max(0, Math.min(1, 1 - (model.market.volume / 300))),
          median_days_to_sell: model.market.median_days_to_sell,
          last_scan_at: new Date().toISOString(),
        },
      };
    },
    enabled: !!modelId,
    retry: false,
  });
}

export function useModelPriceHistory(modelId: string | undefined, period: '7' | '30' | '90' = '30') {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['model-price-history', modelId, period],
    queryFn: async () => {
      if (!modelId) throw new Error('No modelId provided');
      return provider.getModelPriceHistory(modelId, period);
    },
    enabled: !!modelId,
  });
}

export function useModelAds(modelId: string | undefined, page: number = 1, limit: number = 10) {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['model-ads', modelId, page, limit],
    queryFn: async () => {
      if (!modelId) throw new Error('No modelId provided');
      const result = await provider.getModelAds(modelId, page, limit);
      return {
        items: result.items.map(ad => ({
          ...ad,
          ad_id: ad.id,
          fair_value: Math.round(ad.price * 1.1),
          region: 'France',
          publication_date: ad.published_at,
        })),
        total: result.total,
        page: result.page,
        page_size: result.page_size,
        total_pages: Math.ceil(result.total / result.page_size),
      };
    },
    enabled: !!modelId,
  });
}

export function useSimilarModels(modelId: string | undefined, limit: number = 6) {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['similar-models', modelId, limit],
    queryFn: async () => {
      if (!modelId) throw new Error('No modelId provided');
      return provider.getSimilarModels(modelId, limit);
    },
    enabled: !!modelId,
  });
}

export function useToggleModelWatchlist() {
  const provider = useDataProvider();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ modelId, action }: { modelId: number; action: 'add' | 'remove' }) => {
      return provider.toggleModelWatchlist(modelId, action === 'add');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}

export function useCreatePriceAlert() {
  const provider = useDataProvider();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { model_id: number; price_max?: number; variation_min?: number; notify_new_deals?: boolean }) => {
      return provider.createPriceAlert(data.model_id, data.price_max || 0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
