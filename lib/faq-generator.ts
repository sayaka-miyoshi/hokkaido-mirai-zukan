import type { Post } from '@/types/post'

export type FaqItem = {
  question: string
  answer: string
}

function clamp(text: string, max = 220): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1)}…`
}

function excerpt(post: Post): string {
  return clamp(post.description.trim() || post.title)
}

/** スプレッドシート faq_json 列をパース（上書き用） */
export function parseFaqJson(raw: string): FaqItem[] | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    const parsed = JSON.parse(trimmed) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null

    const items: FaqItem[] = []
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue
      const record = entry as Record<string, unknown>
      const question = String(record.q ?? record.question ?? '').trim()
      const answer = String(record.a ?? record.answer ?? '').trim()
      if (question && answer) items.push({ question, answer })
    }

    return items.length > 0 ? items : null
  } catch {
    return null
  }
}

function clubFaqs(post: Post): FaqItem[] {
  const school = post.schoolName.trim()
  const club = post.clubName.trim()
  const sport = post.sportCategory.trim()
  const label = club || sport || 'この部活動'
  const items: FaqItem[] = [
    {
      question: `${label}はどんな活動をしていますか？`,
      answer: excerpt(post) || `${label}の活動紹介です。`,
    },
  ]

  if (school) {
    items.push({
      question: `どこの学校の部活動ですか？`,
      answer: `${school}（${post.area.trim() || '北海道'}）の部活動です。`,
    })
  }

  if (post.recruitmentInfo.trim()) {
    items.push({
      question: '部員募集はありますか？',
      answer: clamp(post.recruitmentInfo),
    })
  } else {
    items.push({
      question: '部員募集の情報はありますか？',
      answer: '募集状況は記事本文・Instagramをご確認ください。',
    })
  }

  return items
}

function schoolFaqs(post: Post): FaqItem[] {
  const school = post.schoolName.trim() || post.title
  const items: FaqItem[] = [
    {
      question: `${school}はどこにありますか？`,
      answer: post.area.trim()
        ? `${school}は${post.area}エリアの学校です。`
        : `${school}の紹介記事です。`,
    },
    {
      question: `${school}について教えてください`,
      answer: excerpt(post),
    },
  ]

  if (post.clubName.trim()) {
    items.push({
      question: 'どんな部活動が紹介されていますか？',
      answer: `${post.clubName.trim()}などの活動を掲載しています。`,
    })
  }

  return items
}

function companyFaqs(post: Post): FaqItem[] {
  const company = post.companyName.trim() || post.title
  return [
    {
      question: `${company}はどんな企業・施設ですか？`,
      answer: excerpt(post),
    },
    {
      question: '見学やインターンはできますか？',
      answer: post.recruitmentInfo.trim()
        ? clamp(post.recruitmentInfo)
        : '詳細は記事本文・公式情報をご確認ください。',
    },
  ]
}

function defaultFaqs(post: Post): FaqItem[] {
  return [
    {
      question: `「${clamp(post.title, 40)}」とは何ですか？`,
      answer: excerpt(post) || '北海道の学校・部活・企業を紹介する記事です。',
    },
    {
      question: 'どこで詳しく見られますか？',
      answer: '北海道未来図鑑の本記事とInstagramで紹介しています。',
    },
  ]
}

/** ジャンルに応じた FAQ を自動生成 */
export function generateFaqForPost(post: Post): FaqItem[] {
  const genre = post.genre.trim()

  if (genre === '部活' || post.sportCategory.trim()) return clubFaqs(post)
  if (genre === '学校') return schoolFaqs(post)
  if (genre === '企業訪問') return companyFaqs(post)

  return defaultFaqs(post)
}

/** faq_json 優先、なければ自動生成（最大5件） */
export function resolvePostFaq(post: Post): FaqItem[] {
  const override = parseFaqJson(post.faqJson)
  if (override) return override.slice(0, 8)

  return generateFaqForPost(post).slice(0, 5)
}
