import { useState, useEffect } from 'react';
import { z } from 'zod';

interface BlogPost {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  tags: string;
  draft: boolean;
  date: string;
}

const postSchema = z.object({
  title: z.string().min(5, 'Mínimo 5 caracteres'),
  author: z.string().min(2, 'Mínimo 2 caracteres'),
  excerpt: z.string().min(20, 'Mínimo 20 caracteres'),
  tags: z.string(),
  draft: z.boolean(),
});

const STORAGE_KEY = 'vectra-admin-blog';

const defaultPosts: BlogPost[] = [
  { id: '1', title: 'Guía de Impresión 3D para Principiantes', author: 'Equipo Vectra', excerpt: 'Todo lo que necesitas saber para comenzar en el mundo de la impresión 3D', tags: 'guía,principiantes,3D', draft: false, date: '2024-03-10' },
];

export default function BlogCRUD() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Omit<BlogPost, 'id' | 'date'>>({
    title: '', author: '', excerpt: '', tags: '', draft: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setPosts(stored ? JSON.parse(stored) : defaultPosts);
  }, []);

  function save(updated: BlogPost[]) {
    setPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', author: '', excerpt: '', tags: '', draft: true });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(p: BlogPost) {
    setEditing(p);
    setForm({ title: p.title, author: p.author, excerpt: p.excerpt, tags: p.tags, draft: p.draft });
    setErrors({});
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm('¿Eliminar post?')) {
      save(posts.filter((p) => p.id !== id));
    }
  }

  function handleSubmit() {
    const result = postSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    if (editing) {
      save(posts.map((p) => p.id === editing.id ? { ...form, id: editing.id, date: editing.date } : p));
    } else {
      save([...posts, { ...form, id: Date.now().toString(), date: new Date().toISOString().split('T')[0] }]);
    }
    setModalOpen(false);
  }

  return (
    <div>
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
              <p className="font-semibold text-[var(--text)] text-sm leading-snug line-clamp-2 flex-1">{p.title}</p>
              <span className={`px-2 py-1 rounded-full text-xs shrink-0 ${p.draft ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                {p.draft ? 'Borrador' : 'Publicado'}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3">{p.author} · {p.date}</p>
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
        {posts.length === 0 && (
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
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-4 py-3 text-[var(--text)] font-medium line-clamp-1">{p.title}</td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{p.author}</td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{p.date}</td>
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
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-[var(--text-muted)] py-10">No hay posts</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 space-y-4
                            max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-[var(--text)]">
                {editing ? 'Editar post' : 'Nuevo post'}
              </h3>

              {[
                { key: 'title', label: 'Título' },
                { key: 'author', label: 'Autor' },
                { key: 'tags', label: 'Tags (separados por coma)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm text-[var(--text)] mb-1">{label}</label>
                  <input
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
                </div>
              ))}

              <div>
                <label className="block text-sm text-[var(--text)] mb-1">Extracto</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                             text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                />
                {errors.excerpt && <p className="text-red-400 text-xs mt-1">{errors.excerpt}</p>}
              </div>

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
                  className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium
                             hover:bg-[var(--primary-hover)] transition-colors"
                >
                  {editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
