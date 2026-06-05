import type { ContactFormConfig, ContactFormPayload } from '@/types/contact'
import { isContactEmailConfigured } from '@/lib/contact/config'
import { buildContactSheetRow, formatContactSheetRowAsText } from '@/lib/contact/sheet'

export const DEFAULT_CONTACT_TO_EMAIL = 'insta.sayaka@gmail.com'

export function buildContactEmailBody(payload: ContactFormPayload): string {
  const row = buildContactSheetRow(payload)

  return [
    '掲載・取材相談のお問い合わせがありました。',
    '',
    '--- お問い合わせ内容 ---',
    formatContactSheetRowAsText(row),
  ].join('\n')
}

export type SendContactEmailResult =
  | { ok: true; preview?: boolean }
  | { ok: false; error: string }

/** Resend API でメール送信（未設定時はプレビューモードで成功） */
export async function sendContactEmail(
  payload: ContactFormPayload,
  config: ContactFormConfig,
): Promise<SendContactEmailResult> {
  const to = process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_CONTACT_TO_EMAIL
  const subject = config.emailSubject
  const text = buildContactEmailBody(payload)

  if (!isContactEmailConfigured()) {
    console.info('[contact:preview] メール送信はスキップ（RESEND_API_KEY 未設定）')
    console.info('[contact:preview] 送信先:', to)
    console.info('[contact:preview] 件名:', subject)
    console.info('[contact:preview] 本文:\n', text)
    return { ok: true, preview: true }
  }

  const apiKey = process.env.RESEND_API_KEY!.trim()
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() || '北海道ナビ <onboarding@resend.dev>'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: payload.email.trim(),
        subject,
        text,
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('[contact] Resend error:', res.status, detail)
      return { ok: false, error: 'メール送信に失敗しました。時間をおいて再度お試しください。' }
    }

    return { ok: true }
  } catch (error) {
    console.error('[contact] send error:', error)
    return { ok: false, error: 'メール送信に失敗しました。時間をおいて再度お試しください。' }
  }
}
