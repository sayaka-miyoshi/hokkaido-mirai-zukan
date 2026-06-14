const PRODUCTION_SITE_URL = 'https://www.hokkaido-miraizukan.jp'

/** 本番サイトのベースURL（末尾スラッシュなし） */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')

  if (process.env.VERCEL_ENV === 'production') {
    return PRODUCTION_SITE_URL
  }

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`

  return PRODUCTION_SITE_URL
}

/** 相対パスまたは絶対URLを絶対URLに変換 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${getSiteUrl()}${normalized}`
}
