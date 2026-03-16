import { cartOpen } from '../stores/cart';
import ProductDetailView from './products/ProductDetailView';
import ShoppingCart from './products/ShoppingCart';

export default function ProductUrlHandler() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const match = path.match(/^\/(es|en)\/products\/([^/]+)\/?$/);

  if (match) {
    const lang = match[1] as 'es' | 'en';
    const slug = match[2];
    return (
      <>
        <ProductDetailView slug={slug} lang={lang} />
        <ShoppingCart lang={lang} />
      </>
    );
  }

  // Standard 404
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)]">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h1 className="text-4xl font-black text-[var(--text)] mb-3">404</h1>
      <p className="text-[var(--text-muted)] mb-8">La página que buscas no existe.</p>
      <a href="/es" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors">
        Volver al inicio
      </a>
    </div>
  );
}
