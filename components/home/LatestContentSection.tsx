import HomePostGridSection from '@/components/home/HomePostGridSection'
import { HOME_CONTENT_GRIDS } from '@/lib/home-layout'
import type { Post } from '@/types/post'

type LatestContentSectionProps = {
  posts: Post[]
}

/** 人気コンテンツ直下 — 最新コンテンツ */
export default function LatestContentSection({ posts }: LatestContentSectionProps) {
  return (
    <HomePostGridSection
      id="latest"
      ariaLabel="最新コンテンツ"
      title="最新コンテンツ"
      description="新しく追加された北海道のストーリー"
      posts={posts}
      gridClassName={HOME_CONTENT_GRIDS.nine}
    />
  )
}
