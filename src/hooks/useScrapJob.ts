// Re-export from provider-based hooks for backward compatibility
export {
  useStartScrap,
  useJobStatus,
  useCancelJob,
  useUserJobs,
} from "./useProviderData";

// Types
export type Platform = 'leboncoin' | 'ebay' | 'amazon' | 'ldlc' | 'fbmarket' | 'vinted';
export type ScrapType = 'faible' | 'fort';

export type { ScrapStartRequest, ScrapStartResponse, JobStatus } from "@/providers/types";

// Platform configuration with Vinted
export const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'leboncoin', label: 'Leboncoin', icon: '🟠' },
  { value: 'ebay', label: 'eBay', icon: '🔵' },
  { value: 'amazon', label: 'Amazon', icon: '📦' },
  { value: 'ldlc', label: 'LDLC', icon: '💻' },
  { value: 'fbmarket', label: 'FB Marketplace', icon: '📱' },
  { value: 'vinted', label: 'Vinted', icon: '👗' },
];

// Region options
export const REGIONS = [
  { value: 'all', label: 'Toutes les régions' },
  { value: 'idf', label: 'Île-de-France' },
  { value: 'ara', label: 'Auvergne-Rhône-Alpes' },
  { value: 'paca', label: 'PACA' },
  { value: 'occ', label: 'Occitanie' },
  { value: 'na', label: 'Nouvelle-Aquitaine' },
  { value: 'hdf', label: 'Hauts-de-France' },
  { value: 'bre', label: 'Bretagne' },
  { value: 'pdl', label: 'Pays de la Loire' },
  { value: 'ge', label: 'Grand Est' },
  { value: 'nor', label: 'Normandie' },
  { value: 'bfc', label: 'Bourgogne-Franche-Comté' },
  { value: 'cvl', label: 'Centre-Val de Loire' },
  { value: 'cor', label: 'Corse' },
];
