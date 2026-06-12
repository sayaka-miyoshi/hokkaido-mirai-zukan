'use client'

import Link from 'next/link'
import { type ReactNode } from 'react'
import { urls } from '@/lib/urls'

type HomeBrowseSectionProps = {
  keyword: string
  onKeywordChange: (value: string) => void
  selectedGenre: string | null
  onGenreChange: (genre: string | null) => void
  selectedArea: string | null
  onAreaChange: (area: string | null) => void
  selectedVideoCategory: string | null
  onVideoCategoryChange: (id: string | null) => void
  selectedCareerCategory: string | null
  onCareerCategoryChange: (category: string | null) => void
  videoCategories: { id: string; label: string }[]
  careerCategories: string[]
  hasActiveFilter: boolean
  filteredCount: number
  totalCount: number
  onClearFilters: () => void
  onShowResults: () => void
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-all active:scale-[0.98]
        ${active
          ? 'border-magazine-title bg-magazine-title text-white shadow-magazine-sm'
          : 'border-magazine-border bg-white text-magazine-text hover:border-hokkaido-sky/50 hover:bg-magazine-sky'
        }`}
    >
      {children}
    </button>
  )
}

/** ② 検索エリア（SEO H2付き） */
export default function HomeBrowseSection({
  keyword,
  onKeywordChange,
  selectedGenre,
  onGenreChange,
  selectedArea,
  onAreaChange,
  selectedVideoCategory,
  onVideoCategoryChange,
  selectedCareerCategory,
  onCareerCategoryChange,
  videoCategories,
  careerCategories,
  hasActiveFilter,
  filteredCount,
  totalCount,
  onClearFilters,
  onShowResults,
}: HomeBrowseSectionProps) {
  return (
    <section
      id="browse"
      aria-label="記事を探す"
      className="scroll-mt-4 bg-white px-6 py-16"
    >
      <div className="space-y-10 rounded-3xl border border-magazine-border bg-magazine-cream/50 p-6">
        <div>
          <label htmlFor="home-search" className="sr-only">
            キーワード検索
          </label>
          <input
            id="home-search"
            type="search"
            enterKeyHint="search"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onShowResults()
            }}
            placeholder="学校名・部活名・企業名で検索"
            className="w-full rounded-2xl border border-magazine-border bg-white px-4 py-3.5 text-sm text-magazine-text placeholder:text-magazine-muted focus:border-hokkaido-sky focus:outline-none focus:ring-2 focus:ring-hokkaido-sky/20"
          />
        </div>

        <div>
          <h2 className="font-magazine-rounded text-lg font-bold text-magazine-title">学校を探す</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <FilterChip
              active={selectedGenre === '学校'}
              onClick={() => onGenreChange(selectedGenre === '学校' ? null : '学校')}
            >
              学校の記事
            </FilterChip>
            <Link
              href={urls.schools()}
              className="inline-flex min-h-[40px] items-center rounded-full border border-magazine-border bg-white px-4 py-2 text-xs font-medium text-magazine-text hover:bg-magazine-sky"
            >
              学校一覧へ →
            </Link>
          </div>
        </div>

        <div>
          <h2 className="font-magazine-rounded text-lg font-bold text-magazine-title">部活を探す</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <FilterChip
              active={selectedGenre === '部活'}
              onClick={() => onGenreChange(selectedGenre === '部活' ? null : '部活')}
            >
              部活の記事
            </FilterChip>
            <Link
              href={urls.clubs()}
              className="inline-flex min-h-[40px] items-center rounded-full border border-magazine-border bg-white px-4 py-2 text-xs font-medium text-magazine-text hover:bg-magazine-sky"
            >
              部活一覧へ →
            </Link>
          </div>
        </div>

        <div>
          <h2 className="font-magazine-rounded text-lg font-bold text-magazine-title">企業を探す</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <FilterChip
              active={selectedGenre === '企業訪問'}
              onClick={() => onGenreChange(selectedGenre === '企業訪問' ? null : '企業訪問')}
            >
              企業の記事
            </FilterChip>
            <FilterChip
              active={selectedGenre === '行政・自治体'}
              onClick={() =>
                onGenreChange(selectedGenre === '行政・自治体' ? null : '行政・自治体')
              }
            >
              行政・自治体
            </FilterChip>
          </div>
        </div>

        <div>
          <h2 className="font-magazine-rounded text-lg font-bold text-magazine-title">進路から探す</h2>
          {careerCategories.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {careerCategories.slice(0, 12).map((category) => (
                <FilterChip
                  key={category}
                  active={selectedCareerCategory === category}
                  onClick={() =>
                    onCareerCategoryChange(selectedCareerCategory === category ? null : category)
                  }
                >
                  {category}
                </FilterChip>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-magazine-muted">進路カテゴリの記事を準備中です</p>
          )}
        </div>

        <div>
          <p className="mb-3 text-[11px] font-bold text-magazine-muted">エリア</p>
          <div className="flex flex-wrap gap-2">
            {['札幌', '函館', '旭川', '帯広'].map((area) => (
              <FilterChip
                key={area}
                active={selectedArea === area}
                onClick={() => onAreaChange(selectedArea === area ? null : area)}
              >
                {area}
              </FilterChip>
            ))}
          </div>
        </div>

        {videoCategories.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer list-none font-medium text-magazine-muted hover:text-magazine-text">
              詳細条件
            </summary>
            <div className="mt-4 flex flex-wrap gap-2">
              {videoCategories.map(({ id, label }) => (
                <FilterChip
                  key={id}
                  active={selectedVideoCategory === id}
                  onClick={() => onVideoCategoryChange(selectedVideoCategory === id ? null : id)}
                >
                  {label}
                </FilterChip>
              ))}
            </div>
          </details>
        )}

        {hasActiveFilter && (
          <div className="space-y-3 border-t border-magazine-border pt-5">
            <div className="flex items-center justify-between text-xs text-magazine-text">
              <span>
                {filteredCount}件 / 全{totalCount}件
              </span>
              <button type="button" onClick={onClearFilters} className="font-bold text-hokkaido-sky">
                リセット
              </button>
            </div>
            <button
              type="button"
              onClick={onShowResults}
              className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-magazine-title text-sm font-bold text-white shadow-magazine-sm"
            >
              記事を見る（{filteredCount}件）↓
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
