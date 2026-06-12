import PostGrid from '@/components/PostGrid'
import type { RelatedPostsSection as RelatedPostsSectionData } from '@/lib/related-posts'

type RelatedPostsSectionProps = {
  sections: RelatedPostsSectionData[]
}

/** 記事詳細 — 関連記事（PostCard・4:5グリッド） */
export default function RelatedPostsSection({ sections }: RelatedPostsSectionProps) {
  if (sections.length === 0) return null

  return (
    <aside
      aria-label="関連記事"
      className="border-t border-hokkaido-ice bg-hokkaido-ice/40 py-10"
    >
      <div className="mx-auto max-w-5xl px-4">
        {sections.map((section) => (
          <section key={section.title} className="mb-10 last:mb-0">
            <h2 className="mb-4 text-lg font-bold text-gray-900">{section.title}</h2>
            <PostGrid posts={section.posts} />
          </section>
        ))}
      </div>
    </aside>
  )
}
