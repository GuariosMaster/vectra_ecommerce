import { useState, useEffect, useMemo } from 'react';
import { addToCart } from '../../stores/cart';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  shortDescription: string;
  image: string;
  featured: boolean;
}

interface Props {
  products: Product[];
  lang: 'es' | 'en';
}

const CATEGORIES = ['figurines', 'functional', 'decorative', 'custom', 'industrial'];

const L = {
  es: {
    search: 'Buscar productos...',
    filters: 'Filtros',
    category: 'Categoría',
    all: 'Todos',
    inStock: 'Solo disponibles',
    maxPrice: 'Precio máximo',
    results: (n: number) => `${n} producto${n !== 1 ? 's' : ''}`,
    empty: 'No se encontraron productos',
    emptyHint: 'Intenta ajustar los filtros',
    clear: 'Limpiar filtros',
    addToCart: 'Agregar',
    outOfStock: 'Sin stock',
    viewDetails: 'Ver más',
    featured: 'Destacado',
  },
  en: {
    search: 'Search products...',
    filters: 'Filters',
    category: 'Category',
    all: 'All',
    inStock: 'In stock only',
    maxPrice: 'Max price',
    results: (n: number) => `${n} product${n !== 1 ? 's' : ''}`,
    empty: 'No products found',
    emptyHint: 'Try adjusting your filters',
    clear: 'Clear filters',
    addToCart: 'Add',
    outOfStock: 'Out of stock',
    viewDetails: 'View',
    featured: 'Featured',
  },
};

