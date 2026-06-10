import type { Post } from '@/types/post'
import { parsePostDate } from '@/lib/dates'
import { getPopularPosts } from '@/lib/popular-posts'

/** トップ掲載のジャンル（学校・部活・企業・行政のバランス用） */
export type FeaturedCategory = '学校' | '部活' | '企業' | '行政'

export type FeaturedPostSpec = {
  title: string
  category: FeaturedCategory
  postId: string
}

/** 採用済み：ヒーロー（/post/16） */
export const ADOPTED_HERO: FeaturedPostSpec = {
  title: '北海道大学フォーミュラ部',
  category: '部活',
  postId: '16',
}

/** 採用済み：編集部おすすめ（表示順） */
export const ADOPTED_EDITOR_PICKS: readonly FeaturedPostSpec[] = [
  { title: '北海道大学フォーミュラ部', category: '部活', postId: '16' },
  { title: '札幌消防学校', category: '学校', postId: '1' },
  { title: '函館カール・レイモン', category: '企業', postId: '27' },
] as const

/**
 * 4本目候補（吹奏楽など）。追加時はここを設定し EDITOR_PICKS_DISPLAY_COUNT を 4 に
 * 例: { title: '札幌国際情報高校吹奏楽部', category: '部活', postId: '39' }
 */
export const OPTIONAL_FOURTH_EDITOR_PICK: FeaturedPostSpec | null = null

/** 編集部おすすめの表示枠数（4本目追加時は 4 に変更） */
export const EDITOR_PICKS_DISPLAY_COUNT = 3

/**
 * 将来の差し替え候補（ジャンルバランス用メモ）
 * OPTIONAL_FOURTH_EDITOR_PICK または ADOPTED_EDITOR_PICKS への昇格時に参照
 */
export const FUTURE_EDITOR_PICK_CANDIDATES: readonly FeaturedPostSpec[] = [
  { title: '札幌国際情報高校吹奏楽部', category: '部活', postId: '39' },
  { title: '北海学園吹奏楽団に潜入！', category: '部活', postId: '132' },
  { title: '札幌消防学校 卒業式1か月前に密着', category: '学校', postId: '82' },
  { title: '日本最北の煉瓦工場', category: '企業', postId: '13' },
  { title: '798万再生！図書館のお仕事', category: '行政', postId: '184' },
] as const

export function getActiveEditorPickSpecs(): FeaturedPostSpec[] {
  const specs = [...ADOPTED_EDITOR_PICKS]
  if (OPTIONAL_FOURTH_EDITOR_PICK) {
    specs.push(OPTIONAL_FOURTH_EDITOR_PICK)
  }
  return specs.slice(0, EDITOR_PICKS_DISPLAY_COUNT)
}

function findPostBySpec(posts: Post[], spec: FeaturedPostSpec): Post | undefined {
  const byId = posts.find((post) => post.id === spec.postId)
  if (byId) return byId
  return posts.find((post) => post.title === spec.title)
}

/** 編集部おすすめ記事 */
export function getEditorPickPosts(posts: Post[]): Post[] {
  const specs = getActiveEditorPickSpecs()
  const picks: Post[] = []
  const usedIds = new Set<string>()

  for (const spec of specs) {
    const match = findPostBySpec(posts, spec)
    if (!match || usedIds.has(match.id)) continue
    picks.push(match)
    usedIds.add(match.id)
  }

  if (picks.length >= specs.length) {
    return picks.slice(0, specs.length)
  }

  for (const post of getPopularPosts(posts)) {
    if (picks.length >= specs.length) break
    if (usedIds.has(post.id)) continue
    picks.push(post)
    usedIds.add(post.id)
  }

  const sorted = [...posts].sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))
  for (const post of sorted) {
    if (picks.length >= specs.length) break
    if (usedIds.has(post.id)) continue
    picks.push(post)
    usedIds.add(post.id)
  }

  return picks.slice(0, specs.length)
}
