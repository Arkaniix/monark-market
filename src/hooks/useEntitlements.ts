// Centralized entitlements hook - single source of truth for user permissions
import { useMemo } from "react";
import { useUserCredits, useUserSubscription, useAlerts, useWatchlist } from "./useProviderData";

// ============= Types =============
export type PlanType = "starter" | "pro" | "elite";
export type ScrapType = "faible" | "fort" | "communautaire";
export type CreditActionType = "scrap_faible" | "scrap_fort" | "estimator" | "alert" | "export";

// Credit costs per action type
export const CREDIT_COSTS: Record<CreditActionType, number> = {
  scrap_faible: 5,
  scrap_fort: 20,
  estimator: 3,
  alert: 0, // Free
  export: 0, // Free but plan-gated
};

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
  // Estimator-specific permissions
  estimator: {
    canSeeBuyPrice: boolean;
    canSeeSellPrice: boolean;
    canSeeMargin: boolean;
    canSeeProbability: boolean;
    canSeeScenarios: boolean;
    canExportEstimation: boolean;
    chartInteractive: boolean;
    chartPeriods: ('7' | '30' | '90')[];
  };
}

export interface EntitlementHelpers {
  canUseEstimator: () => boolean;
  canScrap: (type: ScrapType) => boolean;
  canCreateAlert: () => boolean;
  canAddToWatchlist: () => boolean;
  canExportData: () => boolean;
  canAccessAdvancedStats: () => boolean;
  hasEnoughCredits: (required: number) => boolean;
  getScrapCost: (type: ScrapType, pages: number) => number;
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
const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  starter: {
    maxAlerts: 3,
    maxWatchlistItems: 10,
    maxEstimationsPerDay: 5,
    maxScrapPagesPerJob: 10,
    maxJobsPerDay: 3,
    canScrapStrong: false,
    canExport: false,
    canAccessAdvancedStats: false,
    canAccessPrioritySupport: false,
    canAccessApiAccess: false,
    estimator: {
      canSeeBuyPrice: false,
      canSeeSellPrice: false,
      canSeeMargin: false,
      canSeeProbability: false,
      canSeeScenarios: false,
      canExportEstimation: false,
      chartInteractive: false,
      chartPeriods: [],
    },
  },
  pro: {
    maxAlerts: 20,
    maxWatchlistItems: 50,
    maxEstimationsPerDay: 50,
    maxScrapPagesPerJob: 50,
    maxJobsPerDay: 10,
    canScrapStrong: true,
    canExport: true,
    canAccessAdvancedStats: true,
    canAccessPrioritySupport: false,
    canAccessApiAccess: false,
    estimator: {
      canSeeBuyPrice: true,
      canSeeSellPrice: true,
      canSeeMargin: true,
      canSeeProbability: true,
      canSeeScenarios: false,
      canExportEstimation: false,
      chartInteractive: true,
      chartPeriods: ['30', '90'],
    },
  },
  elite: {
    maxAlerts: 100,
    maxWatchlistItems: 200,
    maxEstimationsPerDay: -1, // unlimited
    maxScrapPagesPerJob: 100,
    maxJobsPerDay: -1, // unlimited
    canScrapStrong: true,
    canExport: true,
    canAccessAdvancedStats: true,
    canAccessPrioritySupport: true,
    canAccessApiAccess: true,
    estimator: {
      canSeeBuyPrice: true,
      canSeeSellPrice: true,
      canSeeMargin: true,
      canSeeProbability: true,
      canSeeScenarios: true,
      canExportEstimation: true,
      chartInteractive: true,
      chartPeriods: ['7', '30', '90'],
    },
  },
};

const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  starter: "Starter",
  pro: "Pro",
  elite: "Élite",
};

// ============= Scrap Cost Configuration (legacy - kept for compatibility) =============
const SCRAP_COSTS: Record<ScrapType, { base: number; perPage: number }> = {
  faible: { base: CREDIT_COSTS.scrap_faible, perPage: 0 },
  fort: { base: CREDIT_COSTS.scrap_fort, perPage: 0 },
  communautaire: { base: 0, perPage: 0 }, // Free but limited
};

