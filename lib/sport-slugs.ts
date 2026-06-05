/** 競技カテゴリ名 ↔ URLスラッグ（日本語そのまま encode） */
export function getSportSlug(category: string): string {
  return encodeURIComponent(category.trim())
}

export function getSportNameFromSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}
