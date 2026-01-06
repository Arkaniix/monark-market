// useModelsSearch - Autocomplete search with debounce, abort, timeout, and strict state management
import { useState, useEffect, useRef, useCallback } from "react";
import { useDataProvider } from "@/providers";
import type { ModelAutocomplete } from "@/providers/types";

export type SearchState = "idle" | "loading" | "success" | "empty" | "error";

export interface UseModelsSearchResult {
  models: ModelAutocomplete[];
  state: SearchState;
  error: string | null;
  retry: () => void;
}

const DEBOUNCE_MS = 300;
const TIMEOUT_MS = 10000;
const MIN_SEARCH_LENGTH = 2;

export function useModelsSearch(search: string): UseModelsSearchResult {
  const provider = useDataProvider();
  const [models, setModels] = useState<ModelAutocomplete[]>([]);
  const [state, setState] = useState<SearchState>("idle");
  const [error, setError] = useState<string | null>(null);
  
  // Refs for cleanup and abort
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearchRef = useRef<string>("");

  // Cleanup function
  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Fetch function
  const fetchModels = useCallback(async (searchTerm: string) => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    // Set loading state
    setState("loading");
    setError(null);
    lastSearchRef.current = searchTerm;

    // Setup timeout
    let didTimeout = false;
    requestTimeoutRef.current = setTimeout(() => {
      didTimeout = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setState("error");
      setError("Délai d'attente dépassé. Veuillez réessayer.");
    }, TIMEOUT_MS);

    try {
      // Call provider - Note: provider doesn't support abort signal, but we check after
      const results = await provider.getModelsAutocomplete(searchTerm);
      
      // Check if aborted or timed out
      if (signal.aborted || didTimeout) {
        return;
      }

      // Clear timeout
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }

      // Verify this is still the current search
      if (searchTerm !== lastSearchRef.current) {
        return;
      }

      // Update state based on results
      setModels(results);
      if (results.length === 0) {
        setState("empty");
      } else {
        setState("success");
      }
      setError(null);
    } catch (err: any) {
      // Clear timeout
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }

      // Ignore abort errors
      if (signal.aborted || didTimeout) {
        return;
      }

      // Handle actual errors
      setState("error");
      setError(err?.message || "Impossible de charger les modèles");
      setModels([]);
    }
  }, [provider]);

  // Retry function
  const retry = useCallback(() => {
    if (lastSearchRef.current.length >= MIN_SEARCH_LENGTH) {
      fetchModels(lastSearchRef.current);
    }
  }, [fetchModels]);

  // Effect to handle search changes with debounce
  useEffect(() => {
    // Cleanup previous debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // Reset if search is too short
    if (search.length < MIN_SEARCH_LENGTH) {
      cleanup();
      setState("idle");
      setModels([]);
      setError(null);
      return;
    }

    // Debounce the search
    debounceTimeoutRef.current = setTimeout(() => {
      fetchModels(search);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [search, fetchModels, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    models,
    state,
    error,
    retry,
  };
}
