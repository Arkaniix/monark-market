// Re-export from provider-based hooks for backward compatibility
export {
  useCategories,
  useManufacturers,
  useBrands,
  useFamilies,
  useCatalogModels,
  useCatalogSummary,
  useAddModelToWatchlist,
} from './useProviderData';

// Re-export types from providers
export type { 
  Category, 
  CatalogModel, 
  CatalogResponse, 
  CatalogFilters, 
  CatalogSummary 
} from '@/providers/types';
