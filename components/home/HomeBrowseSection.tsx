'use client'

import { type ReactNode } from 'react'
import HomeCategoryBrowse from '@/components/home/HomeCategoryBrowse'
import SearchSuggestInput from '@/components/home/SearchSuggestInput'
import type { BrowseFilter } from '@/lib/browse-categories'
import type { SearchSuggestion } from '@/lib/search-suggestions'
import type { Post } from '@/types/post'

type HomeBrowseSectionProps = {
  posts: Post[]
  keyword: string
  onKeywordChange: (value: string) => void
  onSelectSuggestion: (value: string) => void
  suggestionIndex: SearchSuggestion[]
  selectedGenre: string | null
  selectedArea: string | null
  selectedVideoCategory: string | null
  onVideoCategoryChange: (id: string | null) => void
  selectedCareerCategory: string | null
  onCareerCategoryChange: (category: string | null) => void
  videoCategories: { id: string; label: string }[]
  careerCategories: string[]
  onApplyBrowseSelection: (filter: BrowseFilter) => void
  activeBrowseFilter: BrowseFilter | null
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

/** ② 検索エリア（キーワード検索・カテゴリから探す） */
export default function HomeBrowseSection({
  posts,
  keyword,
  onKeywordChange,
  onSelectSuggestion,
  suggestionIndex,
  selectedGenre,
  selectedArea,
  selectedVideoCategory,
  onVideoCategoryChange,
  selectedCareerCategory,
  onCareerCategoryChange,
  videoCategories,
  careerCategories,
  onApplyBrowseSelection,
  activeBrowseFilter,
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

        <HomeCategoryBrowse
          posts={posts}
          activeBrowseFilter={activeBrowseFilter}
          onApplyBrowseFilter={onApplyBrowseSelection}
        />

        {(careerCategories.length > 0 || videoCategories.length > 0) && (
          <details className="text-xs">
            <summary className="cursor-pointer list-none font-medium text-magazine-muted hover:text-magazine-text">
              その他の条件（進路・動画カテゴリ）
            </summary>
            <div className="mt-4 space-y-5">
              {careerCategories.length > 0 && (
                <div>
                  <p className="mb-3 text-[11px] font-bold text-magazine-muted">進路カテゴリ</p>
                  <div className="flex flex-wrap gap-2">
                    {careerCategories.slice(0, 12).map((category) => (
                      <FilterChip
                        key={category}
                        active={selectedCareerCategory === category}
                        onClick={() =>
                          onCareerCategoryChange(
                            selectedCareerCategory === category ? null : category,
                          )
                        }
                      >
                        {category}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              )}
              {videoCategories.length > 0 && (
                <div>
                  <p className="mb-3 text-[11px] font-bold text-magazine-muted">動画カテゴリ</p>
                  <div className="flex flex-wrap gap-2">
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
                </div>
              )}
            </div>
          </details>
        )}

        {hasActiveFilter && (
          <div className="sticky bottom-3 z-10 space-y-3 rounded-2xl border border-magazine-border bg-white/95 p-4 shadow-magazine-sm backdrop-blur-sm sm:static sm:border-t sm:border-magazine-border sm:bg-transparent sm:p-0 sm:pt-5 sm:shadow-none sm:backdrop-blur-none">
            <div className="flex items-center justify-between text-xs text-magazine-text">
              <span>
                {filteredCount}件 / 全{totalCount}件
              </span>
              <button
                type="button"
                onClick={onClearFilters}
                className="min-h-[44px] px-2 font-bold text-hokkaido-sky"
              >
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
