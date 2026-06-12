import type { PublishStats } from '@/lib/publish-stats'

type HomePublishStatsSectionProps = {
  stats: PublishStats
}

/** 検索エリア直下 — 掲載件数サマリー */
export default function HomePublishStatsSection({ stats }: HomePublishStatsSectionProps) {
  if (stats.total === 0) return null

  return (
    <section
      aria-label="掲載記事数"
      className="border-t border-magazine-border bg-white px-6 py-10"
    >
      <div className="mx-auto max-w-sm text-center">
        <p className="text-[11px] font-bold tracking-[0.18em] text-hokkaido-sky">北海道最大級</p>
        <p className="mt-2 font-magazine-rounded text-base font-bold text-magazine-title">
          学校・部活・企業
        </p>
        <p className="mt-3 text-2xl font-bold tabular-nums text-magazine-title">
          {stats.total.toLocaleString('ja-JP')}
          <span className="ml-1 text-sm font-bold">記事掲載中</span>
        </p>

        <ul className="mt-6 space-y-2.5 text-left">
          {stats.byGenre.map(({ emoji, label, count }) => (
            <li
              key={label}
              className="flex min-h-[44px] items-center justify-between rounded-xl border border-magazine-border bg-magazine-cream/40 px-4 py-2.5"
            >
              <span className="text-sm text-magazine-text">
                {emoji} {label}
              </span>
              <span className="text-sm font-bold tabular-nums text-magazine-title">
                {count.toLocaleString('ja-JP')}件
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