// Helper to get action cost
export function getActionCost(action: CreditActionType): number {
  return CREDIT_COSTS[action];
}

// ============= Helper to normalize plan name =============
function normalizePlanName(planName: string | undefined | null): PlanType {
  if (!planName) return "starter";
  
  const normalized = planName.toLowerCase().trim();
  
  if (normalized.includes("elite") || normalized.includes("élite")) {
    return "elite";
  }
  if (normalized.includes("pro")) {
    return "pro";
  }
  return "starter";
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
    return "starter";
  }, [subscription, credits]);
  
  // Get limits for current plan
  const limits = useMemo(() => PLAN_LIMITS[plan], [plan]);
  
  // Current usage counts
  const currentAlerts = alertsData?.items?.length ?? 0;
  const currentWatchlistItems = watchlistData?.items?.length ?? 0;
  const creditsRemaining = credits?.credits_remaining ?? 0;
  const creditsResetDate = credits?.credits_reset_date ?? subscription?.credits_reset_date ?? null;
  
  // Create helper functions
  const helpers = useMemo<EntitlementHelpers>(() => ({
    canUseEstimator: () => {
      // Everyone can use estimator if they have credits or it's within daily limit
      return creditsRemaining > 0 || limits.maxEstimationsPerDay === -1;
    },
    
    canScrap: (type: ScrapType) => {
      if (type === "fort" && !limits.canScrapStrong) {
        return false;
      }
      const cost = SCRAP_COSTS[type];
      const minCreditsNeeded = cost.base + cost.perPage;
      return creditsRemaining >= minCreditsNeeded || type === "communautaire";
    },
    
    canCreateAlert: () => {
      if (limits.maxAlerts === -1) return true;
      return currentAlerts < limits.maxAlerts;
    },
    
    canAddToWatchlist: () => {
      if (limits.maxWatchlistItems === -1) return true;
      return currentWatchlistItems < limits.maxWatchlistItems;
    },
    
    canExportData: () => limits.canExport,
    
    canAccessAdvancedStats: () => limits.canAccessAdvancedStats,
    
    hasEnoughCredits: (required: number) => creditsRemaining >= required,
    
    getScrapCost: (type: ScrapType, pages: number) => {
      const cost = SCRAP_COSTS[type];
      return cost.base + (cost.perPage * pages);
    },
  }), [creditsRemaining, limits, currentAlerts, currentWatchlistItems]);
  
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
      reason: `Limite atteinte (${currentAlerts}/${limits.maxAlerts} alertes). Passez au plan supérieur.`,
      isLoading: false,
    };
  }
  
  return { allowed: true, isLoading: false };
}

export function useCanScrap(type: ScrapType): { allowed: boolean; reason?: string; cost: number; isLoading: boolean } {
  const { helpers, limits, creditsRemaining, isLoading } = useEntitlements();
  const cost = helpers.getScrapCost(type, 1); // Base cost for 1 page
  
  if (isLoading) {
    return { allowed: false, cost, isLoading: true };
  }
  
  if (type === "fort" && !limits.canScrapStrong) {
    return {
      allowed: false,
      reason: "Le scrap fort nécessite un plan Pro ou supérieur.",
      cost,
      isLoading: false,
    };
  }
  
  if (!helpers.canScrap(type)) {
    return {
      allowed: false,
      reason: `Crédits insuffisants (${creditsRemaining} restants, ${cost} requis).`,
      cost,
      isLoading: false,
    };
  }
  
  return { allowed: true, cost, isLoading: false };
}

export function useCanAddToWatchlist(): { allowed: boolean; reason?: string; isLoading: boolean } {
  const { helpers, limits, currentWatchlistItems, isLoading } = useEntitlements();
  
  if (isLoading) {
    return { allowed: false, isLoading: true };
  }
  
  if (!helpers.canAddToWatchlist()) {
    return {
      allowed: false,
      reason: `Limite atteinte (${currentWatchlistItems}/${limits.maxWatchlistItems} items). Passez au plan supérieur.`,
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
      reason: "L'export de données nécessite un plan Pro ou supérieur.",
      isLoading: false,
    };
  }
  
  return { allowed: true, isLoading: false };
}
