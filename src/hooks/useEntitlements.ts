// Centralized entitlements hook - single source of truth for user permissions
import { useMemo } from "react";
import { useUserCredits, useUserSubscription, useAlerts, useWatchlist } from "./useProviderData";

// ============= Types =============
export type PlanType = "free" | "standard" | "pro";
export type AnalysisType = "quick" | "deep" | "passive";
export type CreditActionType = "analysis_quick" | "analysis_deep" | "estimator" | "alert" | "export";

// Legacy aliases for backward compatibility
export type ScrapType = AnalysisType;

// Credit costs per action type
export const CREDIT_COSTS: Record<CreditActionType, number> = {
  analysis_quick: 5,
  analysis_deep: 20,
  estimator: 3,
  alert: 0, // Free
  export: 0, // Free but plan-gated
};

export interface EstimatorFeatures {
  // Starter visible
  canSeeMedianPrice: boolean;
  canSeeVariation30d: boolean;
  canSeeVolume: boolean;
  canSeeOpportunityLabel: boolean;
  // Pro+ visible
  canSeeBuyPrice: boolean;
  canSeeSellPrice: boolean;
  canSeeMargin: boolean;
  canSeeProbability: boolean;
  // Elite only
  canSeeScenarios: boolean;
  canExportEstimation: boolean;
  canSeeExtendedHistory: boolean;
  canSeeAdvancedIndicators: boolean;
  chartInteractive: boolean;
  chartPeriods: ('7' | '30' | '90')[];
}

export interface PlanLimits {
  maxAlerts: number;
  maxWatchlistItems: number;
  maxEstimationsPerDay: number;
  maxScrapPagesPerJob: number;
  maxJobsPerDay: number;
  canScrapStrong: boolean;
  canExport: boolean;
  canAccessAdvancedStats: boolean;
  canAccessPrioritySupport: boolean;
  canAccessApiAccess: boolean;
  canAccessTraining: boolean;
  // Data access permissions
  canAccessAdsDatabase: boolean;
  canAccessCatalog: boolean;
  // Estimator-specific permissions
  estimator: EstimatorFeatures;
}

export interface EntitlementHelpers {
  canUseEstimator: () => boolean;
  canAnalyze: (type: AnalysisType) => boolean;
  /** @deprecated Use canAnalyze instead */
  canScrap: (type: AnalysisType) => boolean;
  canCreateAlert: () => boolean;
  canActivateAlert: () => boolean;
  getActiveAlertsCount: () => number;
  canAddToWatchlist: () => boolean;
  canExportData: () => boolean;
  canAccessAdvancedStats: () => boolean;
  canAccessTraining: () => boolean;
  canAccessAdsDatabase: () => boolean;
  canAccessCatalog: () => boolean;
  hasEnoughCredits: (required: number) => boolean;
  getAnalysisCost: (type: AnalysisType) => number;
  /** @deprecated Use getAnalysisCost instead */
  getScrapCost: (type: AnalysisType, pages: number) => number;
}

export interface Entitlements {
  // Core data
  plan: PlanType;
  planDisplayName: string;
  creditsRemaining: number;
  creditsResetDate: string | null;
  
  // Current usage
  currentAlerts: number;
  currentWatchlistItems: number;
  
  // Limits based on plan
  limits: PlanLimits;
  
  // Helper functions
  helpers: EntitlementHelpers;
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
}

