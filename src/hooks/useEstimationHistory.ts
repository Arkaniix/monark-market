import { useState, useEffect, useCallback, useRef } from "react";
import { useDataProvider } from "@/providers";

// UI-friendly types with consistent naming
export interface EstimationHistoryItem {
  id: string;
  created_at: string;
  model_id: number;
  model_name: string;
  brand: string;
  category: string;
  condition: string;
  region?: string;
  buy_price_input: number;
  // Stored results from the estimation
  results: {
    buy_price_recommended: number;
    sell_price_1m: number;
    sell_price_3m?: number;
    margin_pct: number;
    resell_probability: number;
    risk_level: 'low' | 'medium' | 'high';
    badge: 'good' | 'caution' | 'risk';
    advice: string;
    market: {
      median_price: number;
      var_30d_pct: number;
      volume: number;
      rarity_index: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  trend: "up" | "down" | "stable";
  photos?: string[];
}

export interface EstimationHistoryResponse {
  items: EstimationHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export type HistoryState = "idle" | "loading" | "success" | "empty" | "error";

const TIMEOUT_MS = 10000;
const PAGE_SIZE = 20;

// Mock photos to add to some history items for demo purposes
const mockPhotosMap: Record<number, string[]> = {
  0: [
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400",
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400",
    "https://images.unsplash.com/photo-1555618254-5e4dc4e3c0a3?w=400",
  ],
  2: [
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400",
  ],
};

// Condition labels mapping
const conditionLabels: Record<string, string> = {
  'neuf': 'Neuf',
  'comme-neuf': 'Comme neuf',
  'bon': 'Bon état',
  'correct': 'Correct',
  'pour-pieces': 'Pour pièces',
};

export function useEstimationHistory(page: number = 1, autoFetch: boolean = true) {
  const provider = useDataProvider();
  const [data, setData] = useState<EstimationHistoryResponse | null>(null);
  const [state, setState] = useState<HistoryState>("idle");
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchHistory = useCallback(async (pageNum: number) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState("loading");
    setError(null);

    // Create timeout
    let didTimeout = false;
    timeoutRef.current = setTimeout(() => {
      didTimeout = true;
      abortController.abort();
      if (isMountedRef.current) {
        setError("Délai d'attente dépassé");
        setState("error");
      }
    }, TIMEOUT_MS);

    try {
      const response = await provider.getEstimationHistory(pageNum, PAGE_SIZE);

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Check if aborted or timed out
      if (abortController.signal.aborted || didTimeout) return;
      if (!isMountedRef.current) return;

      // Map provider items to UI-friendly format
      const mappedItems: EstimationHistoryItem[] = response.items.map((item, idx) => ({
        id: item.id,
        created_at: item.date,
        model_id: item.model_id,
        model_name: item.model,
        brand: item.brand || '',
        category: item.category,
        condition: item.condition || 'bon',
        region: item.region,
        buy_price_input: item.buy_price,
        results: item.results,
        trend: item.trend,
        photos: mockPhotosMap[idx] || undefined,
      }));

      if (mappedItems.length > 0) {
        setData({
          items: mappedItems,
          total: response.total,
          page: response.page,
          page_size: response.page_size,
        });
        setState("success");
      } else {
        setData({ items: [], total: 0, page: pageNum, page_size: PAGE_SIZE });
        setState("empty");
      }
    } catch (err: any) {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (!isMountedRef.current) return;

      // Handle abort
      if (err.name === "AbortError" || abortController.signal.aborted) {
        if (didTimeout) {
          setError("Délai d'attente dépassé");
          setState("error");
        }
        return;
      }

      setError(err.message || "Erreur lors du chargement de l'historique");
      setState("error");
    }
  }, [provider]);

  // Fetch on mount or page change
  useEffect(() => {
    isMountedRef.current = true;

    if (autoFetch) {
      fetchHistory(page);
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [page, autoFetch, fetchHistory]);

  const refresh = useCallback(() => {
    fetchHistory(page);
  }, [fetchHistory, page]);

  const retry = useCallback(() => {
    fetchHistory(page);
  }, [fetchHistory, page]);

  return {
    data,
    state,
    error,
    refresh,
    retry,
    isLoading: state === "loading",
    isEmpty: state === "empty",
    isError: state === "error",
    isSuccess: state === "success",
  };
}
