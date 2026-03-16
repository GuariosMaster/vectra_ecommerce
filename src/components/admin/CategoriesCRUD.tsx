import { useState, useEffect, useCallback } from 'react';
import { fetchCategories, createCategory, deleteCategory, toSlug } from '../../lib/products';
import type { ApiCategory } from '../../types/api';

interface CategoryWithCount extends ApiCategory {
  _count?: { products: number };
}

const inputClass = `w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
  text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors`;

export default function CategoriesCRUD() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [nameEs, setNameEs] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('vectra-auth');
    setToken(raw ? JSON.parse(raw).accessToken : null);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await fetchCategories() as CategoryWithCount[];
      setCategories(data);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openModal() {
    setNameEs('');
    setSlug('');
    setSlugTouched(false);
    setFormError('');
    setModalOpen(true);
  }

  async function handleCreate() {
    if (!nameEs.trim()) { setFormError('El nombre es requerido'); return; }
    if (!slug.trim()) { setFormError('El slug es requerido'); return; }
    if (!token) return;
    setSaving(true);
    setFormError('');
    try {
      const created = await createCategory({ slug, nameEs }, token) as CategoryWithCount;
      setCategories((prev) => [...prev, created].sort((a, b) => a.nameEs.localeCompare(b.nameEs)));
      setModalOpen(false);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error al crear categoría');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: CategoryWithCount) {
    const count = cat._count?.products ?? 0;
    const msg = count > 0
      ? `Esta categoría tiene ${count} producto(s). No se puede eliminar.`
      : `¿Eliminar la categoría "${cat.nameEs}"?`;
    if (count > 0) { alert(msg); return; }
    if (!confirm(msg)) return;
    if (!token) return;
    try {
      await deleteCategory(cat.id, token);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al eliminar');
    }
  }

  return (
    <div>
      {apiError && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                        bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="shrink-0 hover:opacity-70">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text)]">
          Categorías ({categories.length})
        </h2>
        <button
          onClick={openModal}
          className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium
                     hover:bg-[var(--primary-hover)] transition-colors"
        >
          + Nueva
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-center text-[var(--text-muted)] py-10 text-sm">Cargando...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-[var(--text-muted)] py-10 text-sm">No hay categorías</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Nombre</th>
                <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 text-center text-[var(--text-muted)] font-medium">Productos</th>
                <th className="px-4 py-3 text-right text-[var(--text-muted)] font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{cat.nameEs}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)] font-mono text-xs hidden sm:table-cell">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (cat._count?.products ?? 0) > 0
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                    }`}>
                      {cat._count?.products ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(cat)}
                      className="text-red-400 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal nueva categoría */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text)]">Nueva categoría</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg
                             hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                >✕</button>
              </div>

              <div className="p-5 space-y-4">
                {formError && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/25 px-3 py-2 rounded-xl">
                    {formError}
                  </p>
                )}

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Nombre</label>
                  <input
                    value={nameEs}
                    onChange={(e) => {
                      setNameEs(e.target.value);
                      if (!slugTouched) setSlug(toSlug(e.target.value));
                    }}
                    placeholder="Ej: Miniaturas"
                    className={inputClass}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Slug (auto)</label>
                  <div className="flex gap-2">
                    <input
                      value={slug}
                      onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
                      placeholder="miniaturas"
                      className={inputClass + ' flex-1'}
                    />
                    <button
                      type="button"
                      onClick={() => { setSlug(toSlug(nameEs)); setSlugTouched(false); }}
                      title="Regenerar slug"
                      className="px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)]
                                 hover:border-[var(--primary)] transition-colors text-sm"
                    >↺</button>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)]
                               hover:text-[var(--text)] transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium
                               hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
