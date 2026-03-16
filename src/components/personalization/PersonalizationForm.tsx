import { useState } from 'react';
import { z } from 'zod';
import { submitPersonalizationRequest } from '../../lib/personalization';

interface Props {
  lang: 'es' | 'en';
  whatsappNumber?: string;
  contactEmail?: string;
}

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Mínimo 2 caracteres / Min 2 chars' }),
  email: z.string().email({ message: 'Email inválido / Invalid email' }),
  phone: z.string().min(7, { message: 'Teléfono inválido / Invalid phone' }).optional().or(z.literal('')),
});

const labels = {
  es: {
    step1Title: 'Describe tu producto',
    step1Placeholder: '¿Qué producto necesitas? Describe materiales, dimensiones, uso...',
    step2Title: 'Referencia visual',
    step2Upload: 'Sube una imagen de referencia',
    step2Url: 'O pega una URL de imagen',
    step2UrlPlaceholder: 'https://...',
    step3Title: 'Tus datos de contacto',
    namePlaceholder: 'Tu nombre',
    emailPlaceholder: 'tu@email.com',
    phonePlaceholder: '+54 11 1234-5678',
    step4Title: '¡Listo!',
    step4Message: 'Recibimos tu solicitud. Te contactaremos pronto.',
    whatsapp: 'Enviar por WhatsApp',
    email: 'Enviar por Email',
    next: 'Siguiente',
    back: 'Atrás',
    send: 'Enviar solicitud',
    required: 'Campo requerido',
  },
  en: {
    step1Title: 'Describe your product',
    step1Placeholder: 'What product do you need? Describe materials, dimensions, use...',
    step2Title: 'Visual reference',
    step2Upload: 'Upload a reference image',
    step2Url: 'Or paste an image URL',
    step2UrlPlaceholder: 'https://...',
    step3Title: 'Your contact info',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'you@email.com',
    phonePlaceholder: '+1 234 567-8900',
    step4Title: 'Done!',
    step4Message: 'We received your request. We\'ll contact you soon.',
    whatsapp: 'Send via WhatsApp',
    email: 'Send via Email',
    next: 'Next',
    back: 'Back',
    send: 'Send request',
    required: 'Required field',
  },
};

export default function PersonalizationForm({ lang, whatsappNumber = '', contactEmail = '' }: Props) {
  const l = labels[lang];
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const totalSteps = 4;

  function validateStep1() {
    if (!description.trim()) {
      setErrors({ description: l.required });
      return false;
    }
    setErrors({});
    return true;
  }

  function validateStep3() {
    const result = contactSchema.safeParse({ name, email, phone });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errs[issue.path[0] as string] = issue.message;
      });
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  async function handleSubmit() {
    if (!validateStep3()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const fd = new FormData();
      fd.append('description', description);
      fd.append('name', name);
      fd.append('email', email);
      fd.append('lang', lang.toUpperCase());
      if (imageUrl.trim()) fd.append('referenceUrl', imageUrl.trim());
      if (phone.trim()) fd.append('phone', phone.trim());
      if (imageFile) fd.append('referenceImage', imageFile);
      await submitPersonalizationRequest(fd);
      setStep(4);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Error al enviar solicitud');
    } finally {
      setSubmitting(false);
    }
  }

  function buildWhatsAppMessage() {
    return encodeURIComponent(
      `Hola Vectra! Quiero personalizar un producto.\n\nDescripción: ${description}\n${imageUrl ? `Referencia: ${imageUrl}\n` : ''}Nombre: ${name}\nEmail: ${email}${phone ? `\nTeléfono: ${phone}` : ''}`
    );
  }

  function buildEmailBody() {
    return encodeURIComponent(
      `Descripción: ${description}\n${imageUrl ? `Referencia: ${imageUrl}\n` : ''}Nombre: ${name}\nTeléfono: ${phone || 'N/A'}`
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold border-2 transition-all ${
                i + 1 < step
                  ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                  : i + 1 === step
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-[var(--border)] text-[var(--text-muted)]'
              }`}
            >
              {i + 1 < step ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                i + 1
              )}
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-[var(--border)] rounded-full">
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-6">{l.step1Title}</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={l.step1Placeholder}
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                         text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm
                         focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-6">{l.step2Title}</h2>

            {/* File upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text)] mb-2">{l.step2Upload}</label>
              <div
                className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center
                            hover:border-[var(--primary)] transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {imageFile ? (
                  <p className="text-sm text-[var(--text)]">✓ {imageFile.name}</p>
                ) : (
                  <>
                    <svg className="mx-auto mb-2 text-[var(--text-muted)]" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p className="text-sm text-[var(--text-muted)]">
                      {lang === 'es' ? 'Haz click para subir imagen' : 'Click to upload image'}
                    </p>
                  </>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            {/* URL input */}
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">{l.step2Url}</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={l.step2UrlPlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                           text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm
                           focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-6">{l.step3Title}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  {lang === 'es' ? 'Nombre' : 'Name'} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={l.namePlaceholder}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                             text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm
                             focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={l.emailPlaceholder}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                             text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm
                             focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  {lang === 'es' ? 'Teléfono' : 'Phone'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={l.phonePlaceholder}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                             text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm
                             focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-3">{l.step4Title}</h2>
            <p className="text-[var(--text-muted)] mb-8">{l.step4Message}</p>

            {/* TODO: Connect to real WhatsApp number and email */}
            <div className="space-y-3">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${buildWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl
                           bg-green-500 hover:bg-green-600 text-white font-semibold
                           transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.1 1.524 5.82L.057 23.998l6.304-1.644A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.001-1.368l-.359-.214-3.72.97.994-3.62-.235-.372A9.79 9.79 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
                {l.whatsapp}
              </a>
              <a
                href={`mailto:${contactEmail}?subject=Personalización Vectra - ${name}&body=${buildEmailBody()}`}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl
                           border border-[var(--border)] text-[var(--text)]
                           hover:border-[var(--primary)] hover:text-[var(--primary)]
                           transition-colors font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                {l.email}
              </a>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {step < 4 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep((s) => Math.max(s - 1, 1))}
              disabled={step === 1 || submitting}
              className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)]
                         hover:text-[var(--text)] hover:border-[var(--primary)] transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← {l.back}
            </button>
            <div className="flex flex-col items-end gap-1">
              {submitError && (
                <p className="text-red-400 text-xs">{submitError}</p>
              )}
              <button
                onClick={step < 3 ? handleNext : handleSubmit}
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold
                           hover:bg-[var(--primary-hover)] transition-colors active:scale-95
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {step === 3 ? (submitting ? '...' : l.send) : l.next + ' →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
