import type { ContactFieldErrors, ContactFormConfig, ContactFormPayload } from '@/types/contact'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function trim(value: string): string {
  return value.trim()
}

export function validateContactPayload(
  payload: ContactFormPayload,
  config: ContactFormConfig,
): ContactFieldErrors {
  const errors: ContactFieldErrors = {}

  for (const field of config.fields) {
    const value = trim(payload[field.name] ?? '')

    if (field.required && !value) {
      errors[field.name] = `${field.label}は必須です`
      continue
    }

    if (field.name === 'email' && value && !EMAIL_PATTERN.test(value)) {
      errors[field.name] = 'メールアドレスの形式が正しくありません'
    }

    if (field.name === 'message' && value && value.length > 5000) {
      errors[field.name] = '相談内容は5000文字以内で入力してください'
    }
  }

  return errors
}

export function hasValidationErrors(errors: ContactFieldErrors): boolean {
  return Object.keys(errors).length > 0
}
