import type { Post } from '@/types/post'
import { parsePostDate } from '@/lib/dates'
import { LATEST_CONTENT_MAX } from '@/lib/home-layout'

/**
 * TOP「最新コンテンツ」
 * - 公開 = true の全ジャンル
 * - 投稿日の新しい順
 * - 人気・企業おすすめ等の除外なし
 */
export function getLatestContentPosts(
  posts: Post[],
  max: number = LATEST_CONTENT_MAX,
): Post[] {
  return posts
    .filter((post) => post.isPublished)
    .sort((a, b) => {
      const diff = parsePostDate(b.date) - parsePostDate(a.date)
      if (diff !== 0) return diff
      return 0
    })
    .slice(0, max)
}
