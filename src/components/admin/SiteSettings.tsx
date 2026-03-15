import { useState, useEffect } from 'react';
import { z } from 'zod';

interface Settings {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  contactEmail: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
}

const settingsSchema = z.object({
  heroTitle: z.string().min(3),
  heroSubtitle: z.string().min(10),
  ctaText: z.string().min(3),
  contactEmail: z.string().email('Email inválido'),
  whatsappNumber: z.string(),
  instagramUrl: z.string().url('URL inválida').or(z.literal('')),
  facebookUrl: z.string().url('URL inválida').or(z.literal('')),
});

const STORAGE_KEY = 'vectra-site-settings';

const defaultSettings: Settings = {
  heroTitle: 'Lleva tus ideas al siguiente nivel',
  heroSubtitle: 'Diseñamos y fabricamos productos 3D personalizados con la más alta precisión.',
  ctaText: 'Empezar ahora',
  contactEmail: 'contacto@vectra.com',
  whatsappNumber: '',
  instagramUrl: '',
  facebookUrl: '',
};

export default function SiteSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSettings(JSON.parse(stored));
  }, []);

  function handleSave() {
    const result = settingsSchema.safeParse(settings);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const fields = [
    { key: 'heroTitle', label: 'Título del Hero' },
    { key: 'heroSubtitle', label: 'Subtítulo del Hero', multiline: true },
    { key: 'ctaText', label: 'Texto del CTA' },
    { key: 'contactEmail', label: 'Email de contacto', type: 'email' },
    { key: 'whatsappNumber', label: 'Número de WhatsApp', placeholder: '+5491112345678' },
    { key: 'instagramUrl', label: 'URL de Instagram', placeholder: 'https://instagram.com/...' },
    { key: 'facebookUrl', label: 'URL de Facebook', placeholder: 'https://facebook.com/...' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text)]">Configuración del Sitio</h2>
        {saved && (
          <div className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Guardado
          </div>
        )}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
        {fields.map(({ key, label, multiline, type, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">{label}</label>
            {multiline ? (
              <textarea
                value={settings[key as keyof Settings]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                           text-[var(--text)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            ) : (
              <input
                type={type ?? 'text'}
                value={settings[key as keyof Settings]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                           text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm
                           focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            )}
            {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
          </div>
        ))}

        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold
                     hover:bg-[var(--primary-hover)] transition-colors"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
