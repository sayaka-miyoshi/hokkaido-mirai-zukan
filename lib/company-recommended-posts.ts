import type { Post } from '@/types/post'
import {
  COMPANY_CURATED_INSTAGRAM_URLS,
  COMPANY_CURATED_MAX,
} from '@/lib/company-curated-instagram'
import { normalizeInstagramPostId } from '@/lib/instagram-post-id'
import { parsePopularFlag, parsePopularOrder } from '@/lib/popular-posts'

/** Googleスプレッドシートの列名（将来の拡張用・現行TOP表示はInstagram手動キュレーション） */
export const COMPANY_RECOMMENDED_SPREADSHEET_COLUMNS = {
  flag: '企業おすすめ',
  order: 'おすすめ順',
} as const

/** @deprecated COMPANY_RECOMMENDED_SPREADSHEET_COLUMNS.flag を使用 */
export const COMPANY_RECOMMENDED_SPREADSHEET_COLUMN = COMPANY_RECOMMENDED_SPREADSHEET_COLUMNS.flag

/** @deprecated COMPANY_CURATED_MAX を使用 */
export const COMPANY_RECOMMENDED_MAX = COMPANY_CURATED_MAX

/** CSVの「企業おすすめ」列を boolean に変換 */
export function parseCompanyRecommendedFlag(value: string): boolean {
  return parsePopularFlag(value)
}

/** CSVの「おすすめ順」列を number | null に変換 */
export function parseCompanyRecommendedOrder(value: string): number | null {
  return parsePopularOrder(value)
}

export type CompanyCuratedResult = {
  /** TOP表示用（max件まで） */
  posts: Post[]
  /** キュレーションリスト全体で一致した件数 */
  matchedCount: number
  /** 記事が見つからなかった Instagram URL */
  unmatchedUrls: readonly string[]
  /** 設定URL数 */
  configuredCount: number
}

/**
 * TOP「北海道の企業を知ろう」— Instagram URL 手動キュレーション
 *
 * - 指定 Instagram URL の順番どおりに表示
 * - 公開 = true のみ
 * - 同一記事（重複 post ID / 重複 Instagram ID）は除外
 * - max 件まで表示（22件）
 */
export function resolveCompanyCuratedPosts(
  posts: Post[],
  max: number,
): CompanyCuratedResult {
  const postByInstagramId = new Map<string, Post>()

  for (const post of posts) {
    if (!post.isPublished) continue
    const instagramId = normalizeInstagramPostId(post.instagramUrl)
    if (!instagramId || postByInstagramId.has(instagramId)) continue
    postByInstagramId.set(instagramId, post)
  }

  const matchedPosts: Post[] = []
  const unmatchedUrls: string[] = []
  const usedPostIds = new Set<string>()

  for (const url of COMPANY_CURATED_INSTAGRAM_URLS) {
    const instagramId = normalizeInstagramPostId(url)
    if (!instagramId) {
      unmatchedUrls.push(url)
      continue
    }

    const post = postByInstagramId.get(instagramId)
    if (!post || usedPostIds.has(post.id)) {
      unmatchedUrls.push(url)
      continue
    }

    usedPostIds.add(post.id)
    matchedPosts.push(post)
  }

  return {
    posts: matchedPosts.slice(0, max),
    matchedCount: matchedPosts.length,
    unmatchedUrls,
    configuredCount: COMPANY_CURATED_INSTAGRAM_URLS.length,
  }
}

/** TOP表示用（後方互換） */
export function getCompanyRecommendedPosts(
  posts: Post[],
  max: number,
): Post[] {
  return resolveCompanyCuratedPosts(posts, max).posts
}
