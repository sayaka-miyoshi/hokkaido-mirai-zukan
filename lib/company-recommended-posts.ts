import type { Post } from '@/types/post'
import { parsePostDate } from '@/lib/dates'
import { parsePopularFlag, parsePopularOrder } from '@/lib/popular-posts'

/** Googleスプレッドシートの列名 */
export const COMPANY_RECOMMENDED_SPREADSHEET_COLUMNS = {
  flag: '企業おすすめ',
  order: 'おすすめ順',
} as const

/** @deprecated COMPANY_RECOMMENDED_SPREADSHEET_COLUMNS.flag を使用 */
export const COMPANY_RECOMMENDED_SPREADSHEET_COLUMN = COMPANY_RECOMMENDED_SPREADSHEET_COLUMNS.flag

/** TOP「北海道の企業を知ろう」の表示件数 */
export const COMPANY_RECOMMENDED_MAX = 14

/** CSVの「企業おすすめ」列を boolean に変換 */
export function parseCompanyRecommendedFlag(value: string): boolean {
  return parsePopularFlag(value)
}

/** CSVの「おすすめ順」列を number | null に変換 */
export function parseCompanyRecommendedOrder(value: string): number | null {
  return parsePopularOrder(value)
}

function compareCompanyRecommendedOrder(a: Post, b: Post): number {
  const aOrder = a.companyRecommendedOrder
  const bOrder = b.companyRecommendedOrder
  const aHasOrder = aOrder != null
  const bHasOrder = bOrder != null

  if (aHasOrder && bHasOrder) return aOrder - bOrder
  if (aHasOrder && !bHasOrder) return -1
  if (!aHasOrder && bHasOrder) return 1
  return 0
}

/**
 * スプレッドシート管理の企業おすすめ記事
 * - 企業おすすめ = true
 * - 公開 = true
 * - おすすめ順 昇順（空欄は最後尾・同順位はシート行順）
 * - 最大14件
 * - 「企業おすすめ」列が未設定・0件のときは公開済み「企業訪問」を投稿日降順で表示
 */
export function getCompanyRecommendedPosts(
  posts: Post[],
  max: number = COMPANY_RECOMMENDED_MAX,
): Post[] {
  const flagged = posts
    .filter((post) => post.isCompanyRecommended && post.isPublished)
    .sort(compareCompanyRecommendedOrder)

  if (flagged.length > 0) {
    return flagged.slice(0, max)
  }

  return posts
    .filter((post) => post.genre === '企業訪問' && post.isPublished)
    .sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))
    .slice(0, max)
}
