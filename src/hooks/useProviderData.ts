// Provider-based hooks using React Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataProvider } from "@/providers";
import type {
  DealsFilters,
  CatalogFilters,
  CreateAlertPayload,
  UpdateAlertPayload,
  EstimationRequest,
  ScrapStartRequest,
  ClaimTaskRequest,
} from "@/providers/types";

// ============= Dashboard =============
export function useDashboard() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => provider.getDashboard(),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

// ============= Watchlist =============
export function useWatchlist() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: () => provider.getWatchlist(),
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (data: { target_type: "ad" | "model"; target_id: number }) =>
      provider.addToWatchlist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (id: number) => provider.removeFromWatchlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ============= Alerts =============
export function useAlerts() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => provider.getAlerts(),
    enabled: true,
    retry: 1,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (data: CreateAlertPayload) => provider.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAlertPayload }) =>
      provider.updateAlert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (id: number) => provider.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ============= Notifications =============
export function useNotifications(limit?: number) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => provider.getNotifications(limit),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (id: string) => provider.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: () => provider.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (id: string) => provider.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ============= Deals =============
export function useDeals(filters: DealsFilters) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["deals", filters],
    queryFn: () => provider.getDeals(filters),
  });
}

export function useMarketSummary() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["market", "summary"],
    queryFn: () => provider.getMarketSummary(),
  });
}

// ============= Catalog =============
export function useCategories() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: () => provider.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 min
  });
}

export function useManufacturers(category?: string) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["catalog", "manufacturers", category],
    queryFn: () => provider.getManufacturers(category),
    staleTime: 1000 * 60 * 30,
  });
}

export function useBrands(category?: string) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["catalog", "brands", category],
    queryFn: () => provider.getBrands(category),
    staleTime: 1000 * 60 * 30,
  });
}

export function useFamilies(manufacturer?: string) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["catalog", "families", manufacturer],
    queryFn: () => provider.getFamilies(manufacturer),
    enabled: !!manufacturer && manufacturer !== 'all',
    staleTime: 1000 * 60 * 30,
  });
}

export function useCatalogModels(filters: CatalogFilters) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["catalog", "models", filters],
    queryFn: () => provider.getCatalogModels(filters),
  });
}

export function useCatalogSummary() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["catalog", "summary"],
    queryFn: () => provider.getCatalogSummary(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAddModelToWatchlist() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (modelId: number) =>
      provider.addToWatchlist({ target_type: "model", target_id: modelId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

// ============= Model Detail =============
export function useModelDetail(modelId: string | undefined) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["model", modelId],
    queryFn: () => provider.getModelDetail(modelId!),
    enabled: !!modelId,
  });
}

export function useModelPriceHistory(
  modelId: string | undefined,
  period?: "7" | "30" | "90"
) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["model", modelId, "price-history", period],
    queryFn: () => provider.getModelPriceHistory(modelId!, period),
    enabled: !!modelId,
  });
}

export function useModelAds(
  modelId: string | undefined,
  page?: number,
  limit?: number
) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["model", modelId, "ads", page, limit],
    queryFn: () => provider.getModelAds(modelId!, page, limit),
    enabled: !!modelId,
  });
}

export function useToggleModelWatchlist() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: ({ modelId, add }: { modelId: number; add: boolean }) =>
      provider.toggleModelWatchlist(modelId, add),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["model"] });
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

export function useCreatePriceAlert() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: ({ modelId, threshold }: { modelId: number; threshold: number }) =>
      provider.createPriceAlert(modelId, threshold),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

// ============= Ad Detail =============
export function useAdDetail(adId: string | undefined) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["ad", adId],
    queryFn: () => provider.getAdDetail(adId!),
    enabled: !!adId,
  });
}

export function useAdPriceHistory(adId: string | undefined) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["ad", adId, "price-history"],
    queryFn: () => provider.getAdPriceHistory(adId!),
    enabled: !!adId,
  });
}

export function useAddAdToWatchlist() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (adId: number) =>
      provider.addToWatchlist({ target_type: "ad", target_id: adId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["ad"] });
    },
  });
}

export function useCreateAdAlert() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (data: CreateAlertPayload) => provider.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

// ============= Estimator =============
export function useModelsAutocomplete(search: string) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["models", "autocomplete", search],
    queryFn: () => provider.getModelsAutocomplete(search),
    enabled: search.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRunEstimation() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (data: EstimationRequest) => provider.runEstimation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimator", "history"] });
      queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
    },
  });
}

export function useEstimationHistory(page?: number, limit?: number) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["estimator", "history", page, limit],
    queryFn: () => provider.getEstimationHistory(page, limit),
  });
}

export function useEstimatorStats() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["estimator", "stats"],
    queryFn: () => provider.getEstimatorStats(),
    staleTime: 1000 * 60 * 5,
  });
}

// ============= Community =============
export function useAvailableTasks() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["community", "tasks"],
    queryFn: () => provider.getAvailableTasks(),
  });
}

export function useMyTasks() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["community", "my-tasks"],
    queryFn: () => provider.getMyTasks(),
  });
}

export function useClaimTask() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (data: ClaimTaskRequest) => provider.claimTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community"] });
    },
  });
}

export function useCommunityStats() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["community", "stats"],
    queryFn: () => provider.getCommunityStats(),
  });
}

export function useLeaderboard(period: "30d" | "all" = "30d") {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["community", "leaderboard", period],
    queryFn: () => provider.getLeaderboard(period),
  });
}

// ============= Trends =============
export function useTrends(period: "7" | "30" | "90" | "180" = "30") {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["trends", period],
    queryFn: () => provider.getTrends(period),
    staleTime: 1000 * 60 * 10,
  });
}

// ============= Training =============
export function useTrainingData() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["training"],
    queryFn: () => provider.getTrainingData(),
  });
}

export function useCompleteModule() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (moduleId: number) => provider.completeModule(moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training"] });
      queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ============= Jobs =============
export function useStartScrap() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (data: ScrapStartRequest) => provider.startScrap(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
    },
  });
}

export function useJobStatus(
  jobId: number | null,
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["jobs", jobId],
    queryFn: () => provider.getJobStatus(jobId!),
    enabled: options?.enabled !== false && jobId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "done" || status === "failed" || status === "cancelled") {
        return false;
      }
      return options?.refetchInterval ?? 2000;
    },
  });
}

export function useCancelJob() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (jobId: number) => provider.cancelJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUserJobs(limit: number = 10) {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["jobs", "user", limit],
    queryFn: () => provider.getUserJobs(limit),
  });
}

// ============= User =============
export function useUserCredits() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["user", "credits"],
    queryFn: () => provider.getUserCredits(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSubscriptionPlans() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["subscriptions", "plans"],
    queryFn: () => provider.getSubscriptionPlans(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useUserSubscription() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["subscriptions", "current"],
    queryFn: () => provider.getUserSubscription(),
  });
}

export function useSubscriptionHistory() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["subscriptions", "history"],
    queryFn: () => provider.getSubscriptionHistory(),
  });
}

export function useUserProfile() {
  const provider = useDataProvider();
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => provider.getUserProfile(),
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  const provider = useDataProvider();
  return useMutation({
    mutationFn: (planId: string) => provider.subscribe(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
