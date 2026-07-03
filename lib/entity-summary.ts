import type { Post } from '@/types/post'

function uniqueNames(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))]
}

function joinNames(names: string[], max = 4): string {
  const list = uniqueNames(names)
  if (list.length === 0) return ''
  if (list.length <= max) return list.join('、')
  return `${list.slice(0, max).join('、')}ほか`
}

function clamp(text: string, max = 140): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1)}…`
}

/** 記事リード文（ai_summary 優先） */
export function resolvePostLeadSummary(post: Post): string {
  const manual = post.aiSummary.trim()
  if (manual) return manual

  const description = post.description.trim()
  if (description) return clamp(description, 160)

  const parts = [post.schoolName, post.clubName, post.companyName, post.sportCategory]
    .map((p) => p.trim())
    .filter(Boolean)

  if (parts.length > 0) {
    return clamp(`${parts.join('・')}に関する紹介記事です。`)
  }

  return clamp(post.title, 160)
}

export function buildSchoolSummary(schoolName: string, posts: Post[]): string {
  const areas = joinNames(posts.map((p) => p.area))
  const clubs = joinNames(posts.map((p) => p.clubName))
  const count = posts.length

  return clamp(
    `${schoolName}の紹介記事を${count}件掲載。` +
      (areas ? `${areas}エリア。` : '') +
      (clubs ? ` ${clubs}などの部活動・学校イベントを紹介しています。` : ''),
    160,
  )
}

export function buildSportSummary(sportName: string, posts: Post[]): string {
  const schools = joinNames(posts.map((p) => p.schoolName))
  const count = posts.length

  return clamp(
    `北海道内の${sportName}に関する部活動紹介を${count}件掲載。` +
      (schools ? `${schools}などの活動記事があります。` : '練習・大会の様子を動画で紹介しています。'),
    160,
  )
}

export function buildCompanySummary(companyName: string, posts: Post[]): string {
  const areas = joinNames(posts.map((p) => p.area))
  const count = posts.length

  return clamp(
    `${companyName}の企業訪問・職場紹介を${count}件掲載。` +
      (areas ? `${areas}を中心に、` : '') +
      '仕事内容や見学の様子を紹介しています。',
    160,
  )
}

export function buildClubSummary(clubName: string, posts: Post[]): string {
  const schools = joinNames(posts.map((p) => p.schoolName))
  const sport = posts.find((p) => p.sportCategory.trim())?.sportCategory.trim()
  const count = posts.length

  return clamp(
    `${clubName}の活動紹介を${count}件掲載。` +
      (schools ? `${schools}の記事があります。` : '') +
      (sport ? ` 競技カテゴリ: ${sport}。` : ''),
    160,
  )
}
