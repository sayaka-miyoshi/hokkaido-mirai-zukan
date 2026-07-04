import type { Post } from '@/types/post'
import { loadRankingSnapshot, rankingEntryToPopularRank, resolvePostsFromRanking } from '@/lib/ranking/load-ranking'

/** TOP人気コンテンツの表示件数 */
export const POPULAR_POSTS_MAX = 6

/**
 * 人気コンテンツの取得元
 * 将来 Google Analytics 連携時は 'analytics' に切り替え
 */
export type PopularContentSource = 'spreadsheet' | 'analytics'

/** 現在の取得元（未設定時は analytics。空スナップショット時はスプレッドシートへフォールバック） */
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
  /** 人気順（スプレッドシート列「人気順」） */
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
 * - 人気表示 = true のみ
 * - 人気順が入力されているもののみ
 * - 人気順の昇順
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

/**
 * 人気コンテンツ取得（統一エントリポイント）
 * analytics 時は ranking-snapshot.json を参照（空ならスプレッドシートへフォールバック）
 */
export async function resolvePopularContentAsync(
  posts: Post[],
  options?: { source?: PopularContentSource; max?: number },
): Promise<PopularContentEntry[]> {
  const source = options?.source ?? getPopularContentSource()
  const max = options?.max ?? POPULAR_POSTS_MAX

  if (source === 'analytics') {
    const snapshot = await loadRankingSnapshot()
    const rankedPosts = resolvePostsFromRanking(snapshot, posts, max)
    const entrySource: PopularContentSource =
      snapshot.posts.length > 0 ? 'analytics' : 'spreadsheet'
    return rankedPosts.map((post, index) => {
      const entry = snapshot.posts.find((e) => e.id === `post:${post.id}` || e.id === post.id)
      return {
        post,
        rank: entry ? rankingEntryToPopularRank(entry, index) : post.popularOrder ?? index + 1,
        source: entrySource,
        trackingId: `popular:${entrySource}:${post.id}`,
      }
    })
  }

  return toPopularEntries(getPopularPostsFromSpreadsheet(posts, max), 'spreadsheet')
}

export function resolvePopularContent(
  posts: Post[],
  options?: { source?: PopularContentSource; max?: number },
): PopularContentEntry[] {
  const source = options?.source ?? getPopularContentSource()
  const max = options?.max ?? POPULAR_POSTS_MAX

  if (source === 'analytics') {
    // 同期コンテキストではスプレッドシートへフォールバック（サーバー側は resolvePopularContentAsync を使用）
    return toPopularEntries(getPopularPostsFromSpreadsheet(posts, max), 'spreadsheet')
  }

  return toPopularEntries(getPopularPostsFromSpreadsheet(posts, max), 'spreadsheet')
}

function toPopularEntries(posts: Post[], source: PopularContentSource): PopularContentEntry[] {
  return posts.map((post) => ({
    post,
    rank: post.popularOrder!,
    source,
    trackingId: `popular:${source}:${post.id}`,
  }))
}

/** @deprecated resolvePopularContent を使用 */
export function getPopularPosts(posts: Post[]): Post[] {
  return getPopularPostsFromSpreadsheet(posts)
}
