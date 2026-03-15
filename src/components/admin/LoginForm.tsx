import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { login, loginWithGoogle } from '../../stores/auth';

const GOOGLE_CLIENT_ID = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID ?? '';

/** Decode a Google JWT credential payload (client-side, no verify needed) */
function decodeGoogleJwt(token: string): { email?: string; name?: string } | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/* ── Inner form (needs GoogleOAuthProvider ancestor) ── */
function LoginFormInner() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 380));
    const ok = login(email.trim().toLowerCase(), password);
    if (ok) {
      window.location.href = '/admin/dashboard';
    } else {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
    }
  }

  function handleGoogleSuccess(response: { credential?: string }) {
    if (!response.credential) {
      setError('No se recibió credencial de Google.');
      return;
    }
    const payload = decodeGoogleJwt(response.credential);
    if (!payload?.email) {
      setError('No se pudo obtener el correo de Google.');
      return;
    }
    loginWithGoogle(payload.email);
    window.location.href = '/admin/dashboard';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm">

        {/* ── Logo ── */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            {/* V icon */}
            <div style={{ filter: 'drop-shadow(0 0 8px var(--glow))' }}>
              <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
                <defs>
                  <linearGradient id="lf-left" x1="8" y1="12" x2="18" y2="26" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#60a5fa"/>
                    <stop offset="100%" stopColor="var(--primary)"/>
                  </linearGradient>
                  <linearGradient id="lf-right" x1="28" y1="12" x2="18" y2="26" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#60a5fa"/>
                    <stop offset="100%" stopColor="var(--primary)"/>
                  </linearGradient>
                  <linearGradient id="lf-border" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.6"/>
                  </linearGradient>
                </defs>
                <rect x="1" y="1" width="34" height="34" rx="9"
                  fill="#2a2a2e" stroke="url(#lf-border)" strokeWidth="1"/>
                <line x1="7"  y1="11.5" x2="12" y2="11.5" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
                <line x1="24" y1="11.5" x2="29" y2="11.5" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
                <line x1="8"  y1="12" x2="18" y2="26" stroke="url(#lf-left)"  strokeWidth="2.4" strokeLinecap="round"/>
                <line x1="28" y1="12" x2="18" y2="26" stroke="url(#lf-right)" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
            </div>
            {/* Wordmark */}
            <div className="flex flex-col leading-none gap-[3px]">
              <span className="text-xl font-black tracking-[0.17em] uppercase" style={{ color: 'var(--text)' }}>
                VEC<span style={{ color: 'var(--primary)' }}>TRA</span>
              </span>
              <span className="font-semibold tracking-[0.28em] uppercase"
                style={{ fontSize: '6.5px', color: 'var(--text-muted)' }}>
                3D · PRINT
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mb-6">
          Inicia sesión para continuar
        </p>

        {/* ── Card ── */}
        <div
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 sm:p-8 space-y-4"
          style={{ boxShadow: '0 0 40px rgba(0,0,0,0.3), 0 0 20px var(--glow-weak)' }}
        >
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                   style={{ color: 'var(--text-muted)' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-xl text-sm
                         bg-[var(--bg-secondary)] border border-[var(--border)]
                         text-[var(--text)] placeholder:text-[var(--text-muted)]
                         focus:outline-none focus:border-[var(--primary)] transition-colors"
              style={{ boxShadow: 'none' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1px var(--primary)')}
              onBlur={(e)  => (e.currentTarget.style.boxShadow = 'none')}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                   style={{ color: 'var(--text-muted)' }}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm
                           bg-[var(--bg-secondary)] border border-[var(--border)]
                           text-[var(--text)] placeholder:text-[var(--text-muted)]
                           focus:outline-none focus:border-[var(--primary)] transition-colors"
                style={{ boxShadow: 'none' }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1px var(--primary)')}
                onBlur={(e)  => (e.currentTarget.style.boxShadow = 'none')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                aria-label={showPass ? 'Ocultar' : 'Mostrar'}
              >
                {showPass ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm
                            bg-red-500/10 border border-red-500/25 text-red-400">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                       hover:brightness-110 active:scale-[0.98]"
            style={{ background: 'var(--primary)', boxShadow: '0 0 16px var(--glow-weak)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Verificando...
              </span>
            ) : 'Iniciar sesión'}
          </button>

          {/* ── Divider ── */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}/>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                o continúa con
              </span>
            </div>
          </div>

          {/* ── Google ── */}
          {GOOGLE_CLIENT_ID ? (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Error al iniciar sesión con Google.')}
                theme="filled_black"
                shape="rectangular"
                size="large"
                text="continue_with"
                locale="es"
              />
            </div>
          ) : (
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium
                         border transition-all duration-200 hover:brightness-110"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                background: 'var(--bg-secondary)',
                opacity: 0.6,
                cursor: 'not-allowed',
              }}
              title="Configura PUBLIC_GOOGLE_CLIENT_ID en .env para activar"
              disabled
            >
              {/* Google G icon */}
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
              <span className="text-xs opacity-60">(configura CLIENT_ID)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginFormInner />
    </GoogleOAuthProvider>
  );
}
