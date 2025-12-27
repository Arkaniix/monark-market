// Mock subscription and credits configuration for demo/prototype mode
// Allows testing ALL business cases without a real backend

import type { PlanType } from "@/hooks/useEntitlements";

// ============= Plan Configuration =============

export interface MockPlanConfig {
  id: string;
  name: PlanType;
  displayName: string;
  price: number;
  creditsPerCycle: number;
  limits: {
    maxAlerts: number;
    maxWatchlistItems: number;
    maxEstimationsPerDay: number;
    maxScrapPagesPerJob: number;
    maxJobsPerDay: number;
    maxCommJobsPerDay: number;
    canScrapStrong: boolean;
    canExport: boolean;
    canAccessAdvancedStats: boolean;
    canAccessPrioritySupport: boolean;
    canAccessApiAccess: boolean;
    canAccessTraining: boolean;
    canAccessAdsDatabase: boolean;
    canAccessCatalog: boolean;
  };
  estimatorFeatures: {
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
  };
}

export const MOCK_PLANS: Record<PlanType, MockPlanConfig> = {
  starter: {
    id: "plan-starter",
    name: "starter",
    displayName: "Starter",
    price: 9.99,
    creditsPerCycle: 120,
    limits: {
      maxAlerts: 3,
      maxWatchlistItems: 10,
      maxEstimationsPerDay: 40,
      maxScrapPagesPerJob: 10,
      maxJobsPerDay: 24,
      maxCommJobsPerDay: 5,
      canScrapStrong: false,
      canExport: false,
      canAccessAdvancedStats: false,
      canAccessPrioritySupport: false,
      canAccessApiAccess: false,
      canAccessTraining: false,
      canAccessAdsDatabase: true,
      canAccessCatalog: true,
    },
    estimatorFeatures: {
      // Visible
      canSeeMedianPrice: true,
      canSeeVariation30d: true,
      canSeeVolume: true,
      canSeeOpportunityLabel: true,
      // Masqué/flouté
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
  pro: {
    id: "plan-pro",
    name: "pro",
    displayName: "Pro",
    price: 29,
    creditsPerCycle: 500,
    limits: {
      maxAlerts: 20,
      maxWatchlistItems: 50,
      maxEstimationsPerDay: 166,
      maxScrapPagesPerJob: 50,
      maxJobsPerDay: 100,
      maxCommJobsPerDay: 10,
      canScrapStrong: true,
      canExport: false,
      canAccessAdvancedStats: true,
      canAccessPrioritySupport: false,
      canAccessApiAccess: false,
      canAccessTraining: true,
      canAccessAdsDatabase: true,
      canAccessCatalog: true,
    },
    estimatorFeatures: {
      // Tout visible
      canSeeMedianPrice: true,
      canSeeVariation30d: true,
      canSeeVolume: true,
      canSeeOpportunityLabel: true,
      canSeeBuyPrice: true,
      canSeeSellPrice: true,
      canSeeMargin: true,
      canSeeProbability: true,
      // Limité
      canSeeScenarios: false,
      canExportEstimation: false,
      canSeeExtendedHistory: false,
      canSeeAdvancedIndicators: false,
      chartInteractive: true,
      chartPeriods: ['30', '90'],
    },
  },
  elite: {
    id: "plan-elite",
    name: "elite",
    displayName: "Élite",
    price: 79,
    creditsPerCycle: 1500,
    limits: {
      maxAlerts: 500,
      maxWatchlistItems: 200,
      maxEstimationsPerDay: -1, // illimité (500 estimations)
      maxScrapPagesPerJob: 100,
      maxJobsPerDay: -1, // illimité
      maxCommJobsPerDay: -1, // illimité
      canScrapStrong: true,
      canExport: true,
      canAccessAdvancedStats: true,
      canAccessPrioritySupport: true,
      canAccessApiAccess: true,
      canAccessTraining: true,
      canAccessAdsDatabase: true,
      canAccessCatalog: true,
    },
    estimatorFeatures: {
      // Tout visible
      canSeeMedianPrice: true,
      canSeeVariation30d: true,
      canSeeVolume: true,
      canSeeOpportunityLabel: true,
      canSeeBuyPrice: true,
      canSeeSellPrice: true,
      canSeeMargin: true,
      canSeeProbability: true,
      canSeeScenarios: true, // Plus tard
      canExportEstimation: true,
      canSeeExtendedHistory: true,
      canSeeAdvancedIndicators: true, // volatilité, vitesse de vente
      chartInteractive: true,
      chartPeriods: ['7', '30', '90'],
    },
  },
};

// ============= Action Costs =============

export interface ActionCost {
  type: string;
  displayName: string;
  cost: number;
  description: string;
}

export const ACTION_COSTS: Record<string, ActionCost> = {
  scrap_faible: {
    type: "scrap_faible",
    displayName: "Scrap léger",
    cost: 5,
    description: "Scan rapide des premières pages",
  },
  scrap_fort: {
    type: "scrap_fort",
    displayName: "Scrap approfondi",
    cost: 20,
    description: "Scan complet avec détails",
  },
  estimator: {
    type: "estimator",
    displayName: "Estimation",
    cost: 3,
    description: "Analyse de prix détaillée",
  },
  export: {
    type: "export",
    displayName: "Export",
    cost: 0,
    description: "Export des données (plan Pro+)",
  },
  alert_create: {
    type: "alert_create",
    displayName: "Créer une alerte",
    cost: 0,
    description: "Gratuit, limité selon le plan",
  },
};

// ============= Credit Recharge Packages =============

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
  savings?: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "pack-50",
    credits: 50,
    price: 5,
    pricePerCredit: 0.10,
  },
  {
    id: "pack-150",
    credits: 150,
    price: 12,
    pricePerCredit: 0.08,
    popular: true,
    savings: "20%",
  },
  {
    id: "pack-400",
    credits: 400,
    price: 30,
    pricePerCredit: 0.075,
    savings: "25%",
  },
];

