import { useState, useEffect } from 'react';
import { fetchOrders } from '../../lib/orders';

export default function OrdersStatCard() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('vectra-auth');
    const token = raw ? JSON.parse(raw).accessToken : null;
    if (!token) return;
    fetchOrders({ limit: 1 }, token)
      .then((res) => setCount(res.meta.total))
      .catch(() => setCount(0));
  }, []);

  return (
    <a
      href="/admin/orders"
      className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]
                 hover:border-[var(--primary)] transition-colors cursor-pointer"
    >
      <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-[var(--text)]">
        {count === null ? '—' : count}
      </div>
      <div className="text-sm text-[var(--text-muted)] mt-1">Pedidos</div>
    </a>
  );
}
