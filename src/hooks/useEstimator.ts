import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api";

// Types
export interface ModelAutocomplete {
  id: number;
  name: string;
  brand: string;
  family: string | null;
  category: string;
}

export interface EstimationRequest {
  model_id: number;
  condition: string;
  buy_price_input: number;
  region?: string;
  mode_advanced?: boolean;
}

export interface MarketSnapshot {
  median_price: number;
  var_30d_pct: number;
  volume_active: number;
  rarity_index: number;
  trend: "up" | "down" | "stable";
}

export interface EstimationResult {
  model_id: number;
  model_name: string;
  brand: string;
  category: string;
  condition: string;
  region?: string;
  buy_price_input: number;
  buy_price_recommended: number;
  sell_price_1m: number;
  sell_price_3m?: number;
  margin_pct: number;
  resell_probability: number;
  risk_level: "low" | "medium" | "high";
  advice: string;
  badge: "good" | "caution" | "risk";
  market: MarketSnapshot;
  trend_90d?: number[];
  volume_30d?: number[];
  credit_cost: number;
}

export interface EstimationHistoryItem {
  id: string;
  created_at: string;
  model_id: number;
  model_name: string;
  category: string;
  condition: string;
  buy_price_input: number;
  buy_price_recommended: number;
  sell_price_1m: number;
  margin_pct: number;
  trend: "up" | "down" | "stable";
}

export interface EstimationHistoryResponse {
  items: EstimationHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

// Hooks
export function useModelsAutocomplete(search: string) {
  return useQuery({
    queryKey: ['models-autocomplete', search],
    queryFn: () => apiFetch<ModelAutocomplete[]>(`/v1/models?search=${encodeURIComponent(search)}&limit=20`),
    enabled: search.length >= 2,
    staleTime: 60000, // 1 minute
  });
}

export function useRunEstimation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EstimationRequest) => 
      apiPost<EstimationResult>('/v1/estimator/run', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimation-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    },
  });
}

export function useEstimationHistory(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['estimation-history', page, limit],
    queryFn: () => apiFetch<EstimationHistoryResponse>(`/v1/estimator/history?page=${page}&limit=${limit}`),
  });
}

export function useEstimatorStats() {
  return useQuery({
    queryKey: ['estimator-stats'],
    queryFn: () => apiFetch<{
      last_recalc: string;
      total_estimations: number;
      data_sources: string[];
    }>('/v1/estimator/stats'),
    staleTime: 300000, // 5 minutes
  });
}