// ============= Plan Configuration =============
// Free: 0€/mois, 20 crédits (découverte Lens)
// Standard: 11.99€/mois, 200 crédits, 10 alertes
// Pro: 24.99€/mois, 800 crédits, 100 alertes

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxAlerts: 0,
    maxWatchlistItems: 0,
    maxEstimationsPerDay: 0,
    maxScrapPagesPerJob: 0,
    maxJobsPerDay: 0,
    canScrapStrong: false,
    canExport: false,
    canAccessAdvancedStats: false,
    canAccessPrioritySupport: false,
    canAccessApiAccess: false,
    canAccessTraining: false,
    canAccessAdsDatabase: false,
    canAccessCatalog: true,
    estimator: {
      canSeeMedianPrice: false,
      canSeeVariation30d: false,
      canSeeVolume: false,
      canSeeOpportunityLabel: false,
      canSeeBuyPrice: false,
      canSeeSellPrice: false,
      canSeeMargin: false,
      canSeeProbability: false,
      canSeeScenarios: false,
      canExportEstimation: false,
      canSeeExtendedHistory: false,
      canSeeAdvancedIndicators: false,
      chartInteractive: false,
      chartPeriods: [],
    },
  },
  standard: {
    maxAlerts: 10,
    maxWatchlistItems: 15,
    maxEstimationsPerDay: 66,
    maxScrapPagesPerJob: 0,
    maxJobsPerDay: 0,
    canScrapStrong: false,
    canExport: false,
    canAccessAdvancedStats: true,
    canAccessPrioritySupport: false,
    canAccessApiAccess: false,
    canAccessTraining: true,
    canAccessAdsDatabase: true,
    canAccessCatalog: true,
    estimator: {
      canSeeMedianPrice: true,
      canSeeVariation30d: true,
      canSeeVolume: true,
      canSeeOpportunityLabel: true,
      canSeeBuyPrice: true,
      canSeeSellPrice: true,
      canSeeMargin: true,
      canSeeProbability: true,
      canSeeScenarios: false,
      canExportEstimation: false,
      canSeeExtendedHistory: false,
      canSeeAdvancedIndicators: false,
      chartInteractive: true,
      chartPeriods: ['30', '90'],
    },
  },
  pro: {
    maxAlerts: 100,
    maxWatchlistItems: 999,
    maxEstimationsPerDay: -1,
    maxScrapPagesPerJob: 0,
    maxJobsPerDay: 0,
    canScrapStrong: false,
    canExport: true,
    canAccessAdvancedStats: true,
    canAccessPrioritySupport: true,
    canAccessApiAccess: true,
    canAccessTraining: true,
    canAccessAdsDatabase: true,
    canAccessCatalog: true,
    estimator: {
      canSeeMedianPrice: true,
      canSeeVariation30d: true,
      canSeeVolume: true,
      canSeeOpportunityLabel: true,
      canSeeBuyPrice: true,
      canSeeSellPrice: true,
      canSeeMargin: true,
      canSeeProbability: true,
      canSeeScenarios: true,
      canExportEstimation: true,
      canSeeExtendedHistory: true,
      canSeeAdvancedIndicators: true,
      chartInteractive: true,
      chartPeriods: ['7', '30', '90'],
    },
  },
};

const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  free: "Free",
  standard: "Standard",
  pro: "Pro",
};

// ============= Analysis Cost Configuration =============
const ANALYSIS_COSTS: Record<AnalysisType, number> = {
  quick: CREDIT_COSTS.analysis_quick,
  deep: CREDIT_COSTS.analysis_deep,
  passive: 0, // Passive navigation earns credits
};

// Helper to get action cost
export function getActionCost(action: CreditActionType): number {
  return CREDIT_COSTS[action];
}

// ============= Helper to normalize plan name =============
function normalizePlanName(planName: string | undefined | null): PlanType {
  if (!planName) return "free";
  
  const normalized = planName.toLowerCase().trim();
  
  if (normalized.includes("pro")) return "pro";
  if (normalized.includes("standard")) return "standard";
  // Rétrocompatibilité avec les anciens plans
  if (normalized.includes("elite") || normalized.includes("élite")) return "pro";
  if (normalized.includes("starter")) return "standard";
  if (normalized.includes("free") || normalized === "") return "free";
  return "free";
}

// ============= Main Hook =============
export function useEntitlements(): Entitlements {
  // Fetch data from providers
  const { data: credits, isLoading: creditsLoading, isError: creditsError } = useUserCredits();
  const { data: subscription, isLoading: subLoading, isError: subError } = useUserSubscription();
  const { data: alertsData, isLoading: alertsLoading } = useAlerts();
  const { data: watchlistData, isLoading: watchlistLoading } = useWatchlist();
  
  // Derive plan from subscription or credits
  const plan = useMemo<PlanType>(() => {
    if (subscription?.plan?.name) {
      return normalizePlanName(subscription.plan.name);
    }
    if (credits?.plan_name) {
      return normalizePlanName(credits.plan_name);
    }
    return "free";
  }, [subscription, credits]);
  
  // Get limits for current plan
  const limits = useMemo(() => PLAN_LIMITS[plan], [plan]);
  
  // Current usage counts
  const currentAlerts = alertsData?.items?.length ?? 0;
  const currentWatchlistItems = watchlistData?.items?.length ?? 0;
  const creditsRemaining = credits?.credits_remaining ?? 0;
  const creditsResetDate = credits?.credits_reset_date ?? subscription?.credits_reset_date ?? null;
  
  // Count only active alerts
  const activeAlertsCount = useMemo(() => {
    return alertsData?.items?.filter(a => a.is_active)?.length ?? 0;
  }, [alertsData]);

  // Create helper functions
  const helpers = useMemo<EntitlementHelpers>(() => ({
    canUseEstimator: () => {
      if (plan === "free") return false;
      return creditsRemaining > 0 || limits.maxEstimationsPerDay === -1;
    },
    
    canAnalyze: (type: AnalysisType) => {
      if (type === "deep" && !limits.canScrapStrong) return false;
      if (type === "passive") return true;
      const cost = ANALYSIS_COSTS[type];
      return creditsRemaining >= cost;
    },

    // Legacy alias
    canScrap: (type: AnalysisType) => {
      if (type === "deep" && !limits.canScrapStrong) return false;
      if (type === "passive") return true;
      const cost = ANALYSIS_COSTS[type];
      return creditsRemaining >= cost;
    },
    
    canCreateAlert: () => {
      if (limits.maxAlerts === 0) return false;
      if (limits.maxAlerts === -1) return true;
      return currentAlerts < limits.maxAlerts;
    },

    canActivateAlert: () => {
      if (limits.maxAlerts === 0) return false;
      if (limits.maxAlerts === -1) return true;
      return activeAlertsCount < limits.maxAlerts;
    },

    getActiveAlertsCount: () => activeAlertsCount,
    
    canAddToWatchlist: () => {
      if (limits.maxWatchlistItems === 0) return false;
      if (limits.maxWatchlistItems === -1) return true;
      return currentWatchlistItems < limits.maxWatchlistItems;
    },
    
    canExportData: () => limits.canExport,
    
    canAccessAdvancedStats: () => limits.canAccessAdvancedStats,
    
    canAccessTraining: () => limits.canAccessTraining,
    
    canAccessAdsDatabase: () => limits.canAccessAdsDatabase,
    
    canAccessCatalog: () => limits.canAccessCatalog,
    
    hasEnoughCredits: (required: number) => creditsRemaining >= required,
    
    getAnalysisCost: (type: AnalysisType) => ANALYSIS_COSTS[type],

    // Legacy alias
    getScrapCost: (type: AnalysisType, _pages: number) => ANALYSIS_COSTS[type],
  }), [creditsRemaining, limits, currentAlerts, currentWatchlistItems, activeAlertsCount, plan]);
  
  return {
    plan,
    planDisplayName: PLAN_DISPLAY_NAMES[plan],
    creditsRemaining,
    creditsResetDate,
    currentAlerts,
    currentWatchlistItems,
    limits,
    helpers,
    isLoading: creditsLoading || subLoading || alertsLoading || watchlistLoading,
    isError: creditsError || subError,
  };
}

