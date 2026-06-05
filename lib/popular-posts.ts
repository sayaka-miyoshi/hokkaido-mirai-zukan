import type { Post } from '@/types/post'

/** 人気コンテンツの最大表示件数 */
export const POPULAR_POSTS_MAX = 10

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
 * 人気コンテンツ
 * - 人気表示=1（isPopular）のみ
 * - 人気順が入力されているもののみ
 * - 人気順の昇順（数値が小さい順）
 * - 最大10件
 */
export function getPopularPosts(posts: Post[]): Post[] {
  return posts
    .filter((post) => post.isPopular && post.popularOrder != null)
    .sort((a, b) => a.popularOrder! - b.popularOrder!)
    .slice(0, POPULAR_POSTS_MAX)
}
