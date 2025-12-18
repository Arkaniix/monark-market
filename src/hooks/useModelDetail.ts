import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api";

export interface ModelSpecs {
  vram_gb?: number;
  tdp_w?: number;
  memory_type?: string;
  bus_width_bit?: number;
  chip?: string;
  release_date?: string;
  outputs_count?: number;
  specs_json?: Record<string, unknown>;
}

export interface ModelDetail {
  id: number;
  name: string;
  brand: string;
  family: string;
  category: string;
  aliases: string[];
  specs: ModelSpecs | null;
  kpi: {
    median_30d: number;
    var_7d_pct: number;
    var_30d_pct: number;
    var_90d_pct: number;
    fair_value_30d: number;
    volume_active: number;
    rarity_index: number;
    median_days_to_sell: number;
    last_scan_at: string;
  };
}

export interface PriceHistoryPoint {
  date: string;
  price_median: number;
  price_p25: number;
  price_p75: number;
  ads_count: number;
}

export interface ModelAd {
  id: number;
  ad_id: number;
  title: string;
  price: number;
  fair_value: number;
  score: number;
  city: string;
  region: string;
  condition: string;
  platform: string;
  publication_date: string;
  url: string;
}

export interface ModelAdsResponse {
  items: ModelAd[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export function useModelDetail(modelId: string | undefined) {
  return useQuery({
    queryKey: ['model-detail', modelId],
    queryFn: () => apiFetch<ModelDetail>(`/v1/models/${modelId}`),
    enabled: !!modelId,
  });
}

export function useModelPriceHistory(modelId: string | undefined, period: '7' | '30' | '90' = '30') {
  return useQuery({
    queryKey: ['model-price-history', modelId, period],
    queryFn: () => apiFetch<PriceHistoryPoint[]>(`/v1/market/history?model_id=${modelId}&period=${period}`),
    enabled: !!modelId,
  });
}

export function useModelAds(modelId: string | undefined, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['model-ads', modelId, page, limit],
    queryFn: () => apiFetch<ModelAdsResponse>(`/v1/ads?model_id=${modelId}&page=${page}&limit=${limit}`),
    enabled: !!modelId,
  });
}

export function useToggleModelWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ modelId, action }: { modelId: number; action: 'add' | 'remove' }) => {
      if (action === 'add') {
        return apiPost('/v1/watchlist', {
          target_type: 'model',
          target_id: modelId,
        });
      } else {
        return apiFetch(`/v1/watchlist/model/${modelId}`, { method: 'DELETE' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}

export function useCreatePriceAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      model_id: number;
      price_max?: number;
      variation_min?: number;
      notify_new_deals?: boolean;
    }) => {
      return apiPost('/v1/alerts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
