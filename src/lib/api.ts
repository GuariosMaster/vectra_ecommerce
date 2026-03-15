const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface FetchOptions {
  method?: string;
  body?: unknown | FormData;
  token?: string;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let bodyInit: BodyInit | undefined;
  if (body instanceof FormData) {
    bodyInit = body;
    // No Content-Type — browser sets it with boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    bodyInit = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: bodyInit,
  });

  if (res.status === 204) return undefined as unknown as T;

  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/admin';
    return undefined as unknown as T;
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = json?.error ?? {};
    throw new ApiRequestError(res.status, err.code ?? 'UNKNOWN', err.message ?? res.statusText);
  }

  return json as T;
}
