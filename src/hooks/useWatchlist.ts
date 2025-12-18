// Re-export from provider-based hooks for backward compatibility
export {
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
} from "./useProviderData";

// Re-export types
export type { WatchlistEntry, WatchlistResponse } from "@/providers/types";
