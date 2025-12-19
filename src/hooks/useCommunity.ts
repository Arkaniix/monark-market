// Re-export from provider-based hooks for backward compatibility
export {
  useAvailableTasks,
  useMyTasks,
  useClaimTask,
  useCommunityStats,
  useLeaderboard,
} from './useProviderData';

// Re-export types from providers
export type { 
  CommunityTask, 
  AvailableTasksResponse, 
  MyTask, 
  MyTasksResponse, 
  ClaimTaskRequest, 
  ClaimTaskResponse, 
  CommunityStats, 
  LeaderboardEntry, 
  LeaderboardResponse 
} from '@/providers/types';

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
