import type { Post } from '@/types/post'
import {
  getPopularContentSource,
  getPopularPostsFromSpreadsheet,
  POPULAR_POSTS_MAX,
  toPopularEntries,
  type PopularContentEntry,
  type PopularContentSource,
} from '@/lib/popular-posts'
import {
  loadRankingSnapshot,
  rankingEntryToPopularRank,
  resolvePostsFromRanking,
} from '@/lib/ranking/load-ranking'

/**
 * サーバー専用: ranking-snapshot.json を参照した人気コンテンツ
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
