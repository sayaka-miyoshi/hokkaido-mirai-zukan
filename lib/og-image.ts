import { isDefaultPostImage, resolveDefaultPostImage } from '@/lib/default-images'
import {
  getImageUrlCandidates,
  isInstagramPageUrl,
  isLikelyDirectImageUrl,
  normalizeImageUrl,
} from '@/lib/image-url'

export { DEFAULT_POST_IMAGE, resolveDefaultPostImage } from '@/lib/default-images'

const FETCH_TIMEOUT_MS = 8000
const VERIFY_TIMEOUT_MS = 5000

const OG_IMAGE_PATTERNS = [
  /property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
  /content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
  /name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
  /"display_url"\s*:\s*"([^"]+)"/,
  /"thumbnail_src"\s*:\s*"([^"]+)"/,
  /"og_image_url"\s*:\s*"([^"]+)"/,
]

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function isInstagramUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return host === 'instagram.com' || host === 'instagr.am'
  } catch {
    return false
  }
}

/** HTMLからOG画像URLを抽出 */
export function extractOgImageUrl(html: string): string | null {
  for (const pattern of OG_IMAGE_PATTERNS) {
    const match = html.match(pattern)
    if (match?.[1]) {
      const url = decodeHtmlEntities(match[1]).trim()
      if (url.startsWith('http')) return url
    }
  }
  return null
}

/** ページURLからOG画像を取得 */
export async function fetchOgImageUrl(pageUrl: string): Promise<string | null> {
  if (!pageUrl.trim() || !isInstagramUrl(pageUrl)) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(pageUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      },
      next: { revalidate: 86400 },
    })

    if (!res.ok) return null

    const html = await res.text()
    return extractOgImageUrl(html)
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/** 画像URLが取得可能か簡易チェック */
export async function verifyImageUrl(url: string): Promise<boolean> {
  if (isDefaultPostImage(url) || url.startsWith('/')) return true

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Range: 'bytes=0-1023',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok && res.status !== 206) return false

    const contentType = res.headers.get('content-type') ?? ''
    if (contentType.startsWith('image/')) return true
    if (contentType.includes('octet-stream')) return true

    return isLikelyDirectImageUrl(url)
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

async function resolveDirectImageUrl(rawUrl: string): Promise<string | null> {
  const candidates = getImageUrlCandidates(rawUrl)

  for (const candidate of candidates) {
    if (isInstagramPageUrl(candidate)) {
      const og = await fetchOgImageUrl(candidate)
      if (og) return og
      continue
    }

    const normalized = normalizeImageUrl(candidate)
    if (!normalized) continue

    if (
      normalized.includes('drive.google.com/uc') ||
      normalized.includes('drive.google.com/thumbnail') ||
      isLikelyDirectImageUrl(normalized) ||
      normalized.startsWith('/')
    ) {
      return normalized
    }

    if (await verifyImageUrl(normalized)) return normalized
  }

  return null
}

/** 投稿の表示用画像URLを解決（画像URL → Instagram OG → デフォルト） */
export async function resolvePostImageUrl(
  imageUrl: string,
  instagramUrl: string,
  genre?: string,
): Promise<string> {
  if (imageUrl.trim()) {
    const resolved = await resolveDirectImageUrl(imageUrl)
    if (resolved) return resolved
  }

  if (instagramUrl.trim()) {
    const ogImage = await fetchOgImageUrl(instagramUrl.trim())
    if (ogImage) return ogImage
  }

  return resolveDefaultPostImage(genre)
}
