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

type InstagramMediaKind = 'p' | 'reel'

/** /p/ /reel/ /reels/ を判定（埋め込みURL生成用） */
export function extractInstagramMediaKind(url: string): InstagramMediaKind | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  const match = trimmed.match(/instagram\.com\/(p|reel|reels)\//i)
  if (!match?.[1]) return null

  const kind = match[1].toLowerCase()
  return kind === 'p' ? 'p' : 'reel'
}

/**
 * 投稿・Reel URL を正規化したパーマリンクに変換
 * （クエリ除去・末尾スラッシュ統一・reels→reel）
 */
export function toInstagramPermalink(url: string): string | null {
  const id = extractInstagramPostId(url)
  const kind = extractInstagramMediaKind(url)
  if (!id || !kind) return null

  return `https://www.instagram.com/${kind}/${id}/`
}

/**
 * Instagram 公式埋め込み用 URL（/embed）
 * 例: https://www.instagram.com/reel/XXXX/ → .../reel/XXXX/embed
 */
export function toInstagramEmbedUrl(url: string): string | null {
  const permalink = toInstagramPermalink(url)
  if (!permalink) return null

  return `${permalink}embed`
}
