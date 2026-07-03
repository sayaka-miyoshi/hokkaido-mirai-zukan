import PostGrid from '@/components/PostGrid'
import EntityLinkChips from '@/components/EntityLinkChips'
import type { EntityLinkChip } from '@/lib/entity-cross-links'
import type { RelatedPostsSection as RelatedPostsSectionData } from '@/lib/related-posts'

type RelatedPostsSectionProps = {
  sections: RelatedPostsSectionData[]
  entityLinks?: EntityLinkChip[]
}

/** 記事詳細 — 関連記事（PostCard・4:5グリッド） */
export default function RelatedPostsSection({ sections, entityLinks = [] }: RelatedPostsSectionProps) {
  if (sections.length === 0 && entityLinks.length === 0) return null

  return (
    <aside
      aria-label="関連記事"
      className="border-t border-hokkaido-ice bg-hokkaido-ice/40 py-10"
    >
      <div className="mx-auto max-w-5xl px-4">
        {entityLinks.length > 0 && (
          <EntityLinkChips title="関連ページ" links={entityLinks} className="mb-10" />
        )}
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
