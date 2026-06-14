import CompanyGridCard from '@/components/home/CompanyGridCard'
import { HOME_CONTENT_GRIDS } from '@/lib/home-layout'
import type { Post } from '@/types/post'

type CompanyRecommendedGridProps = {
  posts: Post[]
}

/** TOP「北海道の企業を知ろう」と同じ企業記事グリッド */
export default function CompanyRecommendedGrid({ posts }: CompanyRecommendedGridProps) {
  if (posts.length === 0) {
    return (
      <p className="rounded-2xl border border-hokkaido-ice bg-white py-12 text-center text-gray-500">
        企業記事がまだありません。
      </p>
    )
  }

  return (
    <div className={HOME_CONTENT_GRIDS.nine}>
      {posts.map((post, index) => (
        <CompanyGridCard key={post.id} post={post} priority={index < 3} />
      ))}
    </div>
  )
}
