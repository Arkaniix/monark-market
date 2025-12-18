import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api";

export interface DealItem {
  id: number;
  ad_id: number;
  title: string;
  price: number;
  fair_value: number;
  score: number;
  deviation_pct: number;
  platform: string;
  city: string;
  region: string;
  condition: string;
  category: string;
  item_type: 'component' | 'pc' | 'lot';
  delivery_possible: boolean;
  publication_date: string;
  url: string;
}

export interface DealsResponse {
  items: DealItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DealsFilters {
  platform?: string;
  region?: string;
  item_type?: string;
  condition?: string;
  price_min?: number;
  price_max?: number;
  sort_by?: 'score' | 'price_asc' | 'price_desc' | 'date';
  page?: number;
  limit?: number;
}

export interface MarketSummary {
  median_price_7d: number;
  price_variation: number;
  total_active_ads: number;
  new_deals_today: number;
}

function buildQueryString(filters: DealsFilters): string {
  const params = new URLSearchParams();
  
  if (filters.platform && filters.platform !== 'all') {
    params.append('platform', filters.platform);
  }
  if (filters.region && filters.region !== 'all') {
    params.append('region', filters.region);
  }
  if (filters.item_type && filters.item_type !== 'all') {
    params.append('item_type', filters.item_type);
  }
  if (filters.condition && filters.condition !== 'all') {
    params.append('condition', filters.condition);
  }
  if (filters.price_min !== undefined && filters.price_min > 0) {
    params.append('price_min', filters.price_min.toString());
  }
  if (filters.price_max !== undefined && filters.price_max < 10000) {
    params.append('price_max', filters.price_max.toString());
  }
  if (filters.sort_by) {
    params.append('sort_by', filters.sort_by);
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export function useDeals(filters: DealsFilters) {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      return apiFetch<DealsResponse>(`/v1/deals${queryString}`);
    },
  });
}

export function useMarketSummary() {
  return useQuery({
    queryKey: ['market-summary'],
    queryFn: () => apiFetch<MarketSummary>('/v1/deals/summary'),
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (adId: number) => {
      return apiPost('/v1/watchlist', {
        target_type: 'ad',
        target_id: adId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}
