import type { Post } from '@/types/post'

export type ExternalLinkItem = {
  emoji: string
  label: string
  url: string
}

type LinkFieldKey = keyof Pick<
  Post,
  | 'schoolOfficialSite'
  | 'schoolSns'
  | 'clubSns'
  | 'companyOfficialSite'
  | 'companySns'
  | 'recruitmentInfoUrl'
>

/** ユーザー向け表示ラベル（スプレッドシート列名とは別） */
const USER_FACING_LINKS = {
  officialSite: { emoji: '🌐', label: '公式サイト' },
  officialSns: { emoji: '📱', label: '公式SNS' },
  recruitment: { emoji: '📩', label: '募集情報はこちら' },
} as const

/** 外部リンクURLを正規化（空欄・不正値は null） */
export function normalizeExternalUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('@')) {
    return `https://www.instagram.com/${trimmed.slice(1).replace(/\/$/, '')}/`
  }

  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.includes('.')) return `https://${trimmed}`

  return null
}

function pickFirstLink(posts: Post[], fields: LinkFieldKey[]): string | null {
  for (const field of fields) {
    for (const post of posts) {
      const normalized = normalizeExternalUrl(post[field])
      if (normalized) return normalized
    }
  }
  return null
}

function toUserLink(
  kind: keyof typeof USER_FACING_LINKS,
  url: string | null,
): ExternalLinkItem | null {
  if (!url) return null
  const { emoji, label } = USER_FACING_LINKS[kind]
  return { emoji, label, url }
}

function buildPageLinks(
  posts: Post[],
  siteFields: LinkFieldKey[],
  snsFields: LinkFieldKey[],
): ExternalLinkItem[] {
  const links = [
    toUserLink('officialSite', pickFirstLink(posts, siteFields)),
    toUserLink('officialSns', pickFirstLink(posts, snsFields)),
    toUserLink('recruitment', pickFirstLink(posts, ['recruitmentInfoUrl'])),
  ]

  return links.filter((link): link is ExternalLinkItem => link != null)
}

/** 学校詳細ページ用の外部リンク */
export function getSchoolExternalLinks(posts: Post[]): ExternalLinkItem[] {
  return buildPageLinks(posts, ['schoolOfficialSite'], ['schoolSns'])
}

/** 部活詳細ページ用の外部リンク */
export function getClubExternalLinks(posts: Post[]): ExternalLinkItem[] {
  return buildPageLinks(
    posts,
    ['schoolOfficialSite'],
    ['clubSns', 'schoolSns'],
  )
}

/** 企業詳細ページ用の外部リンク */
export function getCompanyExternalLinks(posts: Post[]): ExternalLinkItem[] {
  return buildPageLinks(posts, ['companyOfficialSite'], ['companySns'])
}

/** 記事詳細ページ用の外部リンク */
export function getPostExternalLinks(post: Post): ExternalLinkItem[] {
  if (post.genre === '企業訪問' || post.companyName.trim()) {
    return buildPageLinks([post], ['companyOfficialSite'], ['companySns'])
  }

  if (post.genre === '部活' || post.clubName.trim()) {
    return buildPageLinks(
      [post],
      ['schoolOfficialSite'],
      ['clubSns', 'schoolSns'],
    )
  }

  return buildPageLinks([post], ['schoolOfficialSite'], ['schoolSns'])
}
