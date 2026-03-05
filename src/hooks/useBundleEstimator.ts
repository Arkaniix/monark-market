import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { ModelAutocomplete } from "@/providers/types";

// ============= Types =============
export interface BundleComponent {
  component_id: number;
  component_name: string;
  category: string;
  median_price: number | null;
  p25_price?: number | null;
  p75_price?: number | null;
  data_points: number;
  confidence: number;
}

export interface BundleResult {
  components: BundleComponent[];
  total_estimated_value: number;
  bundle_price: number;
  value_difference: number;
  value_difference_percent: number;
  verdict: "good_deal" | "fair" | "overpriced" | "insufficient_data";
  components_found: number;
  components_requested: number;
}

export interface BundleRequest {
  component_ids: number[];
  bundle_price: number;
  platform?: string;
}

// ============= Verdict config =============
export const VERDICT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  good_deal: { label: "Bonne affaire potentielle", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  fair: { label: "Prix dans la moyenne", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
  overpriced: { label: "Au-dessus de la valeur pièces", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
  insufficient_data: { label: "Données insuffisantes", color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
};

// ============= Mock =============
const MOCK_BUNDLE_RESULT: BundleResult = {
  components: [
    {
      component_id: 3,
      component_name: "GeForce RTX 4090",
      category: "gpu",
      median_price: 1500,
      p25_price: 1400,
      p75_price: 1600,
      data_points: 40,
      confidence: 0.9,
    },
    {
      component_id: 484,
      component_name: "Intel Core i9-13900K",
      category: "cpu",
      median_price: 320,
      p25_price: 280,
      p75_price: 360,
      data_points: 12,
      confidence: 0.7,
    },
    {
      component_id: 601,
      component_name: "G.Skill Trident Z5 RGB 32GB DDR5-6000",
      category: "ram",
      median_price: 85,
      p25_price: 75,
      p75_price: 95,
      data_points: 8,
      confidence: 0.5,
    },
    {
      component_id: 650,
      component_name: "Samsung 990 PRO 1TB",
      category: "ssd",
      median_price: 95,
      p25_price: 85,
      p75_price: 110,
      data_points: 15,
      confidence: 0.7,
    },
  ],
  total_estimated_value: 2000,
  bundle_price: 3280,
  value_difference: -1280,
  value_difference_percent: -64.0,
  verdict: "overpriced",
  components_found: 4,
  components_requested: 4,
};

const isMockMode = () => !import.meta.env.VITE_API_URL;

// ============= Hook =============
export function useBundleEstimation() {
  const mutation = useMutation({
    mutationFn: async (req: BundleRequest): Promise<BundleResult> => {
      if (isMockMode()) {
        await new Promise(r => setTimeout(r, 800));
        return MOCK_BUNDLE_RESULT;
      }
      return apiFetch<BundleResult>(ENDPOINTS.LENS.ANALYZE_BUNDLE, {
        method: "POST",
        body: req,
      });
    },
  });

  return mutation;
}

// Fetch component names from component-db by IDs
export function useComponentLookup(ids: number[]) {
  return useQuery({
    queryKey: ["component-db-lookup", ids],
    queryFn: async () => {
      if (isMockMode() || ids.length === 0) return [];
      const db = await apiFetch<Array<{ id: number; name: string; category: string }>>(
        ENDPOINTS.CONFIG.COMPONENT_DB
      );
      return db.filter(c => ids.includes(c.id));
    },
    enabled: ids.length > 0 && !isMockMode(),
  });
}
