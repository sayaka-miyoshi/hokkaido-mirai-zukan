import type { Post } from '@/types/post'
import type { RankingEntry, RankingSnapshot } from '@/types/ranking'
import { RANKING_SNAPSHOT_PATH } from '@/types/ranking'
import { getPopularPostsFromSpreadsheet } from '@/lib/popular-posts'

const EMPTY_SNAPSHOT: RankingSnapshot = {
  version: 1,
  generatedAt: new Date(0).toISOString(),
  period: { start: '', end: '', label: '未集計' },
  weights: { pageViews: 0.4, searchClicks: 0.3, instagramLandings: 0.3 },
  posts: [],
  schools: [],
  clubs: [],
  sports: [],
  companies: [],
}

let cachedSnapshot: RankingSnapshot | null = null

/** ランキングスナップショットを読み込み（ビルド成果物 or 空） */
export async function loadRankingSnapshot(): Promise<RankingSnapshot> {
  if (cachedSnapshot) return cachedSnapshot

  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? ''
    const url = base ? `${base}${RANKING_SNAPSHOT_PATH}` : RANKING_SNAPSHOT_PATH
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) {
      cachedSnapshot = EMPTY_SNAPSHOT
      return cachedSnapshot
    }
    cachedSnapshot = (await res.json()) as RankingSnapshot
    return cachedSnapshot
  } catch {
    cachedSnapshot = EMPTY_SNAPSHOT
    return cachedSnapshot
  }
}

/** 分析ランキングから人気記事を取得（データなし時はスプレッドシートへフォールバック） */
export function resolvePostsFromRanking(
  snapshot: RankingSnapshot,
  posts: Post[],
  max: number,
): Post[] {
  if (snapshot.posts.length === 0) {
    return getPopularPostsFromSpreadsheet(posts, max)
  }

  const byId = new Map(posts.map((p) => [p.id, p]))
  const ranked: Post[] = []
  for (const entry of snapshot.posts) {
    const post = byId.get(entry.id.replace(/^post:/, ''))
    if (post) ranked.push(post)
    if (ranked.length >= max) break
  }
  return ranked.length > 0 ? ranked : getPopularPostsFromSpreadsheet(posts, max)
}

export function rankingEntryToPopularRank(entry: RankingEntry, index: number): number {
  return entry.score?.total ? Math.round(entry.score.total) : index + 1
}
