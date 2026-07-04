import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import Breadcrumb from '@/components/Breadcrumb'
import { createPageMetadata } from '@/lib/metadata'
import { buildSeoReportSnapshot } from '@/lib/seo-report'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: 'SEO・分析レポート',
  description: 'Search Console・人気ランキング・運用チェックリストの確認用レポートです。',
  path: '/operator/seo',
  noIndex: true,
})

const STATUS_LABEL = {
  ok: 'OK',
  warn: '要確認',
  todo: 'TODO',
} as const

const STATUS_CLASS = {
  ok: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-900',
  todo: 'bg-slate-100 text-slate-700',
} as const

/** Search Console / 運用分析用レポート（noindex） */
export default async function OperatorSeoReportPage() {
  const report = await buildSeoReportSnapshot()

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'ホーム', href: urls.home() },
            { label: '運営者', href: urls.operator() },
            { label: 'SEO・分析レポート' },
          ]}
        />

        <h1 className="mt-4 font-magazine-rounded text-2xl font-bold text-magazine-title">
          SEO・分析レポート
        </h1>
        <p className="mt-2 text-sm text-magazine-muted">
          生成: {new Date(report.generatedAt).toLocaleString('ja-JP')}
          （このページは noindex です）
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-bold">チェックリスト</h2>
          <ul className="mt-4 space-y-3">
            {report.checklist.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-hokkaido-ice px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_CLASS[item.status]}`}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                  <span className="font-medium text-magazine-title">{item.label}</span>
                </div>
                <p className="mt-1 text-sm text-magazine-muted">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold">人気ランキング（スナップショット）</h2>
          <p className="mt-1 text-sm text-magazine-muted">{report.ranking.label}</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold text-magazine-title">記事 TOP</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {report.ranking.topPosts.map((post) => (
                  <li key={post.id}>
                    <Link href={urls.post(post.id)} className="text-hokkaido-sky hover:underline">
                      {post.name}
                    </Link>
                    <span className="text-magazine-muted">（{post.score}）</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-sm font-bold text-magazine-title">競技 TOP</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {report.ranking.topSports.map((sport) => (
                  <li key={sport.name}>
                    {sport.name}
                    <span className="text-magazine-muted">（{sport.score}）</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold">次のアクション</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-magazine-text">
            {report.nextActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-lg bg-magazine-cream px-4 py-4 text-sm">
          <p className="font-bold">Search Console 登録 URL</p>
          <p className="mt-2 break-all text-hokkaido-sky">
            https://www.hokkaido-miraizukan.jp/sitemap.xml
          </p>
          <p className="mt-3 font-bold">ローカル監査コマンド</p>
          <pre className="mt-2 overflow-x-auto rounded bg-white p-3 text-xs">
            {`npm run audit:links
npm run audit:metadata
npm run audit:all-links
node scripts/audit-ai-seo.mjs`}
          </pre>
        </section>

        <p className="mt-10 text-center text-sm">
          <Link href={urls.operator()} className="text-hokkaido-sky hover:underline">
            運営者ページへ戻る
          </Link>
        </p>
      </main>
    </div>
  )
}
