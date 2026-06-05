import type { ContactFormPayload } from '@/types/contact'
import { isContactSheetConfigured } from '@/lib/contact/config'

/** 問い合わせスプレッドシートの列（1行目ヘッダーと一致させる） */
export const CONTACT_SHEET_HEADERS = [
  '受付日時',
  '学校名・企業名・団体名',
  'お名前',
  'メールアドレス',
  'Instagram',
  '電話番号',
  'ご相談内容',
  '対応状況',
  '対応メモ',
] as const

export type ContactSheetRow = Record<(typeof CONTACT_SHEET_HEADERS)[number], string>

const DEFAULT_STATUS = '未対応'

function formatReceivedAt(date = new Date()): string {
  return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
}

export function buildContactSheetRow(
  payload: ContactFormPayload,
  receivedAt = new Date(),
): ContactSheetRow {
  return {
    受付日時: formatReceivedAt(receivedAt),
    '学校名・企業名・団体名': payload.organizationName.trim(),
    お名前: payload.contactName.trim(),
    メールアドレス: payload.email.trim(),
    Instagram: payload.instagram.trim(),
    電話番号: payload.phone.trim(),
    ご相談内容: payload.message.trim(),
    対応状況: DEFAULT_STATUS,
    対応メモ: '',
  }
}

export function formatContactSheetRowAsText(row: ContactSheetRow): string {
  return CONTACT_SHEET_HEADERS.map((header) => `${header}: ${row[header] || '（未入力）'}`).join(
    '\n',
  )
}

export type AppendContactSheetResult =
  | { ok: true; preview?: boolean }
  | { ok: false; error: string }

/** Google Apps Script Web App 経由でスプレッドシートに1行追加 */
export async function appendContactToSheet(
  payload: ContactFormPayload,
): Promise<AppendContactSheetResult> {
  const row = buildContactSheetRow(payload)

  if (!isContactSheetConfigured()) {
    console.info('[contact:preview] スプレッドシート保存はスキップ（CONTACT_SHEET_WEBAPP_URL 未設定）')
    console.info('[contact:preview] 保存内容:\n', formatContactSheetRowAsText(row))
    return { ok: true, preview: true }
  }

  const webappUrl = process.env.CONTACT_SHEET_WEBAPP_URL!.trim()
  const secret = process.env.CONTACT_SHEET_SECRET?.trim() ?? ''

  try {
    const res = await fetch(webappUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, row }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('[contact] sheet error:', res.status, detail)
      return { ok: false, error: '送信に失敗しました。時間をおいて再度お試しください。' }
    }

    const data = (await res.json()) as { ok?: boolean; error?: string }
    if (!data.ok) {
      console.error('[contact] sheet rejected:', data.error)
      return { ok: false, error: '送信に失敗しました。時間をおいて再度お試しください。' }
    }

    return { ok: true }
  } catch (error) {
    console.error('[contact] sheet send error:', error)
    return { ok: false, error: '送信に失敗しました。時間をおいて再度お試しください。' }
  }
}
