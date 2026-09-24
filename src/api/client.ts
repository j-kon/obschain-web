/**
 * ObsChain HTTP Client
 * 
 * Provides robust network communication with timeout handling,
 * error normalization, and non-crashing failure modes.
 */

export const API_BASE_URL =
  import.meta.env.VITE_OBSCHAIN_API_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Execute an HTTP request with timeout protection and structured error handling.
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? 10_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    clearTimeout(timer);

    if (!res.ok) {
      let errMsg = `HTTP ${res.status}: ${res.statusText}`;
      let errCode: number | undefined;

      try {
        const errJson = await res.json();
        if (errJson?.error) {
          errMsg = errJson.error;
          errCode = errJson.code;
        }
      } catch {
        // Response body was not JSON, retain default status message
      }

      throw new ApiError(res.status, errMsg, errCode);
    }

    const text = await res.text();
    if (!text || text.trim().length === 0) {
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiError(res.status, 'Invalid JSON returned by backend API');
    }
  } catch (err: unknown) {
    clearTimeout(timer);

    if (err instanceof ApiError) {
      throw err;
    }

    if ((err as Error).name === 'AbortError') {
      throw new ApiError(
        408,
        `Request to ObsChain API timed out after ${timeoutMs}ms (${endpoint})`
      );
    }

    throw new ApiError(
      0,
      `ObsChain backend unreachable at ${API_BASE_URL}. Ensure the service is running. (${(err as Error).message})`
    );
  }
}
