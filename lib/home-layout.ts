/** トップページ固定構成（5セクション）の設定 */

/** トップ「いま注目のストーリー」の表示件数 */
export const FEATURED_STORIES_MAX = 6

/** 最新コンテンツの最大表示件数（TOP） */
export const LATEST_CONTENT_MAX = 10

/** 北海道の企業を知ろう — TOP表示件数（手動キュレーション22件すべて） */
export const COMPANY_CONTENT_MAX = 22

/** TOPグリッド（Tailwind class） */
export const HOME_CONTENT_GRIDS = {
  /** 人気：スマホ2列×3段 / PC 3列×2段 */
  popular: 'grid grid-cols-2 gap-x-2 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-8',
  /** 最新・企業：スマホ2列 / PC 3列（22件=7段+1） */
  nine: 'grid grid-cols-2 gap-x-2 gap-y-4 md:grid-cols-3 md:gap-x-4 md:gap-y-8',
} as const

/** Instagramフィード風 4:5（1080×1350）— ユーザー登録サムネ共通 */
export const POST_CARD_THUMBNAIL = {
  aspect: 'aspect-[4/5]',
  /** 4:5枠内に画像全体を表示（トリミングなし・角丸なし） */
  imageClass: 'object-contain object-center bg-white',
  imageFrame:
    'relative w-full aspect-[4/5] shrink-0 overflow-hidden bg-white border border-magazine-border/40',
} as const

/** 記事詳細ページのメイン画像（ユーザー登録サムネと同仕様） */
export const POST_DETAIL_MAIN_IMAGE = {
  aspect: POST_CARD_THUMBNAIL.aspect,
  imageClass: POST_CARD_THUMBNAIL.imageClass,
  imageFrame: POST_CARD_THUMBNAIL.imageFrame,
} as const

/** サイト内デザイン画像（Hero・ストーリー画像など）— 比率は各所のまま・角丸なし */
export const DESIGN_IMAGE_CLASS = 'mx-auto w-full max-w-lg'

/** 特集バナー枠 — 角丸なし・比率は各バナー定義のまま */
export const DESIGN_BANNER_LINK_CLASS =
  'group relative block overflow-hidden shadow-magazine-sm transition-transform duration-300 hover:scale-[1.01]'

/** TOPグリッドカード共通（4:5固定・トリミングなし） */
export const HOME_GRID_CARD = {
  imageAspect: POST_CARD_THUMBNAIL.aspect,
  imageClass: POST_CARD_THUMBNAIL.imageClass,
  imageFrame: POST_CARD_THUMBNAIL.imageFrame,
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
