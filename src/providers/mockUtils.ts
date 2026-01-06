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

/**
 * Region slug to full name mapping
 */
const REGION_MAP: Record<string, string> = {
  'ile-de-france': 'Île-de-France',
  'auvergne-rhone-alpes': 'Auvergne-Rhône-Alpes',
  'paca': "Provence-Alpes-Côte d'Azur",
  'occitanie': 'Occitanie',
  'nouvelle-aquitaine': 'Nouvelle-Aquitaine',
  'bretagne': 'Bretagne',
  'pays-de-la-loire': 'Pays de la Loire',
  'grand-est': 'Grand Est',
  'hauts-de-france': 'Hauts-de-France',
  'normandie': 'Normandie',
  'bourgogne-franche-comte': 'Bourgogne-Franche-Comté',
  'centre-val-de-loire': 'Centre-Val de Loire',
};

/**
 * Condition slug to full name mapping
 */
const CONDITION_MAP: Record<string, string[]> = {
  'neuf': ['Neuf'],
  'comme-neuf': ['Comme neuf'],
  'bon': ['Bon état', 'Très bon état'],
  'correct': ['Satisfaisant'],
};

/**
 * Check if a region matches the filter slug
 */
export function matchesRegion(regionValue: string | null | undefined, filterSlug: string): boolean {
  if (!regionValue) return false;
  const fullName = REGION_MAP[filterSlug.toLowerCase()];
  if (!fullName) return false;
  return normalizeString(regionValue) === normalizeString(fullName);
}

/**
 * Check if a condition matches the filter slug
 */
export function matchesCondition(conditionValue: string | null | undefined, filterSlug: string): boolean {
  if (!conditionValue) return false;
  const allowedConditions = CONDITION_MAP[filterSlug.toLowerCase()];
  if (!allowedConditions) return false;
  return allowedConditions.some(c => normalizeString(conditionValue) === normalizeString(c));
}

/**
 * Check if an item type matches the filter slug
 */
export function matchesItemType(itemTypeValue: string | null | undefined, filterSlug: string): boolean {
  if (!itemTypeValue) return false;
  return normalizeString(itemTypeValue) === normalizeString(filterSlug);
}
