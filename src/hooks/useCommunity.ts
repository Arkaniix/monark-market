import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

// Types
export interface CommunityTask {
  id: number;
  model_id: number;
  model_name: string;
  platform: string;
  type: 'list_only' | 'open_on_new';
  region: string | null;
  pages_from: number;
  pages_to: number;
  priority: 'high' | 'medium' | 'low';
  reward_credits: number;
  context: string | null;
  expires_at: string;
  estimated_time_min: number;
}

export interface AvailableTasksResponse {
  active: boolean;
  tasks: CommunityTask[];
  summary: {
    pending_missions: number;
    estimated_pages: number;
    coverage_7d_pct: number;
    credits_distributed_30d: number;
  };
}

export interface MyTask {
  id: number;
  task_id: number;
  job_id: number;
  model_name: string;
  platform: string;
  type: 'list_only' | 'open_on_new';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'expired';
  pages_scanned: number;
  ads_found: number;
  credits_earned: number;
  claimed_at: string;
  completed_at: string | null;
}

export interface MyTasksResponse {
  tasks: MyTask[];
  user_limits: {
    max_comm_jobs_per_day: number;
    used_today: number;
    cooldown_minutes: number;
    cooldown_remaining: number;
  };
}

export interface ClaimTaskRequest {
  task_id: number;
}

export interface ClaimTaskResponse {
  success: boolean;
  job_id: number;
  upload_token: string;
  task: CommunityTask;
  params: {
    platform: string;
    keyword: string;
    type: string;
    pages_from: number;
    pages_to: number;
    search_url: string;
  };
}

export interface CommunityStats {
  total_contributors: number;
  total_missions_completed: number;
  total_credits_distributed: number;
  total_pages_scanned: number;
  total_ads_found: number;
  coverage_7d_pct: number;
  active_contributors_today: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_display: string;
  missions: number;
  pages: number;
  credits: number;
  quality_score: number;
  badge: 'Top Contributeur' | 'Élite' | 'Régulier' | 'Nouveau' | null;
}

export interface LeaderboardResponse {
  period: '30d' | 'all';
  entries: LeaderboardEntry[];
  user_rank?: number;
}

// Hook to get available tasks
export function useAvailableTasks() {
  return useQuery({
    queryKey: ['community', 'tasks', 'available'],
    queryFn: async () => {
      return apiGet<AvailableTasksResponse>('/v1/community/tasks/available');
    },
    staleTime: 30000, // 30 seconds
  });
}

// Hook to get user's tasks
export function useMyTasks() {
  return useQuery({
    queryKey: ['community', 'tasks', 'my'],
    queryFn: async () => {
      return apiGet<MyTasksResponse>('/v1/community/tasks/my');
    },
  });
}

// Hook to claim a task
export function useClaimTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ClaimTaskRequest) => {
      return apiPost<ClaimTaskResponse>('/v1/community/tasks/claim', request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Hook to get community stats
export function useCommunityStats() {
  return useQuery({
    queryKey: ['community', 'stats'],
    queryFn: async () => {
      return apiGet<CommunityStats>('/v1/community/stats');
    },
    staleTime: 60000, // 1 minute
  });
}

// Hook to get leaderboard
export function useLeaderboard(period: '30d' | 'all' = '30d') {
  return useQuery({
    queryKey: ['community', 'leaderboard', period],
    queryFn: async () => {
      return apiGet<LeaderboardResponse>(`/v1/community/leaderboard?period=${period}`);
    },
    staleTime: 60000, // 1 minute
  });
}

// Priority color mapping
export const PRIORITY_COLORS = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
} as const;

// Task status color mapping
export const TASK_STATUS_COLORS = {
  pending: 'bg-muted text-muted-foreground',
  running: 'bg-primary text-primary-foreground',
  completed: 'bg-success text-success-foreground',
  failed: 'bg-destructive text-destructive-foreground',
  expired: 'bg-warning text-warning-foreground',
} as const;
