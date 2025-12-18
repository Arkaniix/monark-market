import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// Types
export interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  credits_remaining: number;
  plan_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface AdminUsersResponse {
  items: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminJob {
  id: number;
  user_id: string;
  user_name: string | null;
  keyword: string;
  platform: string;
  type: string;
  status: string;
  pages_scanned: number;
  pages_target: number | null;
  ads_found: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface AdminJobsResponse {
  items: AdminJob[];
  total: number;
  page: number;
  page_size: number;
}

export interface SystemLog {
  id: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  context: Record<string, any> | null;
  created_at: string;
}

export interface SystemLogsResponse {
  items: SystemLog[];
  total: number;
  page: number;
  page_size: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime_seconds: number;
  services: {
    name: string;
    status: 'operational' | 'degraded' | 'down';
    latency_ms: number;
  }[];
  metrics: {
    db_connections: number;
    requests_per_minute: number;
    error_rate: number;
  };
}

export interface AdminUserRole {
  user_id: string;
  role: string;
}

// Hooks
export function useAdminUsers(page: number = 1, limit: number = 20, search?: string) {
  return useQuery({
    queryKey: ['admin-users', page, limit, search],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      return apiFetch<AdminUsersResponse>(`/v1/admin/users?${params.toString()}`);
    },
  });
}

export function useAdminJobs(
  page: number = 1, 
  limit: number = 20, 
  filters?: { status?: string; type?: string; search?: string }
) {
  return useQuery({
    queryKey: ['admin-jobs', page, limit, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters?.search) params.append('search', filters.search);
      return apiFetch<AdminJobsResponse>(`/v1/admin/jobs?${params.toString()}`);
    },
  });
}

export function useAdminJobDetail(jobId: number | null) {
  return useQuery({
    queryKey: ['admin-job-detail', jobId],
    queryFn: () => apiFetch<AdminJob>(`/v1/admin/jobs/${jobId}`),
    enabled: !!jobId,
  });
}

export function useAdminLogs(
  page: number = 1,
  limit: number = 50,
  filters?: { level?: string; search?: string }
) {
  return useQuery({
    queryKey: ['admin-logs', page, limit, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (filters?.level && filters.level !== 'all') params.append('level', filters.level);
      if (filters?.search) params.append('search', filters.search);
      return apiFetch<SystemLogsResponse>(`/v1/admin/logs?${params.toString()}`);
    },
  });
}

export function useHealthStatus() {
  return useQuery({
    queryKey: ['health-status'],
    queryFn: () => apiFetch<HealthStatus>('/health'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useUserRole() {
  return useQuery({
    queryKey: ['user-role'],
    queryFn: () => apiFetch<AdminUserRole>('/v1/users/me/role'),
  });
}
