// Training types - aligned with backend FastAPI
// Last sync: 2026-02-04

export interface TrainingModule {
  id: number;
  code: string;
  title: string;
  description: string;
  content: string;  // Markdown ou HTML
  order_index: number;
  duration_minutes: number;
  is_premium: boolean;
  created_at: string;
  // Progression utilisateur (si connecté)
  is_completed: boolean;
  completed_at: string | null;
}

export interface TrainingModulesResponse {
  modules: TrainingModule[];
  total_modules: number;
  completed_count: number;
  progress_percent: number;
}
