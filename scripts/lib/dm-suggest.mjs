/** 本番サイト URL（.mjs スクリプト用・サイトコード非依存） */
export const PRODUCTION_SITE_URL = 'https://www.hokkaido-miraizukan.jp'

/** dm_category 正式値 */
export const DM_CATEGORY = {
  SCHOOL: '学校',
  CLUB: '部活動',
  COMPANY: '企業',
  TOURISM_CULTURE: '観光/文化',
}

const CULTURE_KEYWORDS = [
  'グルメ',
  '食',
  'ラーメン',
  '寿司',
  '文化',
  '伝統',
  '祭',
  '芸術',
  '茶道',
  '和食',
  'スイーツ',
  '海鮮',
  '観光',
]

const FACTORY_KEYWORDS = ['工場', '製造', '見学']

const SPORT_KEYWORDS = [
  'ラクロス',
  'バドミントン',
  'バスケットボール',
  'バスケ',
  'サッカー',
  '野球',
  'テニス',
  'バレーボール',
  'バレー',
  '陸上',
  '吹奏楽',
  'ボディビルディング',
  'レスリング',
  '柔道',
  '剣道',
  '水泳',
  'ハンドボール',
  'ホッケー',
  'スキー',
  'YOSAKOI',
  'チア',
  '演劇',
  '美術',
  'eスポーツ',
]

const KEYWORD_MAX_LENGTH = 16
const MESSAGE_MAX_TITLE = 32

/** スプレッドシート表記ゆれ → DM出力用の正規表記 */
const SPELLING_FIXES = [['バトミントン', 'バドミントン']]

/** dm_keyword / dm_message 向け表記正規化 */
export function normalizeDmText(text) {
  let result = String(text ?? '')
  for (const [wrong, correct] of SPELLING_FIXES) {
    result = result.split(wrong).join(correct)
  }
  return result
}

function truncate(text, max) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) return ''
  if (trimmed.length <= max) return trimmed
  return trimmed.slice(0, max)
}

function shortenTitleForMessage(title) {
  const trimmed = String(title ?? '').trim()
  if (!trimmed) return 'この記事'

  const cut = trimmed.split(/[｜|／/・—–-]/)[0]?.trim() ?? trimmed
  return truncate(cut, MESSAGE_MAX_TITLE) || 'この記事'
}

function hasCultureSignal(title, videoCategory) {
  const video = String(videoCategory ?? '').trim()
  if (video === 'japanese-culture' || video.includes('文化')) return true
  return CULTURE_KEYWORDS.some((word) => title.includes(word))
}

function hasFactorySignal(title, videoCategory) {
  const video = String(videoCategory ?? '').trim()
  if (video.includes('factory') || video.includes('工場')) return true
  return FACTORY_KEYWORDS.some((word) => title.includes(word))
}

function stripClubSuffix(name) {
  return String(name ?? '')
    .trim()
    .replace(/(同好会|クラブ|部)$/u, '')
    .replace(/^(男子|女子)/u, '')
    .trim()
}

function extractSportFromText(text) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) return ''

  for (const sport of SPORT_KEYWORDS) {
    if (trimmed.includes(sport)) return sport
  }
  // 表記ゆれ（バトミントン等）も正規化してから再チェック
  const normalized = normalizeDmText(trimmed)
  if (normalized !== trimmed) {
    for (const sport of SPORT_KEYWORDS) {
      if (normalized.includes(sport)) return sport
    }
  }

  const match = stripClubSuffix(trimmed).match(/(?:大学|高校|学院|学園|学校)(.+)$/u)
  if (match?.[1]) {
    const candidate = match[1].trim()
    if (candidate && candidate.length <= KEYWORD_MAX_LENGTH) return candidate
  }

  const suffixMatch = stripClubSuffix(trimmed).match(/(.{2,12})$/)
  return suffixMatch?.[1]?.trim() ?? ''
}

function extractClubKeyword(input) {
  const sportCategory = normalizeDmText(String(input.sportCategory ?? '').trim())
  if (sportCategory) return truncate(sportCategory, KEYWORD_MAX_LENGTH)

  const clubName = String(input.clubName ?? '').trim()
  const title = String(input.title ?? '').trim()

  const fromClub = extractSportFromText(clubName)
  if (fromClub) return truncate(fromClub, KEYWORD_MAX_LENGTH)

  const fromTitle = extractSportFromText(title)
  if (fromTitle) return truncate(fromTitle, KEYWORD_MAX_LENGTH)

  return '部活'
}

function extractSchoolKeyword(input) {
  const schoolName = String(input.schoolName ?? '').trim()
  const title = String(input.title ?? '').trim()

  if (schoolName) return truncate(schoolName, KEYWORD_MAX_LENGTH)
  return truncate(shortenTitleForMessage(title), KEYWORD_MAX_LENGTH) || '学校'
}

