import type { Post } from '@/types/post'
import EditorialSectionHeader from '@/components/home/EditorialSectionHeader'
import FeatureArticle from '@/components/home/FeatureArticle'
import type { FutureMagazineSection } from '@/lib/magazine-sections'

type HomeMagazineSectionsProps = {
  sections: FutureMagazineSection[]
  posts: Post[]
}

function findPost(posts: Post[], id: string): Post | undefined {
  return posts.find((post) => post.id === id)
}

/** 将来の特集枠（学校特集・吹奏楽特集など） */
export default function HomeMagazineSections({ sections, posts }: HomeMagazineSectionsProps) {
  if (sections.length === 0) return null

  return (
    <>
      {sections.map((section) => {
        const sectionPosts = section.postIds
          .map((id) => findPost(posts, id))
          .filter((post): post is Post => post != null)

        if (sectionPosts.length === 0) return null

        return (
          <section
            key={section.id}
            aria-label={section.label}
            className="px-6 py-20 border-t border-hokkaido-ice/40"
          >
            <EditorialSectionHeader
              eyebrow="SPECIAL"
              title={section.label}
              description={section.deck}
            />
            <div className="mt-12">
              {sectionPosts.map((post, index) => (
                <FeatureArticle
                  key={`${section.id}-${post.id}`}
                  post={post}
                  layout="feature"
                  editorialCategory={section.category}
                  featureIndex={index + 1}
                  priority={index === 0}
                />
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}
