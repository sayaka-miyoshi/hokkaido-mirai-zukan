import type { Post } from '@/types/post'

/** TOP人気コンテンツの表示件数 */
export const POPULAR_POSTS_MAX = 6

/**
 * 人気コンテンツの取得元
 * analytics = ranking-snapshot.json（空なら spreadsheet へフォールバック）
 */
export type PopularContentSource = 'spreadsheet' | 'analytics'

/** 現在の取得元（未設定時は analytics） */
export function getPopularContentSource(): PopularContentSource {
  const env = process.env.NEXT_PUBLIC_POPULAR_CONTENT_SOURCE?.trim().toLowerCase()
  if (env === 'spreadsheet') return 'spreadsheet'
  return 'analytics'
}

/** Googleスプレッドシートの列名 */
export const POPULAR_SPREADSHEET_COLUMNS = {
  flag: '人気表示',
  order: '人気順',
} as const

/** 人気コンテンツ1件（表示・計測用） */
export type PopularContentEntry = {
  post: Post
  /** 人気順 */
  rank: number
  source: PopularContentSource
  /** GA / 計測イベント用 ID */
  trackingId: string
}

/** CSVの「人気表示」列を boolean に変換 */
export function parsePopularFlag(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return ['true', '1', 'yes', 'y', 'はい', '○', '◯', '✓', 'on'].includes(normalized)
}

/** CSVの「人気順」列を number | null に変換 */
export function parsePopularOrder(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : null
}

/**
 * スプレッドシート列に基づく人気記事
 */
export function getPopularPostsFromSpreadsheet(
  posts: Post[],
  max: number = POPULAR_POSTS_MAX,
): Post[] {
  return posts
    .filter((post) => post.isPopular && post.popularOrder != null)
    .sort((a, b) => a.popularOrder! - b.popularOrder!)
    .slice(0, max)
}

export function toPopularEntries(posts: Post[], source: PopularContentSource): PopularContentEntry[] {
  return posts.map((post, index) => ({
    post,
    rank: post.popularOrder ?? index + 1,
    source,
    trackingId: `popular:${source}:${post.id}`,
  }))
}

/**
 * 同期コンテキスト用（クライアント可）
 * analytics 指定時もスプレッドシートへフォールバック
 */
export function resolvePopularContent(
  posts: Post[],
  options?: { source?: PopularContentSource; max?: number },
): PopularContentEntry[] {
  const max = options?.max ?? POPULAR_POSTS_MAX
  return toPopularEntries(getPopularPostsFromSpreadsheet(posts, max), 'spreadsheet')
}

/** @deprecated resolvePopularContent を使用 */
export function getPopularPosts(posts: Post[]): Post[] {
  return getPopularPostsFromSpreadsheet(posts)
}
