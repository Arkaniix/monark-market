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
  useEstimationHistory,
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
