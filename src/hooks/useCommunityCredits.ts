// Centralized community credit gains logic
// ONLY community scraps earn credits - all other credit gains are removed

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDataProvider } from "@/providers/DataContext";

// ============= Credit Gain Configuration =============

// Base reward for community scrap
const BASE_REWARD = 10;

// Maximum credits per scrap (cap)
const MAX_CREDITS_PER_SCRAP = 20;

// Priority bonuses
const PRIORITY_BONUS: Record<'high' | 'medium' | 'low', number> = {
  high: 10,    // +10 for high priority
  medium: 5,   // +5 for medium priority
  low: 0,      // +0 for low priority
};

// Freshness bonus (based on hours since last scan)
const FRESHNESS_THRESHOLDS = [
  { maxHours: 12, bonus: 8 },   // Very fresh need: +8
  { maxHours: 24, bonus: 5 },   // Fresh need: +5
  { maxHours: 48, bonus: 3 },   // Moderate need: +3
  { maxHours: 72, bonus: 1 },   // Low need: +1
];

// Type bonus (open_on_new is more complex)
const TYPE_BONUS: Record<'list_only' | 'open_on_new', number> = {
  list_only: 0,
  open_on_new: 3,
};

// ============= Types =============

export interface CreditGainCalculation {
  baseReward: number;
  priorityBonus: number;
  freshnessBonus: number;
  typeBonus: number;
  totalBeforeCap: number;
  total: number;
  cappedAmount: number;
  isCapped: boolean;
  breakdown: CreditGainBreakdown[];
}

export interface CreditGainBreakdown {
  label: string;
  value: number;
  description?: string;
}

export interface CommunityTaskWithReward {
  id: number;
  model_name: string;
  platform: string;
  type: 'list_only' | 'open_on_new';
  priority: 'high' | 'medium' | 'low';
  pages_from: number;
  pages_to: number;
  context?: string | null;
  expires_at: string;
  hours_since_last_scan?: number;
  credit_gain: CreditGainCalculation;
}

export interface CreditEarnedEvent {
  id: string;
  date: string;
  task_id: number;
  model_name: string;
  credits_earned: number;
  breakdown: CreditGainBreakdown[];
  pages_scanned: number;
  ads_found: number;
}

// ============= Calculation Functions =============

/**
 * Calculate freshness bonus based on hours since last scan
 */
export function calculateFreshnessBonus(hoursSinceLastScan?: number): number {
  if (hoursSinceLastScan === undefined || hoursSinceLastScan === null) {
    // If unknown, assume moderate freshness need
    return 3;
  }
  
  for (const threshold of FRESHNESS_THRESHOLDS) {
    if (hoursSinceLastScan <= threshold.maxHours) {
      return threshold.bonus;
    }
  }
  
  return 0; // Very stale data, no freshness bonus
}

/**
 * Calculate the total credit reward for a community task
 */
export function calculateCreditGain(
  priority: 'high' | 'medium' | 'low',
  type: 'list_only' | 'open_on_new',
  hoursSinceLastScan?: number
): CreditGainCalculation {
  const baseReward = BASE_REWARD;
  const priorityBonus = PRIORITY_BONUS[priority];
  const freshnessBonus = calculateFreshnessBonus(hoursSinceLastScan);
  const typeBonus = TYPE_BONUS[type];
  
  const totalBeforeCap = baseReward + priorityBonus + freshnessBonus + typeBonus;
  const total = Math.min(totalBeforeCap, MAX_CREDITS_PER_SCRAP);
  const cappedAmount = totalBeforeCap - total;
  const isCapped = cappedAmount > 0;
  
  const breakdown: CreditGainBreakdown[] = [
    { label: 'Base', value: baseReward, description: 'Récompense de base' },
  ];
  
  if (priorityBonus > 0) {
    breakdown.push({
      label: `Priorité ${priority === 'high' ? 'haute' : 'moyenne'}`,
      value: priorityBonus,
      description: priority === 'high' ? 'Mission urgente' : 'Mission importante',
    });
  }
  
  if (freshnessBonus > 0) {
    breakdown.push({
      label: 'Fraîcheur',
      value: freshnessBonus,
      description: hoursSinceLastScan !== undefined 
        ? `Dernière mise à jour il y a ${Math.round(hoursSinceLastScan)}h`
        : 'Données à rafraîchir',
    });
  }
  
  if (typeBonus > 0) {
    breakdown.push({
      label: 'Type approfondi',
      value: typeBonus,
      description: 'Scrap open_on_new (plus de détails)',
    });
  }
  
  return {
    baseReward,
    priorityBonus,
    freshnessBonus,
    typeBonus,
    totalBeforeCap,
    total,
    cappedAmount,
    isCapped,
    breakdown,
  };
}

/**
 * Get a human-readable description of the credit gain
 */
export function getCreditGainDescription(gain: CreditGainCalculation): string {
  const parts: string[] = [`${gain.baseReward} base`];
  
  if (gain.priorityBonus > 0) {
    parts.push(`+${gain.priorityBonus} priorité`);
  }
  if (gain.freshnessBonus > 0) {
    parts.push(`+${gain.freshnessBonus} fraîcheur`);
  }
  if (gain.typeBonus > 0) {
    parts.push(`+${gain.typeBonus} type`);
  }
  
  let description = parts.join(' ');
  
  if (gain.isCapped) {
    description += ` (plafonné à ${MAX_CREDITS_PER_SCRAP})`;
  }
  
  return description;
}

// ============= Hook =============

export interface UseCommunityCreditsResult {
  // Calculate potential gain for a task
  calculateGain: (
    priority: 'high' | 'medium' | 'low',
    type: 'list_only' | 'open_on_new',
    hoursSinceLastScan?: number
  ) => CreditGainCalculation;
  
  // Get description of gain
  getGainDescription: (gain: CreditGainCalculation) => string;
  
  // Award credits after successful community scrap
  awardCredits: (
    amount: number,
    taskId: number,
    modelName: string,
    pagesScanned: number,
    adsFound: number,
    breakdown: CreditGainBreakdown[]
  ) => Promise<void>;
  
  // Constants
  BASE_REWARD: number;
  MAX_CREDITS_PER_SCRAP: number;
}

export function useCommunityCredits(): UseCommunityCreditsResult {
  const provider = useDataProvider();
  const queryClient = useQueryClient();
  
  // Award credits to user after successful community scrap
  const awardCredits = async (
    amount: number,
    taskId: number,
    modelName: string,
    pagesScanned: number,
    adsFound: number,
    breakdown: CreditGainBreakdown[]
  ) => {
    // Use negative delta to represent a gain (the consumeCredits function subtracts)
    // So we need a special method or we pass a negative amount
    // For now, we'll create a specific method for earning credits
    try {
      // In reality, this would call an API endpoint to credit the user
      // For mock, we'll manually update the credits
      await provider.consumeCredits(-amount, `community_scrap_${taskId}`);
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
      queryClient.invalidateQueries({ queryKey: ["community", "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (error) {
      console.error("Failed to award credits:", error);
    }
  };
  
  return {
    calculateGain: calculateCreditGain,
    getGainDescription: getCreditGainDescription,
    awardCredits,
    BASE_REWARD,
    MAX_CREDITS_PER_SCRAP,
  };
}

// Export constants for use in other components
export { BASE_REWARD, MAX_CREDITS_PER_SCRAP, PRIORITY_BONUS };
