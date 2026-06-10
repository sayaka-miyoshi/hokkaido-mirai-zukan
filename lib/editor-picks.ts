import type { Post } from '@/types/post'
import { parsePostDate } from '@/lib/dates'
import { getPopularPosts } from '@/lib/popular-posts'

/** 編集部おすすめに優先表示するタイトル（部分一致・表示順） */
export const EDITOR_PICK_TITLE_HINTS = [
  'フォーミュラ',
  '札幌消防学校',
  'カールレイモン',
] as const

export const EDITOR_PICKS_MAX = 3

/** 編集部おすすめ記事（最大3件） */
export function getEditorPickPosts(posts: Post[]): Post[] {
  const picks: Post[] = []
  const usedIds = new Set<string>()

  for (const hint of EDITOR_PICK_TITLE_HINTS) {
    const match = posts.find((post) => post.title.includes(hint) && !usedIds.has(post.id))
    if (!match) continue
    picks.push(match)
    usedIds.add(match.id)
  }

  for (const post of getPopularPosts(posts)) {
    if (picks.length >= EDITOR_PICKS_MAX) break
    if (usedIds.has(post.id)) continue
    picks.push(post)
    usedIds.add(post.id)
  }

  const sorted = [...posts].sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))
  for (const post of sorted) {
    if (picks.length >= EDITOR_PICKS_MAX) break
    if (usedIds.has(post.id)) continue
    picks.push(post)
    usedIds.add(post.id)
  }

  return picks.slice(0, EDITOR_PICKS_MAX)
}
