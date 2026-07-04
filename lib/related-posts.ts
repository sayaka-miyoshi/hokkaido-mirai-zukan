import type { Post } from '@/types/post'
import { parsePostDate } from '@/lib/dates'
import { filterPublishedPosts } from '@/lib/publish-status'

/** 関連記事セクションあたりの最大件数 */
export const RELATED_POSTS_MAX = 6

export type RelatedPostsSection = {
  title: string
  posts: Post[]
}

export type RelatedPostsOptions = {
  /** postId → 人気スコア（高いほど優先） */
  scoreMap?: Map<string, number>
  /** 人気関連セクション用の全体ランキング上位 */
  popularPool?: Post[]
}

function sortByScoreThenNewest(posts: Post[], scoreMap?: Map<string, number>): Post[] {
  return [...posts].sort((a, b) => {
    const scoreDiff = (scoreMap?.get(b.id) ?? 0) - (scoreMap?.get(a.id) ?? 0)
    if (scoreDiff !== 0) return scoreDiff
    const diff = parsePostDate(b.date) - parsePostDate(a.date)
    if (diff !== 0) return diff
    return a.id.localeCompare(b.id, 'ja')
  })
}

function pickPosts(
  candidates: Post[],
  usedIds: Set<string>,
  max: number,
  scoreMap?: Map<string, number>,
): Post[] {
  const picked = sortByScoreThenNewest(
    candidates.filter((post) => !usedIds.has(post.id)),
    scoreMap,
  ).slice(0, max)
  for (const post of picked) usedIds.add(post.id)
  return picked
}

/**
 * 記事詳細の関連記事セクション
 * ① 同じ競技 → ② 同じ学校 → ③ 同じ部活 → ④ 関連企業
 * → ⑤ 人気の関連記事（ランキング）→ ⑥ フォールバック
 * 各セクション内は人気スコア優先、同点は新着
 */
export function getRelatedPostSections(
  current: Post,
  allPosts: Post[],
  options: RelatedPostsOptions = {},
): RelatedPostsSection[] {
  const { scoreMap, popularPool } = options
  const pool = filterPublishedPosts(allPosts).filter((post) => post.id !== current.id)
  const usedIds = new Set<string>()
  const sections: RelatedPostsSection[] = []

  const sportCategory = current.sportCategory.trim()
  if (sportCategory) {
    const posts = pickPosts(
      pool.filter(
        (post) =>
          post.sportCategory.trim() === sportCategory &&
          (post.schoolName.trim() !== current.schoolName.trim() ||
            post.clubName.trim() !== current.clubName.trim()),
      ),
      usedIds,
      RELATED_POSTS_MAX,
      scoreMap,
    )
    if (posts.length > 0) {
      sections.push({ title: `同じ競技の記事（${sportCategory}）`, posts })
    }
  }

  const schoolName = current.schoolName.trim()
  if (schoolName) {
    const posts = pickPosts(
      pool.filter((post) => post.schoolName.trim() === schoolName),
      usedIds,
      RELATED_POSTS_MAX,
      scoreMap,
    )
    if (posts.length > 0) {
      sections.push({ title: '関連する学校の記事', posts })
    }
  }

  const clubName = current.clubName.trim()
  if (clubName) {
    const posts = pickPosts(
      pool.filter((post) => post.clubName.trim() === clubName),
      usedIds,
      RELATED_POSTS_MAX,
      scoreMap,
    )
    if (posts.length > 0) {
      sections.push({ title: '同じ部活の記事', posts })
    }
  }

  const careerCategory = current.careerCategory.trim()
  if (careerCategory && (current.genre === '企業訪問' || current.companyName.trim())) {
    const posts = pickPosts(
      pool.filter(
        (post) =>
          post.careerCategory.trim() === careerCategory &&
          post.companyName.trim() &&
          post.companyName.trim() !== current.companyName.trim(),
      ),
      usedIds,
      RELATED_POSTS_MAX,
      scoreMap,
    )
    if (posts.length > 0) {
      sections.push({ title: '関連する企業', posts })
    }
  } else if (careerCategory && sections.length < 3) {
    const posts = pickPosts(
      pool.filter((post) => post.careerCategory.trim() === careerCategory),
      usedIds,
      RELATED_POSTS_MAX,
      scoreMap,
    )
    if (posts.length > 0) {
      sections.push({ title: '同じ進路の記事', posts })
    }
  }

  // 人気ランキングから回遊（同じ競技・学校・エリアを優先）
  if (popularPool && popularPool.length > 0) {
    const relatedPopular = popularPool.filter((post) => {
      if (post.id === current.id || usedIds.has(post.id)) return false
      return (
        (sportCategory && post.sportCategory.trim() === sportCategory) ||
        (schoolName && post.schoolName.trim() === schoolName) ||
        (current.area.trim() && post.area.trim() === current.area.trim()) ||
        (careerCategory && post.careerCategory.trim() === careerCategory)
      )
    })
    const posts = pickPosts(relatedPopular, usedIds, RELATED_POSTS_MAX, scoreMap)
    if (posts.length > 0) {
      sections.push({ title: '人気の関連記事', posts })
    }
  }

  if (sections.length === 0) {
    const posts = pickPosts(pool, usedIds, RELATED_POSTS_MAX, scoreMap)
    if (posts.length > 0) {
      sections.push({ title: '関連記事', posts })
    }
  }

  return sections
}
