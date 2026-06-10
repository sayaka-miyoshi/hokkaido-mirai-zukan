export const SITE_NAME = '北海道未来図鑑'
export const SITE_TAGLINE = '北海道の学校・部活・企業を、進路から探せる図鑑'

/** ヒーロー用（メディア訴求・検索サイト感を出さない） */
export const HERO_MEDIA_DECK = '北海道の学校・部活・企業の挑戦を、取材して伝えるメディア'

/** トップの大きなキャッチコピー */
export const SITE_CATCH_COPY = '知られていない挑戦に、\n出会える場所。'

/** ファーストビューのストーリー見出し */
export const HERO_STORY_LINES = [
  '北海道を取材していて気づきました。',
  '頑張っている学生や企業がたくさんいるのに、',
  '知られていない。',
  'だから北海道未来図鑑を作りました。',
] as const

/** 運営者情報 */
export const OPERATOR = {
  name: '三好 清佳',
  titles: ['北海道観光大使', '札幌観光大使'] as const,
  bio: '北海道の学校・部活・企業を取材し、\n頑張る人たちの魅力を発信しています。',
  totalFollowersLabel: '総フォロワー55万人超',
}

export const INSTAGRAM_HANDLE = '@insta.sayaka'
export const INSTAGRAM_URL = 'https://www.instagram.com/insta.sayaka'
export const TIKTOK_URL = 'https://www.tiktok.com/@tiktok.sayaka'
export const YOUTUBE_URL = 'https://youtube.com/@SayakaMiyoshi'

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube'

export const OPERATOR_SOCIAL_LINKS = [
  { platform: 'instagram' as const, label: 'Instagram', stat: '約50万人', url: INSTAGRAM_URL },
  { platform: 'tiktok' as const, label: 'TikTok', stat: '約3万人', url: TIKTOK_URL },
  { platform: 'youtube' as const, label: 'YouTube', stat: '約2万人', url: YOUTUBE_URL },
] as const

export const OPERATOR_SOCIAL_URLS = OPERATOR_SOCIAL_LINKS.map((item) => item.url)

/** デフォルト OGP 画像（app/opengraph-image.tsx が生成） */
export const DEFAULT_OG_IMAGE_PATH = '/opengraph-image'

/** Google Search Console 所有権確認（HTMLタグ） */
export const GOOGLE_SITE_VERIFICATION = 'TFO6fYVgO-x-aP0bXUe7s0BLAd6YwaupafjeT6rRs7M'

/** カテゴリボタン（ジャンル列と対応） */
export const CATEGORY_FILTERS = [
  { emoji: '🏫', label: '学校', genre: '学校' },
  { emoji: '⚽', label: '部活・サークル', genre: '部活' },
  { emoji: '🏢', label: '企業', genre: '企業訪問' },
  { emoji: '🏛️', label: '行政・団体', genre: '行政・自治体' },
] as const

/** トップのカテゴリ導線 */
export const HOME_CATEGORIES = [
  { label: '学校', genre: '学校', href: '/schools', type: 'link' as const },
  { label: '部活・サークル', genre: '部活', href: '/clubs', type: 'link' as const },
  { label: '企業', genre: '企業訪問', href: '#posts', type: 'filter' as const },
  { label: '行政・団体', genre: '行政・自治体', href: '#posts', type: 'filter' as const },
] as const

/** @deprecated 動画カテゴリは `data/動画カテゴリマスター.csv`（ID + 表示名）で管理 */

/** 人気エリア */
export const POPULAR_AREAS = ['札幌', '函館', '旭川', '帯広'] as const