// ============= Convenience hooks for specific checks =============
export function useCanCreateAlert(): { allowed: boolean; reason?: string; isLoading: boolean } {
  const { helpers, limits, currentAlerts, isLoading } = useEntitlements();
  
  if (isLoading) {
    return { allowed: false, isLoading: true };
  }
  
  if (!helpers.canCreateAlert()) {
    return {
      allowed: false,
      reason: limits.maxAlerts === 0 
        ? "Les alertes nécessitent un plan Standard ou supérieur."
        : `Limite atteinte (${currentAlerts}/${limits.maxAlerts} alertes). Passez au plan supérieur.`,
      isLoading: false,
    };
  }
  
  return { allowed: true, isLoading: false };
}

export function useCanAnalyze(type: AnalysisType): { allowed: boolean; reason?: string; cost: number; isLoading: boolean } {
  const { helpers, limits, creditsRemaining, isLoading } = useEntitlements();
  const cost = helpers.getAnalysisCost(type);
  
  if (isLoading) {
    return { allowed: false, cost, isLoading: true };
  }
  
  if (type === "deep" && !limits.canScrapStrong) {
    return {
      allowed: false,
      reason: "L'analyse approfondie nécessite un plan Pro ou supérieur.",
      cost,
      isLoading: false,
    };
  }
  
  if (!helpers.canAnalyze(type)) {
    return {
      allowed: false,
      reason: `Crédits insuffisants (${creditsRemaining} restants, ${cost} requis).`,
      cost,
      isLoading: false,
    };
  }
  
  return { allowed: true, cost, isLoading: false };
}

/** @deprecated Use useCanAnalyze instead */
export const useCanScrap = useCanAnalyze;

export function useCanAddToWatchlist(): { allowed: boolean; reason?: string; isLoading: boolean } {
  const { helpers, limits, currentWatchlistItems, isLoading } = useEntitlements();
  
  if (isLoading) {
    return { allowed: false, isLoading: true };
  }
  
  if (!helpers.canAddToWatchlist()) {
    return {
      allowed: false,
      reason: limits.maxWatchlistItems === 0
        ? "La watchlist nécessite un plan Standard ou supérieur."
        : `Limite atteinte (${currentWatchlistItems}/${limits.maxWatchlistItems} items). Passez au plan supérieur.`,
      isLoading: false,
    };
  }
  
  return { allowed: true, isLoading: false };
}

export function useCanExport(): { allowed: boolean; reason?: string; isLoading: boolean } {
  const { helpers, isLoading } = useEntitlements();
  
  if (isLoading) {
    return { allowed: false, isLoading: true };
  }
  
  if (!helpers.canExportData()) {
    return {
      allowed: false,
      reason: "L'export de données nécessite un plan Pro.",
      isLoading: false,
    };
  }
  
  return { allowed: true, isLoading: false };
}
