import type { Post } from '@/types/post'

/** CSVの「公開」列を boolean に変換（未入力は公開） */
export function parsePublishStatus(value: string): boolean {
  const normalized = value.trim()
  if (!normalized) return true
  if (normalized === '非公開') return false
  if (normalized === '公開') return true
  return true
}

/** サイト表示対象の投稿のみ（非公開を除外） */
export function filterPublishedPosts(posts: Post[]): Post[] {
  return posts.filter((post) => post.isPublished)
}

/** CSV書き出し用の「公開」列の値 */
export function formatPublishStatus(isPublished: boolean): string {
  return isPublished ? '公開' : '非公開'
}
