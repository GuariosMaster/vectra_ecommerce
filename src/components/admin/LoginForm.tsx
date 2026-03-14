import { useState } from 'react';
import { login } from '../../stores/auth';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // TODO: Replace with real API call to backend
    await new Promise((r) => setTimeout(r, 400));
    const success = login(password);

    if (success) {
      window.location.href = '/admin/dashboard';
    } else {
      setError('Contraseña incorrecta / Wrong password');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--primary)] flex items-center justify-center">
            <span className="text-white font-black text-2xl">V</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Vectra Admin</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Panel de control</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                         text-[var(--text)] placeholder:text-[var(--text-muted)]
                         focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold
                       hover:bg-[var(--primary-hover)] transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
