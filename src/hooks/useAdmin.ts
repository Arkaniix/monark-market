import { useQuery } from "@tanstack/react-query";
import { useDataProvider } from "@/providers/DataContext";
import type {
  AdminUser,
  AdminUsersResponse,
  AdminJob,
  AdminJobsResponse,
  AdminJobsFilters,
  SystemLog,
  AdminLogsResponse,
  AdminLogsFilters,
  HealthStatus,
} from "@/providers/types";

// Re-export types for backward compatibility
export type {
  AdminUser,
  AdminUsersResponse,
  AdminJob,
  AdminJobsResponse,
  SystemLog,
  AdminLogsResponse as SystemLogsResponse,
  HealthStatus,
};

export interface AdminUserRole {
  user_id: string;
  role: string;
}

// Default query options to prevent infinite loading
const defaultQueryOptions = {
  staleTime: 30000, // 30 seconds
  retry: 1,
  refetchOnWindowFocus: false,
};

// Hooks
export function useAdminUsers(page: number = 1, limit: number = 20, search?: string) {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['admin-users', page, limit, search],
    queryFn: () => provider.getAdminUsers(page, limit, search),
    ...defaultQueryOptions,
  });
}

export function useAdminJobs(
  page: number = 1, 
  limit: number = 20, 
  filters?: AdminJobsFilters
) {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['admin-jobs', page, limit, filters],
    queryFn: () => provider.getAdminJobs(page, limit, filters),
    ...defaultQueryOptions,
  });
}

export function useAdminJobDetail(jobId: number | null) {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['admin-job-detail', jobId],
    queryFn: async () => {
      // For now, get job from list (individual job detail endpoint may not exist)
      const result = await provider.getAdminJobs(1, 100);
      const job = result.items.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      return job;
    },
    enabled: !!jobId,
    ...defaultQueryOptions,
  });
}

export function useAdminLogs(
  page: number = 1,
  limit: number = 50,
  filters?: AdminLogsFilters
) {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['admin-logs', page, limit, filters],
    queryFn: () => provider.getAdminLogs(page, limit, filters),
    ...defaultQueryOptions,
  });
}

export function useHealthStatus() {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['health-status'],
    queryFn: () => provider.getHealthStatus(),
    refetchInterval: 30000, // Refresh every 30 seconds
    ...defaultQueryOptions,
    staleTime: 10000, // 10 seconds for health check
  });
}

export function useUserRole() {
  const provider = useDataProvider();
  
  return useQuery({
    queryKey: ['user-role'],
    queryFn: () => provider.getUserRole(),
    ...defaultQueryOptions,
    staleTime: 60000, // 1 minute for role check
  });
}
