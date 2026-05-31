/** Googleドライブ等の共有URLを表示用URLへ変換 */

const GOOGLE_DRIVE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/open\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/uc\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/,
  /docs\.google\.com\/(?:file|document)\/d\/([a-zA-Z0-9_-]+)/,
  /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/,
]

const IMAGE_EXT_PATTERN = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?|$)/i

const DIRECT_IMAGE_HOSTS = [
  'googleusercontent.com',
  'cdninstagram.com',
  'fbcdn.net',
  'picsum.photos',
]

function extractGoogleDriveId(url: string): string | null {
  for (const pattern of GOOGLE_DRIVE_ID_PATTERNS) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }

  try {
    const parsed = new URL(url)
    if (
      parsed.hostname.includes('drive.google.com') ||
      parsed.hostname.includes('docs.google.com')
    ) {
      const id = parsed.searchParams.get('id')
      if (id) return id
    }
  } catch {
    return null
  }

  return null
}

/** Googleドライブ共有URL → 直接表示URL */
export function convertGoogleDriveUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  const fileId = extractGoogleDriveId(trimmed)
  if (!fileId) return null

  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

/** GoogleドライブサムネイルURL（view URLが使えない場合の代替） */
export function convertGoogleDriveThumbnailUrl(url: string): string | null {
  const fileId = extractGoogleDriveId(url.trim())
  if (!fileId) return null
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
}

export function isInstagramPageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host !== 'instagram.com' && host !== 'instagr.am') return false
    return /^\/(p|reel|tv|reels)\//.test(parsed.pathname)
  } catch {
    return false
  }
}

export function isLikelyDirectImageUrl(url: string): boolean {
  if (IMAGE_EXT_PATTERN.test(url)) return true

  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return DIRECT_IMAGE_HOSTS.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`),
    )
  } catch {
    return false
  }
}

/**
 * 画像URLを正規化（Googleドライブ変換・空白除去）
 * 変換できない場合は null
 */
export function normalizeImageUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('/')) return trimmed

  if (!/^https?:\/\//i.test(trimmed)) return null

  const driveUrl = convertGoogleDriveUrl(trimmed)
  if (driveUrl) return driveUrl

  if (isInstagramPageUrl(trimmed)) return trimmed

  try {
    return new URL(trimmed).href
  } catch {
    return null
  }
}

/** 表示用URL候補（Googleドライブは view → thumbnail の順） */
export function getImageUrlCandidates(url: string): string[] {
  const trimmed = url.trim()
  if (!trimmed) return []

  const normalized = normalizeImageUrl(trimmed)
  const candidates: string[] = []

  if (normalized) candidates.push(normalized)

  const thumbnail = convertGoogleDriveThumbnailUrl(trimmed)
  if (thumbnail && !candidates.includes(thumbnail)) {
    candidates.push(thumbnail)
  }

  if (!normalized && /^https?:\/\//i.test(trimmed)) {
    try {
      const href = new URL(trimmed).href
      if (!candidates.includes(href)) candidates.push(href)
    } catch {
      // ignore
    }
  }

  return candidates
}
