import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiGet } from '@/lib/api';

// Types
export type Platform = 'leboncoin' | 'ebay' | 'amazon' | 'ldlc' | 'fbmarket';
export type ScrapType = 'faible' | 'fort' | 'communautaire';

export interface ScrapStartRequest {
  platform: Platform;
  type: ScrapType;
  keyword: string;
  filters?: {
    price_min?: number;
    price_max?: number;
    region?: string;
    pages_target?: number;
    condition?: string;
    delivery_only?: boolean;
  };
}

export interface ScrapStartResponse {
  job_id: number;
  upload_token: string;
  params: {
    platform: string;
    keyword: string;
    type: string;
    filters: Record<string, unknown>;
    pages_target: number;
    search_url: string;
  };
}

export interface JobStatus {
  id: number;
  user_id: string;
  platform: string;
  keyword: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  pages_target: number | null;
  pages_scanned: number | null;
  ads_found: number | null;
  error_message: string | null;
  filters_json: Record<string, unknown> | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

// Hook to start a scrap job
export function useStartScrap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ScrapStartRequest) => {
      return apiPost<ScrapStartResponse>('/v1/scrap/start', request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Hook to get job status with polling
export function useJobStatus(jobId: number | null, options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');
      return apiGet<JobStatus>(`/v1/jobs/${jobId}`);
    },
    enabled: !!jobId && (options?.enabled !== false),
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling when job is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed' || data?.status === 'cancelled') {
        return false;
      }
      return options?.refetchInterval ?? 2000;
    },
    staleTime: 0,
  });
}

// Hook to cancel a job
export function useCancelJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: number) => {
      return apiPost<{ success: boolean }>(`/v1/jobs/${jobId}/cancel`);
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Hook to get user's recent jobs
export function useUserJobs(limit: number = 10) {
  return useQuery({
    queryKey: ['jobs', 'recent', limit],
    queryFn: async () => {
      return apiGet<{ jobs: JobStatus[]; total: number }>(`/v1/jobs?limit=${limit}`);
    },
  });
}

// Platform configuration
export const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'leboncoin', label: 'Leboncoin', icon: '🟠' },
  { value: 'ebay', label: 'eBay', icon: '🔵' },
  { value: 'amazon', label: 'Amazon', icon: '📦' },
  { value: 'ldlc', label: 'LDLC', icon: '💻' },
  { value: 'fbmarket', label: 'FB Marketplace', icon: '📱' },
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
