import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface ActiveJob {
  job_id: number;
  upload_token: string;
  platform: string;
  keyword: string;
  type: string;
  params: Record<string, unknown>;
}

interface ScrapJobContextType {
  activeJob: ActiveJob | null;
  setActiveJob: (job: ActiveJob | null) => void;
  clearActiveJob: () => void;
  extensionDetected: boolean;
  setExtensionDetected: (detected: boolean) => void;
}

const ScrapJobContext = createContext<ScrapJobContextType | undefined>(undefined);

export function ScrapJobProvider({ children }: { children: ReactNode }) {
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [extensionDetected, setExtensionDetected] = useState(false);

  const clearActiveJob = useCallback(() => {
    setActiveJob(null);
  }, []);

  return (
    <ScrapJobContext.Provider
      value={{
        activeJob,
        setActiveJob,
        clearActiveJob,
        extensionDetected,
        setExtensionDetected,
      }}
    >
      {children}
    </ScrapJobContext.Provider>
  );
}

export function useScrapJobContext() {
  const context = useContext(ScrapJobContext);
  if (context === undefined) {
    throw new Error('useScrapJobContext must be used within a ScrapJobProvider');
  }
  return context;
}
