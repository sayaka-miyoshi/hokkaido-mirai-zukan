import { cache } from 'react'
import type { Post } from '@/types/post'
import { resolvePostImageUrl } from '@/lib/og-image'

const resolveCached = cache(async (imageUrl: string, instagramUrl: string, genre: string) =>
  resolvePostImageUrl(imageUrl, instagramUrl, genre),
)

const CONCURRENCY = 5

async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  limit: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let index = 0

  async function worker() {
    while (index < items.length) {
      const i = index++
      results[i] = await fn(items[i])
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}

/** 投稿一覧の画像URLを解決（空欄時はInstagram OG → デフォルト） */
export async function enrichPostsImages(posts: Post[]): Promise<Post[]> {
  return mapWithConcurrency(
    posts,
    async (post) => ({
      ...post,
      imageUrl: await resolveCached(post.imageUrl, post.instagramUrl, post.genre),
    }),
    CONCURRENCY,
  )
}
