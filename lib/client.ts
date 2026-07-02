/**
 * Small fetch wrapper for client components.
 *
 * Distinguishes a *server* error (the request reached the server, which
 * replied non-2xx, possibly with a non-JSON body, e.g. a 500 HTML page)
 * from a genuine *network* failure (fetch threw). Without this, a 500 whose
 * body isn't JSON makes `res.json()` throw and gets mislabelled as a
 * "network error", sending the user into a pointless retry loop.
 */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON body (common for unhandled 500s)
  }

  if (!res.ok) {
    const serverMsg = (data as { error?: string } | null)?.error;
    throw new ApiError(serverMsg || `Server error (${res.status}). Please try again.`, res.status);
  }

  return data as T;
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  // fetch() itself threw → genuine connectivity problem
  return 'Network error, couldn’t reach the server. Check your connection.';
}
