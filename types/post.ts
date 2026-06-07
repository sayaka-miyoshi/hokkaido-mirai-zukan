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
  /** 動画カテゴリID（CSV「動画カテゴリ」列） */
  videoCategory: string
  /** 動画カテゴリ表示名（マスターから解決） */
  videoCategoryLabel: string
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
  /** 人気コンテンツに表示（CSV「人気表示」= true） */
  isPopular: boolean
  /** 人気順（人気コンテンツ用・昇順で最大10件・未入力は対象外） */
  popularOrder: number | null
  /** 学校公式サイト（任意列） */
  schoolOfficialSite: string
  /** 学校SNS（任意列・Instagram / Facebook / YouTube 等） */
  schoolSns: string
  /** 部活SNS（任意列） */
  clubSns: string
  /** 競技カテゴリ（任意列・部活マスター連携） */
  sportCategory: string
  /** 企業公式サイト（任意列） */
  companyOfficialSite: string
  /** 企業SNS（任意列） */
  companySns: string
  /** 募集情報URL（任意列・部員募集・採用・インターン等） */
  recruitmentInfoUrl: string
  /** サイト公開（CSV「公開」列・未入力時は true） */
  isPublished: boolean
}

/** 必須列（1行目にすべて必要・列順は自由） */
export const POST_REQUIRED_CSV_HEADERS = [
  '投稿タイトル',
  'ジャンル',
  'エリア',
  '説明文',
  '投稿日',
  'slug',
] as const

/** 任意列（列が無くても・セルが空でも可） */
export const POST_OPTIONAL_CSV_HEADERS = [
  '公開',
  '画像URL',
  '学校名',
  '部活名',
  '企業名',
  '動画カテゴリ',
  '進路カテゴリ',
  '募集情報',
  '募集情報URL',
  'InstagramURL',
  '学校公式サイト',
  '学校SNS',
  '部活SNS',
  '競技カテゴリ',
  '企業公式サイト',
  '企業SNS',
  '人気表示',
  '人気順',
] as const

/** 外部リンク列（POST_OPTIONAL_CSV_HEADERS の一部・互換用） */
export const POST_LINK_CSV_HEADERS = [
  '学校公式サイト',
  '学校SNS',
  '部活SNS',
  '企業公式サイト',
  '企業SNS',
  '募集情報URL',
] as const

/** 推奨ヘッダー順（書き出し・ドキュメント用） */
export const POST_ALL_CSV_HEADERS = [
  ...POST_REQUIRED_CSV_HEADERS,
  ...POST_OPTIONAL_CSV_HEADERS,
] as const

/** @deprecated POST_REQUIRED_CSV_HEADERS を使用 */
export const POST_CSV_HEADERS = POST_REQUIRED_CSV_HEADERS

export type PostRequiredCsvColumnName = (typeof POST_REQUIRED_CSV_HEADERS)[number]
export type PostOptionalCsvColumnName = (typeof POST_OPTIONAL_CSV_HEADERS)[number]
export type PostLinkCsvColumnName = (typeof POST_LINK_CSV_HEADERS)[number]
export type PostAllOptionalCsvColumnName = PostOptionalCsvColumnName

export type PostCsvColumnName = PostRequiredCsvColumnName | PostOptionalCsvColumnName

export const POST_REQUIRED_FIELD_MAP: Record<
  PostRequiredCsvColumnName,
  'title' | 'genre' | 'area' | 'description' | 'date' | 'slug'
> = {
  '投稿タイトル': 'title',
  'ジャンル': 'genre',
  'エリア': 'area',
  '説明文': 'description',
  '投稿日': 'date',
  'slug': 'slug',
}

export const POST_OPTIONAL_FIELD_MAP: Record<
  Exclude<PostOptionalCsvColumnName, '人気表示' | '人気順' | '公開'>,
  | 'schoolName'
  | 'clubName'
  | 'companyName'
  | 'videoCategory'
  | 'careerCategory'
  | 'recruitmentInfo'
  | 'recruitmentInfoUrl'
  | 'instagramUrl'
  | 'imageUrl'
  | 'schoolOfficialSite'
  | 'schoolSns'
  | 'clubSns'
  | 'sportCategory'
  | 'companyOfficialSite'
  | 'companySns'
> = {
  '学校名': 'schoolName',
  '部活名': 'clubName',
  '企業名': 'companyName',
  '動画カテゴリ': 'videoCategory',
  '進路カテゴリ': 'careerCategory',
  '募集情報': 'recruitmentInfo',
  '募集情報URL': 'recruitmentInfoUrl',
  'InstagramURL': 'instagramUrl',
  '画像URL': 'imageUrl',
  '学校公式サイト': 'schoolOfficialSite',
  '学校SNS': 'schoolSns',
  '部活SNS': 'clubSns',
  '競技カテゴリ': 'sportCategory',
  '企業公式サイト': 'companyOfficialSite',
  '企業SNS': 'companySns',
}

/** @deprecated POST_REQUIRED_FIELD_MAP / POST_OPTIONAL_FIELD_MAP を使用 */
export const POST_CSV_FIELD_MAP: Record<
  PostRequiredCsvColumnName | Exclude<PostOptionalCsvColumnName, '人気表示' | '人気順' | '公開'>,
  keyof Omit<Post, 'id' | 'isPopular' | 'popularOrder'>
> = {
  ...POST_REQUIRED_FIELD_MAP,
  ...POST_OPTIONAL_FIELD_MAP,
}

export const POST_LINK_FIELD_MAP: Record<
  PostLinkCsvColumnName,
  | 'schoolOfficialSite'
  | 'schoolSns'
  | 'clubSns'
  | 'companyOfficialSite'
  | 'companySns'
  | 'recruitmentInfoUrl'
> = {
  '学校公式サイト': 'schoolOfficialSite',
  '学校SNS': 'schoolSns',
  '部活SNS': 'clubSns',
  '企業公式サイト': 'companyOfficialSite',
  '企業SNS': 'companySns',
  '募集情報URL': 'recruitmentInfoUrl',
}

/** キーワード検索対象フィールド */
export const POST_SEARCH_FIELDS: (keyof Post)[] = [
  'schoolName',
  'clubName',
  'companyName',
  'sportCategory',
]
