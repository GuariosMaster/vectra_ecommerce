import { atom } from 'nanostores';

export type UserRole = 'admin' | 'user';

export interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  role: UserRole | null;
  accessToken: string | null;
}

export const authStore = atom<AuthState>({
  isAuthenticated: false,
  email: null,
  role: null,
  accessToken: null,
});

/** Email/password login via backend */
export async function login(email: string, password: string): Promise<{ role: UserRole }> {
  const apiUrl = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000';

  const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? 'Correo o contraseña incorrectos');
  }

  const { data } = await res.json();
  const role: UserRole = data.user.role === 'ADMIN' ? 'admin' : 'user';

  const state: AuthState = {
    isAuthenticated: true,
    email: data.user.email,
    role,
    accessToken: data.accessToken,
  };

  authStore.set(state);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('vectra-auth', JSON.stringify(state));
  }
  return { role };
}

/** Register new account via backend */
export async function register(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
): Promise<{ role: UserRole }> {
  const apiUrl = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000';

  const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, firstName, lastName }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? 'Error al registrar la cuenta');
  }

  const { data } = await res.json();
  const role: UserRole = data.user.role === 'ADMIN' ? 'admin' : 'user';

  const state: AuthState = {
    isAuthenticated: true,
    email: data.user.email,
    role,
    accessToken: data.accessToken,
  };

  authStore.set(state);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('vectra-auth', JSON.stringify(state));
  }
  return { role };
}

/** Google login via backend — verifies idToken, returns role from DB */
export async function loginWithGoogle(idToken: string): Promise<{ role: UserRole }> {
  const apiUrl = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000';

  const res = await fetch(`${apiUrl}/api/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message ?? 'Error al iniciar sesión con Google');
  }

  const { data } = await res.json();
  const role: UserRole = data.user.role === 'ADMIN' ? 'admin' : 'user';

  const state: AuthState = {
    isAuthenticated: true,
    email: data.user.email,
    role,
    accessToken: data.accessToken,
  };

  authStore.set(state);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('vectra-auth', JSON.stringify(state));
  }

  return { role };
}

export function logout() {
  authStore.set({ isAuthenticated: false, email: null, role: null, accessToken: null });
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('vectra-auth');
  }
}

export function initAuth() {
  if (typeof sessionStorage === 'undefined') return;
  const stored = sessionStorage.getItem('vectra-auth');
  if (!stored) return;
  try {
    const parsed: AuthState = JSON.parse(stored);
    if (parsed.isAuthenticated) authStore.set(parsed);
  } catch {
    // corrupted session — ignore
  }
}
