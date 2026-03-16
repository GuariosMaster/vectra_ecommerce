import { useState, useEffect } from 'react';
import {
  fetchPersonalizationRequests,
  updatePersonalizationRequest,
  deletePersonalizationRequest,
} from '../../lib/personalization';
import type { ApiPersonalizationRequest, PersonalizStatus } from '../../types/api';

const STATUS_LABELS: Record<PersonalizStatus, string> = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revisión',
  QUOTED: 'Cotizado',
  ACCEPTED: 'Aceptado',
  REJECTED: 'Rechazado',
};

const STATUS_COLORS: Record<PersonalizStatus, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25',
  IN_REVIEW: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  QUOTED: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
  ACCEPTED: 'bg-green-500/10 text-green-400 border-green-500/25',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/25',
};

export default function PersonalizationCRUD() {
  const [requests, setRequests] = useState<ApiPersonalizationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<PersonalizStatus | ''>('');
  const [selected, setSelected] = useState<ApiPersonalizationRequest | null>(null);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState<PersonalizStatus>('PENDING');
  const [editNotes, setEditNotes] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const raw = sessionStorage.getItem('vectra-auth');
    const t = raw ? JSON.parse(raw).accessToken : null;
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    load();
  }, [token, filterStatus, page]);

  async function load() {
    setLoading(true);
    setApiError(null);
    try {
      const { data, meta } = await fetchPersonalizationRequests(
        { limit: 20, page, status: filterStatus || undefined },
        token!,
      );
      setRequests(data);
      setTotalPages(meta.totalPages);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }

  function openDetail(req: ApiPersonalizationRequest) {
    setSelected(req);
    setEditStatus(req.status);
    setEditNotes(req.adminNotes ?? '');
    setEditPrice(req.quotedPrice != null ? String(req.quotedPrice) : '');
  }

  async function handleSave() {
    if (!selected || !token) return;
    setSaving(true);
    setApiError(null);
    try {
      const updated = await updatePersonalizationRequest(
        selected.id,
        {
          status: editStatus,
          adminNotes: editNotes || undefined,
          quotedPrice: editPrice ? Number(editPrice) : undefined,
        },
        token,
      );
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelected(null);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!confirm('¿Eliminar esta solicitud?')) return;
    try {
      await deletePersonalizationRequest(id, token);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al eliminar');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-[var(--text)]">Solicitudes de Personalización</h1>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as PersonalizStatus | ''); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {apiError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center justify-between">
          {apiError}
          <button onClick={() => setApiError(null)} className="ml-2 text-red-300 hover:text-red-100">✕</button>
        </div>
      )}

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium">Descripción</th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium hidden md:table-cell">Estado</th>
                <th className="text-left px-4 py-3 text-[var(--text-muted)] font-medium hidden lg:table-cell">Fecha</th>
                <th className="text-right px-4 py-3 text-[var(--text-muted)] font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[var(--text-muted)]">Cargando...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[var(--text-muted)]">No hay solicitudes</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text)]">{req.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{req.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[var(--text-muted)] line-clamp-2 max-w-xs">{req.description}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[req.status]}`}>
                        {STATUS_LABELS[req.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[var(--text-muted)]">
                      {new Date(req.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(req)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-xs text-[var(--text-muted)]">Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* Detail / edit modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text)]">Detalle de Solicitud</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors ml-4 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Client info */}
            <div className="mb-4 p-4 rounded-xl bg-[var(--bg-secondary)] space-y-1.5 text-sm">
              <p><span className="text-[var(--text-muted)]">Nombre: </span><span className="text-[var(--text)] font-medium">{selected.name}</span></p>
              <p>
                <span className="text-[var(--text-muted)]">Email: </span>
                <a href={`mailto:${selected.email}`} className="text-[var(--primary)] hover:underline">{selected.email}</a>
              </p>
              {selected.phone && (
                <p><span className="text-[var(--text-muted)]">Teléfono: </span><span className="text-[var(--text)]">{selected.phone}</span></p>
              )}
              <p><span className="text-[var(--text-muted)]">Idioma: </span><span className="text-[var(--text)]">{selected.lang}</span></p>
              <p><span className="text-[var(--text-muted)]">Recibida: </span><span className="text-[var(--text)]">{new Date(selected.createdAt).toLocaleString('es-AR')}</span></p>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Descripción</h3>
              <p className="text-[var(--text)] text-sm bg-[var(--bg-secondary)] rounded-xl p-4 whitespace-pre-wrap">{selected.description}</p>
            </div>

            {/* Reference */}
            {(selected.referenceUrl || selected.referenceImage) && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Referencia visual</h3>
                {selected.referenceImage && (
                  <img
                    src={selected.referenceImage}
                    alt="Referencia"
                    className="w-full max-h-48 object-contain rounded-xl bg-[var(--bg-secondary)] mb-2"
                  />
                )}
                {selected.referenceUrl && (
                  <a
                    href={selected.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--primary)] hover:underline break-all"
                  >
                    {selected.referenceUrl}
                  </a>
                )}
              </div>
            )}

            {/* Admin editable fields */}
            <div className="space-y-4 border-t border-[var(--border)] pt-4 mt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Gestión</h3>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Estado</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as PersonalizStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)]"
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Precio cotizado ($)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Notas internas</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Notas visibles solo para el admin..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
