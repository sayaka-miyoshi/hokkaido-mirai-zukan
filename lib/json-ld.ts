import { OPERATOR_SOCIAL_URLS, SITE_NAME, SITE_TAGLINE, DEFAULT_OG_IMAGE_PATH } from '@/lib/site'
import { PROFILE_IMAGE_PATH } from '@/lib/branding-paths'
import { OPERATOR_PAGE } from '@/lib/operator-page'
import { absoluteUrl, getSiteUrl } from '@/lib/site-url'
import type { Post } from '@/types/post'

function organizationId(): string {
  return `${getSiteUrl()}/#organization`
}

function websiteId(): string {
  return `${getSiteUrl()}/#website`
}

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

/** サイト全体の Organization スキーマ */
export function createOrganizationJsonLd() {
  return {
    '@type': 'Organization',
    '@id': organizationId(),
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    },
    sameAs: [...OPERATOR_SOCIAL_URLS],
  }
}

/** トップページ用 WebSite + Organization */
export function createWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      createOrganizationJsonLd(),
      {
        '@type': 'WebSite',
        '@id': websiteId(),
        name: SITE_NAME,
        description: SITE_TAGLINE,
        url: getSiteUrl(),
        inLanguage: 'ja',
        publisher: { '@id': organizationId() },
      },
    ],
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
    inLanguage: 'ja',
    ...(post.genre ? { articleSection: post.genre } : {}),
    ...(datePublished ? { datePublished } : {}),
    author: { '@id': organizationId() },
    publisher: {
      '@type': 'Organization',
      '@id': organizationId(),
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
      },
    },
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

type CollectionPageJsonLdParams = {
  name: string
  description: string
  path: string
}

/** 一覧・学校/部活/企業ページ用 CollectionPage */
export function createCollectionPageJsonLd({ name, description, path }: CollectionPageJsonLdParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: 'ja',
    isPartOf: { '@id': websiteId() },
    publisher: { '@id': organizationId() },
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
