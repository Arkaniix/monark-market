// Re-export from provider-based hooks for backward compatibility
export {
  useTrends,
  useTrainingData,
  useCompleteModule,
  useDeals,
  useMarketSummary,
  useCategories,
  useBrands,
  useFamilies,
  useCatalogModels,
  useCatalogSummary,
  useAddModelToWatchlist,
  useModelDetail,
  useModelPriceHistory,
  useModelAds,
  useToggleModelWatchlist,
  useCreatePriceAlert,
  useAdDetail,
  useAdPriceHistory,
  useAddAdToWatchlist,
  useCreateAdAlert,
  useModelsAutocomplete,
  useRunEstimation,
  useEstimationHistory as useEstimationHistoryLegacy,
  useEstimatorStats,
  useAvailableTasks,
  useMyTasks,
  useClaimTask,
  useCommunityStats,
  useLeaderboard,
  useStartScrap,
  useJobStatus,
  useCancelJob,
  useUserJobs,
  useUserCredits,
} from "./useProviderData";

// Models Search - autocomplete with debounce, abort, timeout
export {
  useModelsSearch,
  type SearchState,
  type UseModelsSearchResult,
} from "./useModelsSearch";

// Estimation History - with state management, retry, refresh (legacy from useEstimationHistory.ts)
export {
  useEstimationHistory,
  type EstimationHistoryItem,
  type EstimationHistoryResponse,
  type HistoryState,
} from "./useEstimationHistory";

// Enhanced Estimation History (v2 - with full result storage)
export {
  useEnhancedEstimation,
  useEnhancedEstimationHistory,
  useEnhancedEstimatorStats,
  useClearEstimationHistory,
  DEFAULT_ESTIMATION_OPTIONS,
} from "./useEnhancedEstimator";

export type {
  EnhancedEstimationResult,
  EnhancedEstimationHistoryItem,
  EstimationOptions,
} from "@/types/estimator";

// Entitlements - single source of truth for user permissions
export {
  useEntitlements,
  useCanCreateAlert,
  useCanScrap,
  useCanAddToWatchlist,
  useCanExport,
  CREDIT_COSTS,
  getActionCost,
  type PlanType,
  type ScrapType,
  type CreditActionType,
  type PlanLimits,
  type Entitlements,
} from "./useEntitlements";

// Credits - centralized credit management
export {
  useCredits,
  CREDIT_RESET_EXPLANATION,
  type CreditCheckResult,
  type CreditResetInfo,
  type UseCreditActionResult,
} from "./useCredits";

// Community Credits - gains from community scraps
export {
  useCommunityCredits,
  calculateCreditGain,
  getCreditGainDescription,
  calculateFreshnessBonus,
  BASE_REWARD,
  MAX_CREDITS_PER_SCRAP,
  PRIORITY_BONUS,
  type CreditGainCalculation,
  type CreditGainBreakdown,
  type CommunityTaskWithReward,
  type CreditEarnedEvent,
} from "./useCommunityCredits";
