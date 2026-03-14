import { useState, useEffect } from 'react';

interface Product {
  slug: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  shortDescription: string;
  image: string;
}

interface Props {
  products: Product[];
  lang: 'es' | 'en';
  onFilter: (filtered: Product[]) => void;
}

const CATEGORIES = ['figurines', 'functional', 'decorative', 'custom', 'industrial'];

const labels = {
  es: {
    search: 'Buscar productos...',
    category: 'Categoría',
    all: 'Todos',
    inStock: 'Solo disponibles',
    maxPrice: 'Precio máximo',
  },
  en: {
    search: 'Search products...',
    category: 'Category',
    all: 'All',
    inStock: 'In stock only',
    maxPrice: 'Max price',
  },
};

export default function ProductFilters({ products, lang, onFilter }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(500);
  const [inStockOnly, setInStockOnly] = useState(false);

  const l = labels[lang];
  const maxProductPrice = Math.max(...products.map((p) => p.price), 500);

  useEffect(() => {
    let filtered = [...products];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }
    filtered = filtered.filter((p) => p.price <= maxPrice);
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.inStock);
    }
    onFilter(filtered);
  }, [search, category, maxPrice, inStockOnly, products]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 space-y-6">
      {/* Search */}
      <div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={l.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-secondary)]
                       border border-[var(--border)] text-[var(--text)] text-sm
                       placeholder:text-[var(--text-muted)]
                       focus:outline-none focus:border-[var(--primary)]
                       transition-colors"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">{l.category}</label>
        <div className="flex flex-wrap gap-2">
          {['all', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'
              }`}
            >
              {cat === 'all' ? l.all : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-2">
          {l.maxPrice}: <span className="text-[var(--primary)]">${maxPrice}</span>
        </label>
        <input
          type="range"
          min="0"
          max={maxProductPrice}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[var(--primary)]"
        />
      </div>

      {/* In Stock */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setInStockOnly(!inStockOnly)}
          className={`relative w-10 h-6 rounded-full transition-colors ${
            inStockOnly ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              inStockOnly ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </div>
        <span className="text-sm text-[var(--text)]">{l.inStock}</span>
      </label>
    </div>
  );
}
