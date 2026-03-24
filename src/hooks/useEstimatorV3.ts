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

function normalizeNegotiationOffer(rawOffer: unknown, inputPrice: number) {
  if (typeof rawOffer === "number") {
    const savings = inputPrice > 0 ? inputPrice - rawOffer : 0;
    const savingsPct = inputPrice > 0 ? (savings / inputPrice) * 100 : 0;
    return {
      price: rawOffer,
      savings_eur: Number.isFinite(savings) ? savings : 0,
      savings_pct: Number.isFinite(savingsPct) ? savingsPct : 0,
    };
  }

  if (!isObject(rawOffer)) return null;

  const price = typeof rawOffer.price === "number" ? rawOffer.price : inputPrice;
  const savingsEur = typeof rawOffer.savings_eur === "number"
    ? rawOffer.savings_eur
    : (inputPrice > 0 ? inputPrice - price : 0);
  const savingsPct = typeof rawOffer.savings_pct === "number"
    ? rawOffer.savings_pct
    : (inputPrice > 0 ? ((savingsEur / inputPrice) * 100) : 0);

  return {
    price,
    savings_eur: Number.isFinite(savingsEur) ? savingsEur : 0,
    savings_pct: Number.isFinite(savingsPct) ? savingsPct : 0,
  };
}

function normalizeEstimatorPayload(payload: unknown): V3EstimationResponse | null {
  if (!isObject(payload)) return null;

  const wrappedData = isObject(payload.data)
    ? payload.data
    : isObject(payload.result)
      ? payload.result
      : isObject(payload.results)
        ? payload.results
        : payload;

  if (!isObject(wrappedData)) return null;
  if (!isObject(wrappedData.score) || !isObject(wrappedData.market) || !isObject(wrappedData.input)) {
    return null;
  }

  const inputPrice = typeof wrappedData.input.price === "number" ? wrappedData.input.price : 0;
  const negotiation = isObject(wrappedData.negotiation) ? wrappedData.negotiation : null;

  if (negotiation) {
    const aggressive = normalizeNegotiationOffer(
      negotiation.aggressive ?? negotiation.aggressive_offer,
      inputPrice
    );
    const compromise = normalizeNegotiationOffer(
      negotiation.compromise ?? negotiation.compromise_offer,
      inputPrice
    );
    const max = normalizeNegotiationOffer(
      negotiation.max ?? negotiation.max_offer,
      inputPrice
    );

    wrappedData.negotiation = {
      aggressive: aggressive ?? { price: inputPrice, savings_eur: 0, savings_pct: 0 },
      compromise: compromise ?? { price: inputPrice, savings_eur: 0, savings_pct: 0 },
      max: max ?? { price: inputPrice, savings_eur: 0, savings_pct: 0 },
      tip: typeof negotiation.tip === "string" ? negotiation.tip : "",
      arguments: Array.isArray(negotiation.arguments)
        ? negotiation.arguments.filter((arg): arg is string => typeof arg === "string")
        : [],
    };
  }

  return wrappedData as V3EstimationResponse;
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
        const details = isObject(rawPayload) ? (rawPayload as V3ErrorResponse) : undefined;
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
