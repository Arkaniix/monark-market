import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { LENS } from "@/lib/api/endpoints";
import { useState } from "react";

export interface LensHistoryItem {
  id: number;
  component_id: number;
  component_name: string;
  platform: string;
  price: number;
  currency: string;
  condition: string | null;
  region: string | null;
  has_warranty: boolean;
  has_invoice: boolean;
  has_original_box: boolean;
  defects: string | null;
  is_bundle: boolean;
  signal_type: string;
  created_at: string;
  // Optional enriched fields from API
  listing_intent?: string;
  market_median?: number | null;
  gap_percent?: number | null;
  verdict?: string | null;
  confidence?: number | null;
  data_points_30d?: number | null;
  credits_earned?: number | null;
  bundle_components?: { id: number; name: string; category: string; score?: number }[];
  bundle_component_ids?: number[];
  ad_title?: string | null;
  ad_url?: string | null;
}

interface LensHistoryResponse {
  items: LensHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface LensStats {
  total_signals: number;
  total_credits_earned: number;
  signals_by_platform: Record<string, number>;
  signals_today: number;
  qualified_count?: number;
  decision_count?: number;
}

interface UseLensHistoryOptions {
  platform?: string;
  signalType?: string;
  enabled?: boolean;
}

export function useLensHistory(options: UseLensHistoryOptions = {}) {
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const { platform, signalType, enabled = true } = options;

  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("page_size", String(pageSize));
  if (platform && platform !== "all") queryParams.set("platform", platform);
  if (signalType && signalType !== "all") queryParams.set("signal_type", signalType);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<LensHistoryResponse>({
    queryKey: ["lens-history", page, platform, signalType],
    queryFn: () => apiFetch<LensHistoryResponse>(`${LENS.HISTORY}?${queryParams.toString()}`),
    staleTime: 60_000,
    enabled,
  });

  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery<LensStats>({
    queryKey: ["lens-stats"],
    queryFn: () => apiFetch<LensStats>(LENS.STATS),
    staleTime: 120_000,
    enabled,
  });

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    pageSize,
    setPage,
    stats: stats ?? null,
    isLoading: isLoading || isLoadingStats,
    isError,
    error,
    refresh: refetch,
  };
}
