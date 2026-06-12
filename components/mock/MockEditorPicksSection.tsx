import EditorialSectionHeader from '@/components/home/EditorialSectionHeader'
import FeatureArticle from '@/components/home/FeatureArticle'
import type { Post } from '@/types/post'
import { getActiveEditorPickSpecs } from '@/lib/editor-picks'
import { FEATURED_SECTION } from '@/lib/home-layout'

type MockEditorPicksSectionProps = {
  posts: Post[]
}

/** いま注目のストーリー（レイアウト確認用） */
export default function MockEditorPicksSection({ posts }: MockEditorPicksSectionProps) {
  if (posts.length === 0) return null

  const getEditorialCategory = (postId: string) =>
    getActiveEditorPickSpecs().find((spec) => spec.postId === postId)?.category

  return (
    <section
      id="featured-stories"
      aria-label="いま注目のストーリー"
      className="scroll-mt-4 border-t border-[#E8EEF2] bg-white px-6 pb-4 pt-16"
    >
      <EditorialSectionHeader
        eyebrow={FEATURED_SECTION.eyebrow}
        title={FEATURED_SECTION.title}
        description={FEATURED_SECTION.description}
      />
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8">
        {posts.map((post, index) => (
          <FeatureArticle
            key={`mock-editor-${post.id}`}
            post={post}
            layout="grid"
            editorialCategory={getEditorialCategory(post.id)}
            priority={index < 2}
            showMeta
          />
        ))}
      </div>
    </section>
  )
}
