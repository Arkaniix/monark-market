// React hook for mock subscription state with reactivity
// Uses the centralized mockSubscription.ts as source of truth

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getMockSubscriptionState,
  setMockSubscriptionState,
  changeMockPlan as changeMockPlanFn,
  MOCK_PLANS,
  type MockSubscriptionState,
  type MockPlanConfig,
} from "@/providers/mockSubscription";
import type { PlanType } from "./useEntitlements";

// Custom event for subscription changes (for cross-component reactivity)
const SUBSCRIPTION_CHANGE_EVENT = "mock-subscription-change";

function dispatchSubscriptionChange() {
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
  
  // Loading state (for async simulation)
  isChangingPlan: boolean;
}

export function useMockSubscription(): UseMockSubscriptionResult {
  const queryClient = useQueryClient();
  const [state, setState] = useState<MockSubscriptionState>(() => getMockSubscriptionState());
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // Listen for subscription changes from other components
  useEffect(() => {
    const handleChange = () => {
      setState(getMockSubscriptionState());
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
  }, [state]);

  // Derived values
  const plan = state.planName;
  const planConfig = useMemo(() => MOCK_PLANS[plan], [plan]);
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
    
    // Invalidate relevant queries so useEntitlements/useCredits update
    queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
    queryClient.invalidateQueries({ queryKey: ["user", "subscription"] });
    
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
    isChangingPlan,
  };
}

// Re-export plan config for convenience
export { MOCK_PLANS };
