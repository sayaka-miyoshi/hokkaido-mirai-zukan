import HomePostGridSection from '@/components/home/HomePostGridSection'
import { HOME_CONTENT_GRIDS } from '@/lib/home-layout'
import type { Post } from '@/types/post'

type HomeSearchResultsSectionProps = {
  posts: Post[]
  title: string
  description: string
  onClearFilters: () => void
}

/** 検索・絞り込み結果（#search-results） */
export default function HomeSearchResultsSection({
  posts,
  title,
  description,
  onClearFilters,
}: HomeSearchResultsSectionProps) {
  if (posts.length === 0) {
    return (
      <section
        id="search-results"
        aria-label={title}
        className="scroll-mt-4 border-t border-magazine-border bg-white px-6 py-16"
      >
        <h2 className="font-magazine-rounded text-xl font-bold text-magazine-title">{title}</h2>
        <div className="mt-10 py-12 text-center">
          <p className="font-medium text-magazine-text">該当する記事が見つかりませんでした</p>
          <p className="mt-2 text-sm text-magazine-muted">キーワードや条件を変えてみてください</p>
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 text-sm font-bold text-hokkaido-sky hover:underline"
          >
            すべて表示する
          </button>
        </div>
      </section>
    )
  }

  return (
    <HomePostGridSection
      id="search-results"
      ariaLabel={title}
      title={title}
      description={description}
      posts={posts}
      gridClassName={HOME_CONTENT_GRIDS.nine}
      priorityCount={3}
      animate={false}
    />
  )
}
