import { useState, useEffect } from 'react';
import { fetchOrders, updateOrderStatus } from '../../lib/orders';
import type { ApiOrder, OrderStatus } from '../../types/api';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'En proceso',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500/15 text-yellow-400',
  CONFIRMED: 'bg-blue-500/15 text-blue-400',
  PROCESSING: 'bg-purple-500/15 text-purple-400',
  SHIPPED: 'bg-cyan-500/15 text-cyan-400',
  DELIVERED: 'bg-green-500/15 text-green-400',
  CANCELLED: 'bg-red-500/15 text-red-400',
};

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrdersCRUD() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApiOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');

  useEffect(() => {
    const raw = sessionStorage.getItem('vectra-auth');
    const t = raw ? JSON.parse(raw).accessToken : null;
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    load(1);
  }, [token, filterStatus]);

  async function load(p: number) {
    if (!token) return;
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetchOrders({ page: p, limit: 20, status: filterStatus || undefined }, token);
      setOrders(res.data);
      setTotal(res.meta.total);
      setPage(res.meta.page);
      setTotalPages(res.meta.totalPages);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    if (!token) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateOrderStatus(orderId, newStatus, token);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selected?.id === orderId) setSelected(updated);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Error al actualizar estado');
    } finally {
      setUpdatingStatus(false);
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

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">Pedidos</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{total} pedido{total !== 1 ? 's' : ''} en total</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
          className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                     text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
        >
          <option value="">Todos los estados</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="text-left px-4 py-3 font-medium">N° Pedido</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Fecha</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[var(--text-muted)]">
                    Cargando...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[var(--text-muted)]">
                    No hay pedidos.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                    onClick={() => setSelected(order)}
                  >
                    <td className="px-4 py-3 font-mono font-medium text-[var(--text)]">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] hidden sm:table-cell">
                      {order.shippingAddr
                        ? `${order.shippingAddr.firstName} ${order.shippingAddr.lastName}`
                        : order.guestEmail ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] hidden md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[var(--text)]">
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(order); }}
                        className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                        title="Ver detalle"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      </button>
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

      {/* Order detail modal */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg
                            max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                <div>
                  <h3 className="font-bold text-[var(--text)]">{selected.orderNumber}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {new Date(selected.createdAt).toLocaleString('es-CO')}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg
                             hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-colors"
                >✕</button>
              </div>

              <div className="p-6 space-y-5">
                {/* Status selector */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wide">
                    Estado del pedido
                  </label>
                  <select
                    value={selected.status}
                    onChange={(e) => handleStatusChange(selected.id, e.target.value as OrderStatus)}
                    disabled={updatingStatus}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                               text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors
                               disabled:opacity-50"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                {/* Payment status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Estado de pago</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    selected.paymentStatus === 'PAID' ? 'bg-green-500/15 text-green-400' :
                    selected.paymentStatus === 'FAILED' ? 'bg-red-500/15 text-red-400' :
                    'bg-yellow-500/15 text-yellow-400'
                  }`}>
                    {selected.paymentStatus === 'PAID' ? 'Pagado' :
                     selected.paymentStatus === 'FAILED' ? 'Fallido' : 'Pendiente'}
                  </span>
                </div>

                {/* Shipping */}
                {selected.shippingAddr && (
                  <div>
                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Envío</p>
                    <div className="bg-[var(--bg-secondary)] rounded-xl p-4 space-y-1 text-sm text-[var(--text)]">
                      <p className="font-medium">{selected.shippingAddr.firstName} {selected.shippingAddr.lastName}</p>
                      <p className="text-[var(--text-muted)]">{selected.shippingAddr.email}</p>
                      <p className="text-[var(--text-muted)]">{selected.shippingAddr.phone}</p>
                      <p className="text-[var(--text-muted)]">
                        {selected.shippingAddr.address}, {selected.shippingAddr.city}, {selected.shippingAddr.state}
                      </p>
                      <p className="text-[var(--text-muted)]">{selected.shippingAddr.postalCode} — {selected.shippingAddr.country}</p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">Productos</p>
                  <ul className="space-y-2">
                    {selected.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between text-sm bg-[var(--bg-secondary)] rounded-xl px-4 py-2.5">
                        <span className="text-[var(--text)]">
                          {item.productName}
                          <span className="text-[var(--text-muted)] ml-2">×{item.quantity}</span>
                        </span>
                        <span className="font-semibold text-[var(--text)]">${Number(item.subtotal).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                  <span className="font-semibold text-[var(--text)]">Total</span>
                  <span className="text-xl font-black text-[var(--primary)]">${Number(selected.total).toFixed(2)}</span>
                </div>

                {selected.notes && (
                  <div>
                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Notas</p>
                    <p className="text-sm text-[var(--text)] bg-[var(--bg-secondary)] rounded-xl px-4 py-3">{selected.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
