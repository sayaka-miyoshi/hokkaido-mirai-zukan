import { OPERATOR_SOCIAL_URLS, SITE_NAME, SITE_TAGLINE } from '@/lib/site'
import { PROFILE_IMAGE_PATH } from '@/lib/branding-paths'
import { OPERATOR_PAGE } from '@/lib/operator-page'
import { absoluteUrl, getSiteUrl } from '@/lib/site-url'
import type { Post } from '@/types/post'

function toIsoDate(date: string): string | undefined {
  const trimmed = date.trim()
  if (!trimmed) return undefined

  const slashMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (slashMatch) {
    const [, y, m, d] = slashMatch
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  const parsed = Date.parse(trimmed)
  if (Number.isNaN(parsed)) return undefined
  return new Date(parsed).toISOString().slice(0, 10)
}

/** トップページ用 WebSite スキーマ */
export function createWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: SITE_TAGLINE,
    url: getSiteUrl(),
    inLanguage: 'ja',
    publisher: createOrganizationJsonLd(),
  }
}

/** サイト全体の Organization スキーマ */
export function createOrganizationJsonLd() {
  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: getSiteUrl(),
    sameAs: [...OPERATOR_SOCIAL_URLS],
  }
}

type ArticleJsonLdParams = {
  post: Post
  imageUrl: string
  pageUrl: string
}

/** 投稿詳細用 Article スキーマ */
export function createArticleJsonLd({ post, imageUrl, pageUrl }: ArticleJsonLdParams) {
  const datePublished = toIsoDate(post.date)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: [absoluteUrl(imageUrl)],
    url: pageUrl,
    datePublished,
    author: createOrganizationJsonLd(),
    publisher: createOrganizationJsonLd(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  }
}

type BreadcrumbItem = {
  name: string
  href?: string
}

/** パンくずリスト用 BreadcrumbList スキーマ */
export function createBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  }
}

/** 運営者ページ用 Person スキーマ */
export function createPersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: '三好清佳',
    alternateName: 'Sayaka Miyoshi',
    jobTitle: [...OPERATOR_PAGE.titles],
    image: absoluteUrl(PROFILE_IMAGE_PATH),
    description: OPERATOR_PAGE.schemaDescription,
    url: absoluteUrl(OPERATOR_PAGE.path),
    sameAs: [...OPERATOR_PAGE.sameAs],
  }
}
