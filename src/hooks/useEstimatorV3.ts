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

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function normalizeEstimatorPayload(payload: unknown): V3EstimationResponse | null {
  if (!isObject(payload)) return null;

  // Handle possible wrappers (data, result, results) or flat response
  const data = isObject(payload.data)
    ? payload.data
    : isObject(payload.result)
      ? payload.result
      : isObject(payload.results)
        ? payload.results
        : payload;

  if (!isObject(data)) return null;
  if (!isObject(data.score) || !isObject(data.market) || !isObject(data.input)) {
    return null;
  }

  // Return as-is — the API response structure is the source of truth
  return data as unknown as V3EstimationResponse;
}

export function useEstimatorV3() {
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<V3EstimationResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async (request: V3EstimationRequest): Promise<V3EstimationResponse> => {
      const token = getAccessToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(EVALUATE_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      const rawPayload: unknown = await res.json();

      if (!res.ok) {
        const details = isObject(rawPayload) ? (rawPayload as unknown as V3ErrorResponse) : undefined;
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
        throw new EstimatorError("internal_error", details?.message || res.statusText);
      }

      const normalized = normalizeEstimatorPayload(rawPayload);
      if (!normalized) {
        throw new EstimatorError("internal_error", "Format de réponse API invalide");
      }

      return normalized;
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
