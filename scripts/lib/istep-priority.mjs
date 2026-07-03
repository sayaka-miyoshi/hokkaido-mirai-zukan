/** iSTEP キーワード優先度（A/B/C） */

export const ISTEP_PRIORITY = {
  A: 'A',
  B: 'B',
  C: 'C',
}

const PRIORITY_ORDER = { A: 0, B: 1, C: 2 }

/** @typedef {{ id: string, type: string, primaryKeyword: string, postCount: number, urlType: string, isPopular?: boolean }} KeywordGroup */

/**
 * 優先度を自動判定
 * A: 必ず登録（入口・人気・記事4件以上・手動A）
 * B: 登録推奨（記事2件以上 or 一覧/学校ページあり）
 * C: 記事1件のみ（将来の拡張候補）
 */
export function resolvePriority(group, override) {
  if (override?.priority && ISTEP_PRIORITY[override.priority]) {
    return override.priority
  }

  if (group.type === 'entry') return ISTEP_PRIORITY.A
  if (group.isPopular) return ISTEP_PRIORITY.A
  if (group.postCount >= 4) return ISTEP_PRIORITY.A

  if (group.postCount >= 2) return ISTEP_PRIORITY.B
  if (group.urlType === 'school_page') return ISTEP_PRIORITY.B
  if (group.urlType === 'sport_list') return ISTEP_PRIORITY.B
  if (group.urlType === 'company_list') return ISTEP_PRIORITY.B
  if (group.urlType === 'tourism_list') return ISTEP_PRIORITY.B

  return ISTEP_PRIORITY.C
}

export function comparePriority(a, b) {
  return (PRIORITY_ORDER[a] ?? 9) - (PRIORITY_ORDER[b] ?? 9)
}

export function priorityLabel(priority) {
  switch (priority) {
    case 'A':
      return 'A（必ず登録）'
    case 'B':
      return 'B（登録推奨）'
    case 'C':
      return 'C（記事増加後）'
    default:
      return priority
  }
}
