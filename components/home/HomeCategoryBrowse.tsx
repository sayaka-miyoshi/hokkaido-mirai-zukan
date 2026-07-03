'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  browseFiltersEqual,
  POPULAR_BROWSE_SEARCHES,
  resolveBrowseCategories,
  type BrowseFilter,
  type ResolvedBrowseCategory,
} from '@/lib/browse-categories'
import type { Post } from '@/types/post'

type HomeCategoryBrowseProps = {
  posts: Post[]
  activeBrowseFilter: BrowseFilter | null
  onApplyBrowseFilter: (filter: BrowseFilter) => void
}

function SubcategoryChip({
  label,
  postCount,
  active,
  href,
  onClick,
}: {
  label: string
  postCount: number | null
  active: boolean
  href?: string
  onClick?: () => void
}) {
  const className = `inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-medium transition-all active:scale-[0.98]
    ${active
      ? 'border-magazine-title bg-magazine-title text-white shadow-magazine-sm'
      : 'border-magazine-border bg-white text-magazine-text hover:border-hokkaido-sky/50 hover:bg-magazine-sky'
    }`

  const content = (
    <>
      <span>{label}</span>
      {postCount != null && postCount > 0 && (
        <span className={`text-[10px] ${active ? 'text-white/80' : 'text-magazine-muted'}`}>
          {postCount}
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
        <span aria-hidden="true">→</span>
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}

function isSubcategoryActive(
  sub: ResolvedBrowseCategory['subcategories'][number],
  activeBrowseFilter: BrowseFilter | null,
): boolean {
  if (!sub.filter || !activeBrowseFilter) return false
  return browseFiltersEqual(sub.filter, activeBrowseFilter)
}

function CategoryPanel({
  category,
  expanded,
  onToggle,
  activeBrowseFilter,
  onApplyBrowseFilter,
}: {
  category: ResolvedBrowseCategory
  expanded: boolean
  onToggle: () => void
  activeBrowseFilter: BrowseFilter | null
  onApplyBrowseFilter: (filter: BrowseFilter) => void
}) {
  const panelId = `browse-category-${category.id}`

  return (
    <div className="overflow-hidden rounded-2xl border border-magazine-border bg-white">
      <button
        type="button"
        id={`${panelId}-button`}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 py-3 text-left active:bg-magazine-sky/40"
      >
        <span className="flex items-center gap-2.5">
          <span className="text-xl" aria-hidden="true">
            {category.emoji}
          </span>
          <span className="font-magazine-rounded text-base font-bold text-magazine-title">
            {category.label}
          </span>
        </span>
        <span
          className={`text-magazine-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={`${panelId}-button`}
          className="border-t border-magazine-border bg-magazine-cream/30 px-4 py-4"
        >
          <div className="flex flex-wrap gap-2">
            {category.subcategories.map((sub) => (
              <SubcategoryChip
                key={sub.id}
                label={sub.label}
                postCount={sub.postCount}
                href={sub.href}
                active={isSubcategoryActive(sub, activeBrowseFilter)}
                onClick={
                  sub.filter ? () => onApplyBrowseFilter(sub.filter!) : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** カテゴリから探す（大カテゴリ5つ＋人気検索） */
export default function HomeCategoryBrowse({
  posts,
  activeBrowseFilter,
  onApplyBrowseFilter,
}: HomeCategoryBrowseProps) {
  const categories = useMemo(() => resolveBrowseCategories(posts), [posts])
  const [expandedId, setExpandedId] = useState<string | null>('clubs')

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-magazine-rounded text-lg font-bold text-magazine-title">
          カテゴリから探す
        </h2>
        <p className="mt-1 text-xs text-magazine-muted">
          タップしてサブカテゴリを表示。記事がすぐ見つかります。
        </p>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-bold text-magazine-muted">人気検索</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_BROWSE_SEARCHES.map((item) => {
            const filter: BrowseFilter | null = item.keyword ? { keyword: item.keyword } : null
            const active = filter ? browseFiltersEqual(filter, activeBrowseFilter) : false

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-hokkaido-sky/30 bg-hokkaido-sky/10 px-4 py-2.5 text-xs font-bold text-hokkaido-sky active:scale-[0.98]"
                >
                  {item.label}
                </Link>
              )
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onApplyBrowseFilter(filter!)}
                className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-2.5 text-xs font-bold transition-all active:scale-[0.98]
                  ${active
                    ? 'border-magazine-title bg-magazine-title text-white'
                    : 'border-hokkaido-sky/30 bg-hokkaido-sky/10 text-hokkaido-sky'
                  }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-3">
        {categories.map((category) => (
          <CategoryPanel
            key={category.id}
            category={category}
            expanded={expandedId === category.id}
            onToggle={() =>
              setExpandedId((current) => (current === category.id ? null : category.id))
            }
            activeBrowseFilter={activeBrowseFilter}
            onApplyBrowseFilter={onApplyBrowseFilter}
          />
        ))}
      </div>
    </div>
  )
}
