import { useState, useEffect } from 'react';
import { addToCart } from '../../stores/cart';
import { fetchProductBySlug } from '../../lib/products';
import type { ApiProduct } from '../../types/api';

interface Props {
  slug: string;
  lang: 'es' | 'en';
}

const L = {
  es: {
    addToCart: 'Agregar al carrito',
    outOfStock: 'Sin stock',
    material: 'Material', dimensions: 'Dimensiones',
    weight: 'Peso', printTime: 'Tiempo de impresión',
    loading: 'Cargando producto...',
    error: 'No se pudo cargar el producto.',
    added: '✓ Agregado',
    back: '← Volver a productos',
  },
  en: {
    addToCart: 'Add to cart',
    outOfStock: 'Out of stock',
    material: 'Material', dimensions: 'Dimensions',
    weight: 'Weight', printTime: 'Print time',
    loading: 'Loading product...',
    error: 'Could not load product.',
    added: '✓ Added',
    back: '← Back to products',
  },
};

export default function ProductDetailView({ slug, lang }: Props) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const l = L[lang];

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchProductBySlug(slug)
      .then((p) => { setProduct(p); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] animate-pulse" />
        <p className="text-[var(--text-muted)]">{l.loading}</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-red-400 mb-6">{l.error}</p>
        <a href={`/${lang}/products`} className="text-[var(--primary)] hover:underline">{l.back}</a>
      </div>
    );
  }

  const name = lang === 'es' ? product.nameEs : product.nameEn;
  const description = lang === 'es' ? product.descriptionEs : product.descriptionEn;
  const shortDescription = lang === 'es' ? product.shortDescEs : product.shortDescEn;
  const image = product.images[0]?.url ?? '/images/placeholder.svg';
  const tags = product.tags.map((t) => (lang === 'es' ? t.tag.nameEs : t.tag.nameEn));
  const price = Number(product.price);

  const specs = [
    { label: l.material, value: product.material },
    { label: l.dimensions, value: product.dimensions },
    { label: l.weight, value: product.weight },
    { label: l.printTime, value: product.printTime },
  ].filter((s) => s.value);

  function handleAdd() {
    addToCart({
      id: product!.slug,
      name,
      price,
      image,
      slug: product!.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="rounded-2xl bg-[var(--bg-secondary)] aspect-square flex items-center justify-center p-6 overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-contain" loading="eager" />
        </div>

        {/* Details */}
        <div>
          {/* Category & tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium capitalize">
              {product.category.slug}
            </span>
            {tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] text-sm border border-[var(--border)]">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text)] mb-4">{name}</h1>
          <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-6">{shortDescription}</p>

          {/* Price */}
          <div className="text-3xl sm:text-4xl font-black text-[var(--text)] mb-6">
            <span className="text-base font-medium text-[var(--primary)] mr-1">$</span>
            {price.toFixed(2)}
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {specs.map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                  <div className="text-xs text-[var(--text-muted)] mb-1">{label}</div>
                  <div className="font-medium text-[var(--text)] text-sm">{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Add to cart */}
          {product.inStock ? (
            <button
              onClick={handleAdd}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-95
                ${added
                  ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                  : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]'
                }`}
            >
              {added ? l.added : l.addToCart}
            </button>
          ) : (
            <div className="w-full py-4 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-muted)] font-bold text-lg text-center border border-[var(--border)]">
              {l.outOfStock}
            </div>
          )}
        </div>
      </div>

      {/* Long description */}
      {description && (
        <div className="mt-16 max-w-3xl">
          <div className="prose prose-lg max-w-none
            prose-headings:text-[var(--text)]
            prose-p:text-[var(--text-muted)]
            prose-a:text-[var(--primary)]
            prose-strong:text-[var(--text)]
            dark:prose-invert">
            <p style={{ whiteSpace: 'pre-line' }}>{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
