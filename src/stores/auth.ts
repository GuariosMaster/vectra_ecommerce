import { atom } from 'nanostores';

export interface AuthState {
  isAuthenticated: boolean;
  // TODO: Add user data when backend is connected
}

export const authStore = atom<AuthState>({ isAuthenticated: false });

export function login(password: string): boolean {
  // TODO: Replace with real API call to backend
  const adminPassword = import.meta.env.PUBLIC_ADMIN_PASSWORD ?? 'vectra2024';
  if (password === adminPassword) {
    authStore.set({ isAuthenticated: true });
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('vectra-auth', 'true');
    }
    return true;
  }
  return false;
}

export function logout() {
  authStore.set({ isAuthenticated: false });
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('vectra-auth');
  }
}

export function initAuth() {
  if (typeof sessionStorage === 'undefined') return;
  const stored = sessionStorage.getItem('vectra-auth');
  if (stored === 'true') {
    authStore.set({ isAuthenticated: true });
  }
}
