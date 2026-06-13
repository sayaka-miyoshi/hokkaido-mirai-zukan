/** Googleドライブ等の共有URLを表示用URLへ変換 */

const GOOGLE_DRIVE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/open\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/uc\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/,
  /docs\.google\.com\/(?:file|document)\/d\/([a-zA-Z0-9_-]+)/,
  /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/,
]

const GOOGLE_DRIVE_FOLDER_PATTERN = /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/

/** フォルダURL → 代表画像ファイルID（K列修正前の既知データ向け） */
const GOOGLE_DRIVE_FOLDER_FILE_IDS: Record<string, string> = {
  '19urfuXIRQu9MXXmyS5nigPSrWZerNF78': '1-ZW29h0pUNmYWlAqWiFGdopsUlJSjVGB',
}

const IMAGE_EXT_PATTERN = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?|$)/i

const DIRECT_IMAGE_HOSTS = [
  'googleusercontent.com',
  'cdninstagram.com',
  'fbcdn.net',
  'picsum.photos',
]

export function isGoogleDriveFolderUrl(url: string): boolean {
  return GOOGLE_DRIVE_FOLDER_PATTERN.test(url.trim())
}

function extractGoogleDriveFolderId(url: string): string | null {
  const match = url.trim().match(GOOGLE_DRIVE_FOLDER_PATTERN)
  return match?.[1] ?? null
}

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

/** フォルダURLを file/d 形式へ補正（既知フォルダのみ） */
export function sanitizePostImageUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''

  const folderId = extractGoogleDriveFolderId(trimmed)
  const fileId = folderId ? GOOGLE_DRIVE_FOLDER_FILE_IDS[folderId] : null
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view`
  }

  return trimmed
}

/** Googleドライブ共有URL → ブラウザ表示向けURL（thumbnail を優先） */
export function convertGoogleDriveUrl(url: string): string | null {
  const fileId = extractGoogleDriveId(sanitizePostImageUrl(url))
  if (!fileId) return null

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
}

/** Googleドライブ uc 形式（OGP等サーバー側取得用） */
export function convertGoogleDriveDirectUrl(url: string): string | null {
  const fileId = extractGoogleDriveId(sanitizePostImageUrl(url))
  if (!fileId) return null

  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

/** GoogleドライブサムネイルURL */
export function convertGoogleDriveThumbnailUrl(url: string): string | null {
  const fileId = extractGoogleDriveId(sanitizePostImageUrl(url))
  if (!fileId) return null
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
}

function convertGoogleDriveContentUrl(url: string): string | null {
  const fileId = extractGoogleDriveId(sanitizePostImageUrl(url))
  if (!fileId) return null
  return `https://lh3.googleusercontent.com/d/${fileId}=w1000`
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
  const trimmed = sanitizePostImageUrl(url)
  if (!trimmed) return null

  if (trimmed.startsWith('/')) return trimmed

  if (!/^https?:\/\//i.test(trimmed)) return null

  if (isGoogleDriveFolderUrl(trimmed)) return null

  const driveUrl = convertGoogleDriveUrl(trimmed)
  if (driveUrl) return driveUrl

  if (isInstagramPageUrl(trimmed)) return trimmed

  try {
    return new URL(trimmed).href
  } catch {
    return null
  }
}

/** 表示用URL候補（Googleドライブは thumbnail → uc → googleusercontent の順） */
export function getImageUrlCandidates(url: string): string[] {
  const trimmed = sanitizePostImageUrl(url)
  if (!trimmed) return []

  if (isGoogleDriveFolderUrl(trimmed)) return []

  const candidates: string[] = []
  const push = (candidate: string | null) => {
    if (candidate && !candidates.includes(candidate)) candidates.push(candidate)
  }

  push(convertGoogleDriveThumbnailUrl(trimmed))
  push(convertGoogleDriveDirectUrl(trimmed))
  push(convertGoogleDriveContentUrl(trimmed))

  const normalized = normalizeImageUrl(trimmed)
  push(normalized)

  if (candidates.length === 0 && /^https?:\/\//i.test(trimmed)) {
    try {
      push(new URL(trimmed).href)
    } catch {
      // ignore
    }
  }

  return candidates
}
