// Debug tracker for dev mode - tracks last endpoint called

interface DebugState {
  lastEndpoint: string | null;
  lastProvider: 'mock' | 'api' | null;
  lastTimestamp: number | null;
  callCount: number;
}

const state: DebugState = {
  lastEndpoint: null,
  lastProvider: null,
  lastTimestamp: null,
  callCount: 0,
};

const listeners: Set<() => void> = new Set();

export function trackEndpointCall(endpoint: string, provider: 'mock' | 'api') {
  if (import.meta.env.DEV) {
    state.lastEndpoint = endpoint;
    state.lastProvider = provider;
    state.lastTimestamp = Date.now();
    state.callCount++;
    listeners.forEach(fn => fn());
  }
}

export function getDebugState(): DebugState {
  return { ...state };
}

export function subscribeDebugState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetDebugState() {
  state.lastEndpoint = null;
  state.lastProvider = null;
  state.lastTimestamp = null;
  state.callCount = 0;
  listeners.forEach(fn => fn());
}
