/** 投稿データ（GoogleスプレッドシートCSVと1:1対応） */
export interface Post {
  /** 投稿ID（/post/[id] 用。CSV未設定時は取得順で付与） */
  id: string
  /** 投稿タイトル */
  title: string
  /** ジャンル */
  genre: string
  /** エリア */
  area: string
  /** 学校名 */
  schoolName: string
  /** 部活名 */
  clubName: string
  /** 企業名 */
  companyName: string
  /** 動画カテゴリ */
  videoCategory: string
  /** 進路カテゴリ */
  careerCategory: string
  /** 募集情報 */
  recruitmentInfo: string
  /** InstagramURL */
  instagramUrl: string
  /** 画像URL */
  imageUrl: string
  /** 説明文 */
  description: string
  /** 投稿日 */
  date: string
  /** URL用スラッグ（学校・部活・企業ページ生成に利用） */
  slug: string
}

/** Googleスプレッドシート1行目のヘッダー（列順固定） */
export const POST_CSV_HEADERS = [
  '投稿タイトル',
  'ジャンル',
  'エリア',
  '学校名',
  '部活名',
  '企業名',
  '動画カテゴリ',
  '進路カテゴリ',
  '募集情報',
  'InstagramURL',
  '画像URL',
  '説明文',
  '投稿日',
  'slug',
] as const

/** CSV列インデックス（0始まり） */
export const POST_CSV_COLUMNS = {
  title: 0,
  genre: 1,
  area: 2,
  schoolName: 3,
  clubName: 4,
  companyName: 5,
  videoCategory: 6,
  careerCategory: 7,
  recruitmentInfo: 8,
  instagramUrl: 9,
  imageUrl: 10,
  description: 11,
  date: 12,
  slug: 13,
} as const

/** キーワード検索対象フィールド */
export const POST_SEARCH_FIELDS: (keyof Post)[] = [
  'schoolName',
  'clubName',
  'companyName',
]
