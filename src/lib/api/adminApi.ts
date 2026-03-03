// Admin API Helper - Centralized fetcher for admin panel
// Uses FastAPI backend for pipeline/market data, Supabase for user/billing data

import { API_BASE_URL, getAccessToken } from './client';

/**
 * Fetch from VPS API with JWT auth from localStorage (same token as all other API calls)
 */
export async function adminApiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  return null as T;
}

/**
 * Convenience GET
 */
export async function adminApiGet<T>(endpoint: string): Promise<T> {
  return adminApiFetch<T>(endpoint);
}

/**
 * Convenience PATCH
 */
export async function adminApiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
  return adminApiFetch<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Download a file (CSV export etc.)
 */
export async function adminApiDownload(endpoint: string, filename: string): Promise<void> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) throw new Error(`Download failed: ${response.status}`);

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