function extractCompanyKeyword(input) {
  const title = String(input.title ?? '').trim()
  const companyName = String(input.companyName ?? '').trim()

  if (hasFactorySignal(title, input.videoCategory)) {
    const factoryMatch = title.match(/([^、。！!？?\sの]{1,10}工場)/u)
    if (factoryMatch?.[1]) return factoryMatch[1]
    return '工場'
  }

  if (companyName && companyName.length <= KEYWORD_MAX_LENGTH) return companyName

  const afterNo = title.match(/の([^、。！!？?\sの]{2,12})$/u)
  if (afterNo?.[1]) return afterNo[1]

  if (companyName) return truncate(companyName, KEYWORD_MAX_LENGTH)
  return truncate(shortenTitleForMessage(title), KEYWORD_MAX_LENGTH) || '企業'
}

function extractTourismKeyword(input) {
  const title = String(input.title ?? '').trim()
  const companyName = String(input.companyName ?? '').trim()

  if (hasFactorySignal(title, input.videoCategory)) {
    return extractCompanyKeyword(input)
  }

  if (hasCultureSignal(title, input.videoCategory) && !title.includes('観光')) {
    const cultureMatch = title.match(/([^、。！!？?\sの]{2,10}(?:文化|グルメ|祭|ラーメン|寿司))/u)
    if (cultureMatch?.[1]) return truncate(cultureMatch[1], KEYWORD_MAX_LENGTH)
    return '文化'
  }

  if (companyName && companyName.length <= KEYWORD_MAX_LENGTH) return companyName

  const spotMatch = title.match(/([^、。！!？?\sの]{2,12}(?:スポット|公園|館|寺|神社|温泉|道|市))/u)
  if (spotMatch?.[1]) return truncate(spotMatch[1], KEYWORD_MAX_LENGTH)

  return truncate(shortenTitleForMessage(title), KEYWORD_MAX_LENGTH) || '観光'
}

/** ジャンル・競技カテゴリ等から dm_category を決定 */
export function resolveDmCategory(input) {
  const genre = String(input.genre ?? '').trim()
  const sportCategory = String(input.sportCategory ?? '').trim()
  const title = String(input.title ?? '').trim()
  const videoCategory = String(input.videoCategory ?? '').trim()

  if (genre === '学校') return DM_CATEGORY.SCHOOL
  if (genre === '部活' || sportCategory) return DM_CATEGORY.CLUB
  if (genre === '企業訪問' || hasFactorySignal(title, videoCategory)) return DM_CATEGORY.COMPANY
  if (
    genre === '観光' ||
    genre === 'イベント' ||
    genre === '行政・自治体' ||
    hasCultureSignal(title, videoCategory)
  ) {
    return DM_CATEGORY.TOURISM_CULTURE
  }

  if (genre) return DM_CATEGORY.TOURISM_CULTURE
  return ''
}

/** dm_keyword 候補（Instagram コメント反応用・短く） */
export function resolveDmKeyword(input) {
  const dm_category = resolveDmCategory(input)

  switch (dm_category) {
    case DM_CATEGORY.SCHOOL:
      return extractSchoolKeyword(input)
    case DM_CATEGORY.CLUB:
      return extractClubKeyword(input)
    case DM_CATEGORY.COMPANY:
      return extractCompanyKeyword(input)
    case DM_CATEGORY.TOURISM_CULTURE:
      return extractTourismKeyword(input)
    default:
      return truncate(shortenTitleForMessage(input.title), KEYWORD_MAX_LENGTH) || '北海道'
  }
}

/** dm_message の「〇〇」部分（メッセージは正式名称寄り） */
export function resolveMessageSubject(input, dm_category) {
  const clubName = String(input.clubName ?? '').trim()
  const schoolName = String(input.schoolName ?? '').trim()
  const companyName = String(input.companyName ?? '').trim()
  const title = String(input.title ?? '').trim()

  if (dm_category === DM_CATEGORY.CLUB) {
    return clubName || title || '部活動'
  }
  if (dm_category === DM_CATEGORY.SCHOOL) {
    return schoolName || title || '学校'
  }
  if (dm_category === DM_CATEGORY.COMPANY || dm_category === DM_CATEGORY.TOURISM_CULTURE) {
    return companyName || shortenTitleForMessage(title)
  }

  return shortenTitleForMessage(title)
}

function normalizeMessageSubject(subject) {
  return normalizeDmText(subject)
}

export function buildDmMessage(subject, dm_category) {
  const label = String(subject ?? '').trim() || 'この記事'

  if (dm_category === DM_CATEGORY.CLUB) {
    return `北海道未来図鑑で「${label}」の活動紹介を見ることができます。こちらからご覧ください。`
  }

  return `北海道未来図鑑で「${label}」の紹介記事を見ることができます。こちらからご覧ください。`
}

export function buildPostUrl(postId, siteUrl = PRODUCTION_SITE_URL) {
  return `${siteUrl.replace(/\/$/, '')}/post/${postId}`
}

/** 1行分の DM 候補を生成 */
export function suggestDmFields(input) {
  const dm_category = resolveDmCategory(input)
  const dm_keyword = normalizeDmText(resolveDmKeyword(input))
  const subject = normalizeMessageSubject(resolveMessageSubject(input, dm_category))
  const dm_message = normalizeDmText(buildDmMessage(subject, dm_category))
  const dm_url = input.postId ? buildPostUrl(input.postId, input.siteUrl) : ''

  return { dm_keyword, dm_url, dm_message, dm_category }
}
