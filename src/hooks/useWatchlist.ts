import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost, apiDelete } from "@/lib/api";

export interface WatchlistEntry {
  id: number;
  target_type: 'ad' | 'model';
  target_id: number;
  created_at: string;
  // Enriched data from backend
  name?: string;
  brand?: string;
  category?: string;
  current_price?: number;
  price_change_7d?: number;
  fair_value?: number;
}

export interface WatchlistResponse {
  items: WatchlistEntry[];
  total: number;
}

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: () => apiFetch<WatchlistResponse>('/v1/watchlist'),
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { target_type: 'ad' | 'model'; target_id: number }) => {
      return apiPost('/v1/watchlist', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return apiDelete(`/v1/watchlist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
