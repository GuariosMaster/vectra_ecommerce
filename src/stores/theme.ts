import { atom } from 'nanostores';

export type Theme = 'dark' | 'light';

export const themeStore = atom<Theme>('dark');

export function initTheme() {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('vectra-theme') as Theme | null;
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = stored ?? preferred;
  applyTheme(theme);
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('vectra-theme', theme);
  themeStore.set(theme);
}

export function toggleTheme() {
  const current = themeStore.get();
  applyTheme(current === 'dark' ? 'light' : 'dark');
}
