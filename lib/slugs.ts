/** エリア名 ↔ URLスラッグ（ASCII のみ。日本語 slug は禁止） */
export const AREA_SLUG_MAP: Record<string, string> = {
  札幌: 'sapporo',
  函館: 'hakodate',
  旭川: 'asahikawa',
  釧路: 'kushiro',
  帯広: 'obihiro',
  北見: 'kitami',
  小樽: 'otaru',
  苫小牧: 'tomakomai',
  千歳: 'chitose',
  富良野: 'furano',
  ニセコ: 'niseko',
  トマム: 'tomamu',
  洞爺湖: 'toyako',
  定山渓: 'jozankei',
  知床: 'shiretoko',
  十勝: 'tokachi',
  檜山: 'hiyama',
  厚岸: 'akkeshi',
  音更町: 'otofuke',
  士幌町: 'shihoro',
  鹿部町: 'shikabe',
  七飯町: 'nanae',
  松前町: 'matsumae',
  長沼町: 'naganuma',
  当別町: 'tobetsu',
  当麻町: 'toma',
  美瑛町: 'biei',
  標津町: 'shibetsu',
  別海町: 'betsukai',
  留寿都村: 'rusutsu',
  岩内郡: 'iwanai',
  北海道江別市: 'ebetsu',
  江別市: 'ebetsu',
  江別: 'ebetsu',
  北海道恵庭市: 'eniwa',
  恵庭市: 'eniwa',
  恵庭: 'eniwa',
  北海道石狩市: 'ishikari',
  石狩市: 'ishikari',
  石狩: 'ishikari',
  北海道美唄市: 'bibai',
  美唄市: 'bibai',
  美唄: 'bibai',
  北海道北広島市: 'kitahiroshima',
  北広島市: 'kitahiroshima',
  北広島: 'kitahiroshima',
  北海道伊達市: 'date',
  伊達市: 'date',
  伊達: 'date',
  室蘭: 'muroran',
  東京都: 'tokyo',
  東京: 'tokyo',
  名古屋: 'nagoya',
  兵庫県: 'hyogo',
  その他: 'other',
}

export const AREA_NAME_BY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(AREA_SLUG_MAP).map(([name, slug]) => [slug, name]),
)

/** スラッグが ASCII（英数字・ハイフン）のみか */
export function isAsciiSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

/** 未登録エリア用の安定した ASCII slug（日本語を URL に出さない） */
function fallbackAsciiSlug(area: string): string {
  const ascii = area
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (ascii && isAsciiSlug(ascii)) return ascii

  let hash = 0
  for (let i = 0; i < area.length; i++) {
    hash = (Math.imul(31, hash) + area.charCodeAt(i)) | 0
  }
  return `area-${(hash >>> 0).toString(36)}`
}

/**
 * エリア名から URL スラッグを生成
 * 常に ASCII。未登録エリアはフォールバック slug（日本語は返さない）
 */
export function getAreaSlug(area: string): string {
  const trimmed = area.trim()
  if (!trimmed) return 'other'

  const direct = AREA_SLUG_MAP[trimmed]
  if (direct) return direct

  const withoutHokkaido = trimmed.replace(/^北海道/, '')
  if (withoutHokkaido !== trimmed) {
    const mapped = AREA_SLUG_MAP[withoutHokkaido] ?? AREA_SLUG_MAP[`${withoutHokkaido}市`]
    if (mapped) return mapped
  }

  const withCity = AREA_SLUG_MAP[`${trimmed}市`] ?? AREA_SLUG_MAP[`${trimmed}町`] ?? AREA_SLUG_MAP[`${trimmed}村`]
  if (withCity) return withCity

  return fallbackAsciiSlug(trimmed)
}

/** URL パラメータ用に decode（旧日本語 URL 対策） */
export function normalizeAreaSlugParam(slug: string): string {
  let decoded = slug
  try {
    decoded = decodeURIComponent(slug)
  } catch {
    // keep as-is
  }
  // 旧: /area/洞爺湖 → 新: toyako
  if (!isAsciiSlug(decoded) && AREA_SLUG_MAP[decoded]) {
    return AREA_SLUG_MAP[decoded]
  }
  if (!isAsciiSlug(decoded)) {
    return getAreaSlug(decoded)
  }
  return decoded
}

export function getAreaName(slug: string): string | undefined {
  const normalized = normalizeAreaSlugParam(slug)
  return AREA_NAME_BY_SLUG[normalized]
}

/** 投稿データからエリア名を逆引き */
export function findAreaNameBySlug(slug: string, areas: string[]): string | undefined {
  const normalized = normalizeAreaSlugParam(slug)
  const fromMap = AREA_NAME_BY_SLUG[normalized]
  if (fromMap && areas.includes(fromMap)) return fromMap

  // 同一 slug に複数名がある場合（江別 / 北海道江別市）は投稿に存在する名前を優先
  const matched = areas.filter((area) => getAreaSlug(area) === normalized)
  if (matched.length === 0) return undefined
  // マップに載っている正式名があればそれを返す
  const preferred = matched.find((area) => AREA_SLUG_MAP[area] === normalized)
  return preferred ?? matched[0]
}

export function isKnownAreaSlug(slug: string): boolean {
  const normalized = normalizeAreaSlugParam(slug)
  return normalized in AREA_NAME_BY_SLUG
}
