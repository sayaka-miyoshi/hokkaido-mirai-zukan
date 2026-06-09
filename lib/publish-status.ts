import type { Post } from '@/types/post'

/** CSVの「公開」列を boolean に変換（1 / 公開のみ表示、0 / 非公開は非表示） */
export function parsePublishStatus(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return false
  if (['0', '非公開', 'false', 'no', 'off', '×', '✗'].includes(normalized)) {
    return false
  }
  if (['1', '公開', 'true', 'yes', 'on', '○', '◯', '✓'].includes(normalized)) {
    return true
  }
  return false
}

/** サイト表示対象の投稿のみ（非公開を除外） */
export function filterPublishedPosts(posts: Post[]): Post[] {
  return posts.filter((post) => post.isPublished)
}

/** CSV書き出し用の「公開」列の値 */
export function formatPublishStatus(isPublished: boolean): string {
  return isPublished ? '公開' : '非公開'
}
