import React, { createContext, useContext, useMemo } from 'react';
import type { DataProvider } from './types';
import { apiProvider } from './apiProvider';
import { mockProvider } from './mockProvider';

// Get provider type from environment
const PROVIDER_TYPE = import.meta.env.VITE_DATA_PROVIDER || 'api';

const DataContext = createContext<DataProvider | null>(null);

export function DataProviderComponent({ children }: { children: React.ReactNode }) {
  const provider = useMemo(() => {
    if (PROVIDER_TYPE === 'mock') {
      console.log('[DataProvider] Using MOCK provider');
      return mockProvider;
    }
    console.log('[DataProvider] Using API provider');
    return apiProvider;
  }, []);

  return (
    <DataContext.Provider value={provider}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataProvider(): DataProvider {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataProvider must be used within a DataProviderComponent');
  }
  return context;
}

// Export provider type for conditional logic
export function isUsingMockProvider(): boolean {
  return PROVIDER_TYPE === 'mock';
}
