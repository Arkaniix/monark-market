// Hook for enhanced estimator with new features
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataProvider } from "@/providers";
import { useEntitlements } from "@/hooks/useEntitlements";
import { generateEnhancedEstimation, generateEstimatorStats } from "@/lib/estimatorEnhancedMock";
import type { 
  EnhancedEstimationRequest, 
  EnhancedEstimationResult,
  EstimationOptions,
  EnhancedEstimationHistoryItem
} from "@/types/estimator";
import type { PlanType } from "@/hooks/useEntitlements";

// Default options
export const DEFAULT_ESTIMATION_OPTIONS: EstimationOptions = {
  withoutPlatform: false,
  withoutCondition: false,
};

// Run enhanced estimation
export function useEnhancedEstimation() {
  const { plan } = useEntitlements();
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<EnhancedEstimationResult | null>(null);

  const mutation = useMutation({
    mutationFn: async (params: {
      modelId: number;
      modelName: string;
      adPrice: number;
      condition?: string;
      platform?: string;
      options: EstimationOptions;
    }): Promise<EnhancedEstimationResult> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

      const request: EnhancedEstimationRequest = {
        model_id: params.modelId,
        ad_price: params.adPrice,
        condition: params.options.withoutCondition ? undefined : params.condition,
        platform: params.options.withoutPlatform ? undefined : params.platform,
        options: params.options,
      };

      // Generate enhanced result
      const result = generateEnhancedEstimation(request, params.modelName, plan);
      
      return result;
    },
    onSuccess: (result) => {
      setLastResult(result);
      queryClient.invalidateQueries({ queryKey: ['estimation-history-enhanced'] });
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    },
  });

  return {
    runEstimation: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    result: lastResult,
    reset: () => setLastResult(null),
  };
}

// Get estimator stats
export function useEnhancedEstimatorStats() {
  return useQuery({
    queryKey: ['estimator-stats-enhanced'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return generateEstimatorStats();
    },
    staleTime: 300000,
  });
}

// Enhanced estimation history with new structure
export function useEnhancedEstimationHistory(page: number = 1, enabled: boolean = true) {
  const { plan } = useEntitlements();
  
  return useQuery({
    queryKey: ['estimation-history-enhanced', page],
    queryFn: async (): Promise<{
      items: EnhancedEstimationHistoryItem[];
      total: number;
      page: number;
      page_size: number;
    }> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate mock history based on stored localStorage or generate new
      const storageKey = 'enhanced_estimation_history';
      const stored = localStorage.getItem(storageKey);
      let items: EnhancedEstimationHistoryItem[] = [];
      
      if (stored) {
        try {
          items = JSON.parse(stored);
        } catch {
          items = [];
        }
      }
      
      return {
        items: items.slice((page - 1) * 10, page * 10),
        total: items.length,
        page,
        page_size: 10,
      };
    },
    enabled,
    staleTime: 60000,
  });
}

// Save estimation to history
export function useSaveEstimationToHistory() {
  const queryClient = useQueryClient();
  
  return useCallback((result: EnhancedEstimationResult) => {
    const storageKey = 'enhanced_estimation_history';
    const stored = localStorage.getItem(storageKey);
    let items: EnhancedEstimationHistoryItem[] = [];
    
    if (stored) {
      try {
        items = JSON.parse(stored);
      } catch {
        items = [];
      }
    }
    
    const historyItem: EnhancedEstimationHistoryItem = {
      id: `est_${Date.now()}`,
      created_at: new Date().toISOString(),
      model_id: result.inputs.model_id,
      model_name: result.inputs.model_name,
      brand: result.inputs.brand,
      category: result.inputs.category,
      condition: result.inputs.condition,
      platform: result.inputs.platform,
      ad_price: result.inputs.ad_price,
      plan_at_creation: result.meta.plan_at_creation,
      options: result.inputs.options,
      results: result,
    };
    
    items.unshift(historyItem);
    items = items.slice(0, 50); // Keep last 50
    
    localStorage.setItem(storageKey, JSON.stringify(items));
    queryClient.invalidateQueries({ queryKey: ['estimation-history-enhanced'] });
  }, [queryClient]);
}

// Re-export types
export type { EnhancedEstimationResult, EnhancedEstimationRequest, EstimationOptions };
