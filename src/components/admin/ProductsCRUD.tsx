import { useState, useEffect } from 'react';
import { z } from 'zod';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  shortDescription: string;
}

const productSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  price: z.number().min(0, 'El precio debe ser positivo'),
  category: z.enum(['figurines', 'functional', 'decorative', 'custom', 'industrial']),
  inStock: z.boolean(),
  shortDescription: z.string().min(10, 'Mínimo 10 caracteres'),
});

const STORAGE_KEY = 'vectra-admin-products';

const defaultProducts: Product[] = [
  { id: '1', name: 'Figura Personalizada', price: 29.99, category: 'figurines', inStock: true, shortDescription: 'Figura impresa en 3D con alta resolución' },
  { id: '2', name: 'Soporte de Escritorio', price: 19.99, category: 'functional', inStock: true, shortDescription: 'Soporte ergonómico para monitor' },
];

export default function ProductsCRUD() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Omit<Product, 'id'>>({
    name: '', price: 0, category: 'custom', inStock: true, shortDescription: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setProducts(stored ? JSON.parse(stored) : defaultProducts);
  }, []);

  function save(updated: Product[]) {
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', price: 0, category: 'custom', inStock: true, shortDescription: '' });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, price: p.price, category: p.category, inStock: p.inStock, shortDescription: p.shortDescription });
    setErrors({});
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm('¿Eliminar producto?')) {
      save(products.filter((p) => p.id !== id));
    }
  }

  function handleSubmit() {
    const result = productSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    if (editing) {
      save(products.map((p) => p.id === editing.id ? { ...form, id: editing.id } : p));
    } else {
      save([...products, { ...form, id: Date.now().toString() }]);
    }
    setModalOpen(false);
  }

  return (
    <div>
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
                <p className="font-semibold text-[var(--text)] text-sm truncate">{p.name}</p>
                <p className="text-[var(--primary)] font-bold text-base mt-0.5">${p.price.toFixed(2)}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs shrink-0 ${p.inStock ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {p.inStock ? 'En stock' : 'Sin stock'}
              </span>
            </div>
            <span className="inline-block px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs mb-3">
              {p.category}
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
        {products.length === 0 && (
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
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-4 py-3 text-[var(--text)] font-medium">{p.name}</td>
                <td className="px-4 py-3 text-[var(--text)]">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs">
                    {p.category}
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
            {products.length === 0 && (
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
            <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 space-y-4
                            max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-[var(--text)]">
                {editing ? 'Editar producto' : 'Nuevo producto'}
              </h3>

              {(['name', 'shortDescription'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm text-[var(--text)] mb-1 capitalize">{field}</label>
                  <input
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                  {errors[field] && <p className="text-red-400 text-xs mt-1">{errors[field]}</p>}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[var(--text)] mb-1">Precio</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text)] mb-1">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Product['category'] })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  >
                    {['figurines', 'functional', 'decorative', 'custom', 'industrial'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                  className="accent-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text)]">En stock</span>
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
