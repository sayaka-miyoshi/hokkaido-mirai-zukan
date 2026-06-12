import CompanyGridCard from '@/components/home/CompanyGridCard'
import FadeInSection from '@/components/home/FadeInSection'
import { COMPANY_SECTION, HOME_CONTENT_GRIDS } from '@/lib/home-layout'
import type { Post } from '@/types/post'

type CompanyContentSectionProps = {
  posts: Post[]
}

/** スプレッドシート「企業おすすめ」で管理する企業グリッド */
export default function CompanyContentSection({ posts }: CompanyContentSectionProps) {
  if (posts.length === 0) return null

  return (
    <FadeInSection
      id="companies"
      aria-label={COMPANY_SECTION.title}
      className="scroll-mt-4 border-t border-magazine-border bg-magazine-cream px-6 py-16"
    >
      <h2 className="font-magazine-rounded text-xl font-bold text-magazine-title">
        {COMPANY_SECTION.title}
      </h2>
      <p className="mt-3 text-sm leading-[1.85] text-magazine-muted">{COMPANY_SECTION.lead}</p>
      <p className="mt-3 whitespace-pre-line text-sm leading-[1.85] text-magazine-text">
        {COMPANY_SECTION.description}
      </p>
      <div className={`mt-10 ${HOME_CONTENT_GRIDS.nine}`}>
        {posts.map((post, index) => (
          <CompanyGridCard key={post.id} post={post} priority={index < 3} />
        ))}
      </div>
    </FadeInSection>
  )
}
