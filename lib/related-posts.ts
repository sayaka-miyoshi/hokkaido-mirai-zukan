import type { Post } from '@/types/post'
import { parsePostDate } from '@/lib/dates'
import { filterPublishedPosts } from '@/lib/publish-status'

/** 関連記事セクションあたりの最大件数 */
export const RELATED_POSTS_MAX = 6

export type RelatedPostsSection = {
  title: string
  posts: Post[]
}

function sortByNewest(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const diff = parsePostDate(b.date) - parsePostDate(a.date)
    if (diff !== 0) return diff
    return a.id.localeCompare(b.id, 'ja')
  })
}

function pickPosts(
  candidates: Post[],
  usedIds: Set<string>,
  max: number,
): Post[] {
  const picked = sortByNewest(candidates.filter((post) => !usedIds.has(post.id))).slice(0, max)
  for (const post of picked) usedIds.add(post.id)
  return picked
}

/**
 * 記事詳細の関連記事セクション
 * ① 同じ部活 → ② 同じ学校 → ③ 同じ進路カテゴリ（各最大6件）
 * いずれも0件のときのみ最新記事6件（見出し「関連記事」）
 */
export function getRelatedPostSections(current: Post, allPosts: Post[]): RelatedPostsSection[] {
  const pool = filterPublishedPosts(allPosts).filter((post) => post.id !== current.id)
  const usedIds = new Set<string>()
  const sections: RelatedPostsSection[] = []

  const clubName = current.clubName.trim()
  if (clubName) {
    const posts = pickPosts(
      pool.filter((post) => post.clubName.trim() === clubName),
      usedIds,
      RELATED_POSTS_MAX,
    )
    if (posts.length > 0) {
      sections.push({ title: '同じ部活の記事', posts })
    }
  }

  const schoolName = current.schoolName.trim()
  if (schoolName) {
    const posts = pickPosts(
      pool.filter((post) => post.schoolName.trim() === schoolName),
      usedIds,
      RELATED_POSTS_MAX,
    )
    if (posts.length > 0) {
      sections.push({ title: '同じ学校の記事', posts })
    }
  }

  const careerCategory = current.careerCategory.trim()
  if (careerCategory) {
    const posts = pickPosts(
      pool.filter((post) => post.careerCategory.trim() === careerCategory),
      usedIds,
      RELATED_POSTS_MAX,
    )
    if (posts.length > 0) {
      sections.push({ title: '同じ進路の記事', posts })
    }
  }

  if (sections.length === 0) {
    const posts = pickPosts(pool, usedIds, RELATED_POSTS_MAX)
    if (posts.length > 0) {
      sections.push({ title: '関連記事', posts })
    }
  }

  return sections
}
