/** トップ「テーマから読む」の1項目 */
export type MagazineTheme = {
  id: string
  /** 表示ラベル（例: 学校を知る） */
  label: string
  /** 一覧ページへ（読み物導線） */
  href?: string
  /** 最新ストーリーへスクロール＋ジャンル絞り込み */
  genre?: string
  /** 最新ストーリーへスクロール＋キーワード（吹奏楽など） */
  keyword?: string
}

/** 雑誌の特集一覧風テーマ（検索ではなく読み物導線） */
export const MAGAZINE_THEMES: readonly MagazineTheme[] = [
  { id: 'school', label: '学校を知る', href: '/schools' },
  { id: 'club', label: '部活を知る', href: '/clubs' },
  { id: 'company', label: '企業を知る', genre: '企業訪問' },
  { id: 'admin', label: '公務員・行政を知る', genre: '行政・自治体' },
  { id: 'sports', label: 'スポーツを知る', href: '/sports' },
  { id: 'band', label: '吹奏楽を知る', keyword: '吹奏' },
] as const
