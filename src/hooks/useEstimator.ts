import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataProvider } from "@/providers";

// Re-export types from providers for convenience
export type { 
  ModelAutocomplete,
  EstimationResult,
  EstimationHistoryResponse,
  EstimatorStats,
} from "@/providers/types";

// Request type used by the form
export interface EstimationRequest {
  model_id: number;
  condition: string;
  buy_price_input: number;
  region?: string;
  mode_advanced?: boolean;
}

// Result type with additional fields for UI
export interface EstimationResultUI {
  model_id: number;
  model_name: string;
  brand?: string;
  category: string;
  condition: string;
  region?: string;
  buy_price_input: number;
  buy_price_recommended: number;
  sell_price_1m: number;
  sell_price_3m?: number;
  margin_pct: number;
  resell_probability: number;
  risk_level: "low" | "medium" | "high";
  advice: string;
  badge: "good" | "caution" | "risk";
  market: {
    median_price: number;
    var_30d_pct: number;
    volume_active: number;
    rarity_index: number;
    trend: "up" | "down" | "stable";
  };
  trend_90d?: number[];
  volume_30d?: number[];
  credit_cost: number;
}

// Run estimation using provider (works in mock mode)
export function useRunEstimation() {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EstimationRequest): Promise<EstimationResultUI> => {
      // Map form fields to provider expected format
      const providerRequest = {
        model_id: data.model_id,
        state: data.condition, // Map condition -> state
        purchase_price: data.buy_price_input, // Map buy_price_input -> purchase_price
        region: data.region,
      };

      const result = await provider.runEstimation(providerRequest);

      // Map provider response to UI expected format
      return {
        model_id: result.model_id,
        model_name: result.model_name,
        category: result.category,
        condition: result.state,
        region: result.region,
        buy_price_input: data.buy_price_input,
        buy_price_recommended: result.estimate.buy_price,
        sell_price_1m: result.estimate.sell_price_30d,
        sell_price_3m: result.estimate.sell_price_90d,
        margin_pct: result.estimate.profit_margin_pct,
        resell_probability: result.estimate.resell_probability,
        risk_level: result.estimate.risk_level,
        advice: result.estimate.advice,
        badge: result.estimate.badge,
        market: {
          median_price: result.market.median_price,
          var_30d_pct: result.market.var_30d_pct,
          volume_active: result.market.volume,
          rarity_index: result.market.rarity_index,
          trend: result.market.trend,
        },
        trend_90d: result.trend_90d,
        volume_30d: result.volume_30d,
        credit_cost: 2, // Fixed cost in mock
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimation-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    },
  });
}

// Get estimator stats using provider
export function useEstimatorStats() {
  const provider = useDataProvider();

  return useQuery({
    queryKey: ['estimator-stats'],
    queryFn: () => provider.getEstimatorStats(),
    staleTime: 300000, // 5 minutes
  });
}
