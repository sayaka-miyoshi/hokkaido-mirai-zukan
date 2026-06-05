/** 問い合わせスプレッドシート（GAS Web App）が設定済みか */
export function isContactSheetConfigured(): boolean {
  return Boolean(process.env.CONTACT_SHEET_WEBAPP_URL?.trim())
}

/** メール送信（Resend）が設定済みか */
export function isContactEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

/** UI確認用プレビューモード（Sheets または Resend が未設定） */
export function isContactPreviewMode(): boolean {
  return !isContactSheetConfigured() || !isContactEmailConfigured()
}

export function getContactPreviewMessages(): string[] {
  const messages: string[] = []
  if (!isContactSheetConfigured()) {
    messages.push('スプレッドシート保存は設定後に有効になります')
  }
  if (!isContactEmailConfigured()) {
    messages.push('通知メールは Resend 設定後に有効になります')
  }
  return messages
}
