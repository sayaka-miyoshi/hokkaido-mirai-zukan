type RecaptchaVerifyResponse = {
  success: boolean
  score?: number
  action?: string
  'error-codes'?: string[]
}

const MIN_SCORE = 0.5

/** reCAPTCHA v3 トークンを検証（シークレット未設定時はスキップ） */
export async function verifyRecaptchaToken(token: string | undefined): Promise<{
  ok: boolean
  skipped: boolean
  error?: string
}> {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim()

  if (!secret) {
    return { ok: true, skipped: true }
  }

  if (!token?.trim()) {
    return { ok: false, skipped: false, error: 'reCAPTCHA認証に失敗しました。再度お試しください。' }
  }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    })

    if (!res.ok) {
      return { ok: false, skipped: false, error: 'reCAPTCHA認証に失敗しました。' }
    }

    const data = (await res.json()) as RecaptchaVerifyResponse

    if (!data.success) {
      return { ok: false, skipped: false, error: 'reCAPTCHA認証に失敗しました。' }
    }

    if (typeof data.score === 'number' && data.score < MIN_SCORE) {
      return { ok: false, skipped: false, error: '送信できませんでした。しばらくしてから再度お試しください。' }
    }

    return { ok: true, skipped: false }
  } catch {
    return { ok: false, skipped: false, error: 'reCAPTCHA認証中にエラーが発生しました。' }
  }
}

export function getRecaptchaSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || undefined
}
