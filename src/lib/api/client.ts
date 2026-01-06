// API Client - Core HTTP client with token management
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ============= Token Management =============
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: { access: string; refresh?: string }): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  if (tokens.refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  }
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Legacy exports for backward compatibility
export const setAccessToken = (token: string) => setTokens({ access: token });
export const clearAccessToken = clearTokens;

// ============= Types =============
export interface ApiError {
  detail: string | { msg: string; type: string }[];
  status: number;
}

export class ApiException extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

// Special error for features not yet implemented in API
export class ApiFeatureUnavailableError extends Error {
  constructor(
    public feature: string,
    message?: string
  ) {
    super(message || `Feature "${feature}" is not available in API mode`);
    this.name = 'ApiFeatureUnavailableError';
  }
}

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// ============= Token Refresh Logic =============
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    if (data.access_token) {
      setTokens({
        access: data.access_token,
        refresh: data.refresh_token || refreshToken,
      });
      return true;
    }
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

async function handleTokenRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

// ============= Core Fetch Function =============
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true, headers: customHeaders = {}, signal } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${path}`;

  const fetchOptions: RequestInit = {
    method,
    headers,
    signal,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  let response = await fetch(url, fetchOptions);

  // Handle 401 with refresh token
  if (response.status === 401 && auth && getRefreshToken()) {
    const refreshed = await handleTokenRefresh();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        fetchOptions.headers = headers;
        response = await fetch(url, fetchOptions);
      }
    }
  }

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiException(`HTTP Error: ${response.statusText}`, response.status);
    }
    return null as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = typeof data.detail === 'string'
      ? data.detail
      : 'An error occurred';
    throw new ApiException(errorMessage, response.status, data.detail);
  }

  return data as T;
}

// ============= Convenience Methods =============
export async function apiGet<T>(path: string, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: 'GET', auth });
}

export async function apiPost<T, D = unknown>(path: string, data?: D, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body: data, auth });
}

export async function apiPut<T, D = unknown>(path: string, data?: D, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: 'PUT', body: data, auth });
}

export async function apiPatch<T, D = unknown>(path: string, data?: D, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: 'PATCH', body: data, auth });
}

export async function apiDelete<T>(path: string, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: 'DELETE', auth });
}
