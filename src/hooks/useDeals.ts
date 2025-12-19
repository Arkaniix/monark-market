// Re-export from provider-based hooks for backward compatibility
export {
  useDeals,
  useMarketSummary,
} from './useProviderData';

// Re-export useAddAdToWatchlist as useAddToWatchlist for backward compatibility
export { useAddAdToWatchlist as useAddToWatchlist } from './useProviderData';

// Re-export types from providers
export type { DealsFilters, DealItem, DealsResponse, MarketSummary } from '@/providers/types';
