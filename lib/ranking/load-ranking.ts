import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Post } from '@/types/post'
import type { RankingEntry, RankingSnapshot } from '@/types/ranking'
import { RANKING_SNAPSHOT_PATH } from '@/types/ranking'

function getPopularPostsFromSpreadsheet(posts: Post[], max: number): Post[] {
  return posts
    .filter((post) => post.isPopular && post.popularOrder != null)
    .sort((a, b) => a.popularOrder! - b.popularOrder!)
    .slice(0, max)
}

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

/** ランキングスナップショットを読み込み（public/data 優先） */
export async function loadRankingSnapshot(): Promise<RankingSnapshot> {
  if (cachedSnapshot) return cachedSnapshot

  try {
    const filePath = join(process.cwd(), 'public', 'data', 'ranking-snapshot.json')
    const text = await readFile(filePath, 'utf8')
    cachedSnapshot = JSON.parse(text) as RankingSnapshot
    return cachedSnapshot
  } catch {
    // fall through to HTTP
  }

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

/** postId → スコア */
export function buildPostScoreMap(snapshot: RankingSnapshot): Map<string, number> {
  const map = new Map<string, number>()
  for (const entry of snapshot.posts) {
    const id = entry.id.replace(/^post:/, '')
    map.set(id, entry.score?.total ?? 0)
  }
  return map
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

/** 投稿一覧をランキングスコア順に並べ替え（同点は新着優先） */
export function sortPostsByRanking(
  posts: Post[],
  scoreMap: Map<string, number>,
  parseDate: (date: string) => number,
): Post[] {
  return [...posts].sort((a, b) => {
    const scoreDiff = (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0)
    if (scoreDiff !== 0) return scoreDiff
    return parseDate(b.date) - parseDate(a.date)
  })
}

export function rankingEntryToPopularRank(entry: RankingEntry, index: number): number {
  return entry.score?.total ? Math.round(entry.score.total) : index + 1
}
