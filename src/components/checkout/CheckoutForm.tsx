import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, cartTotal, clearCart } from '../../stores/cart';
import { createOrder, createMpPreference } from '../../lib/orders';

interface Props {
  lang: 'es' | 'en';
}

const labels = {
  es: {
    title: 'Finalizar compra',
    orderSummary: 'Resumen del pedido',
    shipping: 'Datos de envío',
    firstName: 'Nombre', lastName: 'Apellido',
    email: 'Email', phone: 'Teléfono',
    address: 'Dirección', city: 'Ciudad',
    state: 'Departamento / Provincia', postalCode: 'Código postal',
    country: 'País', notes: 'Notas (opcional)',
    total: 'Total', pay: 'Pagar con MercadoPago',
    processing: 'Procesando...',
    backToCart: '← Volver al catálogo',
    emptyCart: 'Tu carrito está vacío.',
    unit: 'c/u',
  },
  en: {
    title: 'Checkout',
    orderSummary: 'Order summary',
    shipping: 'Shipping details',
    firstName: 'First name', lastName: 'Last name',
    email: 'Email', phone: 'Phone',
    address: 'Address', city: 'City',
    state: 'State / Province', postalCode: 'Postal code',
    country: 'Country', notes: 'Notes (optional)',
    total: 'Total', pay: 'Pay with MercadoPago',
    processing: 'Processing...',
    backToCart: '← Back to catalog',
    emptyCart: 'Your cart is empty.',
    unit: 'each',
  },
};

interface ShippingForm {
  firstName: string; lastName: string; email: string; phone: string;
  address: string; city: string; state: string; postalCode: string;
  country: string; notes: string;
}

const emptyForm: ShippingForm = {
  firstName: '', lastName: '', email: '', phone: '',
  address: '', city: '', state: '', postalCode: '',
  country: 'CO', notes: '',
};

const inputClass = `w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
  text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm
  focus:outline-none focus:border-[var(--primary)] transition-colors`;
const labelClass = 'block text-sm font-medium text-[var(--text)] mb-1.5';
const errorClass = 'text-red-400 text-xs mt-1';

function Field({
  label, type = 'text', placeholder, value, onChange, error,
}: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

export default function CheckoutForm({ lang }: Props) {
  const items = useStore(cartItems);
  const total = useStore(cartTotal);
  const l = labels[lang];

  const [form, setForm] = useState<ShippingForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function set(key: keyof ShippingForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const required: (keyof ShippingForm)[] = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country',
    ];
    const errs: Partial<Record<keyof ShippingForm, string>> = {};
    for (const k of required) {
      if (!form[k].trim()) errs[k] = lang === 'es' ? 'Campo requerido' : 'Required field';
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = lang === 'es' ? 'Email inválido' : 'Invalid email';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.slug, quantity: i.quantity })),
        shippingAddress: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
        notes: form.notes || undefined,
        guestEmail: form.email,
      });

      const { initPoint } = await createMpPreference(order.id);
      clearCart();
      window.location.href = initPoint;
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : (lang === 'es' ? 'Error al procesar el pedido' : 'Error processing order'));
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-muted)] mb-6">{l.emptyCart}</p>
        <a href={`/${lang}/products`} className="text-[var(--primary)] hover:underline">{l.backToCart}</a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)] mb-8">{l.title}</h1>

      {apiError && (
        <div className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                        bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="shrink-0 hover:opacity-70">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left: shipping form */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
            <h2 className="text-base font-bold text-[var(--text)] mb-5">{l.shipping}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={l.firstName} value={form.firstName} onChange={(v) => set('firstName', v)} error={errors.firstName} />
              <Field label={l.lastName} value={form.lastName} onChange={(v) => set('lastName', v)} error={errors.lastName} />
              <Field label={l.email} type="email" placeholder="tu@email.com" value={form.email} onChange={(v) => set('email', v)} error={errors.email} />
              <Field label={l.phone} placeholder="+57 300 000 0000" value={form.phone} onChange={(v) => set('phone', v)} error={errors.phone} />
              <div className="sm:col-span-2">
                <Field label={l.address} placeholder="Calle 123 # 45-67" value={form.address} onChange={(v) => set('address', v)} error={errors.address} />
              </div>
              <Field label={l.city} placeholder="Bogotá" value={form.city} onChange={(v) => set('city', v)} error={errors.city} />
              <Field label={l.state} placeholder="Cundinamarca" value={form.state} onChange={(v) => set('state', v)} error={errors.state} />
              <Field label={l.postalCode} placeholder="110111" value={form.postalCode} onChange={(v) => set('postalCode', v)} error={errors.postalCode} />
              <Field label={l.country} placeholder="CO" value={form.country} onChange={(v) => set('country', v)} error={errors.country} />
              <div className="sm:col-span-2">
                <label className={labelClass}>{l.notes}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: order summary + CTA */}
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
            <h2 className="text-base font-bold text-[var(--text)] mb-4">{l.orderSummary}</h2>
            <ul className="space-y-3 mb-5">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-[var(--border)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] line-clamp-1">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.quantity} × ${item.price.toFixed(2)} {l.unit}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text)] flex-shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
              <span className="font-semibold text-[var(--text)]">{l.total}</span>
              <span className="text-2xl font-black text-[var(--text)]">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[var(--primary)] text-white font-bold text-base
                       hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {l.processing}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                {l.pay}
              </>
            )}
          </button>

          <a
            href={`/${lang}/products`}
            className="block text-center text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors py-2"
          >
            {l.backToCart}
          </a>
        </div>
      </form>
    </div>
  );
}
