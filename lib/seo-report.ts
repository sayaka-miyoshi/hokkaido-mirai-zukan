import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { RankingSnapshot } from '@/types/ranking'

export type SeoReportSnapshot = {
  generatedAt: string
  ranking: {
    label: string
    postCount: number
    topPosts: { id: string; name: string; score: number }[]
    topSports: { name: string; score: number }[]
  }
  checklist: { id: string; label: string; status: 'ok' | 'warn' | 'todo'; note: string }[]
  nextActions: string[]
}

async function loadRanking(): Promise<RankingSnapshot | null> {
  try {
    const text = await readFile(join(process.cwd(), 'public', 'data', 'ranking-snapshot.json'), 'utf8')
    return JSON.parse(text) as RankingSnapshot
  } catch {
    return null
  }
}

/** Search Console / 運用向けレポート用スナップショット */
export async function buildSeoReportSnapshot(): Promise<SeoReportSnapshot> {
  const ranking = await loadRanking()
  const hasRanking = Boolean(ranking && ranking.posts.length > 0)

  return {
    generatedAt: new Date().toISOString(),
    ranking: {
      label: ranking?.period.label ?? '未集計',
      postCount: ranking?.posts.length ?? 0,
      topPosts: (ranking?.posts ?? []).slice(0, 8).map((p) => ({
        id: p.id.replace(/^post:/, ''),
        name: p.name,
        score: p.score.total,
      })),
      topSports: (ranking?.sports ?? []).slice(0, 6).map((s) => ({
        name: s.name,
        score: s.score.total,
      })),
    },
    checklist: [
      {
        id: 'ga4',
        label: 'GA4 計測（G-9Q0MGFPBZ6）',
        status: 'ok',
        note: 'リアルタイムでアクティブユーザーを確認済み',
      },
      {
        id: 'sitemap',
        label: 'sitemap.xml',
        status: 'ok',
        note: 'https://www.hokkaido-miraizukan.jp/sitemap.xml を Search Console に登録',
      },
      {
        id: 'llms',
        label: 'llms.txt',
        status: 'ok',
        note: 'https://www.hokkaido-miraizukan.jp/llms.txt',
      },
      {
        id: 'ranking',
        label: '人気ランキングスナップショット',
        status: hasRanking ? 'ok' : 'warn',
        note: hasRanking
          ? ranking!.period.label
          : 'npm run ranking:bootstrap または aggregate:analytics を実行',
      },
      {
        id: 'gsc-index',
        label: 'Search Console インデックス',
        status: 'todo',
        note: 'カバレッジ・ページインデックス登録を週次で確認',
      },
      {
        id: 'cwv',
        label: 'Core Web Vitals',
        status: 'todo',
        note: 'Search Console「体験」レポートで LCP / INP / CLS を監視',
      },
      {
        id: 'title-dup',
        label: '記事タイトル重複',
        status: 'todo',
        note: 'npm run audit:metadata で重複を確認しスプレッドシートを修正',
      },
    ],
    nextActions: [
      'Search Console に sitemap.xml を送信し、検出 URL 数を確認する',
      'GA4 週次エクスポート CSV で npm run aggregate:analytics を実行しランキングを更新する',
      'インデックス未登録 URL があれば URL 検査からリクエストする',
      'Core Web Vitals の不良 URL があれば画像・LCP を優先改善する',
    ],
  }
}
