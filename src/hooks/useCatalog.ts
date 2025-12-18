import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api";

export interface Category {
  id: number;
  name: string;
  count: number;
}

export interface CatalogModel {
  id: number;
  name: string;
  brand: string;
  family: string;
  category: string;
  aliases: string[];
  fair_value_30d: number | null;
  price_median_30d: number | null;
  var_30d_pct: number | null;
  liquidity: number;
  ads_count: number;
  last_scan_at: string | null;
}

export interface CatalogResponse {
  items: CatalogModel[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CatalogFilters {
  category?: string;
  brand?: string;
  family?: string;
  search?: string;
  sort_by?: 'fair_value_30d' | 'var_30d' | 'liquidity' | 'name';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CatalogSummary {
  total_models: number;
  total_ads: number;
  median_price_global: number;
  avg_variation: number;
}

function buildQueryString(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  
  if (filters.category && filters.category !== 'all') {
    params.append('category', filters.category);
  }
  if (filters.brand && filters.brand !== 'all') {
    params.append('brand', filters.brand);
  }
  if (filters.family && filters.family !== 'all') {
    params.append('family', filters.family);
  }
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.sort_by) {
    params.append('sort_by', filters.sort_by);
  }
  if (filters.sort_order) {
    params.append('sort_order', filters.sort_order);
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

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/v1/categories'),
  });
}

export function useBrands(category?: string) {
  return useQuery({
    queryKey: ['brands', category],
    queryFn: () => {
      const params = category && category !== 'all' ? `?category=${category}` : '';
      return apiFetch<string[]>(`/v1/models/brands${params}`);
    },
  });
}

export function useFamilies(brand?: string) {
  return useQuery({
    queryKey: ['families', brand],
    queryFn: () => {
      const params = brand && brand !== 'all' ? `?brand=${brand}` : '';
      return apiFetch<string[]>(`/v1/models/families${params}`);
    },
    enabled: !!brand && brand !== 'all',
  });
}

export function useCatalogModels(filters: CatalogFilters) {
  return useQuery({
    queryKey: ['catalog-models', filters],
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      return apiFetch<CatalogResponse>(`/v1/models${queryString}`);
    },
  });
}

export function useCatalogSummary() {
  return useQuery({
    queryKey: ['catalog-summary'],
    queryFn: () => apiFetch<CatalogSummary>('/v1/models/summary'),
  });
}

export function useAddModelToWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (modelId: number) => {
      return apiPost('/v1/watchlist', {
        target_type: 'model',
        target_id: modelId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}