function ProductCard({ product, lang }: { product: Product; lang: 'es' | 'en' }) {
  const l = L[lang];
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.id });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article className="group relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden
                        card-cyber flex flex-col
                        hover:border-[var(--primary)] hover:-translate-y-1.5 hover:glow-primary-sm
                        transition-all duration-300"
             style={{ boxShadow: 'none' }}
             onMouseEnter={(e) => {
               (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px var(--glow-weak), 0 4px 24px rgba(0,0,0,0.3)';
             }}
             onMouseLeave={(e) => {
               (e.currentTarget as HTMLElement).style.boxShadow = 'none';
             }}
    >
      {/* Featured badge */}
      {product.featured && (
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-xs font-bold
                        bg-[var(--primary)] text-white glow-primary-sm">
          ★ {l.featured}
        </div>
      )}

      {/* Image */}
      <a href={`/${lang}/products/${product.id}`} className="block overflow-hidden aspect-square bg-[var(--bg-secondary)]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-500"
        />
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent
                        opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />
      </a>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full
                           bg-[var(--primary)]/10 text-[var(--primary)] capitalize tracking-wide">
            {product.category}
          </span>
          {!product.inStock && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-500/10 text-red-400">
              {l.outOfStock}
            </span>
          )}
        </div>

        <a href={`/${lang}/products/${product.id}`} className="hover:text-[var(--primary)] transition-colors">
          <h3 className="font-bold text-[var(--text)] text-base mb-1.5 line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </a>
        <p className="text-[var(--text-muted)] text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Price */}
        <div className="mt-auto pt-3">
          <span className="text-xl font-black text-[var(--text)]">
            <span className="text-sm font-medium text-[var(--primary)] mr-0.5">$</span>
            {product.price.toFixed(2)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <a
            href={`/${lang}/products/${product.id}`}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)]
                       hover:border-[var(--primary)] hover:text-[var(--primary)]
                       transition-colors text-xs font-medium"
          >
            {l.viewDetails}
          </a>
          {product.inStock && (
            <button
              onClick={handleAdd}
              className={`flex-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all duration-200
                          active:scale-95 ${added
                            ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]'
                            : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] shadow-[0_0_12px_var(--glow-weak)] hover:shadow-[0_0_20px_var(--glow)]'
                          }`}
            >
              {added ? '✓' : l.addToCart}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProductCatalog({ products, lang }: Props) {
  const l = L[lang];
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const maxProductPrice = useMemo(
    () => Math.ceil(Math.max(...products.map((p) => p.price), 100)),
    [products]
  );

  const effectiveMax = maxPrice ?? maxProductPrice;

  const filtered = useMemo(() => {
    let res = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (p) => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') res = res.filter((p) => p.category === category);
    res = res.filter((p) => p.price <= effectiveMax);
    if (inStockOnly) res = res.filter((p) => p.inStock);
    return res;
  }, [search, category, effectiveMax, inStockOnly, products]);

  const hasActiveFilters = search || category !== 'all' || effectiveMax < maxProductPrice || inStockOnly;

  function clearFilters() {
    setSearch('');
    setCategory('all');
    setMaxPrice(null);
    setInStockOnly(false);
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">
          {lang === 'es' ? 'Buscar' : 'Search'}
        </label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
               xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder={l.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
                       bg-[var(--bg-secondary)] border border-[var(--border)]
                       text-[var(--text)] placeholder:text-[var(--text-muted)]
                       focus:outline-none focus:border-[var(--primary)]
                       transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary)]">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
          {l.category}
        </label>
        <div className="space-y-1.5">
          {['all', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] border border-transparent'
              }`}
            >
              <span className="capitalize">{cat === 'all' ? l.all : cat}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                category === cat ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-[var(--border)] text-[var(--text-muted)]'
              }`}>
                {cat === 'all' ? products.length : products.filter((p) => p.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            {l.maxPrice}
          </label>
          <span className="text-sm font-bold text-[var(--primary)]">
            ${effectiveMax}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max={maxProductPrice}
            value={effectiveMax}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 appearance-none rounded-full cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-[var(--primary)]
                       [&::-webkit-slider-thumb]:shadow-[0_0_8px_var(--glow)]
                       [&::-webkit-slider-thumb]:cursor-grab"
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(effectiveMax / maxProductPrice) * 100}%, var(--border) ${(effectiveMax / maxProductPrice) * 100}%, var(--border) 100%)`
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1.5">
          <span>$0</span>
          <span>${maxProductPrice}</span>
        </div>
      </div>

      {/* In Stock toggle */}
      <div>
        <button
          onClick={() => setInStockOnly(!inStockOnly)}
          className="flex items-center justify-between w-full"
        >
          <span className="text-sm font-medium text-[var(--text)]">{l.inStock}</span>
          <div className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
            inStockOnly
              ? 'bg-[var(--primary)] shadow-[0_0_10px_var(--glow-weak)]'
              : 'bg-[var(--border)]'
          }`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
              inStockOnly ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </div>
        </button>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2.5 rounded-xl border border-[var(--primary)]/40 text-[var(--primary)]
                     text-sm font-medium hover:bg-[var(--primary)]/10 transition-colors"
        >
          {l.clear}
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-muted)] text-sm">
            <span className="font-bold text-[var(--primary)]">{filtered.length}</span>
            {' '}{l.results(filtered.length)}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]
                         hover:text-[var(--primary)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              {l.clear}
            </button>
          )}
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex lg:hidden items-center gap-2 px-4 py-2 rounded-xl
                     border border-[var(--border)] text-[var(--text-muted)] text-sm
                     hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          {l.filters}
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_6px_var(--glow)]" />
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop always visible, mobile overlay */}
        <aside className={`
          lg:block lg:w-64 lg:flex-shrink-0
          ${sidebarOpen
            ? 'fixed inset-0 z-50 flex items-start justify-end lg:relative lg:inset-auto'
            : 'hidden'
          }
        `}>
          {/* Mobile backdrop */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <div className={`
            relative z-10 h-full overflow-y-auto
            bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6
            lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)]
            w-80 lg:w-full
            ${sidebarOpen ? 'shadow-2xl shadow-[var(--glow-weak)]' : ''}
          `}>
            <div className="flex items-center justify-between mb-6 lg:mb-0">
              <div className="flex items-center gap-2 lg:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)]">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                </svg>
                <span className="font-semibold text-[var(--text)]">{l.filters}</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[var(--text-muted)] hover:text-[var(--primary)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]
                              flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                     className="text-[var(--text-muted)]">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <p className="text-[var(--text)] font-semibold mb-1">{l.empty}</p>
              <p className="text-[var(--text-muted)] text-sm mb-4">{l.emptyHint}</p>
              <button onClick={clearFilters}
                      className="px-5 py-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]
                                 border border-[var(--primary)]/30 text-sm font-medium hover:bg-[var(--primary)]/20 transition-colors">
                {l.clear}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
