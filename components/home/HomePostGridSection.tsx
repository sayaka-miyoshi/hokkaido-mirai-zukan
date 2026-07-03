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
  /** false = 絞り込み結果など、即時表示が必要なセクション */
  animate?: boolean
  /** PostClickTracker 用 data-post-index 付与 */
  postIndexAttribute?: boolean
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
  animate = true,
  postIndexAttribute = false,
}: HomePostGridSectionProps) {
  if (posts.length === 0) return null

  const content = (
    <>
      <h2 className="font-magazine-rounded text-xl font-bold text-magazine-title">{title}</h2>
      <p className="mt-3 text-sm leading-[1.85] text-magazine-muted">{description}</p>
      <div className={`mt-10 ${gridClassName}`}>
        {posts.map((post, index) => (
          <div key={post.id} {...(postIndexAttribute ? { 'data-post-index': index + 1 } : {})}>
            <FeatureArticle
              post={post}
              layout="grid"
              priority={index < priorityCount}
              showMeta
            />
          </div>
        ))}
      </div>
    </>
  )

  if (!animate) {
    return (
      <section id={id} aria-label={ariaLabel} className={sectionClassName}>
        {content}
      </section>
    )
  }

  return (
    <FadeInSection id={id} aria-label={ariaLabel} className={sectionClassName}>
      {content}
    </FadeInSection>
  )
}
