/** エリア名 ↔ URLスラッグ */
export const AREA_SLUG_MAP: Record<string, string> = {
  '札幌': 'sapporo',
  '函館': 'hakodate',
  '旭川': 'asahikawa',
  '釧路': 'kushiro',
  '帯広': 'obihiro',
  '北見': 'kitami',
  '小樽': 'otaru',
  '苫小牧': 'tomakomai',
  'その他': 'other',
}

export const AREA_NAME_BY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(AREA_SLUG_MAP).map(([name, slug]) => [slug, name]),
)

export function getAreaSlug(area: string): string {
  return AREA_SLUG_MAP[area] ?? area
}

export function getAreaName(slug: string): string | undefined {
  return AREA_NAME_BY_SLUG[slug]
}

export function isValidAreaSlug(slug: string): boolean {
  return slug in AREA_NAME_BY_SLUG
}
