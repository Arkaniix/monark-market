import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPut, apiDelete } from "@/lib/api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export interface NotificationsResponse {
  items: Notification[];
  total: number;
  unread_count: number;
}

export function useNotifications(limit?: number) {
  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: () => {
      const params = limit ? `?limit=${limit}` : '';
      return apiFetch<NotificationsResponse>(`/v1/users/notifications${params}`);
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiPut(`/v1/users/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiPut('/v1/users/notifications/read-all', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(`/v1/users/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
