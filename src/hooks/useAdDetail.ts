import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api";

export interface AdComponent {
  role: string;
  model_id: number | null;
  model_name: string;
  brand: string;
  category: string;
}

export interface AdPricePoint {
  id: number;
  price: number;
  seen_at: string;
  price_drop: boolean;
}

export interface AdDetail {
  id: number;
  ad_id: number;
  platform: string;
  platform_ad_id: string;
  url: string;
  title: string;
  description: string | null;
  price: number;
  condition: string | null;
  category: string | null;
  subcategory: string | null;
  city: string | null;
  postal_code: string | null;
  region: string | null;
  delivery_possible: boolean;
  secured_payment: boolean;
  published_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  status: string;
  item_type: 'component' | 'pc' | 'lot';
  model_id: number | null;
  model_name: string | null;
  model_confidence: number | null;
  // Deal score info
  score: number | null;
  fair_value: number | null;
  deviation_pct: number | null;
  // Components for PC/lot
  components: AdComponent[] | null;
}

export interface AdPriceHistory {
  items: AdPricePoint[];
  current_price: number;
  initial_price: number;
  price_drops_count: number;
}

export function useAdDetail(adId: string | undefined) {
  return useQuery({
    queryKey: ['ad-detail', adId],
    queryFn: () => apiFetch<AdDetail>(`/v1/ads/${adId}`),
    enabled: !!adId,
  });
}

export function useAdPriceHistory(adId: string | undefined) {
  return useQuery({
    queryKey: ['ad-price-history', adId],
    queryFn: () => apiFetch<AdPriceHistory>(`/v1/ads/${adId}/prices`),
    enabled: !!adId,
  });
}

export function useAddAdToWatchlist() {
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

export interface CreateAlertPayload {
  target_type: 'ad' | 'model';
  target_id: number;
  alert_type: 'deal_detected' | 'price_below';
  price_threshold?: number;
}

export function useCreateAdAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateAlertPayload) => {
      return apiPost('/v1/alerts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
