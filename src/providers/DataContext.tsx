import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import type { DataProvider } from './types';
import { apiProvider } from './apiProvider';
import { mockProvider } from './mockProvider';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { API_BASE_URL } from '@/lib/api/client';

// Get provider type from environment
const ENV_PROVIDER_TYPE = import.meta.env.VITE_DATA_PROVIDER || 'mock';

// Check if we're in a dev/lovable environment
const isDevEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname.includes('lovable.dev') ||
    hostname.includes('lovableproject.com') ||
    hostname.includes('127.0.0.1') ||
    import.meta.env.DEV
  );
};

// Storage key for provider override
const PROVIDER_OVERRIDE_KEY = 'DATA_PROVIDER_OVERRIDE';

// Get effective provider type (respects localStorage override in dev)
const getEffectiveProviderType = (): 'api' | 'mock' => {
  if (isDevEnvironment()) {
    const override = localStorage.getItem(PROVIDER_OVERRIDE_KEY);
    if (override === 'mock' || override === 'api') {
      return override;
    }
  }
  return ENV_PROVIDER_TYPE as 'api' | 'mock';
};

interface DataContextValue {
  provider: DataProvider;
  isApiUnavailable: boolean;
  isMockMode: boolean;
  isDevMode: boolean;
  switchToMock: () => void;
  switchToApi: () => void;
  clearOverride: () => void;
  checkApiHealth: () => Promise<boolean>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProviderComponent({ children }: { children: React.ReactNode }) {
  const [providerType, setProviderType] = useState<'api' | 'mock'>(getEffectiveProviderType);
  const [isApiUnavailable, setIsApiUnavailable] = useState(false);
  const [hasCheckedHealth, setHasCheckedHealth] = useState(false);

  const isDevMode = useMemo(() => isDevEnvironment(), []);

  // Health check function
  const checkApiHealth = useCallback(async (): Promise<boolean> => {
    if (!API_BASE_URL) {
      console.warn('[DataProvider] No API_BASE_URL configured');
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HEALTH.READY}`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('[DataProvider] Health check failed:', error);
      return false;
    }
  }, []);

  // Check API health on mount if using API provider
  useEffect(() => {
    if (providerType === 'api' && !hasCheckedHealth) {
      checkApiHealth().then((isHealthy) => {
        setIsApiUnavailable(!isHealthy);
        setHasCheckedHealth(true);
        if (!isHealthy) {
          console.warn('[DataProvider] API is not available');
        }
      });
    } else if (providerType === 'mock') {
      setHasCheckedHealth(true);
      setIsApiUnavailable(false);
    }
  }, [providerType, hasCheckedHealth, checkApiHealth]);

  const provider = useMemo(() => {
    if (providerType === 'mock') {
      console.log('[DataProvider] Using MOCK provider');
      return mockProvider;
    }
    console.log('[DataProvider] Using API provider');
    return apiProvider;
  }, [providerType]);

  const switchToMock = useCallback(() => {
    if (isDevMode) {
      localStorage.setItem(PROVIDER_OVERRIDE_KEY, 'mock');
      setProviderType('mock');
      setIsApiUnavailable(false);
      window.location.reload();
    }
  }, [isDevMode]);

  const switchToApi = useCallback(() => {
    if (isDevMode) {
      localStorage.setItem(PROVIDER_OVERRIDE_KEY, 'api');
      setProviderType('api');
      setHasCheckedHealth(false);
      window.location.reload();
    }
  }, [isDevMode]);

  const clearOverride = useCallback(() => {
    localStorage.removeItem(PROVIDER_OVERRIDE_KEY);
    setProviderType(ENV_PROVIDER_TYPE as 'api' | 'mock');
    setHasCheckedHealth(false);
    window.location.reload();
  }, []);

  const contextValue = useMemo<DataContextValue>(() => ({
    provider,
    isApiUnavailable,
    isMockMode: providerType === 'mock',
    isDevMode,
    switchToMock,
    switchToApi,
    clearOverride,
    checkApiHealth,
  }), [provider, isApiUnavailable, providerType, isDevMode, switchToMock, switchToApi, clearOverride, checkApiHealth]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataProvider(): DataProvider {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataProvider must be used within a DataProviderComponent');
  }
  return context.provider;
}

export function useDataProviderStatus() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataProviderStatus must be used within a DataProviderComponent');
  }
  return {
    isApiUnavailable: context.isApiUnavailable,
    isMockMode: context.isMockMode,
    isDevMode: context.isDevMode,
    switchToMock: context.switchToMock,
    switchToApi: context.switchToApi,
    clearOverride: context.clearOverride,
    checkApiHealth: context.checkApiHealth,
  };
}

// Export provider type for conditional logic
export function isUsingMockProvider(): boolean {
  return getEffectiveProviderType() === 'mock';
}
