import { useState, useEffect } from 'react';
import { z } from 'zod';
import type { ApiPost } from '../../types/api';
import { fetchPosts, createPost, updatePost, deletePost, toSlug } from '../../lib/blog';

interface PostForm {
  slug: string;
  titleEs: string;
  excerptEs: string;
  contentEs: string;
  coverImage: string;
  author: string;
  draft: boolean;
}

const emptyForm: PostForm = {
  slug: '', titleEs: '',
  excerptEs: '',
  contentEs: '',
  coverImage: '', author: '', draft: true,
};

const postSchema = z.object({
  slug: z.string().min(1, 'Requerido'),
  titleEs: z.string().min(2, 'Mínimo 2 caracteres'),
  excerptEs: z.string().min(10, 'Mínimo 10 caracteres'),
  contentEs: z.string().min(10, 'Mínimo 10 caracteres'),
  coverImage: z.string().url('Debe ser una URL válida'),
  author: z.string().min(2, 'Mínimo 2 caracteres'),
});

export default function BlogCRUD() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiPost | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = sessionStorage.getItem('vectra-auth');
    const t = raw ? JSON.parse(raw).accessToken : null;
    setToken(t);

    setLoading(true);
    fetchPosts({ limit: 50 }, t ?? undefined)
      .then(({ data }) => setPosts(data))
      .catch((e) => setApiError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(p: ApiPost) {
    setEditing(p);
    setForm({
      slug: p.slug,
      titleEs: p.titleEs,
      excerptEs: p.excerptEs,
      contentEs: p.contentEs,
      coverImage: p.coverImage, author: p.author, draft: p.draft,
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar post?')) return;
    if (!token) { setApiError('No autenticado'); return; }
    try {
      setLoading(true);
      await deletePost(id, token);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    const result = postSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    if (!token) { setApiError('No autenticado'); return; }

    const payload = { ...form, tagIds: [] as string[] };

    try {
      setLoading(true);
      if (editing) {
        const updated = await updatePost(editing.id, payload, token);
        setPosts((prev) => prev.map((p) => p.id === editing.id ? updated : p));
      } else {
        const created = await createPost(payload, token);
        setPosts((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
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

      <div className="flex items-center justify-between mb-6 gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text)]">Blog Posts ({posts.length})</h2>
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
        {posts.map((p) => (
          <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-semibold text-[var(--text)] text-sm leading-snug line-clamp-2 flex-1">{p.titleEs}</p>
              <span className={`px-2 py-1 rounded-full text-xs shrink-0 ${p.draft ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                {p.draft ? 'Borrador' : 'Publicado'}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3">{p.author} · {formatDate(p.publishedAt ?? p.createdAt)}</p>
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
        {loading && posts.length === 0 && (
          <p className="text-center text-[var(--text-muted)] py-10 text-sm">Cargando...</p>
        )}
        {!loading && posts.length === 0 && (
          <p className="text-center text-[var(--text-muted)] py-10 text-sm">No hay posts</p>
        )}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden sm:block bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
              <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Título</th>
              <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Autor</th>
              <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Fecha</th>
              <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">Estado</th>
              <th className="px-4 py-3 text-right text-[var(--text-muted)] font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading && posts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-[var(--text-muted)] py-10">Cargando...</td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-4 py-3 text-[var(--text)] font-medium max-w-xs truncate">{p.titleEs}</td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{p.author}</td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{formatDate(p.publishedAt ?? p.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.draft ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                    {p.draft ? 'Borrador' : 'Publicado'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="text-[var(--primary)] hover:underline mr-3">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
            {!loading && posts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-[var(--text-muted)] py-10">No hay posts</td>
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
            <div className="w-full max-w-3xl bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 space-y-4
                            max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-[var(--text)]">
                {editing ? 'Editar post' : 'Nuevo post'}
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
                    onClick={() => setForm({ ...form, slug: toSlug(form.titleEs) })}
                    title="Regenerar slug desde título ES"
                    className="px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)]
                               hover:text-[var(--text)] hover:border-[var(--primary)] transition-colors text-sm"
                  >
                    ↺
                  </button>
                </div>
                {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug}</p>}
              </div>

              {/* Campos de texto */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Título</label>
                  <input
                    value={form.titleEs}
                    onChange={(e) => setForm({ ...form, titleEs: e.target.value })}
                    onBlur={() => { if (!editing && !form.slug) setForm((f) => ({ ...f, slug: toSlug(f.titleEs) })); }}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  {errors.titleEs && <p className="text-red-400 text-xs mt-1">{errors.titleEs}</p>}
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Extracto</label>
                  <textarea
                    rows={2}
                    value={form.excerptEs}
                    onChange={(e) => setForm({ ...form, excerptEs: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  />
                  {errors.excerptEs && <p className="text-red-400 text-xs mt-1">{errors.excerptEs}</p>}
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Contenido</label>
                  <textarea
                    rows={8}
                    value={form.contentEs}
                    onChange={(e) => setForm({ ...form, contentEs: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  />
                  {errors.contentEs && <p className="text-red-400 text-xs mt-1">{errors.contentEs}</p>}
                </div>
              </div>

              {/* Author + Cover */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[var(--text)] mb-1">Autor</label>
                  <input
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  {errors.author && <p className="text-red-400 text-xs mt-1">{errors.author}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[var(--text)] mb-1">Imagen de portada (URL)</label>
                  <input
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm
                               focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  {errors.coverImage && <p className="text-red-400 text-xs mt-1">{errors.coverImage}</p>}
                </div>
              </div>

              {/* Draft */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.draft}
                  onChange={(e) => setForm({ ...form, draft: e.target.checked })}
                  className="accent-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text)]">Guardar como borrador</span>
              </label>

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
