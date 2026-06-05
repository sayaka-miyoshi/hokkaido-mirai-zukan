import type { ExternalLinkItem } from '@/lib/external-links'

type ExternalLinksProps = {
  links: ExternalLinkItem[]
}

/** 学校・部活・企業詳細ページの外部リンク一覧 */
export default function ExternalLinks({ links }: ExternalLinksProps) {
  if (links.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold mb-3">外部リンク</h2>
      <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-hokkaido-ice bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-hokkaido-sky hover:text-hokkaido-deep"
            >
              <span aria-hidden="true">{link.emoji}</span>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
