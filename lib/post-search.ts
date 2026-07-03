import { POST_SEARCH_FIELDS, type Post } from '@/types/post'

/** 検索語・フィールド値の表記ゆれを統一 */
const SEARCH_TEXT_ALIASES: [string, string][] = [['バトミントン', 'バドミントン']]

export const SPORT_QUICK_CHIP_MAX = 12

export type PostSearchFilters = {
  keyword: string
  selectedGenre: string | null
  selectedVideoCategory: string | null
  selectedCareerCategory: string | null
  selectedArea: string | null
}

export type SportQuickChip = {
  name: string
  postCount: number
}

function applySearchAliases(text: string): string {
  let result = text
  for (const [from, to] of SEARCH_TEXT_ALIASES) {
    const normalizedFrom = from.normalize('NFKC').toLowerCase()
    const normalizedTo = to.normalize('NFKC').toLowerCase()
    if (result.includes(normalizedFrom)) {
      result = result.replaceAll(normalizedFrom, normalizedTo)
    }
  }
  return result
}

/** 検索キーワードの正規化（trim / NFKC / 小文字化 / 表記ゆれ） */
export function normalizeSearchQuery(raw: string): string {
  return applySearchAliases(raw.trim().normalize('NFKC').toLowerCase())
}

function normalizeSearchField(value: unknown): string {
  return applySearchAliases(String(value ?? '').trim().normalize('NFKC').toLowerCase())
}

/** 1投稿がキーワードに一致するか（部分一致・大文字小文字無視） */
export function postMatchesKeyword(post: Post, keyword: string): boolean {
  const normalizedKeyword = normalizeSearchQuery(keyword)
  if (!normalizedKeyword) return true

  return POST_SEARCH_FIELDS.some((field) =>
    normalizeSearchField(post[field]).includes(normalizedKeyword),
  )
}

/** キーワード＋チップ条件で投稿を絞り込み */
export function filterPostsBySearch(posts: Post[], filters: PostSearchFilters): Post[] {
  const {
    keyword,
    selectedGenre,
    selectedVideoCategory,
    selectedCareerCategory,
    selectedArea,
  } = filters

  return posts.filter((post) => {
    if (!postMatchesKeyword(post, keyword)) return false
    if (selectedGenre && post.genre !== selectedGenre) return false
    if (selectedVideoCategory && post.videoCategory !== selectedVideoCategory) return false
    if (selectedCareerCategory && post.careerCategory !== selectedCareerCategory) return false
    if (selectedArea && post.area !== selectedArea) return false
    return true
  })
}

/** 公開記事の競技カテゴリを記事数降順で取得（クイックチップ用） */
export function getPopularSportCategories(
  posts: Post[],
  limit: number = SPORT_QUICK_CHIP_MAX,
): SportQuickChip[] {
  const counts = new Map<string, number>()

  for (const post of posts) {
    if (!post.isPublished) continue
    const name = String(post.sportCategory ?? '').trim()
    if (!name) continue
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([name, postCount]) => ({ name, postCount }))
    .sort((a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name, 'ja'))
    .slice(0, limit)
}
