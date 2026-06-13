/** トップページ固定構成（5セクション）の設定 */

/** トップ「いま注目のストーリー」の表示件数 */
export const FEATURED_STORIES_MAX = 6

/** 最新コンテンツの最大表示件数（TOP） */
export const LATEST_CONTENT_MAX = 10

/** 北海道の企業を知ろう — TOP現在の表示件数（手動キュレーション1〜14件目） */
export const COMPANY_CONTENT_MAX = 14

/** 手動キュレーション最大件数（15〜22件目は COMPANY_CONTENT_MAX 増加で表示可能） */
export { COMPANY_CURATED_MAX } from '@/lib/company-curated-instagram'

/** TOPグリッド（Tailwind class） */
export const HOME_CONTENT_GRIDS = {
  /** 人気：スマホ2列×3段 / PC 3列×2段 */
  popular: 'grid grid-cols-2 gap-x-2 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-8',
  /** 最新・企業：スマホ2列 / PC 3列×3段 */
  nine: 'grid grid-cols-2 gap-x-2 gap-y-4 md:grid-cols-3 md:gap-x-4 md:gap-y-8',
} as const

/** Instagramフィード風 4:5（1080×1350）— 記事カードサムネ共通 */
export const POST_CARD_THUMBNAIL = {
  aspect: 'aspect-[4/5]',
  /** 顔・上部テキストが切れにくいよう、やや上寄せでトリミング */
  imageClass:
    'object-cover object-[center_32%] transition-transform duration-[1.2s] ease-out group-hover:scale-[1.02]',
} as const

/** 記事詳細ページのメイン画像（一覧と同じ4:5・object-cover・上寄せ） */
export const POST_DETAIL_MAIN_IMAGE = {
  aspect: POST_CARD_THUMBNAIL.aspect,
  imageClass: 'object-cover object-[center_30%]',
} as const

/** TOPグリッドカード共通（Instagramフィード風・4:5固定） */
export const HOME_GRID_CARD = {
  imageAspect: POST_CARD_THUMBNAIL.aspect,
  imageClass: POST_CARD_THUMBNAIL.imageClass,
  /** タイトルは最大2行・高さ固定 */
  title:
    'text-xs leading-snug line-clamp-2 min-h-[2.5rem] md:text-[13px] md:leading-snug md:min-h-[2.75rem]',
  meta: 'text-[10px] leading-snug line-clamp-1 md:text-[11px]',
  body: 'mt-1.5 space-y-0.5 md:mt-2 md:space-y-1',
} as const

/** @deprecated HOME_GRID_CARD を使用 */
export const HOME_NINE_GRID_CARD = HOME_GRID_CARD

/** 北海道の企業を知ろうセクション */
export const COMPANY_SECTION = {
  title: '北海道の企業を知ろう',
  lead: '北海道で未来をつくる企業のストーリー',
  description:
    '北海道には魅力的な仕事がたくさんあります。\n企業訪問を通して、未来の仕事や働く人たちの姿を知ろう。',
} as const

/** トップ特集バナー（初期3件） */
export const HOME_SPECIAL_FEATURES = [
  {
    id: 'hokkaido-jobs',
    title: '北海道を支える仕事',
    deck: '企業訪問で、北海道の仕事の現場を知る',
    href: '#companies',
    gradient: 'from-[#2B4A6B] via-[#3D6288] to-[#5BAFD6]',
  },
  {
    id: 'popular-clubs',
    title: '人気部活特集',
    deck: '部活動の熱量と、仲間のストーリー',
    href: '/clubs',
    gradient: 'from-[#2B4A6B] via-[#4A9B7A] to-[#7EC8A8]',
  },
  {
    id: 'open-campus',
    title: 'オープンキャンパス特集',
    deck: '学校選びのヒントが見つかる',
    href: '/schools',
    gradient: 'from-[#2B4A6B] via-[#6B5B95] to-[#B8A9E8]',
  },
] as const

/** 運営者セクション */
export const OPERATOR_SECTION = {
  title: '運営者',
  ctaLabel: '掲載・取材のご相談はこちら',
} as const

/** 最新ストーリーの最大表示件数 */
export const LATEST_STORIES_MAX = 10

/** 注目ストーリー（旧・編集部おすすめ） */
export const FEATURED_SECTION = {
  eyebrow: 'PICK UP',
  title: 'いま注目のストーリー',
  description: '北海道未来図鑑が、いま伝えたい記事を厳選しました。',
} as const

/** @deprecated FEATURED_SECTION を使用 */
export const EDITOR_PICKS_SECTION = FEATURED_SECTION

/** テーマから読むセクション */
export const THEME_SECTION = {
  eyebrow: 'THEME',
  title: 'テーマから読む',
  description: '学校・部活・企業から、好きなテーマで記事を見つけられます。',
} as const

/** 最新ストーリーセクション */
export const LATEST_SECTION = {
  eyebrow: 'LATEST',
  title: '最新ストーリー',
  description: 'ほかにも、北海道で未来をつくる挑戦があります。',
} as const

/** 検索セクション */
export const SEARCH_SECTION = {
  eyebrow: 'SEARCH',
  title: '条件で絞り込む',
  description: 'キーワードやエリアから、記事を見つけられます。',
} as const

/** トップで一目で伝える4カテゴリ（検索・テーマ導線共通） */
export const QUICK_SEARCH_CATEGORIES = [
  { id: 'school', label: '学校', emoji: '🏫', href: '/schools' },
  { id: 'club', label: '部活', emoji: '⚽', href: '/clubs' },
  { id: 'company', label: '企業', emoji: '🏢', genre: '企業訪問' },
  { id: 'admin', label: '行政', emoji: '🏛️', genre: '行政・自治体' },
] as const

/** お問い合わせ導線 */
export const CONTACT_SECTION = {
  title: '掲載・取材のご相談',
  description: '学校・部活・企業・行政の掲載・取材をご希望の方はこちら。',
  linkLabel: 'お問い合わせフォームへ',
} as const
