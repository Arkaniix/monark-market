# API Client Documentation

## Configuration

Set `VITE_API_URL` in your `.env` file:

```env
VITE_API_URL=https://your-api-domain.com/api
```

## Usage

### Basic Fetch

```typescript
import { apiFetch, apiGet, apiPost } from '@/lib/api';

// GET request (authenticated by default)
const data = await apiGet<MyType>('/v1/users/me');

// POST request
const result = await apiPost<Response, Payload>('/v1/items', { name: 'test' });

// Custom options
const data = await apiFetch<MyType>('/v1/public', { 
  method: 'GET', 
  auth: false // Skip auth header
});
```

### Token Management

```typescript
import { setTokens, clearTokens, getAccessToken } from '@/lib/api';

// After login
setTokens({ access: 'jwt-token', refresh: 'refresh-token' });

// Check if logged in
const token = getAccessToken();

// Logout
clearTokens();
```

### 401 Interceptor

The client automatically handles 401 responses:
1. If a refresh token exists, calls `POST /v1/auth/refresh`
2. On success, retries the original request with the new token
3. On failure, clears tokens (user should be redirected to login)

### Error Handling

```typescript
import { apiFetch, ApiException } from '@/lib/api';

try {
  await apiFetch('/v1/protected');
} catch (error) {
  if (error instanceof ApiException) {
    console.log(error.status); // HTTP status code
    console.log(error.message); // Error message
    console.log(error.details); // Full error details
  }
}
```

## Backend Requirements

The refresh endpoint should:
- Accept `POST /v1/auth/refresh` with `{ refresh_token: string }`
- Return `{ access_token: string, refresh_token?: string }`
