import type { Post } from '@/types/post'
import { filterPostsBySearch, postMatchesKeyword, type PostSearchFilters } from '@/lib/post-search'
import { getSportSlug } from '@/lib/sport-slugs'
import { urls } from '@/lib/urls'

/** カテゴリ絞り込み条件（スプレッドシート列＋キーワードを組み合わせ） */
export type BrowseFilter = {
  keyword?: string
  genre?: string
  area?: string
  careerCategory?: string
  sportCategory?: string
  schoolType?: 'university' | 'high_school' | 'vocational' | 'fire'
}

export type BrowseSelection = {
  keyword?: string
  genre?: string | null
  area?: string | null
  careerCategory?: string | null
}

export type BrowseSubcategoryItem = {
  id: string
  label: string
  filter?: BrowseFilter
  href?: string
}

export type BrowseMainCategory = {
  id: string
  label: string
  emoji: string
  subcategories: BrowseSubcategoryItem[]
}

export type PopularBrowseItem = {
  id: string
  label: string
  keyword?: string
  href?: string
}

function schoolTypeMatches(post: Post, schoolType: BrowseFilter['schoolType']): boolean {
  if (!schoolType) return false
  const text = `${post.schoolName} ${post.title}`
  switch (schoolType) {
    case 'fire':
      return /消防/.test(text)
    case 'university':
      if (post.genre !== '学校') return false
      return /大学/.test(text) && !/高等学校|高校/.test(text)
    case 'high_school':
      if (post.genre !== '学校') return false
      return /高等学校|高校/.test(text)
    case 'vocational':
      if (post.genre !== '学校') return false
      return /専門学校|専門学院/.test(text)
    default:
      return false
  }
}

/** 1投稿がカテゴリ条件に一致するか */
export function postMatchesBrowseFilter(post: Post, filter: BrowseFilter): boolean {
  if (filter.genre && post.genre !== filter.genre) return false
  if (filter.area && post.area !== filter.area) return false
  if (filter.careerCategory && post.careerCategory !== filter.careerCategory) return false
  if (filter.sportCategory && post.sportCategory !== filter.sportCategory) return false
  if (filter.schoolType && !schoolTypeMatches(post, filter.schoolType)) return false
  if (filter.keyword && !postMatchesKeyword(post, filter.keyword)) return false
  return true
}

export function countPostsForBrowseFilter(posts: Post[], filter: BrowseFilter): number {
  return posts.filter((post) => postMatchesBrowseFilter(post, filter)).length
}

export function browseFilterToSelection(filter: BrowseFilter): BrowseSelection {
  return {
    keyword: filter.keyword ?? filter.sportCategory ?? '',
    genre: filter.genre ?? null,
    area: filter.area ?? null,
    careerCategory: filter.careerCategory ?? null,
  }
}

export function browseFiltersEqual(a: BrowseFilter | null, b: BrowseFilter | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.keyword === b.keyword &&
    a.genre === b.genre &&
    a.area === b.area &&
    a.careerCategory === b.careerCategory &&
    a.sportCategory === b.sportCategory &&
    a.schoolType === b.schoolType
  )
}

export function filterPostsByBrowseSelection(
  posts: Post[],
  selection: BrowseSelection,
  extra?: Pick<PostSearchFilters, 'selectedVideoCategory'>,
): Post[] {
  return filterPostsBySearch(posts, {
    keyword: selection.keyword ?? '',
    selectedGenre: selection.genre ?? null,
    selectedArea: selection.area ?? null,
    selectedCareerCategory: selection.careerCategory ?? null,
    selectedVideoCategory: extra?.selectedVideoCategory ?? null,
  })
}

/** 人気検索（iSTEP・Instagram導線と揃える） */
export const POPULAR_BROWSE_SEARCHES: PopularBrowseItem[] = [
  {
    id: 'lacrosse',
    label: 'ラクロス',
    href: urls.sport('ラクロス'),
  },
  {
    id: 'hokudai',
    label: '北海道大学',
    href: urls.school('hokkaido-university'),
  },
  {
    id: 'fire-school',
    label: '消防学校',
    keyword: '札幌消防学校',
  },
  {
    id: 'yosakoi',
    label: 'YOSAKOI',
    href: urls.sport('YOSAKOI'),
  },
  {
    id: 'factory',
    label: '工場見学',
    keyword: '工場',
  },
]

