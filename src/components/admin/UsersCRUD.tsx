import { useState, useEffect } from 'react';
import { fetchUsers, updateUser, deleteUser } from '../../lib/users';
import type { ApiUser, UpdateUserBody } from '../../types/api';

export default function UsersCRUD() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [filterRole, setFilterRole] = useState<'ADMIN' | 'USER' | ''>('');
  const [filterActive, setFilterActive] = useState<'true' | 'false' | ''>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [editTarget, setEditTarget] = useState<ApiUser | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserBody>({});
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<ApiUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('vectra-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      setToken(parsed.accessToken ?? null);
      setCurrentUserId(parsed.userId ?? null);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    load(1);
  }, [token, filterRole, filterActive, search]);

  async function load(p: number) {
    if (!token) return;
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetchUsers(
        {
          page: p,
          limit: 20,
          role: filterRole || undefined,
          isActive: filterActive || undefined,
          search: search || undefined,
        },
        token
      );
      setUsers(res.data);
      setTotal(res.meta.total);
      setPage(res.meta.page);
      setTotalPages(res.meta.totalPages);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  function openEdit(user: ApiUser) {
    setEditTarget(user);
    setEditForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
      role: user.role,
      isActive: user.isActive,
    });
  }

  async function handleSave() {
    if (!token || !editTarget) return;
    setSaving(true);
    setApiError(null);
    try {
      const updated = await updateUser(editTarget.id, editForm, token);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditTarget(null);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleRole(user: ApiUser) {
    if (!token) return;
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const updated = await updateUser(user.id, { role: newRole }, token);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al cambiar rol');
    }
  }

  async function handleToggleActive(user: ApiUser) {
    if (!token || user.id === currentUserId) return;
    try {
      const updated = await updateUser(user.id, { isActive: !user.isActive }, token);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al cambiar estado');
    }
  }

  async function handleDelete() {
    if (!token || !confirmDelete) return;
    setDeleting(true);
    try {
      await deleteUser(confirmDelete.id, token);
      setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
      setTotal((t) => t - 1);
      setConfirmDelete(null);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  }

  function getInitial(user: ApiUser) {
    if (user.firstName) return user.firstName[0].toUpperCase();
    return user.email[0].toUpperCase();
  }

  function getFullName(user: ApiUser) {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '—';
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

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">Usuarios</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{total} usuario{total !== 1 ? 's' : ''} en total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="flex gap-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSearch(searchInput); }}
              placeholder="Buscar email o nombre…"
              className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                         text-[var(--text)] text-sm placeholder:text-[var(--text-muted)]
                         focus:outline-none focus:border-[var(--primary)] transition-colors w-52"
            />
            <button
              onClick={() => setSearch(searchInput)}
              className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                         text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--primary)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
          {/* Role filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'ADMIN' | 'USER' | '')}
            className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                       text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
          >
            <option value="">Todos los roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">Usuario</option>
          </select>
          {/* Active filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'true' | 'false' | '')}
            className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                       text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="text-left px-4 py-3 font-medium">Usuario</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Nombre</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Rol</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Último acceso</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[var(--text-muted)]">Cargando...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[var(--text-muted)]">No hay usuarios.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                    {/* Avatar + email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                             style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}>
                          {getInitial(user)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[var(--text)] font-medium truncate">{user.email}</p>
                          {user._count !== undefined && (
                            <p className="text-xs text-[var(--text-muted)]">{user._count.orders} pedido{user._count.orders !== 1 ? 's' : ''}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3 text-[var(--text-muted)] hidden sm:table-cell">{getFullName(user)}</td>
                    {/* Role badge + toggle */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <button
                        onClick={() => handleToggleRole(user)}
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-opacity hover:opacity-70 ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-500/15 text-purple-400'
                            : 'bg-blue-500/15 text-blue-400'
                        }`}
                        title="Clic para cambiar rol"
                      >
                        {user.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                      </button>
                    </td>
                    {/* Last login */}
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs hidden lg:table-cell">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'Nunca'}
                    </td>
                    {/* Active toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={user.id === currentUserId}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-opacity
                          ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-70'}
                          ${user.isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}
                        title={user.id === currentUserId ? 'No puedes desactivarte a ti mismo' : 'Clic para cambiar estado'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(user)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg
                                     text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmDelete(user)}
                          disabled={user.id === currentUserId}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors
                            ${user.id === currentUserId
                              ? 'opacity-30 cursor-not-allowed text-[var(--text-muted)]'
                              : 'text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10'}`}
                          title={user.id === currentUserId ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--text-muted)]">Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => load(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-muted)]
                           disabled:opacity-40 hover:border-[var(--primary)] hover:text-[var(--text)] transition-colors"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => load(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-muted)]
                           disabled:opacity-40 hover:border-[var(--primary)] hover:text-[var(--text)] transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editTarget && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setEditTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                <div>
                  <h3 className="font-bold text-[var(--text)]">Editar usuario</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{editTarget.email}</p>
                </div>
                <button
                  onClick={() => setEditTarget(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-colors"
                >✕</button>
              </div>

              <div className="p-6 space-y-4">
                {/* Email — read only */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    type="text"
                    value={editTarget.email}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text-muted)] text-sm opacity-60 cursor-not-allowed"
                  />
                </div>

                {/* First name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Nombre</label>
                    <input
                      type="text"
                      value={editForm.firstName ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                                 text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Apellido</label>
                    <input
                      type="text"
                      value={editForm.lastName ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                                 text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Teléfono</label>
                  <input
                    type="text"
                    value={editForm.phone ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">Rol</label>
                  <select
                    value={editForm.role ?? 'USER'}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as 'ADMIN' | 'USER' }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  >
                    <option value="USER">Usuario</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text)]">Cuenta activa</span>
                  <button
                    onClick={() => setEditForm((f) => ({ ...f, isActive: !f.isActive }))}
                    disabled={editTarget.id === currentUserId}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none
                      ${editTarget.id === currentUserId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${editForm.isActive ? 'bg-green-500' : 'bg-[var(--border)]'}`}
                    title={editTarget.id === currentUserId ? 'No puedes desactivarte a ti mismo' : undefined}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                      ${editForm.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Save */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditTarget(null)}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)]
                               hover:text-[var(--text)] hover:border-[var(--primary)] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}
                  >
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-sm shadow-2xl p-6">
              <h3 className="font-bold text-[var(--text)] mb-1">Eliminar usuario</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                ¿Estás seguro de eliminar a <span className="font-medium text-[var(--text)]">{confirmDelete.email}</span>?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)]
                             hover:text-[var(--text)] hover:border-[var(--primary)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
