import FeatureArticle from '@/components/home/FeatureArticle'
import FadeInSection from '@/components/home/FadeInSection'
import type { Post } from '@/types/post'

type HomePostGridSectionProps = {
  id: string
  ariaLabel: string
  title: string
  description: string
  posts: Post[]
  gridClassName: string
  sectionClassName?: string
  priorityCount?: number
}

/** TOP — 記事グリッド共通（最新・企業など） */
export default function HomePostGridSection({
  id,
  ariaLabel,
  title,
  description,
  posts,
  gridClassName,
  sectionClassName = 'scroll-mt-4 border-t border-magazine-border bg-white px-6 py-16',
  priorityCount = 0,
}: HomePostGridSectionProps) {
  if (posts.length === 0) return null

  return (
    <FadeInSection id={id} aria-label={ariaLabel} className={sectionClassName}>
      <h2 className="font-magazine-rounded text-xl font-bold text-magazine-title">{title}</h2>
      <p className="mt-3 text-sm leading-[1.85] text-magazine-muted">{description}</p>
      <div className={`mt-10 ${gridClassName}`}>
        {posts.map((post, index) => (
          <FeatureArticle
            key={post.id}
            post={post}
            layout="grid"
            priority={index < priorityCount}
            showMeta
          />
        ))}
      </div>
    </FadeInSection>
  )
}
