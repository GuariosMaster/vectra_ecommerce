import { useStore } from '@nanostores/react';
import { cartItems, cartOpen, cartTotal, removeFromCart, updateQuantity } from '../../stores/cart';

interface Props {
  lang: 'es' | 'en';
}

const labels = {
  es: {
    title: 'Tu carrito',
    empty: 'El carrito está vacío',
    total: 'Total',
    checkout: 'Finalizar compra',
    remove: 'Eliminar',
    continue: 'Seguir comprando',
  },
  en: {
    title: 'Your cart',
    empty: 'Cart is empty',
    total: 'Total',
    checkout: 'Checkout',
    remove: 'Remove',
    continue: 'Keep shopping',
  },
};

export default function ShoppingCart({ lang }: Props) {
  const items = useStore(cartItems);
  const open = useStore(cartOpen);
  const total = useStore(cartTotal);
  const l = labels[lang];

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={() => cartOpen.set(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col
                      bg-[var(--bg-card)] border-l border-[var(--border)] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text)]">{l.title}</h2>
          <button
            onClick={() => cartOpen.set(false)}
            className="w-9 h-9 flex items-center justify-center rounded-lg
                       hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]
                       hover:text-[var(--text)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)]">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <p className="text-[var(--text-muted)]">{l.empty}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[var(--text)] text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-[var(--primary)] font-semibold mt-1">${item.price.toFixed(2)}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]
                                   flex items-center justify-center text-[var(--text-muted)]
                                   hover:text-[var(--text)] hover:border-[var(--primary)] transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium text-[var(--text)] w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]
                                   flex items-center justify-center text-[var(--text-muted)]
                                   hover:text-[var(--text)] hover:border-[var(--primary)] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[var(--text-muted)] hover:text-red-400 transition-colors self-start"
                    aria-label={l.remove}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[var(--text)]">{l.total}</span>
              <span className="text-2xl font-black text-[var(--text)]">${total.toFixed(2)}</span>
            </div>
            <button
              className="w-full py-4 rounded-xl bg-[var(--primary)] text-white font-semibold
                         hover:bg-[var(--primary-hover)] transition-colors active:scale-95"
            >
              {/* TODO: Connect to checkout flow */}
              {l.checkout}
            </button>
            <button
              onClick={() => cartOpen.set(false)}
              className="w-full py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)]
                         hover:text-[var(--text)] hover:border-[var(--primary)] transition-colors text-sm"
            >
              {l.continue}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
