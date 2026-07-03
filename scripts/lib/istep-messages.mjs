import { normalizeDmText } from './dm-suggest.mjs'

/** iSTEP 返信文テンプレート（優先20件と統一） */
export function buildIstepReplyMessage(subject, category) {
  const label = String(subject ?? '').trim() || 'この記事'

  if (category === '入口') {
    return `コメントありがとうございます！

北海道未来図鑑で紹介記事を探せます。
こちらからご覧ください。`
  }

  if (category === '部活動' || category === '競技') {
    return `コメントありがとうございます！

北海道未来図鑑で「${label}」の活動紹介を見ることができます。
こちらからご覧ください。`
  }

  return `コメントありがとうございます！

北海道未来図鑑で「${label}」の紹介記事を見ることができます。
こちらからご覧ください。`
}

export function normalizeKeyword(keyword) {
  return normalizeDmText(String(keyword ?? '').trim())
}
