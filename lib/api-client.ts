/**
 * Centralized API client with request deduplication and caching
 */

interface FetchOptions extends RequestInit {
  skipCache?: boolean;
  timeout?: number;
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<Response>>();

// Debounce helper
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle helper
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipCache = false, timeout = 30000, ...fetchOptions } = options;

  // Create request key for deduplication
  const requestKey = `${url}-${JSON.stringify(fetchOptions)}`;

  // Check if same request is already pending
  if (!skipCache && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)!;
  }

  // Create fetch promise
  const fetchPromise = Promise.race([
    fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      cache: skipCache ? "no-store" : "default",
    }),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    ),
  ]) as Promise<Response>;

  // Store pending request
  if (!skipCache) {
    pendingRequests.set(requestKey, fetchPromise);
    fetchPromise.finally(() => {
      pendingRequests.delete(requestKey);
    });
  }

  return fetchPromise;
}

// Prevent double-click submissions
export function preventDoubleClick<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 1000
): T {
  let isPending = false;
  return (async (...args: Parameters<T>) => {
    if (isPending) {
      throw new Error("Request already in progress");
    }
    isPending = true;
    try {
      const result = await fn(...args);
      setTimeout(() => {
        isPending = false;
      }, delay);
      return result;
    } catch (error) {
      isPending = false;
      throw error;
    }
  }) as T;
}
