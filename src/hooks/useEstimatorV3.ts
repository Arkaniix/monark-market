// Hook for V3 Estimator — calls POST /v1/estimator/evaluate
// Uses raw fetch (not apiFetch) because the endpoint returns a flat JSON object
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, getAccessToken } from "@/lib/api/client";
import type {
  V3EstimationRequest,
  V3EstimationResponse,
  V3ErrorResponse,
} from "@/types/estimatorV3";

const EVALUATE_ENDPOINT = `${API_BASE_URL}/v1/estimator/evaluate`;

export function useEstimatorV3() {
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<V3EstimationResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async (request: V3EstimationRequest): Promise<V3EstimationResponse> => {
      try {
        const response = await apiFetch<V3EstimationResponse>(EVALUATE_V3_ENDPOINT, {
          method: "POST",
          body: request,
          auth: true,
        });
        return response;
      } catch (err) {
        if (err instanceof ApiException) {
          // Try to parse structured error
          const details = err.details as V3ErrorResponse | undefined;
          if (details?.error === "insufficient_credits") {
            throw new EstimatorError(
              "insufficient_credits",
              details.message,
              details.credits_required,
              details.plan_level
            );
          }
          if (details?.error === "validation_error") {
            throw new EstimatorError("validation_error", details.message);
          }
          throw new EstimatorError("internal_error", err.message);
        }
        throw err;
      }
    },
    onSuccess: (result) => {
      setLastResult(result);
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
      queryClient.invalidateQueries({ queryKey: ["estimation-history"] });
    },
  });

  return {
    evaluate: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    result: lastResult,
    reset: () => {
      setLastResult(null);
      mutation.reset();
    },
  };
}

// Custom error class for estimator errors
export class EstimatorError extends Error {
  constructor(
    public type: "validation_error" | "insufficient_credits" | "internal_error",
    message: string,
    public creditsRequired?: number,
    public planLevel?: string
  ) {
    super(message);
    this.name = "EstimatorError";
  }
}
