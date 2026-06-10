'use client'

import Link from 'next/link'
import { HOME_CATEGORIES } from '@/lib/site'

type CategoryEditorialSectionProps = {
  onFilterGenre?: (genre: string) => void
}

/** 学校・部活・企業・行政カテゴリ（エディトリアル） */
export default function CategoryEditorialSection({
  onFilterGenre,
}: CategoryEditorialSectionProps) {
  return (
    <section aria-label="カテゴリ" className="py-2">
      <h2 className="text-2xl font-bold text-hokkaido-deep leading-snug">カテゴリ</h2>

      <div className="mt-10 divide-y divide-hokkaido-ice/80">
        {HOME_CATEGORIES.map((category) => {
          const className =
            'group block w-full py-7 text-left text-xl font-bold leading-snug text-hokkaido-deep hover:text-hokkaido-sky transition-colors first:pt-0'

          if (category.type === 'link') {
            return (
              <Link key={category.label} href={category.href} className={className}>
                {category.label}
              </Link>
            )
          }

          return (
            <button
              key={category.label}
              type="button"
              onClick={() => onFilterGenre?.(category.genre)}
              className={className}
            >
              {category.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
