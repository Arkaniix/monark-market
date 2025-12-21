// Centralized credit management hook
import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEntitlements, CREDIT_COSTS, getActionCost, type CreditActionType } from "./useEntitlements";
import { useDataProvider } from "@/providers/DataContext";
import { differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";

export interface CreditCheckResult {
  allowed: boolean;
  cost: number;
  currentCredits: number;
  deficit: number;
}

export interface CreditResetInfo {
  resetDate: Date | null;
  formattedResetDate: string | null;
  daysUntilReset: number | null;
  isResetSoon: boolean;
  creditsWillExpire: number;
}

export interface UseCreditActionResult {
  // Check if action is allowed
  checkCredits: (action: CreditActionType) => CreditCheckResult;
  
  // Execute action with credit deduction
  executeWithCredits: <T>(
    action: CreditActionType,
    executor: () => Promise<T>
  ) => Promise<{ success: boolean; data?: T; error?: string }>;
  
  // Current state
  creditsRemaining: number;
  isLoading: boolean;
  
  // Reset info
  resetInfo: CreditResetInfo;
  
  // Modal state management
  showInsufficientModal: boolean;
  insufficientModalData: {
    actionType: CreditActionType;
    requiredCredits: number;
    currentCredits: number;
  } | null;
  openInsufficientModal: (action: CreditActionType) => void;
  closeInsufficientModal: () => void;
}

// Tooltip text explaining non-cumulative credits
export const CREDIT_RESET_EXPLANATION = 
  "Les crédits sont remis à zéro à chaque nouveau cycle mensuel. " +
  "Les crédits non utilisés et ceux gagnés via le scrap communautaire " +
  "ne sont pas reportés au mois suivant.";

export function useCredits(): UseCreditActionResult {
  const { creditsRemaining, creditsResetDate, plan, isLoading } = useEntitlements();
  const provider = useDataProvider();
  const queryClient = useQueryClient();
  
  // Modal state
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [insufficientModalData, setInsufficientModalData] = useState<{
    actionType: CreditActionType;
    requiredCredits: number;
    currentCredits: number;
  } | null>(null);

  // Calculate reset info
  const resetInfo = useMemo<CreditResetInfo>(() => {
    if (!creditsResetDate) {
      return {
        resetDate: null,
        formattedResetDate: null,
        daysUntilReset: null,
        isResetSoon: false,
        creditsWillExpire: 0,
      };
    }

    const resetDate = new Date(creditsResetDate);
    const now = new Date();
    const daysUntilReset = differenceInDays(resetDate, now);
    const isResetSoon = daysUntilReset <= 7 && daysUntilReset >= 0;

    return {
      resetDate,
      formattedResetDate: format(resetDate, "dd MMMM", { locale: fr }),
      daysUntilReset,
      isResetSoon,
      creditsWillExpire: isResetSoon ? creditsRemaining : 0,
    };
  }, [creditsResetDate, creditsRemaining]);

  // Check if user has enough credits for an action
  const checkCredits = useCallback((action: CreditActionType): CreditCheckResult => {
    const cost = getActionCost(action);
    const allowed = creditsRemaining >= cost;
    
    return {
      allowed,
      cost,
      currentCredits: creditsRemaining,
      deficit: allowed ? 0 : cost - creditsRemaining,
    };
  }, [creditsRemaining]);

  // Open insufficient credits modal
  const openInsufficientModal = useCallback((action: CreditActionType) => {
    const cost = getActionCost(action);
    setInsufficientModalData({
      actionType: action,
      requiredCredits: cost,
      currentCredits: creditsRemaining,
    });
    setShowInsufficientModal(true);
  }, [creditsRemaining]);

  // Close insufficient credits modal
  const closeInsufficientModal = useCallback(() => {
    setShowInsufficientModal(false);
    setInsufficientModalData(null);
  }, []);

  // Execute an action with credit consumption
  const executeWithCredits = useCallback(async <T>(
    action: CreditActionType,
    executor: () => Promise<T>
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    const check = checkCredits(action);
    
    // Check if user has enough credits
    if (!check.allowed) {
      openInsufficientModal(action);
      return { 
        success: false, 
        error: `Crédits insuffisants. ${check.cost} requis, ${check.currentCredits} disponibles.` 
      };
    }
    
    try {
      // Execute the action
      const result = await executor();
      
      // Deduct credits after successful execution
      const cost = getActionCost(action);
      if (cost > 0) {
        await provider.consumeCredits(cost, action);
        
        // Invalidate credits query to refresh UI
        queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
      }
      
      return { success: true, data: result };
    } catch (error: any) {
      return { 
        success: false, 
        error: error?.message || "Une erreur est survenue" 
      };
    }
  }, [checkCredits, openInsufficientModal, provider, queryClient]);

  return {
    checkCredits,
    executeWithCredits,
    creditsRemaining,
    isLoading,
    resetInfo,
    showInsufficientModal,
    insufficientModalData,
    openInsufficientModal,
    closeInsufficientModal,
  };
}

// Re-export types and constants for convenience
export { CREDIT_COSTS, getActionCost };
export type { CreditActionType };
