import { atom } from 'nanostores';

export type Theme = 'dark' | 'light';

/**
 * Read the current theme directly from the <html> class so the store
 * starts in sync with whatever the anti-FOUC inline script already set.
 * Falls back to 'dark' during SSG (no `document`).
 */
function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  return 'dark';
}

export const themeStore = atom<Theme>(getInitialTheme());

export function initTheme() {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('vectra-theme') as Theme | null;
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(stored ?? preferred);
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('vectra-theme', theme);
  themeStore.set(theme);
}

export function toggleTheme() {
  applyTheme(themeStore.get() === 'dark' ? 'light' : 'dark');
}
