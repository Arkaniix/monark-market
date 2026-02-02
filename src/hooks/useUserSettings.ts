import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPut } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { UserSettings, UpdateUserSettingsPayload } from "@/types/userSettings";

/**
 * Hook to fetch current user settings
 */
export function useUserSettings() {
  return useQuery({
    queryKey: ['userSettings'],
    queryFn: () => apiFetch<UserSettings>(ENDPOINTS.USERS.SETTINGS),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update user settings
 */
export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserSettingsPayload) => 
      apiPut<UserSettings>(ENDPOINTS.USERS.UPDATE_SETTINGS, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['userSettings'], data);
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });
}

// Default settings for new users / fallback
export const defaultUserSettings: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'system',
  locale: 'fr',
  notify_email: true,
  notify_push: true,
  notify_discord: false,
  alert_default_cooldown_hours: 24,
  alert_platforms: ['leboncoin', 'vinted', 'ebay'],
  alert_regions: [],
  default_category: null,
  default_sort: 'score',
  items_per_page: 20,
};
