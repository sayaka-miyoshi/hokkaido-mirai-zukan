/** Instagram投稿URLから post/reel ID を抽出（クエリ・末尾スラッシュは無視） */
export function extractInstagramPostId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  const match = trimmed.match(/instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/i)
  return match?.[1] ?? null
}

/** マッチング用に post ID を正規化 */
export function normalizeInstagramPostId(url: string): string | null {
  const id = extractInstagramPostId(url)
  return id ? id.toLowerCase() : null
}
