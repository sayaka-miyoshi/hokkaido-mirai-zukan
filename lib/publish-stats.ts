import type { Post } from '@/types/post'

export type PublishGenreStat = {
  emoji: string
  label: string
  genre: string
  count: number
}

export type PublishStats = {
  total: number
  byGenre: PublishGenreStat[]
}

/** TOP掲載件数に表示するジャンル（CSV「ジャンル」列と一致） */
export const PUBLISH_GENRE_STATS: Omit<PublishGenreStat, 'count'>[] = [
  { emoji: '📚', label: '学校', genre: '学校' },
  { emoji: '🏆', label: '部活', genre: '部活' },
  { emoji: '🏢', label: '企業', genre: '企業訪問' },
  { emoji: '🏛️', label: '行政・自治体', genre: '行政・自治体' },
]

/** 公開記事から掲載件数を集計 */
export function getPublishStats(posts: Post[]): PublishStats {
  const published = posts.filter((post) => post.isPublished)

  const countByGenre = new Map<string, number>()
  for (const post of published) {
    const genre = post.genre.trim()
    if (!genre) continue
    countByGenre.set(genre, (countByGenre.get(genre) ?? 0) + 1)
  }

  return {
    total: published.length,
    byGenre: PUBLISH_GENRE_STATS.map((item) => ({
      ...item,
      count: countByGenre.get(item.genre) ?? 0,
    })),
  }
}
