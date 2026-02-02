import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost, apiPut, apiDelete } from "@/lib/api";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { 
  SavedSearch, 
  SavedSearchesResponse, 
  CreateSavedSearchPayload, 
  UpdateSavedSearchPayload 
} from "@/types/userSettings";

/**
 * Hook to fetch all saved searches for current user
 */
export function useSavedSearches() {
  return useQuery({
    queryKey: ['savedSearches'],
    queryFn: () => apiFetch<SavedSearchesResponse>(ENDPOINTS.USERS.SAVED_SEARCHES),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single saved search by ID
 */
export function useSavedSearch(id: number) {
  return useQuery({
    queryKey: ['savedSearches', id],
    queryFn: () => apiFetch<SavedSearch>(ENDPOINTS.USERS.SAVED_SEARCH_DETAIL(id)),
    enabled: !!id,
  });
}

/**
 * Hook to create a new saved search
 */
export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSavedSearchPayload) => 
      apiPost<SavedSearch>(ENDPOINTS.USERS.SAVED_SEARCHES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
    },
  });
}

/**
 * Hook to update an existing saved search
 */
export function useUpdateSavedSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSavedSearchPayload }) => 
      apiPut<SavedSearch>(ENDPOINTS.USERS.SAVED_SEARCH_DETAIL(id), data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
      queryClient.invalidateQueries({ queryKey: ['savedSearches', id] });
    },
  });
}

/**
 * Hook to delete a saved search
 */
export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      apiDelete(ENDPOINTS.USERS.SAVED_SEARCH_DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
    },
  });
}

/**
 * Hook to run a saved search (get results)
 */
export function useRunSavedSearch() {
  return useMutation({
    mutationFn: async (id: number) => {
      // This will call the appropriate endpoint based on search_type
      const search = await apiFetch<SavedSearch>(ENDPOINTS.USERS.SAVED_SEARCH_DETAIL(id));
      
      // Build query params from filters
      const params = new URLSearchParams();
      Object.entries(search.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      // Route to appropriate list endpoint
      const endpoint = search.search_type === 'deals' 
        ? `/v1/deals?${params.toString()}`
        : search.search_type === 'catalog'
        ? `/v1/models?${params.toString()}`
        : `/v1/ads?${params.toString()}`;
      
      return apiFetch(endpoint);
    },
  });
}
