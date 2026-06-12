import { AREA_SLUG_MAP } from '@/lib/slugs'

/** 北海道外として除外するエリア（完全一致） */
const NON_HOKKAIDO_AREAS = new Set([
  '東京都',
  '東京',
  '大阪府',
  '大阪',
  '大阪市',
  '京都府',
  '京都',
  '愛知県',
  '名古屋',
  '福岡県',
  '福岡',
  '神奈川県',
  '横浜',
  '千葉県',
  '埼玉県',
])

/** 北海道外の都道府県・地域名パターン */
const NON_HOKKAIDO_PATTERN =
  /^(東京都?|大阪(?:府|市)?|京都(?:府|市)?|愛知県?|福岡(?:県|市)?|神奈川(?:県|市)?|千葉(?:県|市)?|埼玉(?:県|市)?|兵庫(?:県|市)?|広島(?:県|市)?|宮城(?:県|市)?)/

const HOKKAIDO_KNOWN_AREAS = new Set(
  Object.keys(AREA_SLUG_MAP).filter((name) => name !== 'その他'),
)

/** エリアが北海道内かどうか */
export function isHokkaidoArea(area: string): boolean {
  const trimmed = area.trim()
  if (!trimmed) return false

  if (NON_HOKKAIDO_AREAS.has(trimmed)) return false
  if (NON_HOKKAIDO_PATTERN.test(trimmed)) return false

  if (trimmed.includes('北海道')) return true
  if (HOKKAIDO_KNOWN_AREAS.has(trimmed)) return true

  // 「士幌町」など道内の市区町村（他道府県名を含まない）
  if (/(市|町|村)$/.test(trimmed) && !/(都|府|県)/.test(trimmed)) {
    return true
  }

  return false
}
