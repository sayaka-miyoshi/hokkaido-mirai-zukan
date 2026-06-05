'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type {
  ContactFieldConfig,
  ContactFieldErrors,
  ContactFieldName,
  ContactFormConfig,
  ContactFormPayload,
} from '@/types/contact'
import { hasValidationErrors, validateContactPayload } from '@/lib/contact/validation'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

type ContactFormProps = {
  config: ContactFormConfig
  recaptchaSiteKey?: string
}

const EMPTY_FORM: Omit<ContactFormPayload, 'formType' | 'recaptchaToken' | 'website'> = {
  organizationName: '',
  companyName: '',
  schoolName: '',
  contactName: '',
  email: '',
  phone: '',
  instagram: '',
  message: '',
}

export default function ContactForm({ config, recaptchaSiteKey }: ContactFormProps) {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY_FORM)
  const [honeypot, setHoneypot] = useState('')
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!recaptchaSiteKey) return

    const scriptId = 'recaptcha-v3'
    if (document.getElementById(scriptId)) return

    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`
    script.async = true
    document.head.appendChild(script)
  }, [recaptchaSiteKey])

  const updateField = (name: ContactFieldName, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const getRecaptchaToken = async (): Promise<string | undefined> => {
    if (!recaptchaSiteKey || !window.grecaptcha) return undefined

    return new Promise((resolve) => {
      window.grecaptcha!.ready(async () => {
        try {
          const token = await window.grecaptcha!.execute(recaptchaSiteKey, {
            action: `contact_${config.type}`,
          })
          resolve(token)
        } catch {
          resolve(undefined)
        }
      })
    })
  }

  const renderField = (field: ContactFieldConfig) => {
    const error = fieldErrors[field.name]
    const inputClassName =
      'w-full rounded-xl border px-4 py-3 text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-hokkaido-sky/40 ' +
      (error ? 'border-red-300 bg-red-50/30' : 'border-hokkaido-ice')

    return (
      <div key={field.name}>
        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1.5">
          {field.label}
          {field.required ? (
            <span className="ml-1.5 inline-flex items-center rounded-md bg-hokkaido-ice px-1.5 py-0.5 text-[10px] font-medium text-hokkaido-deep">
              必須
            </span>
          ) : (
            <span className="ml-1.5 text-gray-400 text-xs font-normal">任意</span>
          )}
        </label>

        {field.type === 'textarea' ? (
          <textarea
            id={field.name}
            name={field.name}
            rows={4}
            required={field.required}
            value={form[field.name]}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={inputClassName}
          />
        ) : (
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            required={field.required}
            value={form[field.name]}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            className={inputClassName}
          />
        )}

        {error && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
      </div>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const payload: ContactFormPayload = {
      formType: config.type,
      ...form,
      website: honeypot,
    }

    const clientErrors = validateContactPayload(payload, config)
    if (hasValidationErrors(clientErrors)) {
      setFieldErrors(clientErrors)
      setFormError('入力内容を確認してください。')
      return
    }

    setSubmitting(true)

    try {
      const recaptchaToken = await getRecaptchaToken()

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, recaptchaToken }),
      })

      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        fieldErrors?: ContactFieldErrors
        redirectTo?: string
      }

      if (!res.ok) {
        setFieldErrors(data.fieldErrors ?? {})
        setFormError(data.error ?? '送信に失敗しました。')
        return
      }

      router.push(data.redirectTo ?? `/contact/${config.type}/complete`)
    } catch {
      setFormError('送信に失敗しました。通信環境をご確認ください。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {config.fields.map((field) => renderField(field))}

      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3"
        >
          {formError}
        </p>
      )}

      {recaptchaSiteKey && (
        <p className="text-[10px] text-gray-400 leading-relaxed">
          このサイトは reCAPTCHA により保護されており、Google の
          <a
            href="https://policies.google.com/privacy"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            プライバシーポリシー
          </a>
          と
          <a
            href="https://policies.google.com/terms"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            利用規約
          </a>
          が適用されます。
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-hokkaido-deep text-white font-bold py-3.5 text-sm shadow-sm hover:bg-hokkaido-lake active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
      >
        {submitting ? '送信中...' : config.submitLabel}
      </button>
    </form>
  )
}
