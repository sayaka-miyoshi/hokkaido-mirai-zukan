import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import { SITE_NAME } from '@/lib/site'
import { urls } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'ページが見つかりません',
  description: `お探しのページは見つかりませんでした。${SITE_NAME}のトップや一覧から記事を探せます。`,
  robots: { index: false, follow: true },
}

const LINKS = [
  { href: urls.home(), label: 'トップページ' },
  { href: urls.schools(), label: '学校一覧' },
  { href: urls.clubs(), label: '部活一覧' },
  { href: urls.companies(), label: '企業一覧' },
  { href: urls.sports(), label: '競技一覧' },
]

/** カスタム 404（内部リンク付き・noindex） */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-sm font-bold tracking-widest text-magazine-coral">404</p>
        <h1 className="mt-4 font-magazine-rounded text-2xl font-bold text-magazine-title">
          ページが見つかりません
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-magazine-muted">
          URLが変わったか、ページが削除された可能性があります。
          <br />
          以下のリンクから記事を探してみてください。
        </p>
        <ul className="mt-10 space-y-3 text-left">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-lg border border-hokkaido-ice px-4 py-3 text-sm font-medium text-hokkaido-sky hover:bg-hokkaido-ice/40"
              >
                {link.label} →
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
