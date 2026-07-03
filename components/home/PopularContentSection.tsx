import FeatureArticle from '@/components/home/FeatureArticle'
import FadeInSection from '@/components/home/FadeInSection'
import { HOME_CONTENT_GRIDS } from '@/lib/home-layout'
import type { PopularContentEntry } from '@/lib/popular-posts'

type PopularContentSectionProps = {
  entries: PopularContentEntry[]
  entityLinkMap?: Record<string, { label: string; href: string }>
}

/** ③ 人気コンテンツ（スプレッドシート「人気表示」「人気順」） */
export default function PopularContentSection({ entries, entityLinkMap = {} }: PopularContentSectionProps) {
  if (entries.length === 0) return null

  const source = entries[0]?.source ?? 'spreadsheet'

  return (
    <FadeInSection
      id="popular"
      aria-label="人気コンテンツ"
      className="scroll-mt-4 bg-magazine-cream px-6 py-16"
    >
      <h2 className="font-magazine-rounded text-xl font-bold text-magazine-title">人気コンテンツ</h2>
      <p className="mt-3 text-sm leading-[1.85] text-magazine-muted">
        いま読まれている北海道のストーリー
      </p>
      <div
        className={`mt-10 ${HOME_CONTENT_GRIDS.popular}`}
        data-popular-source={source}
      >
        {entries.map(({ post, rank, source: entrySource, trackingId }, index) => (
          <div
            key={post.id}
            data-popular-rank={rank}
            data-popular-source={entrySource}
            data-analytics-id={trackingId}
          >
            <FeatureArticle
              post={post}
              layout="grid"
              priority={index < 2}
              showMeta
              entityLink={entityLinkMap[post.id]}
            />
          </div>
        ))}
      </div>
    </FadeInSection>
  )
}
