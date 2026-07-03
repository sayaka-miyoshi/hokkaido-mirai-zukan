import Link from 'next/link'
import { INDEX_LINKS } from '@/lib/entity-cross-links'

/** フッター直上：一覧ページへのサイト内ナビ（孤立ページ対策） */
export default function EntitySiteNav() {
  return (
    <nav aria-label="サイト内ナビ" className="mt-10 border-t border-hokkaido-ice pt-6">
      <p className="mb-3 text-sm font-bold text-gray-700">テーマから探す</p>
      <ul className="flex flex-wrap gap-2">
        {INDEX_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex items-center gap-1 rounded-full bg-hokkaido-ice/60 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-pink-50 hover:text-pink-600"
            >
              <span aria-hidden>{link.emoji}</span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
