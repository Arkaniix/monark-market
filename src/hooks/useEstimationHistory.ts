import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { ESTIMATOR } from "@/lib/api/endpoints";

// Types
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
  buy_price_recommended: number;
  sell_price_1m: number;
  margin_pct: number;
  trend: "up" | "down" | "stable";
  photos?: string[]; // URLs to photos attached to this estimation
}

export interface EstimationHistoryResponse {
  items: EstimationHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export type HistoryState = "idle" | "loading" | "success" | "empty" | "error";

const TIMEOUT_MS = 10000; // 10 seconds
const PAGE_SIZE = 20;

// Mock data for fallback
const mockHistoryItems: EstimationHistoryItem[] = [
  {
    id: "mock-1",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    model_id: 1,
    model_name: "NVIDIA RTX 3060 Ti",
    brand: "NVIDIA",
    category: "GPU",
    condition: "bon",
    region: "IDF",
    buy_price_input: 260,
    buy_price_recommended: 245,
    sell_price_1m: 295,
    margin_pct: 13.5,
    trend: "up",
    photos: [
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400",
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400",
      "https://images.unsplash.com/photo-1555618254-5e4dc4e3c0a3?w=400",
    ],
  },
  {
    id: "mock-2",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    model_id: 6,
    model_name: "AMD Ryzen 7 5800X3D",
    brand: "AMD",
    category: "CPU",
    condition: "comme-neuf",
    buy_price_input: 255,
    buy_price_recommended: 240,
    sell_price_1m: 275,
    margin_pct: 7.8,
    trend: "stable",
  },
  {
    id: "mock-3",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    model_id: 13,
    model_name: "Samsung 980 Pro 1TB",
    brand: "Samsung",
    category: "SSD",
    condition: "neuf",
    buy_price_input: 108,
    buy_price_recommended: 100,
    sell_price_1m: 125,
    margin_pct: 15.7,
    trend: "up",
    photos: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400",
    ],
  },
  {
    id: "mock-4",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    model_id: 4,
    model_name: "NVIDIA RTX 3080",
    brand: "NVIDIA",
    category: "GPU",
    condition: "bon",
    region: "PACA",
    buy_price_input: 420,
    buy_price_recommended: 395,
    sell_price_1m: 465,
    margin_pct: 10.7,
    trend: "down",
  },
  {
    id: "mock-5",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    model_id: 9,
    model_name: "Intel Core i7-13700K",
    brand: "Intel",
    category: "CPU",
    condition: "neuf",
    buy_price_input: 340,
    buy_price_recommended: 320,
    sell_price_1m: 385,
    margin_pct: 13.2,
    trend: "stable",
  },
];

export function useEstimationHistory(page: number = 1, autoFetch: boolean = true) {
  const [data, setData] = useState<EstimationHistoryResponse | null>(null);
  const [state, setState] = useState<HistoryState>("idle");
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchHistory = useCallback(async (pageNum: number) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState("loading");
    setError(null);

    // Create timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, TIMEOUT_MS);

    try {
      const response = await apiFetch<EstimationHistoryResponse>(
        `${ESTIMATOR.HISTORY}?page=${pageNum}&limit=${PAGE_SIZE}`,
        { signal: abortController.signal }
      );

      clearTimeout(timeoutId);

      if (!isMountedRef.current) return;

      if (response.items && response.items.length > 0) {
        setData(response);
        setState("success");
      } else {
        setData({ items: [], total: 0, page: pageNum, page_size: PAGE_SIZE });
        setState("empty");
      }
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (!isMountedRef.current) return;

      // Handle abort (don't set error for abort)
      if (err.name === "AbortError") {
        // Check if it was a timeout
        if (abortController.signal.aborted) {
          setError("Délai d'attente dépassé");
          setState("error");
        }
        return;
      }

      // Use mock data as fallback in development/demo mode
      const useMockFallback = 
        import.meta.env.VITE_DATA_PROVIDER !== "api" ||
        err.message?.includes("Failed to fetch") ||
        err.status === 0;

      if (useMockFallback) {
        // Return mock data
        const startIdx = (pageNum - 1) * PAGE_SIZE;
        const paginatedItems = mockHistoryItems.slice(startIdx, startIdx + PAGE_SIZE);
        
        if (paginatedItems.length > 0) {
          setData({
            items: paginatedItems,
            total: mockHistoryItems.length,
            page: pageNum,
            page_size: PAGE_SIZE,
          });
          setState("success");
        } else {
          setData({ items: [], total: 0, page: pageNum, page_size: PAGE_SIZE });
          setState("empty");
        }
        return;
      }

      setError(err.message || "Erreur lors du chargement de l'historique");
      setState("error");
    }
  }, []);

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
