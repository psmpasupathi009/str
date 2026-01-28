import { useState, useCallback } from "react";
import { preventDoubleClick } from "@/lib/api-client";

/**
 * Hook to prevent double-clicks and unwanted actions
 * Provides loading state and error handling
 */
export function useSafeAction<T extends (...args: any[]) => Promise<any>>(
  action: T,
  options?: {
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: Error) => void;
    debounceMs?: number;
  }
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const safeAction = useCallback(
    preventDoubleClick(
      async (...args: Parameters<T>) => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await action(...args);
          options?.onSuccess?.(result);
          return result;
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          options?.onError?.(error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      options?.debounceMs || 1000
    ) as T,
    [action, options]
  );

  return {
    execute: safeAction,
    isLoading,
    error,
  };
}
