'use client'

import Link from 'next/link'
import { type ReactNode } from 'react'
import SearchSuggestInput from '@/components/home/SearchSuggestInput'
import type { SearchSuggestion } from '@/lib/search-suggestions'
import type { SportQuickChip } from '@/lib/post-search'
import { urls } from '@/lib/urls'

type HomeBrowseSectionProps = {
  keyword: string
  onKeywordChange: (value: string) => void
  onSelectSuggestion: (value: string) => void
  suggestionIndex: SearchSuggestion[]
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
  sportQuickChips: SportQuickChip[]
  onSportChipClick: (sportName: string) => void
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
      className={`min-h-[44px] shrink-0 rounded-full border px-4 py-2.5 text-xs font-medium transition-all active:scale-[0.98]
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
  onSelectSuggestion,
  suggestionIndex,
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
  sportQuickChips,
  onSportChipClick,
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
      className="scroll-mt-4 bg-white px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="space-y-8 rounded-3xl border border-magazine-border bg-magazine-cream/50 p-4 sm:space-y-10 sm:p-6">
        <div>
          <label htmlFor="home-search" className="sr-only">
            キーワード検索
          </label>
          <SearchSuggestInput
            keyword={keyword}
            onKeywordChange={onKeywordChange}
            onSelectSuggestion={onSelectSuggestion}
            onShowResults={onShowResults}
            suggestionIndex={suggestionIndex}
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
              className="inline-flex min-h-[44px] items-center rounded-full border border-magazine-border bg-white px-4 py-2.5 text-xs font-medium text-magazine-text hover:bg-magazine-sky"
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
              className="inline-flex min-h-[44px] items-center rounded-full border border-magazine-border bg-white px-4 py-2.5 text-xs font-medium text-magazine-text hover:bg-magazine-sky"
            >
              部活一覧へ →
            </Link>
          </div>

          {sportQuickChips.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-[11px] font-bold text-magazine-muted">競技から探す</p>
              <div className="flex flex-wrap gap-2">
                {sportQuickChips.map((sport) => (
                  <FilterChip
                    key={sport.name}
                    active={keyword === sport.name}
                    onClick={() => onSportChipClick(sport.name)}
                  >
                    {sport.name}
                  </FilterChip>
                ))}
              </div>
              <p className="mt-3">
                <Link
                  href={urls.sports()}
                  className="text-xs font-medium text-hokkaido-sky hover:underline"
                >
                  競技カテゴリ一覧へ →
                </Link>
              </p>
            </div>
          )}
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
            <Link
              href={urls.companies()}
              className="inline-flex min-h-[44px] items-center rounded-full border border-magazine-border bg-white px-4 py-2.5 text-xs font-medium text-magazine-text hover:bg-magazine-sky"
            >
              企業一覧へ →
            </Link>
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
          <div className="sticky bottom-3 z-10 space-y-3 rounded-2xl border border-magazine-border bg-white/95 p-4 shadow-magazine-sm backdrop-blur-sm sm:static sm:border-t sm:border-magazine-border sm:bg-transparent sm:p-0 sm:pt-5 sm:shadow-none sm:backdrop-blur-none">
            <div className="flex items-center justify-between text-xs text-magazine-text">
              <span>
                {filteredCount}件 / 全{totalCount}件
              </span>
              <button type="button" onClick={onClearFilters} className="min-h-[44px] px-2 font-bold text-hokkaido-sky">
                リセット
              </button>
            </div>
            <button
              type="button"
              onClick={onShowResults}
              className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-magazine-title text-sm font-bold text-white shadow-magazine-sm active:scale-[0.99]"
            >
              記事を見る（{filteredCount}件）↓
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
