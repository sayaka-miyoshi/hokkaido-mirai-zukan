'use client'

import { type ReactNode } from 'react'
import { CATEGORY_FILTERS, POPULAR_AREAS } from '@/lib/site'

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
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
        ${active
          ? 'bg-hokkaido-deep text-white border-hokkaido-deep'
          : 'bg-transparent text-gray-500 border-gray-200 hover:border-hokkaido-sky hover:text-hokkaido-deep'
        }`}
    >
      {children}
    </button>
  )
}

/** 編集部おすすめの後に置く、控えめな検索・絞り込み */
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
}: HomeBrowseSectionProps) {
  return (
    <section
      id="browse"
      aria-label="記事を探す"
      className="scroll-mt-4 px-6 py-16 border-t border-hokkaido-ice/60"
    >
      <details className="group">
        <summary className="cursor-pointer list-none text-sm text-gray-400 hover:text-hokkaido-deep transition-colors">
          記事を探す
          {hasActiveFilter && (
            <span className="ml-2 text-hokkaido-sky">
              （{filteredCount}件）
            </span>
          )}
        </summary>

        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="home-search" className="sr-only">
              キーワード検索
            </label>
            <input
              id="home-search"
              type="search"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="学校名・部活名・企業名..."
              className="w-full border-0 border-b border-hokkaido-ice bg-transparent px-0 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-hokkaido-sky"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map(({ label, genre }) => (
              <FilterChip
                key={genre}
                active={selectedGenre === genre}
                onClick={() => onGenreChange(selectedGenre === genre ? null : genre)}
              >
                {label}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {POPULAR_AREAS.map((area) => (
              <FilterChip
                key={area}
                active={selectedArea === area}
                onClick={() => onAreaChange(selectedArea === area ? null : area)}
              >
                {area}
              </FilterChip>
            ))}
          </div>

          {(videoCategories.length > 0 || careerCategories.length > 0) && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-400 hover:text-hokkaido-deep list-none">
                さらに絞り込む
              </summary>
              <div className="mt-4 space-y-4">
                {videoCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {videoCategories.map(({ id, label }) => (
                      <FilterChip
                        key={id}
                        active={selectedVideoCategory === id}
                        onClick={() =>
                          onVideoCategoryChange(selectedVideoCategory === id ? null : id)
                        }
                      >
                        {label}
                      </FilterChip>
                    ))}
                  </div>
                )}
                {careerCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {careerCategories.map((category) => (
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
                )}
              </div>
            </details>
          )}

          {hasActiveFilter && (
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                全{totalCount}件中 {filteredCount}件
              </span>
              <button
                type="button"
                onClick={onClearFilters}
                className="text-hokkaido-sky hover:underline"
              >
                条件をクリア
              </button>
            </div>
          )}
        </div>
      </details>
    </section>
  )
}
