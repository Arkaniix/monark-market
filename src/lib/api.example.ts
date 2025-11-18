// Example usage of the API client
// This file shows how to use the API functions - you can delete it later

import { apiGet, apiPost, apiPut, apiDelete, setAccessToken, clearAccessToken } from './api';

// ============================================
// EXAMPLE 1: GET request to fetch ads
// ============================================

interface Ad {
  id: number;
  title: string;
  price: number;
  description?: string;
  // ... other fields
}

interface AdsResponse {
  ads: Ad[];
  total: number;
}

async function fetchAds() {
  try {
    const data = await apiGet<AdsResponse>('/v1/ads');
    console.log('Ads:', data.ads);
    console.log('Total:', data.total);
    return data;
  } catch (error) {
    console.error('Error fetching ads:', error);
    throw error;
  }
}

// ============================================
// EXAMPLE 2: GET request with query parameters
// ============================================

async function fetchAdById(adId: number) {
  try {
    const ad = await apiGet<Ad>(`/v1/ads/${adId}`);
    console.log('Ad details:', ad);
    return ad;
  } catch (error) {
    console.error('Error fetching ad:', error);
    throw error;
  }
}

// ============================================
// EXAMPLE 3: POST request to create a resource
// ============================================

interface CreateAdRequest {
  title: string;
  price: number;
  description: string;
}

async function createAd(adData: CreateAdRequest) {
  try {
    const newAd = await apiPost<Ad, CreateAdRequest>('/v1/ads', adData);
    console.log('Created ad:', newAd);
    return newAd;
  } catch (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
}

// ============================================
// EXAMPLE 4: Using in a React component
// ============================================

/*
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAds() {
      try {
        setLoading(true);
        const data = await apiGet<AdsResponse>('/v1/ads');
        setAds(data.ads);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadAds();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Ads</h1>
      {ads.map(ad => (
        <div key={ad.id}>
          <h2>{ad.title}</h2>
          <p>{ad.price}€</p>
        </div>
      ))}
    </div>
  );
}
*/

// ============================================
// EXAMPLE 5: Authentication flow
// ============================================

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

async function login(email: string, password: string) {
  try {
    const response = await apiPost<LoginResponse, LoginRequest>('/v1/auth/login', {
      email,
      password,
    });
    
    // Store the token
    setAccessToken(response.access_token);
    
    console.log('Login successful');
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

async function logout() {
  // Clear the token
  clearAccessToken();
  console.log('Logged out');
}

// ============================================
// EXAMPLE 6: Error handling with try/catch
// ============================================

async function fetchAdsWithErrorHandling() {
  try {
    const data = await apiGet<AdsResponse>('/v1/ads');
    return data;
  } catch (error) {
    // The error is an ApiException with status and details
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Check if it's an ApiException to access status
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number };
      if (apiError.status === 401) {
        console.log('Unauthorized - redirect to login');
      } else if (apiError.status === 404) {
        console.log('Resource not found');
      }
    }
    throw error;
  }
}

export {
  fetchAds,
  fetchAdById,
  createAd,
  login,
  logout,
  fetchAdsWithErrorHandling,
};
