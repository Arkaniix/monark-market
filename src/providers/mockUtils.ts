/**
 * Utility functions for mock data filtering
 */

/**
 * Check if a filter value represents "all" / "no filter"
 * Returns true if the value should NOT be used for filtering
 */
export function isAllFilter(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value !== 'string') return false;
  
  const normalized = value.toLowerCase().trim();
  
  // Empty string means no filter
  if (normalized === '') return true;
  
  // Common "all" values from select components (UI may send any of these)
  const allValues = [
    // English variants
    'all',
    'all platforms',
    'all regions',
    'all categories',
    'all brands',
    'all families',
    'all conditions',
    'any',
    '*',
    // French variants  
    'toutes',
    'tous',
    'tout',
    'toutes plateformes',
    'toutes les plateformes',
    'toutes régions',
    'toutes les régions',
    'toutes catégories',
    'toutes les catégories',
    'toutes marques',
    'toutes les marques',
    'toutes familles',
    'toutes les familles',
    'toutes conditions',
    'toutes les conditions',
    // Common select default values
    'select',
    'choisir',
    'sélectionner',
    'none',
    'aucun',
    'aucune',
    '-',
    '--',
  ];
  
  return allValues.includes(normalized);
}

/**
 * Check if a filter value is valid for filtering
 * Returns true if the value SHOULD be used for filtering
 */
export function isValidFilter(value: unknown): boolean {
  return !isAllFilter(value);
}

/**
 * Normalize a string for case-insensitive comparison
 */
export function normalizeString(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Check if a string contains a search term (case-insensitive)
 */
export function matchesSearch(text: string | null | undefined, search: string): boolean {
  if (!text) return false;
  return normalizeString(text).includes(normalizeString(search));
}