// ============= Mock User Subscription State =============

export interface MockSubscriptionState {
  planName: PlanType;
  status: "active" | "expired" | "cancelled" | "trial";
  creditsRemaining: number;
  creditsFromPlan: number;
  creditsFromRecharge: number;
  creditsResetDate: string;
  cycleStartDate: string;
  cycleEndDate: string;
  rechargeHistory: Array<{
    id: string;
    packageId: string;
    credits: number;
    price: number;
    purchasedAt: string;
    expiresAt: string;
    status: "active" | "expired" | "used";
  }>;
}

// Storage key for mock subscription
const STORAGE_KEY = "mock_subscription_state";

// Calculate next reset date (end of current month)
function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

// Calculate cycle dates
function getCycleDates(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

// Default initial state (Starter plan for demo)
function getDefaultState(): MockSubscriptionState {
  const cycleDates = getCycleDates();
  return {
    planName: "starter",
    status: "active",
    creditsRemaining: 85, // Partially used for demo (120 - 35)
    creditsFromPlan: 120,
    creditsFromRecharge: 0,
    creditsResetDate: getNextResetDate(),
    cycleStartDate: cycleDates.start,
    cycleEndDate: cycleDates.end,
    rechargeHistory: [],
  };
}

// Get current state from localStorage
export function getMockSubscriptionState(): MockSubscriptionState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as MockSubscriptionState;
      // Check if reset is needed (past reset date)
      if (new Date(state.creditsResetDate) < new Date()) {
        return resetCredits(state);
      }
      return state;
    }
  } catch (e) {
    console.warn("Error reading mock subscription state:", e);
  }
  return getDefaultState();
}

// Save state to localStorage
export function setMockSubscriptionState(state: MockSubscriptionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Error saving mock subscription state:", e);
  }
}

// ============= State Mutation Functions =============

// Reset credits (called at cycle end)
function resetCredits(state: MockSubscriptionState): MockSubscriptionState {
  const plan = MOCK_PLANS[state.planName];
  const cycleDates = getCycleDates();
  
  const newState: MockSubscriptionState = {
    ...state,
    creditsRemaining: plan.creditsPerCycle,
    creditsFromPlan: plan.creditsPerCycle,
    creditsFromRecharge: 0,
    creditsResetDate: getNextResetDate(),
    cycleStartDate: cycleDates.start,
    cycleEndDate: cycleDates.end,
    rechargeHistory: state.rechargeHistory.map(r => ({
      ...r,
      status: "expired" as const,
    })),
  };
  
  setMockSubscriptionState(newState);
  return newState;
}

// Change plan (for demo switching)
export function changeMockPlan(newPlan: PlanType): MockSubscriptionState {
  const state = getMockSubscriptionState();
  const plan = MOCK_PLANS[newPlan];
  const cycleDates = getCycleDates();
  
  const newState: MockSubscriptionState = {
    ...state,
    planName: newPlan,
    status: "active",
    creditsRemaining: plan.creditsPerCycle,
    creditsFromPlan: plan.creditsPerCycle,
    creditsFromRecharge: 0,
    creditsResetDate: getNextResetDate(),
    cycleStartDate: cycleDates.start,
    cycleEndDate: cycleDates.end,
  };
  
  setMockSubscriptionState(newState);
  return newState;
}

// Consume credits
export function consumeMockCredits(amount: number): { success: boolean; remaining: number; error?: string } {
  const state = getMockSubscriptionState();
  
  if (state.creditsRemaining < amount) {
    return {
      success: false,
      remaining: state.creditsRemaining,
      error: `Crédits insuffisants (${state.creditsRemaining} restants, ${amount} requis)`,
    };
  }
  
  const newState: MockSubscriptionState = {
    ...state,
    creditsRemaining: state.creditsRemaining - amount,
  };
  
  setMockSubscriptionState(newState);
  return { success: true, remaining: newState.creditsRemaining };
}

