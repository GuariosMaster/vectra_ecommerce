import { useState, useEffect } from 'react';
import { fetchProducts } from '../../lib/products';
import type { ApiProduct } from '../../types/api';

interface Props {
  lang: 'es' | 'en';
  viewAllLabel: string;
  titleLabel: string;
  subtitleLabel: string;
  accentLabel: string;
}

export default function FeaturedProductsClient({ lang, viewAllLabel, titleLabel, subtitleLabel, accentLabel }: Props) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ featured: 'true', limit: 4 })
      .then(({ data }) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />
              <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--accent)' }}>
                {accentLabel}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--text)] mb-2">{titleLabel}</h2>
            <p className="text-[var(--text-muted)]">{subtitleLabel}</p>
          </div>
          <a
            href={`/${lang}/products`}
            className="hidden sm:inline-flex items-center gap-2 font-medium transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            {viewAllLabel}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-[var(--bg-secondary)]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-[var(--bg-secondary)] rounded w-1/3" />
                  <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--bg-secondary)] rounded w-full" />
                  <div className="h-5 bg-[var(--bg-secondary)] rounded w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const name = lang === 'es' ? product.nameEs : (product.nameEn ?? product.nameEs);
              const shortDesc = lang === 'es' ? product.shortDescEs : (product.shortDescEn ?? product.shortDescEs);
              const image = product.images[0]?.url ?? '/images/placeholder.svg';
              const price = Number(product.price);

              return (
                <article
                  key={product.id}
                  className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden
                             hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1
                             transition-all duration-300 flex flex-col"
                >
                  <a href={`/${lang}/products/${product.slug}`}
                     className="block aspect-square bg-[var(--bg-secondary)] p-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={image}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </a>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] capitalize">
                        {product.category.slug}
                      </span>
                      {!product.inStock && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-500/10 text-red-400">
                          {lang === 'es' ? 'Sin stock' : 'Out of stock'}
                        </span>
                      )}
                    </div>

                    <a href={`/${lang}/products/${product.slug}`} className="hover:text-[var(--primary)] transition-colors">
                      <h3 className="font-semibold text-[var(--text)] text-lg mb-1 line-clamp-2">{name}</h3>
                    </a>
                    <p className="text-[var(--text-muted)] text-sm line-clamp-2 mb-4 flex-1">{shortDesc}</p>

                    <div className="mt-auto pt-3">
                      <span className="text-xl font-black text-[var(--text)]">${price.toFixed(2)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-[var(--text-muted)]">
            {lang === 'es' ? 'No hay productos destacados.' : 'No featured products.'}
          </div>
        )}

        {/* Mobile "ver todos" */}
        <div className="mt-8 text-center sm:hidden">
          <a href={`/${lang}/products`} className="inline-flex items-center gap-2 text-[var(--primary)] font-medium hover:underline">
            {viewAllLabel}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
