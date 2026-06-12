/** ジャンル別デフォルト画像（public/images/。jpg/png に差し替え可） */
export const DEFAULT_IMAGES = {
  post: '/images/default-post.svg',
  school: '/images/default-school.svg',
  club: '/images/default-club.svg',
  /** 例: /images/default-company.jpg — 企業訪問の未設定時 */
  company: '/images/default-company.jpg',
  admin: '/images/default-admin.svg',
} as const

/** @deprecated DEFAULT_IMAGES.post を使用 */
export const DEFAULT_POST_IMAGE = DEFAULT_IMAGES.post

const GENRE_DEFAULT_MAP: Record<string, string> = {
  学校: DEFAULT_IMAGES.school,
  部活: DEFAULT_IMAGES.club,
  企業訪問: DEFAULT_IMAGES.company,
  '行政・自治体': DEFAULT_IMAGES.admin,
}

/** 投稿ジャンルに応じたデフォルト画像パス */
export function resolveDefaultPostImage(genre?: string): string {
  if (!genre?.trim()) return DEFAULT_IMAGES.post
  return GENRE_DEFAULT_MAP[genre.trim()] ?? DEFAULT_IMAGES.post
}

/** デフォルト画像か（表示スタイル判定用） */
export function isDefaultPostImage(src: string): boolean {
  if (Object.values(DEFAULT_IMAGES).includes(src as (typeof DEFAULT_IMAGES)[keyof typeof DEFAULT_IMAGES])) {
    return true
  }
  return /^\/images\/default-/.test(src)
}
