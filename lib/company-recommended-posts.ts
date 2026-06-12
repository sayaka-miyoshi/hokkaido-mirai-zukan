import type { Post } from '@/types/post'
import { parsePostDate } from '@/lib/dates'
import { isHokkaidoArea } from '@/lib/hokkaido-area'
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

/** TOP「北海道の企業を知ろう」共通の表示条件 */
export function isEligibleHokkaidoCompanyPost(post: Post): boolean {
  return (
    post.isPublished &&
    post.companyName.trim() !== '' &&
    isHokkaidoArea(post.area)
  )
}

/**
 * TOP「北海道の企業を知ろう」
 *
 * 表示条件（共通）:
 * - 公開 = true
 * - 企業名あり
 * - エリア = 北海道内（東京都などは除外）
 *
 * 優先順:
 * 1. 企業おすすめ = true → おすすめ順 昇順
 * 2. 不足分 → ジャンル=企業訪問・投稿日降順で北海道内企業を補完
 * 3. 最大14件（不足時は取得できる件数のみ）
 */
export function getCompanyRecommendedPosts(
  posts: Post[],
  max: number = COMPANY_RECOMMENDED_MAX,
): Post[] {
  const result: Post[] = []
  const usedIds = new Set<string>()

  const recommended = posts
    .filter((post) => post.isCompanyRecommended && isEligibleHokkaidoCompanyPost(post))
    .sort(compareCompanyRecommendedOrder)

  for (const post of recommended) {
    if (result.length >= max) break
    result.push(post)
    usedIds.add(post.id)
  }

  if (result.length < max) {
    const fallback = posts
      .filter(
        (post) =>
          !usedIds.has(post.id) &&
          post.genre === '企業訪問' &&
          isEligibleHokkaidoCompanyPost(post),
      )
      .sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))

    for (const post of fallback) {
      if (result.length >= max) break
      result.push(post)
    }
  }

  return result
}
