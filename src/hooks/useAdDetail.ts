import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataProvider } from "@/providers";

export function useAdDetail(adId: string | undefined) {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['ad-detail', adId],
    queryFn: async () => {
      if (!adId) throw new Error('No adId provided');
      const ad = await provider.getAdDetail(adId);
      // Transform to UI expected format
      return {
        ...ad,
        ad_id: ad.id,
        platform_ad_id: `AD-${ad.id}`,
        category: ad.model?.category || 'Unknown',
        model_id: ad.model?.id || null,
        model_name: ad.model?.name || null,
        model_confidence: 0.95,
        components: ad.components?.map(c => ({
          role: c.type,
          model_id: null,
          model_name: c.model,
          brand: c.brand,
          category: c.type,
        })) || [],
      };
    },
    enabled: !!adId,
    retry: false,
  });
}

export function useAdPriceHistory(adId: string | undefined) {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['ad-price-history', adId],
    queryFn: async () => {
      if (!adId) throw new Error('No adId provided');
      const result = await provider.getAdPriceHistory(adId);
      return {
        items: result.points.map((p, i) => ({
          id: i + 1,
          price: p.price,
          seen_at: p.date,
          price_drop: i > 0 ? result.points[i-1].price > p.price : false,
        })),
        current_price: result.points.length > 0 ? result.points[result.points.length - 1].price : 0,
        initial_price: result.points.length > 0 ? result.points[0].price : 0,
        price_drops_count: result.points.filter((p, i) => i > 0 && result.points[i-1].price > p.price).length,
      };
    },
    enabled: !!adId,
  });
}

export function useAddAdToWatchlist() {
  const provider = useDataProvider();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (adId: number) => {
      return provider.addToWatchlist({ target_type: 'ad', target_id: adId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}

export function useCreateAdAlert() {
  const provider = useDataProvider();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { target_type: 'ad' | 'model'; target_id: number; alert_type: string; price_threshold?: number }) => {
      return provider.createAlert({
        target_type: data.target_type,
        target_id: data.target_id,
        alert_type: data.alert_type as 'deal_detected' | 'price_below' | 'price_above',
        price_threshold: data.price_threshold,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
