import { atom } from 'nanostores';

export type UserRole = 'admin' | 'user';

export interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  role: UserRole | null;
}

export const authStore = atom<AuthState>({
  isAuthenticated: false,
  email: null,
  role: null,
});

export function login(email: string, password: string): boolean {
  const adminEmail    = import.meta.env.PUBLIC_ADMIN_EMAIL    ?? 'admin@vectra.com';
  const adminPassword = import.meta.env.PUBLIC_ADMIN_PASSWORD ?? 'vectra2024';

  let state: AuthState;

  if (email === adminEmail && password === adminPassword) {
    // Admin credentials match → full admin access
    state = { isAuthenticated: true, email, role: 'admin' };
  } else if (email.includes('@') && password.length >= 6) {
    // Any other valid-format credentials → regular user (demo; replace with API)
    state = { isAuthenticated: true, email, role: 'user' };
  } else {
    return false;
  }

  authStore.set(state);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('vectra-auth', JSON.stringify(state));
  }
  return true;
}

/** Called after a successful Google sign-in — sets role based on email match */
export function loginWithGoogle(email: string): void {
  const adminEmail = import.meta.env.PUBLIC_ADMIN_EMAIL ?? 'admin@vectra.com';
  const role: UserRole = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';
  const state: AuthState = { isAuthenticated: true, email, role };
  authStore.set(state);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('vectra-auth', JSON.stringify(state));
  }
}

export function logout() {
  authStore.set({ isAuthenticated: false, email: null, role: null });
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
