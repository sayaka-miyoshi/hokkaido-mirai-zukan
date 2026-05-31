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

/** スプレッドシート1行目の列名（順序は自由・追加列も可） */
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

export type PostCsvColumnName = (typeof POST_CSV_HEADERS)[number]

/** 列名 → Postフィールド（CSV取得のキー定義） */
export const POST_CSV_FIELD_MAP: Record<PostCsvColumnName, keyof Omit<Post, 'id'>> = {
  '投稿タイトル': 'title',
  'ジャンル': 'genre',
  'エリア': 'area',
  '学校名': 'schoolName',
  '部活名': 'clubName',
  '企業名': 'companyName',
  '動画カテゴリ': 'videoCategory',
  '進路カテゴリ': 'careerCategory',
  '募集情報': 'recruitmentInfo',
  'InstagramURL': 'instagramUrl',
  '画像URL': 'imageUrl',
  '説明文': 'description',
  '投稿日': 'date',
  'slug': 'slug',
}

/** キーワード検索対象フィールド */
export const POST_SEARCH_FIELDS: (keyof Post)[] = [
  'schoolName',
  'clubName',
  'companyName',
]
