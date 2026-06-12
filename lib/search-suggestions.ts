import type { Post } from '@/types/post'

/** サジェスト候補の種別 */
export type SearchSuggestionKind = 'school' | 'club' | 'company' | 'sport'

export type SearchSuggestion = {
  label: string
  kind: SearchSuggestionKind
  postCount: number
}

export const SEARCH_SUGGESTION_MAX = 10

const SUGGESTION_SOURCES: { field: keyof Pick<Post, 'schoolName' | 'clubName' | 'companyName' | 'sportCategory'>; kind: SearchSuggestionKind }[] = [
  { field: 'schoolName', kind: 'school' },
  { field: 'clubName', kind: 'club' },
  { field: 'companyName', kind: 'company' },
  { field: 'sportCategory', kind: 'sport' },
]

const KIND_ORDER: SearchSuggestionKind[] = ['school', 'club', 'company', 'sport']

function kindRank(kind: SearchSuggestionKind): number {
  return KIND_ORDER.indexOf(kind)
}

/** 公開記事からサジェスト用インデックスを生成（重複排除・記事数集計） */
export function buildSearchSuggestionIndex(posts: Post[]): SearchSuggestion[] {
  const counts = new Map<string, { kind: SearchSuggestionKind; postCount: number }>()

  for (const post of posts) {
    if (!post.isPublished) continue

    for (const { field, kind } of SUGGESTION_SOURCES) {
      const label = String(post[field] ?? '').trim()
      if (!label) continue

      const existing = counts.get(label)
      if (!existing) {
        counts.set(label, { kind, postCount: 1 })
        continue
      }

      existing.postCount += 1
      if (kindRank(kind) < kindRank(existing.kind)) {
        existing.kind = kind
      }
    }
  }

  return [...counts.entries()]
    .map(([label, { kind, postCount }]) => ({ label, kind, postCount }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ja'))
}

function matchRank(label: string, query: string, kind: SearchSuggestionKind): number | null {
  if (label.startsWith(query)) return 0
  if (label.includes(query) && (kind === 'club' || kind === 'sport')) return 1
  return null
}

/** 入力文字列に一致する候補（最大10件・前方一致優先・記事数降順） */
export function filterSearchSuggestions(
  index: SearchSuggestion[],
  query: string,
  max: number = SEARCH_SUGGESTION_MAX,
): SearchSuggestion[] {
  const normalized = query.trim()
  if (!normalized) return []

  return index
    .map((item) => ({ item, rank: matchRank(item.label, normalized, item.kind) }))
    .filter((entry): entry is { item: SearchSuggestion; rank: number } => entry.rank != null)
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank
      if (b.item.postCount !== a.item.postCount) return b.item.postCount - a.item.postCount
      return a.item.label.localeCompare(b.item.label, 'ja')
    })
    .slice(0, max)
    .map(({ item }) => item)
}
