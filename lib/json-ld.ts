import { OPERATOR_SOCIAL_URLS, SITE_NAME, SITE_TAGLINE, DEFAULT_OG_IMAGE_PATH } from '@/lib/site'
import { PROFILE_IMAGE_PATH } from '@/lib/branding-paths'
import { OPERATOR_PAGE } from '@/lib/operator-page'
import { absoluteUrl, getSiteUrl } from '@/lib/site-url'
import type { FaqItem } from '@/lib/faq-generator'
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
  faqItems?: FaqItem[]
  leadSummary?: string
}

function postKeywords(post: Post): string[] {
  return [
    post.genre,
    post.schoolName,
    post.clubName,
    post.companyName,
    post.sportCategory,
    post.careerCategory,
    post.area,
  ]
    .map((value) => value.trim())
    .filter(Boolean)
}

function postAboutEntities(post: Post, pageUrl: string) {
  const entities: Record<string, string>[] = []

  if (post.schoolName.trim()) {
    entities.push({ '@type': 'EducationalOrganization', name: post.schoolName.trim() })
  }
  if (post.sportCategory.trim()) {
    entities.push({ '@type': 'SportsActivity', name: post.sportCategory.trim() })
  }
  if (post.companyName.trim()) {
    entities.push({ '@type': 'Organization', name: post.companyName.trim() })
  }
  if (post.area.trim()) {
    entities.push({ '@type': 'Place', name: post.area.trim() })
  }

  return entities.length > 0 ? entities : [{ '@type': 'WebPage', '@id': pageUrl }]
}

/** 投稿詳細用 Article スキーマ */
export function createArticleJsonLd({
  post,
  imageUrl,
  pageUrl,
  faqItems = [],
  leadSummary,
}: ArticleJsonLdParams) {
  const datePublished = toIsoDate(post.date)
  const keywords = postKeywords(post)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: leadSummary?.trim() || post.description,
    image: [absoluteUrl(imageUrl)],
    url: pageUrl,
    inLanguage: 'ja',
    ...(post.genre ? { articleSection: post.genre } : {}),
    ...(keywords.length > 0 ? { keywords: keywords.join(', ') } : {}),
    ...(datePublished ? { datePublished } : {}),
    about: postAboutEntities(post, pageUrl),
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
    ...(faqItems.length > 0
      ? {
          mainEntity: {
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          },
        }
      : {}),
  }
}

/** FAQ 専用 JSON-LD（Article と併用可） */
export function createFaqPageJsonLd(faqItems: FaqItem[], pageUrl: string) {
  if (faqItems.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
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

/** 学校ページ用 EducationalOrganization */
export function createEducationalOrganizationJsonLd(params: {
  name: string
  description: string
  path: string
  areas?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.path),
    ...(params.areas && params.areas.length > 0
      ? { address: { '@type': 'PostalAddress', addressRegion: params.areas.join('、') } }
      : {}),
    parentOrganization: { '@id': organizationId() },
  }
}

/** 競技ページ用 SportsOrganization */
export function createSportsOrganizationJsonLd(params: {
  name: string
  description: string
  path: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.path),
    sport: params.name,
    parentOrganization: { '@id': organizationId() },
  }
}

/** 企業ページ用 Organization */
export function createBusinessOrganizationJsonLd(params: {
  name: string
  description: string
  path: string
  areas?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.path),
    ...(params.areas && params.areas.length > 0
      ? { areaServed: params.areas.join('、') }
      : {}),
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
