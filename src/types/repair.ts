// Repair Guide types — aligned with API

export type RepairCategory = "gpu" | "cpu" | "ram" | "ssd" | "motherboard" | "psu";

export interface RepairSymptom {
  id: number;
  slug: string;
  category: RepairCategory;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
}

export interface DiagnosticStep {
  order: number;
  title: string;
  description: string;
  tools_needed: string[];
}

export interface CommonCause {
  cause: string;
  probability_pct: number;
  repair_difficulty: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface RepairMaterial {
  name: string;
  spec?: string;
  est_price_eur: number;
}

export interface RepairProcedure {
  cause_ref: string;
  steps: string[];
  materials: RepairMaterial[];
  estimated_cost_eur: number;
  estimated_time_min: number;
  difficulty?: string;
}

export interface RepairGuide {
  id: number;
  severity: "low" | "medium" | "high" | "critical";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  success_rate_pct: number;
  diagnostic_steps: DiagnosticStep[];
  common_causes: CommonCause[];
  repair_procedures: RepairProcedure[];
  pro_tips: string[];
}

export interface RepairGuideResponse {
  symptom: RepairSymptom;
  guide: RepairGuide;
}

// Deep diagnostic
export interface DeepDiagnosticRequest {
  symptom_id: number;
  model_id: number | null;
  custom_name: string | null;
  context: string | null;
}

export interface PersonalizedDiagnosticStep {
  order: number;
  title: string;
  description: string;
  expected_result: string;
}

export interface PersonalizedRepair {
  scenario: string;
  probability_pct: number;
  steps: string[];
  materials: RepairMaterial[];
  difficulty: string;
  estimated_time_min: number;
  estimated_cost_eur: number;
}

export interface RoiEstimate {
  total_repair_cost_eur: number;
  estimated_value_repaired_eur: number;
  roi_pct: number;
  recommendation: string;
}

export interface DeepAnalysis {
  model_specific_notes: string;
  known_issues: string[];
  personalized_diagnostic: PersonalizedDiagnosticStep[];
  personalized_repair: PersonalizedRepair[];
  roi_estimate: RoiEstimate;
  warnings: string[];
  confidence: "high" | "medium" | "low";
}

export interface DeepDiagnosticResponse {
  deep_analysis: DeepAnalysis;
  credits_spent: number;
  cached: boolean;
  symptom: RepairSymptom;
  model_name: string;
}

// Category config
export const REPAIR_CATEGORIES: { key: RepairCategory; label: string; emoji: string }[] = [
  { key: "gpu", label: "Carte graphique", emoji: "🎮" },
  { key: "cpu", label: "Processeur", emoji: "🧠" },
  { key: "motherboard", label: "Carte mère", emoji: "🔌" },
  { key: "ram", label: "Mémoire", emoji: "💾" },
  { key: "ssd", label: "Stockage", emoji: "💽" },
  { key: "psu", label: "Alimentation", emoji: "⚡" },
];

export const SEVERITY_CONFIG = {
  low: { label: "Faible", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  medium: { label: "Moyenne", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  high: { label: "Élevée", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  critical: { label: "Critique", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
} as const;

export const DIFFICULTY_CONFIG = {
  beginner: { label: "Débutant", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  intermediate: { label: "Intermédiaire", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  advanced: { label: "Avancé", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  expert: { label: "Expert", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
} as const;

export const CONFIDENCE_CONFIG = {
  high: { label: "Élevée", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  medium: { label: "Moyenne", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  low: { label: "Faible", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
} as const;
