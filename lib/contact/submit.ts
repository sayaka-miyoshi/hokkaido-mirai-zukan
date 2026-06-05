import type { ContactFormConfig, ContactFormPayload } from '@/types/contact'
import { sendContactEmail } from '@/lib/contact/email'
import { appendContactToSheet } from '@/lib/contact/sheet'

export type SubmitContactResult =
  | { ok: true; preview?: { sheet?: boolean; email?: boolean } }
  | { ok: false; error: string }

/** 問い合わせ送信：スプレッドシート保存 → 通知メール */
export async function submitContact(
  payload: ContactFormPayload,
  config: ContactFormConfig,
): Promise<SubmitContactResult> {
  const sheetResult = await appendContactToSheet(payload)
  if (!sheetResult.ok) {
    return { ok: false, error: sheetResult.error }
  }

  const emailResult = await sendContactEmail(payload, config)
  if (!emailResult.ok) {
    console.error('[contact] email failed after sheet save:', emailResult.error)
    return {
      ok: true,
      preview: {
        sheet: sheetResult.preview,
        email: false,
      },
    }
  }

  return {
    ok: true,
    preview: {
      sheet: sheetResult.preview,
      email: emailResult.preview,
    },
  }
}