// Add credits (from community or recharge)
export function addMockCredits(amount: number, source: "community" | "recharge" = "community"): MockSubscriptionState {
  const state = getMockSubscriptionState();
  
  const newState: MockSubscriptionState = {
    ...state,
    creditsRemaining: state.creditsRemaining + amount,
    creditsFromRecharge: source === "recharge" 
      ? state.creditsFromRecharge + amount 
      : state.creditsFromRecharge,
  };
  
  setMockSubscriptionState(newState);
  return newState;
}

// Purchase recharge package
export function purchaseMockRecharge(packageId: string): { success: boolean; state: MockSubscriptionState; error?: string } {
  const state = getMockSubscriptionState();
  
  // Check if subscription is active (not starter for recharges)
  if (state.planName === "starter") {
    return {
      success: false,
      state,
      error: "Un abonnement actif (Pro ou Elite) est requis pour acheter des recharges.",
    };
  }
  
  const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
  if (!pkg) {
    return {
      success: false,
      state,
      error: "Package non trouvé.",
    };
  }
  
  const newRecharge = {
    id: `recharge-${Date.now()}`,
    packageId: pkg.id,
    credits: pkg.credits,
    price: pkg.price,
    purchasedAt: new Date().toISOString(),
    expiresAt: state.creditsResetDate,
    status: "active" as const,
  };
  
  const newState: MockSubscriptionState = {
    ...state,
    creditsRemaining: state.creditsRemaining + pkg.credits,
    creditsFromRecharge: state.creditsFromRecharge + pkg.credits,
    rechargeHistory: [newRecharge, ...state.rechargeHistory],
  };
  
  setMockSubscriptionState(newState);
  return { success: true, state: newState };
}

// Get action cost
export function getActionCost(actionType: string): number {
  return ACTION_COSTS[actionType]?.cost ?? 0;
}

// Check if user can perform action
export function canPerformAction(actionType: string): { allowed: boolean; reason?: string; cost: number } {
  const state = getMockSubscriptionState();
  const plan = MOCK_PLANS[state.planName];
  const cost = getActionCost(actionType);
  
  // Check plan-gated features
  if (actionType === "scrap_fort" && !plan.limits.canScrapStrong) {
    return {
      allowed: false,
      reason: "Le scrap fort nécessite un plan Pro ou supérieur.",
      cost,
    };
  }
  
  if (actionType === "export" && !plan.limits.canExport) {
    return {
      allowed: false,
      reason: "L'export de données nécessite un plan Pro ou supérieur.",
      cost,
    };
  }
  
  // Check credits
  if (cost > 0 && state.creditsRemaining < cost) {
    return {
      allowed: false,
      reason: `Crédits insuffisants (${state.creditsRemaining} restants, ${cost} requis).`,
      cost,
    };
  }
  
  return { allowed: true, cost };
}

// Get current plan limits
export function getCurrentPlanLimits(): MockPlanConfig["limits"] {
  const state = getMockSubscriptionState();
  return MOCK_PLANS[state.planName].limits;
}

// Get current estimator features
export function getCurrentEstimatorFeatures(): MockPlanConfig["estimatorFeatures"] {
  const state = getMockSubscriptionState();
  return MOCK_PLANS[state.planName].estimatorFeatures;
}

// ============= Demo Helpers =============

// Set specific demo scenario
export type DemoScenario = 
  | "new_user"           // Starter with full credits
  | "low_credits"        // Starter with almost no credits
  | "no_credits"         // Any plan with 0 credits
  | "pro_user"           // Pro with good credits
  | "elite_user"         // Elite with full credits
  | "near_reset"         // Credits expiring soon (3 days)
  | "limit_reached";     // At alert limit

export function setDemoScenario(scenario: DemoScenario): MockSubscriptionState {
  let state = getDefaultState();
  
  switch (scenario) {
    case "new_user":
      state = {
        ...state,
        planName: "starter",
        creditsRemaining: 120,
        creditsFromPlan: 120,
      };
      break;
      
    case "low_credits":
      state = {
        ...state,
        planName: "starter",
        creditsRemaining: 8,
        creditsFromPlan: 120,
      };
      break;
      
    case "no_credits":
      state = {
        ...state,
        planName: "pro",
        creditsRemaining: 0,
        creditsFromPlan: 500,
      };
      break;
      
    case "pro_user":
      state = {
        ...state,
        planName: "pro",
        creditsRemaining: 350,
        creditsFromPlan: 500,
      };
      break;
      
    case "elite_user":
      state = {
        ...state,
        planName: "elite",
        creditsRemaining: 1500,
        creditsFromPlan: 1500,
      };
      break;
      
    case "near_reset":
      const nearResetDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      state = {
        ...state,
        planName: "pro",
        creditsRemaining: 180,
        creditsFromPlan: 500,
        creditsResetDate: nearResetDate.toISOString(),
      };
      break;
      
    case "limit_reached":
      state = {
        ...state,
        planName: "starter",
        creditsRemaining: 25,
        creditsFromPlan: 120,
      };
      break;
  }
  
  setMockSubscriptionState(state);
  return state;
}

// Reset to default state
export function resetMockSubscription(): MockSubscriptionState {
  const state = getDefaultState();
  setMockSubscriptionState(state);
  return state;
}
