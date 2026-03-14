import es from './es.json';
import en from './en.json';

export const languages = {
  es: 'Español',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';

const translations = { es, en } as const;

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: string): string {
    const keys = key.split('.');
    let result: unknown = translations[lang];
    for (const k of keys) {
      if (typeof result !== 'object' || result === null) return key;
      result = (result as Record<string, unknown>)[k];
    }
    if (typeof result === 'string') return result;
    // fallback to spanish
    let fallback: unknown = translations[defaultLang];
    for (const k of keys) {
      if (typeof fallback !== 'object' || fallback === null) return key;
      fallback = (fallback as Record<string, unknown>)[k];
    }
    return typeof fallback === 'string' ? fallback : key;
  };
}

export function getLocalePath(lang: Lang, path: string = '') {
  return `/${lang}${path}`;
}
