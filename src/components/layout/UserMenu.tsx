import { useStore } from '@nanostores/react';
import { useEffect, useRef, useState } from 'react';
import { authStore, initAuth, logout } from '../../stores/auth';

interface Props {
  lang: 'es' | 'en';
  menuMode?: boolean; // cuando true: se renderiza como ítem de menú full-width
}

const L = {
  es: {
    login:     'Iniciar sesión',
    dashboard: 'Dashboard',
    products:  'Productos',
    blog:      'Blog',
    settings:  'Configuración',
    logout:    'Cerrar sesión',
    admin:     'Administrador',
    user:      'Mi cuenta',
  },
  en: {
    login:     'Log in',
    dashboard: 'Dashboard',
    products:  'Products',
    blog:      'Blog',
    settings:  'Settings',
    logout:    'Log out',
    admin:     'Administrator',
    user:      'My account',
  },
};

const adminItems = [
  {
    href: '/admin/dashboard',
    labelKey: 'dashboard' as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/admin/products',
    labelKey: 'products' as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    href: '/admin/blog',
    labelKey: 'blog' as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    href: '/admin/settings',
    labelKey: 'settings' as const,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M2 12h2M20 12h2M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93M12 2v2M12 20v2"/>
      </svg>
    ),
  },
];

export default function UserMenu({ lang, menuMode = false }: Props) {
  const auth = useStore(authStore);
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);
  const l    = L[lang];

  useEffect(() => { initAuth(); }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setOpen(false);
    window.location.href = `/${lang}`;
  }

  /* ── Not authenticated ── */
  if (!auth.isAuthenticated) {
    /* Versión menú hamburguesa: full-width, igual estilo que los otros ítems */
    if (menuMode) {
      return (
        <a
          href="/admin"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                     transition-all duration-200"
          style={{ color: 'var(--primary)', background: 'var(--primary-weak, rgba(192,38,211,0.08))' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-weak, rgba(192,38,211,0.15))')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary-weak, rgba(192,38,211,0.08))')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          {l.login}
        </a>
      );
    }
    /* Versión header: botón compacto */
    return (
      <a
        href="/admin"
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold
                   border border-[var(--primary)]/40 text-[var(--primary)]
                   hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]
                   transition-all duration-200"
        style={{ boxShadow: '0 0 10px var(--glow-weak)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        {l.login}
      </a>
    );
  }

  const isAdmin      = auth.role === 'admin';
  const displayName  = isAdmin ? l.admin : (auth.email?.split('@')[0] ?? l.user);
  const avatarLetter = (auth.email?.[0] ?? 'U').toUpperCase();

  /* ── Authenticated — modo menú hamburguesa: todo inline, sin dropdown ── */
  if (menuMode) {
    return (
      <div>
        {/* Fila de usuario */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-1"
             style={{ background: 'var(--bg-secondary)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, var(--primary), #9333ea)', boxShadow: '0 0 10px var(--glow-weak)' }}>
            {avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{displayName}</p>
            <p className="text-xs" style={{ color: 'var(--primary)' }}>
              {isAdmin ? '● Admin' : '● Usuario'}
            </p>
          </div>
          {isAdmin && (
            <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--primary)', color: 'white', opacity: 0.85 }}>
              ADM
            </span>
          )}
        </div>

        {/* Links de admin */}
        {isAdmin && adminItems.map(({ href, labelKey, icon }) => (
          <a
            key={href}
            href={href}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color      = 'var(--primary)';
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color      = 'var(--text-muted)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <span style={{ color: 'var(--primary)' }}>{icon}</span>
            {l[labelKey]}
          </a>
        ))}

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium
                     text-red-400 hover:bg-red-500/10 transition-colors duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {l.logout}
        </button>
      </div>
    );
  }

  /* ── Authenticated — modo header: avatar + dropdown ── */
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl
                   border border-[var(--primary)]/40
                   hover:border-[var(--primary)] hover:bg-[var(--primary)]/8
                   transition-all duration-200"
        style={{ boxShadow: open ? '0 0 14px var(--glow-weak)' : undefined }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
          style={{ background: 'linear-gradient(135deg, var(--primary), #9333ea)', boxShadow: '0 0 8px var(--glow-weak)' }}
        >
          {avatarLetter}
        </div>
        <span className="hidden sm:block text-sm font-medium text-[var(--text)]">{displayName}</span>
        {/* Role badge */}
        {isAdmin && (
          <span className="hidden sm:block text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded"
                style={{ background: 'var(--primary)', color: 'white', opacity: 0.85 }}>
            ADM
          </span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setOpen(false)} />

          <div
            className="absolute right-0 top-full mt-2 w-60 z-50 rounded-2xl overflow-hidden
                       border border-[var(--border)]"
            style={{
              background: 'var(--bg-card)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 40px var(--glow-weak)',
              borderColor: 'var(--primary)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, var(--primary), #9333ea)', boxShadow: '0 0 10px var(--glow-weak)' }}
                >
                  {avatarLetter}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{displayName}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--primary)' }}>
                    {isAdmin ? '● Admin' : '● Usuario'}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin-only items */}
            {isAdmin && (
              <div className="py-1.5">
                {adminItems.map(({ href, labelKey, icon }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color      = 'var(--primary)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color      = 'var(--text-muted)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <span style={{ color: 'var(--primary)' }}>{icon}</span>
                    {l[labelKey]}
                  </a>
                ))}
              </div>
            )}

            {/* Logout */}
            <div className={`p-2 border-t ${isAdmin ? '' : 'pt-2'}`} style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                           text-red-400 hover:bg-red-500/10 transition-colors duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {l.logout}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
