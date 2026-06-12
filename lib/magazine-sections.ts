import type { FeaturedCategory } from '@/lib/editor-picks'

/** 将来追加する雑誌特集枠（enabled: true でトップに表示） */
export type FutureMagazineSectionKind =
  | '学校特集'
  | '部活特集'
  | '企業特集'
  | '行政特集'
  | 'スポーツ特集'
  | '吹奏楽特集'

export type FutureMagazineSection = {
  id: string
  label: FutureMagazineSectionKind
  /** 補助見出し（エディトリアル用） */
  deck: string
  category: FeaturedCategory
  enabled: boolean
  /** 掲載 post ID（将来設定） */
  postIds: readonly string[]
}

/**
 * トップページの将来特集枠
 * 記事数増加時: enabled を true にし postIds を設定 → HomeMagazineSections で表示
 */
export const FUTURE_MAGAZINE_SECTIONS: readonly FutureMagazineSection[] = [
  {
    id: 'school-feature',
    label: '学校特集',
    deck: '学びの場から、未来への一歩。',
    category: '学校',
    enabled: false,
    postIds: [],
  },
  {
    id: 'club-feature',
    label: '部活特集',
    deck: '部活動の熱量と、仲間の姿。',
    category: '部活',
    enabled: false,
    postIds: [],
  },
  {
    id: 'company-feature',
    label: '企業特集',
    deck: '仕事の現場で、挑戦する人たち。',
    category: '企業',
    enabled: false,
    postIds: [],
  },
  {
    id: 'admin-feature',
    label: '行政特集',
    deck: '地域を支える、公の現場。',
    category: '行政',
    enabled: false,
    postIds: [],
  },
  {
    id: 'sports-feature',
    label: 'スポーツ特集',
    deck: '競技と、青春の記録。',
    category: '部活',
    enabled: false,
    postIds: [],
  },
  {
    id: 'band-feature',
    label: '吹奏楽特集',
    deck: '音楽と、部活の熱。',
    category: '部活',
    enabled: false,
    postIds: [],
  },
] as const

export function getEnabledMagazineSections(): FutureMagazineSection[] {
  return FUTURE_MAGAZINE_SECTIONS.filter((section) => section.enabled)
}
