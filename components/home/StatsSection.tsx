import type { HomeStats } from '@/lib/home-stats'
import MediaSectionHeading from './MediaSectionHeading'

type StatsSectionProps = {
  stats: HomeStats
}

const STAT_ITEMS = [
  { key: 'articleCount', label: '掲載記事数', emoji: '📰' },
  { key: 'schoolCount', label: '学校数', emoji: '🏫' },
  { key: 'clubCount', label: '部活動数', emoji: '⚽' },
  { key: 'companyCount', label: '企業数', emoji: '🏢' },
] as const

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section aria-label="数字で見る北海道未来図鑑">
      <MediaSectionHeading
        eyebrow="Numbers"
        title="数字で見る北海道未来図鑑"
        description="取材・掲載を重ねて、北海道の挑戦が集まり続けています。"
      />

      <div className="grid grid-cols-2 gap-3">
        {STAT_ITEMS.map(({ key, label, emoji }) => (
          <div
            key={key}
            className="rounded-2xl bg-gradient-to-br from-white to-hokkaido-ice/50 border border-hokkaido-ice p-4 text-center shadow-sm"
          >
            <p className="text-xl" aria-hidden="true">
              {emoji}
            </p>
            <p className="mt-2 text-2xl font-bold text-hokkaido-deep tabular-nums">
              {stats[key].toLocaleString('ja-JP')}
            </p>
            <p className="mt-1 text-xs font-semibold text-gray-600">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
