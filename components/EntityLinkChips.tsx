import Link from 'next/link'
import type { EntityLinkChip } from '@/lib/entity-cross-links'

type EntityLinkChipsProps = {
  title: string
  links: EntityLinkChip[]
  className?: string
}

/** エンティティ相互リンク（チップ形式） */
export default function EntityLinkChips({ title, links, className = '' }: EntityLinkChipsProps) {
  if (links.length === 0) return null

  return (
    <section className={`mb-8 ${className}`} aria-label={title}>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex items-center gap-1 rounded-full border border-hokkaido-ice bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-pink-300 hover:text-pink-600"
            >
              <span aria-hidden>{link.emoji}</span>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
