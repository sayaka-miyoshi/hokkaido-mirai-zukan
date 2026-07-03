/** 人気ランキング・分析集計用データ構造（Phase 2B） */

export type RankingEntityType = 'post' | 'school' | 'club' | 'sport' | 'company'

/** 指標の生カウント（週次バッチで更新） */
export type RankingMetrics = {
  pageViews: number
  searchClicks: number
  instagramLandings: number
  istepLandings: number
}

/** 重み付きスコア（Phase 2C UI 表示用） */
export type RankingScore = {
  total: number
  pageViews: number
  searchClicks: number
  instagramLandings: number
  /** 算出日時 ISO8601 */
  computedAt: string
}

export type RankingEntry = {
  id: string
  type: RankingEntityType
  name: string
  slug?: string
  url: string
  metrics: RankingMetrics
  score: RankingScore
  /** 紐づく記事 ID（エンティティ集計時） */
  postIds?: string[]
}

export type RankingSnapshot = {
  version: 1
  generatedAt: string
  period: {
    start: string
    end: string
    label: string
  }
  weights: {
    pageViews: number
    searchClicks: number
    instagramLandings: number
  }
  posts: RankingEntry[]
  schools: RankingEntry[]
  clubs: RankingEntry[]
  sports: RankingEntry[]
  companies: RankingEntry[]
}

export const RANKING_WEIGHTS = {
  pageViews: 0.4,
  searchClicks: 0.3,
  instagramLandings: 0.3,
} as const

export const RANKING_SNAPSHOT_PATH = '/data/ranking-snapshot.json'
