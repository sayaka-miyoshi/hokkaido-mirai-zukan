export const SITE_NAME = '北海道未来図鑑'
export const SITE_TAGLINE =
  '北海道の学校・部活・企業を動画と記事で紹介。エリア・ジャンルから探せる進路情報サイト'

/** デフォルト OGP 画像（app/opengraph-image.tsx が生成） */
export const DEFAULT_OG_IMAGE_PATH = '/opengraph-image'
export const INSTAGRAM_HANDLE = '@insta.sayakans'
export const INSTAGRAM_URL = 'https://www.instagram.com/insta.sayakans/'

/** カテゴリボタン（ジャンル列と対応） */
export const CATEGORY_FILTERS = [
  { emoji: '🏫', label: '学校', genre: '学校' },
  { emoji: '⚽', label: '部活', genre: '部活' },
  { emoji: '🏢', label: '企業', genre: '企業訪問' },
] as const

/** @deprecated 動画カテゴリは `data/動画カテゴリマスター.csv`（ID + 表示名）で管理 */

/** 人気エリア */
export const POPULAR_AREAS = ['札幌', '函館', '旭川', '帯広'] as const
