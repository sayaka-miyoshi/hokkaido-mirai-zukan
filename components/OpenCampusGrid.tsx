import FeatureArticle from '@/components/home/FeatureArticle'
import { HOME_CONTENT_GRIDS } from '@/lib/home-layout'
import type { Post } from '@/types/post'

type OpenCampusGridProps = {
  posts: Post[]
}

/** オープンキャンパス特集 — 記事グリッド */
export default function OpenCampusGrid({ posts }: OpenCampusGridProps) {
  if (posts.length === 0) {
    return (
      <p className="rounded-2xl border border-hokkaido-ice bg-white py-12 text-center text-gray-500">
        オープンキャンパスの記事がまだありません。
      </p>
    )
  }

  return (
    <div className={HOME_CONTENT_GRIDS.nine}>
      {posts.map((post, index) => (
        <FeatureArticle key={post.id} post={post} layout="grid" priority={index < 3} showMeta />
      ))}
    </div>
  )
}
