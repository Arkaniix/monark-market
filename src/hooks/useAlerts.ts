import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost, apiPut, apiDelete } from "@/lib/api";

export interface Alert {
  id: number;
  target_type: 'ad' | 'model';
  target_id: number;
  alert_type: 'deal_detected' | 'price_below' | 'price_above';
  price_threshold?: number;
  is_active: boolean;
  created_at: string;
  last_triggered_at?: string;
  // Enriched data
  target_name?: string;
  target_category?: string;
  current_price?: number;
}

export interface AlertsResponse {
  items: Alert[];
  total: number;
}

export interface CreateAlertPayload {
  target_type: 'ad' | 'model';
  target_id: number;
  alert_type: 'deal_detected' | 'price_below' | 'price_above';
  price_threshold?: number;
}

export interface UpdateAlertPayload {
  alert_type?: 'deal_detected' | 'price_below' | 'price_above';
  price_threshold?: number;
  is_active?: boolean;
}

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiFetch<AlertsResponse>('/v1/alerts'),
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateAlertPayload) => {
      return apiPost('/v1/alerts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAlertPayload }) => {
      return apiPut(`/v1/alerts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return apiDelete(`/v1/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
