import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import { createPageMetadata } from '@/lib/metadata'
import { FEATURED_SPORTS } from '@/lib/sport-page-copy'
import { getSportSlug } from '@/lib/sport-slugs'
import { SITE_NAME } from '@/lib/site'
import { urls } from '@/lib/urls'

export const metadata: Metadata = createPageMetadata({
  title: 'カテゴリから探す',
  description:
    '学校・部活・企業・人気競技から北海道未来図鑑の記事を探せます。iSTEP・Instagramからの導線ページです。',
  path: '/start',
})

const CATEGORIES = [
  {
    id: 'schools',
    label: '学校を探す',
    description: '大学・専門学校などの紹介記事',
    href: urls.schools(),
    emoji: '🏫',
  },
  {
    id: 'clubs',
    label: '部活を探す',
    description: '部活動・サークルの活動記事',
    href: urls.clubs(),
    emoji: '⚽',
  },
  {
    id: 'companies',
    label: '企業を探す',
    description: '企業訪問・仕事紹介',
    href: urls.companies(),
    emoji: '🏭',
  },
  {
    id: 'sports',
    label: '競技一覧',
    description: '競技カテゴリから部活を探す',
    href: urls.sports(),
    emoji: '🏅',
  },
] as const

/** iSTEP / SNS 向けカテゴリ選択ランディング */
export default function StartPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-12">
        <p className="text-sm font-bold tracking-wide text-magazine-coral">START HERE</p>
        <h1 className="mt-3 font-magazine-rounded text-2xl font-bold text-magazine-title">
          何を探しますか？
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-magazine-muted">
          {SITE_NAME}の記事をカテゴリから選べます。気になるテーマをタップしてください。
        </p>

        <ul className="mt-10 space-y-3">
          {CATEGORIES.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-start gap-4 rounded-xl border border-hokkaido-ice bg-magazine-cream/40 px-4 py-4 transition hover:border-hokkaido-sky hover:bg-hokkaido-ice/30"
              >
                <span className="text-2xl" aria-hidden>
                  {item.emoji}
                </span>
                <span>
                  <span className="block font-bold text-magazine-title">{item.label}</span>
                  <span className="mt-1 block text-sm text-magazine-muted">{item.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-12">
          <h2 className="text-lg font-bold text-magazine-title">人気の競技</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {FEATURED_SPORTS.map((name) => (
              <li key={name}>
                <Link
                  href={urls.sport(getSportSlug(name))}
                  className="inline-block rounded-full bg-hokkaido-ice/70 px-4 py-2 text-sm font-medium text-hokkaido-sky hover:bg-hokkaido-ice"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-12 text-center text-sm">
          <Link href={urls.home()} className="font-medium text-hokkaido-sky hover:underline">
            トップページへ →
          </Link>
        </p>
      </main>
    </div>
  )
}