/** 大カテゴリ5つ＋サブカテゴリ定義 */
export const BROWSE_MAIN_CATEGORIES: BrowseMainCategory[] = [
  {
    id: 'school',
    label: '学校',
    emoji: '🏫',
    subcategories: [
      { id: 'university', label: '大学', filter: { genre: '学校', schoolType: 'university' } },
      { id: 'high-school', label: '高校', filter: { genre: '学校', schoolType: 'high_school' } },
      {
        id: 'vocational',
        label: '専門学校',
        filter: { genre: '学校', schoolType: 'vocational' },
      },
      { id: 'fire', label: '消防学校', filter: { schoolType: 'fire' } },
      { id: 'all-schools', label: '学校一覧へ', href: urls.schools() },
    ],
  },
  {
    id: 'clubs',
    label: '部活動',
    emoji: '⚽',
    subcategories: [
      { id: 'baseball', label: '野球', filter: { sportCategory: '野球' }, href: urls.sport(getSportSlug('野球')) },
      { id: 'soccer', label: 'サッカー', filter: { keyword: 'サッカー', genre: '部活' } },
      { id: 'lacrosse', label: 'ラクロス', filter: { sportCategory: 'ラクロス' }, href: urls.sport(getSportSlug('ラクロス')) },
      { id: 'badminton', label: 'バドミントン', filter: { sportCategory: 'バドミントン' }, href: urls.sport(getSportSlug('バドミントン')) },
      { id: 'table-tennis', label: '卓球', filter: { sportCategory: '卓球' }, href: urls.sport(getSportSlug('卓球')) },
      { id: 'american-football', label: 'アメフト', filter: { sportCategory: 'アメフト' }, href: urls.sport(getSportSlug('アメフト')) },
      {
        id: 'ice-hockey',
        label: 'アイスホッケー',
        filter: { sportCategory: 'アイスホッケー' },
        href: urls.sport(getSportSlug('アイスホッケー')),
      },
      {
        id: 'basketball',
        label: 'バスケットボール',
        filter: { sportCategory: 'バスケットボール' },
        href: urls.sport(getSportSlug('バスケットボール')),
      },
      { id: 'brass-band', label: '吹奏楽', filter: { sportCategory: '吹奏楽' }, href: urls.sport(getSportSlug('吹奏楽')) },
      { id: 'yosakoi', label: 'YOSAKOI', filter: { sportCategory: 'YOSAKOI' }, href: urls.sport(getSportSlug('YOSAKOI')) },
      { id: 'all-clubs', label: '部活一覧へ', href: urls.clubs() },
      { id: 'all-sports', label: '競技一覧へ', href: urls.sports() },
    ],
  },
  {
    id: 'companies',
    label: '企業',
    emoji: '🏭',
    subcategories: [
      { id: 'factory', label: '工場', filter: { keyword: '工場' } },
      { id: 'hotel', label: 'ホテル', filter: { keyword: 'ホテル' } },
      { id: 'care', label: '介護・福祉', filter: { careerCategory: '医療・福祉' } },
      { id: 'it', label: 'IT', filter: { careerCategory: 'IT・情報' } },
      { id: 'food', label: '食品', filter: { careerCategory: '食品・製造' } },
      { id: 'all-companies', label: '企業一覧へ', href: urls.companies() },
    ],
  },
  {
    id: 'sapporo',
    label: '札幌市',
    emoji: '🏙️',
    subcategories: [
      { id: 'sapporo-area', label: '札幌エリア', filter: { area: '札幌' } },
      {
        id: 'municipal',
        label: '行政・広報',
        filter: { genre: '行政・自治体', keyword: '札幌' },
      },
      { id: 'snow-festival', label: '雪まつり', filter: { keyword: '雪まつり' } },
      { id: 'public-servant', label: '公務員', filter: { careerCategory: '公務員' } },
    ],
  },
  {
    id: 'tourism',
    label: '観光',
    emoji: '🗻',
    subcategories: [
      { id: 'tourism-all', label: '観光記事', filter: { keyword: '観光' } },
      { id: 'snow-festival-t', label: '雪まつり', filter: { keyword: '雪まつり' } },
      { id: 'culture', label: '文化・イベント', filter: { keyword: 'イベント' } },
      { id: 'regional', label: '地域ガイド', filter: { keyword: '町' } },
    ],
  },
]

export type ResolvedBrowseSubcategory = BrowseSubcategoryItem & {
  postCount: number | null
}

export type ResolvedBrowseCategory = Omit<BrowseMainCategory, 'subcategories'> & {
  subcategories: ResolvedBrowseSubcategory[]
  totalPostCount: number
}

/** 公開記事数に基づきサブカテゴリを解決（0件は非表示・リンク系は常に表示） */
export function resolveBrowseCategories(posts: Post[]): ResolvedBrowseCategory[] {
  return BROWSE_MAIN_CATEGORIES.map((category) => {
    const subcategories = category.subcategories
      .map((sub) => {
        if (sub.href) {
          return { ...sub, postCount: null }
        }
        const count = countPostsForBrowseFilter(posts, sub.filter ?? {})
        return { ...sub, postCount: count }
      })
      .filter((sub) => sub.href || (sub.postCount ?? 0) > 0)

    const filterSubs = subcategories.filter((sub) => sub.filter)
    const totalPostCount = filterSubs.reduce((sum, sub) => {
      return Math.max(sum, sub.postCount ?? 0)
    }, 0)

    return { ...category, subcategories, totalPostCount }
  })
}
