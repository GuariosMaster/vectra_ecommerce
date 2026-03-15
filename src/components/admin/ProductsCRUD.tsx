import { useState, useEffect } from 'react';
import { z } from 'zod';
import type { ApiProduct, ApiCategory } from '../../types/api';
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  toSlug,
} from '../../lib/products';

interface ProductForm {
  slug: string;
  nameEs: string;
  nameEn: string;
  shortDescEs: string;
  shortDescEn: string;
  descriptionEs: string;
  descriptionEn: string;
  price: number;
  stock: number;
  inStock: boolean;
  featured: boolean;
  categoryId: string;
  material: string;
  dimensions: string;
  weight: string;
  printTime: string;
  images: File[];
}

const emptyForm: ProductForm = {
  slug: '', nameEs: '', nameEn: '',
  shortDescEs: '', shortDescEn: '',
  descriptionEs: '', descriptionEn: '',
  price: 0, stock: 0, inStock: true, featured: false,
  categoryId: '', material: '', dimensions: '', weight: '', printTime: '',
  images: [],
};

const productSchema = z.object({
  slug: z.string().min(1, 'Requerido'),
  nameEs: z.string().min(2, 'Mínimo 2 caracteres'),
  nameEn: z.string().min(2, 'Mínimo 2 caracteres'),
  shortDescEs: z.string().min(10, 'Mínimo 10 caracteres'),
  shortDescEn: z.string().min(10, 'Mínimo 10 caracteres'),
  descriptionEs: z.string().min(10, 'Mínimo 10 caracteres'),
  descriptionEn: z.string().min(10, 'Mínimo 10 caracteres'),
  price: z.number().min(0, 'El precio debe ser positivo'),
  stock: z.number().int().min(0, 'Stock no puede ser negativo'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
});

export default function ProductsCRUD() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = sessionStorage.getItem('vectra-auth');
    const t = raw ? JSON.parse(raw).accessToken : null;
    setToken(t);

    setLoading(true);
    Promise.all([fetchProducts({ limit: 100 }), fetchCategories()])
      .then(([{ data }, cats]) => {
        setProducts(data);
        setCategories(cats);
      })
      .catch((e) => setApiError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(p: ApiProduct) {
    setEditing(p);
    setForm({
      slug: p.slug,
      nameEs: p.nameEs, nameEn: p.nameEn,
      shortDescEs: p.shortDescEs, shortDescEn: p.shortDescEn,
      descriptionEs: p.descriptionEs, descriptionEn: p.descriptionEn,
      price: p.price, stock: p.stock,
      inStock: p.inStock, featured: p.featured,
      categoryId: p.categoryId,
      material: p.material ?? '', dimensions: p.dimensions ?? '',
      weight: p.weight ?? '', printTime: p.printTime ?? '',
      images: [],
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar producto?')) return;
    if (!token) { setApiError('No autenticado'); return; }
    try {
      setLoading(true);
      await deleteProduct(id, token);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    const result = productSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    if (!token) { setApiError('No autenticado'); return; }

    const payload = {
      slug: form.slug, nameEs: form.nameEs, nameEn: form.nameEn,
      shortDescEs: form.shortDescEs, shortDescEn: form.shortDescEn,
      descriptionEs: form.descriptionEs, descriptionEn: form.descriptionEn,
      price: form.price, stock: form.stock,
      inStock: form.inStock, featured: form.featured,
      categoryId: form.categoryId,
      ...(form.material && { material: form.material }),
      ...(form.dimensions && { dimensions: form.dimensions }),
      ...(form.weight && { weight: form.weight }),
      ...(form.printTime && { printTime: form.printTime }),
      tagIds: [],
      ...(form.images.length > 0 && { images: form.images }),
    };

    try {
      setLoading(true);
      if (editing) {
        const updated = await updateProduct(editing.id, payload, token);
        setProducts((prev) => prev.map((p) => p.id === editing.id ? updated : p));
      } else {
        const created = await createProduct(payload, token);
        setProducts((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Error banner */}
      {apiError && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                        bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="shrink-0 hover:opacity-70">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text)]">Productos ({products.length})</h2>
        <button
          onClick={openCreate}
          className="px-3 sm:px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium
                     hover:bg-[var(--primary-hover)] transition-colors shrink-0"
        >
          + Nuevo
        </button>
      </div>

      {/* ── Mobile: cards ── */}
      <div className="sm:hidden space-y-3">
        {products.map((p) => (
          <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text)] text-sm truncate">{p.nameEs}</p>
                <p className="text-[var(--primary)] font-bold text-base mt-0.5">${Number(p.price).toFixed(2)}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs shrink-0 ${p.inStock ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {p.inStock ? 'En stock' : 'Sin stock'}
              </span>
            </div>
            <span className="inline-block px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs mb-3">
              {p.category?.nameEs ?? p.categoryId}
            </span>
            <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
              <button
                onClick={() => openEdit(p)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-[var(--primary)]
                           border border-[var(--primary)]/40 hover:bg-[var(--primary)]/10 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-red-400
                           border border-red-400/40 hover:bg-red-500/10 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {loading && products.length === 0 && (
          <p className="text-center text-[var(--text-muted)] py-10 text-sm">Cargando...</p>
        )}
        {!loading && products.length === 0 && (
          <p className="text-center text-[var(--text-muted)] py-10 text-sm">No hay productos</p>
        )}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden sm:block bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
              <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Nombre</th>
              <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Precio</th>
              <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Categoría</th>
              <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Stock</th>
              <th className="px-4 py-3 text-right text-[var(--text-muted)] font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading && products.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-[var(--text-muted)] py-10">Cargando...</td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-4 py-3 text-[var(--text)] font-medium">{p.nameEs}</td>
                <td className="px-4 py-3 text-[var(--text)]">${Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs">
                    {p.category?.nameEs ?? p.categoryId}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.inStock ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {p.inStock ? 'En stock' : 'Sin stock'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="text-[var(--primary)] hover:underline mr-3">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-[var(--text-muted)] py-10">No hay productos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 space-y-4
                            max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-[var(--text)]">
                {editing ? 'Editar producto' : 'Nuevo producto'}
              </h3>

              {/* Slug */}
              <div>
                <label className="block text-sm text-[var(--text)] mb-1">Slug (auto)</label>
                <div className="flex gap-2">
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, slug: toSlug(form.nameEs) })}
                    title="Regenerar slug desde nameEs"
                    className="px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)]
                               hover:text-[var(--text)] hover:border-[var(--primary)] transition-colors text-sm"
                  >
                    ↺
                  </button>
                </div>
                {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug}</p>}
              </div>

              {/* Bilingual fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Español</p>
                  {[
                    { key: 'nameEs', label: 'Nombre ES', onBlur: () => { if (!editing && !form.slug) setForm((f) => ({ ...f, slug: toSlug(f.nameEs) })); } },
                    { key: 'shortDescEs', label: 'Descripción corta ES' },
                  ].map(({ key, label, onBlur }) => (
                    <div key={key}>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
                      <input
                        value={form[key as keyof ProductForm] as string}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        onBlur={onBlur}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                                   text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Descripción ES</label>
                    <textarea
                      rows={3}
                      value={form.descriptionEs}
                      onChange={(e) => setForm({ ...form, descriptionEs: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                                 text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                    />
                    {errors.descriptionEs && <p className="text-red-400 text-xs mt-1">{errors.descriptionEs}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">English</p>
                  {[
                    { key: 'nameEn', label: 'Name EN' },
                    { key: 'shortDescEn', label: 'Short description EN' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
                      <input
                        value={form[key as keyof ProductForm] as string}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                                   text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">Description EN</label>
                    <textarea
                      rows={3}
                      value={form.descriptionEn}
                      onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                                 text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                    />
                    {errors.descriptionEn && <p className="text-red-400 text-xs mt-1">{errors.descriptionEn}</p>}
                  </div>
                </div>
              </div>

              {/* Price / Stock / Category */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-[var(--text)] mb-1">Precio</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text)] mb-1">Stock</label>
                  <input
                    type="number" min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text)] mb-1">Categoría</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  >
                    <option value="">— Seleccionar —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nameEs}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-red-400 text-xs mt-1">{errors.categoryId}</p>}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                    className="accent-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text)]">En stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="accent-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text)]">Destacado</span>
                </label>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'material', label: 'Material' },
                  { key: 'dimensions', label: 'Dimensiones' },
                  { key: 'weight', label: 'Peso' },
                  { key: 'printTime', label: 'Tiempo de impresión' },
                ] as const).map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
                    <input
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                                 text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                ))}
              </div>

              {/* Images */}
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Imágenes</p>
                {editing && editing.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editing.images.map((img) => (
                      <img key={img.id} src={img.url} alt={img.alt} className="w-16 h-16 object-cover rounded-lg border border-[var(--border)]" />
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, images: Array.from(e.target.files ?? []) })}
                  className="text-sm text-[var(--text-muted)] file:mr-3 file:py-1.5 file:px-3
                             file:rounded-lg file:border-0 file:bg-[var(--primary)] file:text-white
                             file:text-sm file:cursor-pointer hover:file:bg-[var(--primary-hover)]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)]
                             hover:text-[var(--text)] transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium
                             hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
