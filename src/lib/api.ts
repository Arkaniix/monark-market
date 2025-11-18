// API client for FastAPI backend integration
export const API_URL = import.meta.env.VITE_API_URL;

// Type for API error responses
export interface ApiError {
  detail: string | { msg: string; type: string }[];
  status: number;
}

// Custom error class for API errors
export class ApiException extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

// Function to get the access token (can be adapted based on your auth implementation)
// For now, it checks localStorage, but you can modify this to use AuthContext
const getAccessToken = (): string | null => {
  // TODO: Replace with your AuthContext when implemented
  return localStorage.getItem('access_token');
};

// Generic request function with automatic header management
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new ApiException(
          `HTTP Error: ${response.statusText}`,
          response.status
        );
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
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiException(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// GET request
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
  });
}

// POST request
export async function apiPost<T, D = any>(
  endpoint: string,
  data?: D
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT request
export async function apiPut<T, D = any>(
  endpoint: string,
  data?: D
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PATCH request
export async function apiPatch<T, D = any>(
  endpoint: string,
  data?: D
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE request
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
  });
}

// Helper function to set the access token (for login flows)
export function setAccessToken(token: string): void {
  localStorage.setItem('access_token', token);
}

// Helper function to clear the access token (for logout flows)
export function clearAccessToken(): void {
  localStorage.removeItem('access_token');
}