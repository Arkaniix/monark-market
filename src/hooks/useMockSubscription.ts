// React hook for mock subscription state with reactivity
// Uses the centralized mockSubscription.ts as source of truth

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getMockSubscriptionState,
  changeMockPlan as changeMockPlanFn,
  MOCK_PLANS,
  type MockSubscriptionState,
  type MockPlanConfig,
} from "@/providers/mockSubscription";
import type { PlanType } from "./useEntitlements";

// Custom event for subscription changes (for cross-component reactivity)
export const SUBSCRIPTION_CHANGE_EVENT = "mock-subscription-change";

export function dispatchSubscriptionChange() {
  window.dispatchEvent(new CustomEvent(SUBSCRIPTION_CHANGE_EVENT));
}

export interface UseMockSubscriptionResult {
  // Current state
  state: MockSubscriptionState;
  plan: PlanType;
  planConfig: MockPlanConfig;
  planDisplayName: string;
  
  // Credits
  creditsRemaining: number;
  creditsMax: number;
  creditsResetDate: string;
  creditPercentage: number;
  isCreditsLow: boolean;
  
  // Actions
  changePlan: (newPlan: PlanType) => Promise<void>;
  refreshState: () => void;
  
  // Loading state (for async simulation)
  isChangingPlan: boolean;
}

export function useMockSubscription(): UseMockSubscriptionResult {
  const queryClient = useQueryClient();
  const [state, setState] = useState<MockSubscriptionState>(() => getMockSubscriptionState());
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // Function to refresh state from localStorage
  const refreshState = useCallback(() => {
    setState(getMockSubscriptionState());
  }, []);

  // Listen for subscription changes from other components
  useEffect(() => {
    const handleChange = () => {
      refreshState();
    };

    window.addEventListener(SUBSCRIPTION_CHANGE_EVENT, handleChange);
    
    // Also check periodically for localStorage changes (e.g., from other tabs)
    const interval = setInterval(() => {
      const current = getMockSubscriptionState();
      if (JSON.stringify(current) !== JSON.stringify(state)) {
        setState(current);
      }
    }, 1000);

    return () => {
      window.removeEventListener(SUBSCRIPTION_CHANGE_EVENT, handleChange);
      clearInterval(interval);
    };
  }, [state, refreshState]);

  // Derived values
  const plan = state.planName;
  const planConfig = useMemo(() => MOCK_PLANS[plan] || MOCK_PLANS.standard, [plan]);
  const planDisplayName = planConfig.displayName;
  const creditsRemaining = state.creditsRemaining;
  const creditsMax = planConfig.creditsPerCycle;
  const creditsResetDate = state.creditsResetDate;
  const creditPercentage = Math.min((creditsRemaining / creditsMax) * 100, 100);
  const isCreditsLow = creditPercentage < 20;

  // Change plan with simulated delay
  const changePlan = useCallback(async (newPlan: PlanType): Promise<void> => {
    setIsChangingPlan(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update the centralized state
    const newState = changeMockPlanFn(newPlan);
    setState(newState);
    
    // Notify other components
    dispatchSubscriptionChange();
    
    // Invalidate ALL relevant queries so useEntitlements/useCredits update everywhere
    await queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
    await queryClient.invalidateQueries({ queryKey: ["user", "subscription"] });
    await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    await queryClient.invalidateQueries({ queryKey: ["alerts"] });
    await queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    
    setIsChangingPlan(false);
  }, [queryClient]);

  return {
    state,
    plan,
    planConfig,
    planDisplayName,
    creditsRemaining,
    creditsMax,
    creditsResetDate,
    creditPercentage,
    isCreditsLow,
    changePlan,
    refreshState,
    isChangingPlan,
  };
}

// Re-export plan config for convenience
export { MOCK_PLANS };
