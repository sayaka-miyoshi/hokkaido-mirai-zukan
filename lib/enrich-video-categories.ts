import type { Post } from '@/types/post'
import {
  loadVideoCategoryMaps,
  normalizeVideoCategoryId,
  resolveVideoCategoryLabel,
} from '@/lib/video-categories'

/** 動画カテゴリID・表示名をマスターから解決 */
export async function enrichPostsVideoCategories(posts: Post[]): Promise<Post[]> {
  const maps = await loadVideoCategoryMaps()

  return posts.map((post) => {
    const raw = post.videoCategory
    return {
      ...post,
      videoCategory: normalizeVideoCategoryId(raw, maps),
      videoCategoryLabel: resolveVideoCategoryLabel(raw, maps),
    }
  })
}
