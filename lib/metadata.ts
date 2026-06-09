import type { Metadata } from 'next'
import { DEFAULT_POST_IMAGE } from '@/lib/og-image'
import { DEFAULT_OG_IMAGE_PATH, GOOGLE_SITE_VERIFICATION, SITE_NAME, SITE_TAGLINE } from '@/lib/site'
import { absoluteUrl, getSiteUrl } from '@/lib/site-url'

type PageMetadataParams = {
  title: string
  description?: string
  path: string
  /** トップページなど、サイト名のみを title に使う */
  absoluteTitle?: boolean
  image?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

function resolveMetadataImage(image?: string): string {
  if (!image?.trim() || image.includes('default-post')) {
    return DEFAULT_OG_IMAGE_PATH
  }
  return image.trim()
}

function buildGoogleVerification(): Metadata['verification'] | undefined {
  const token = process.env.GOOGLE_SITE_VERIFICATION?.trim() || GOOGLE_SITE_VERIFICATION
  if (!token) return undefined
  return { google: token }
}

/** ルート layout 用の共通メタデータ */
export function createRootMetadata(): Metadata {
  const siteUrl = getSiteUrl()
  const googleVerification = buildGoogleVerification()

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_TAGLINE,
    applicationName: SITE_NAME,
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_TAGLINE,
      url: siteUrl,
      images: [
        {
          url: DEFAULT_OG_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_TAGLINE,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    ...(googleVerification ? { verification: googleVerification } : {}),
  }
}

/** 各ページの SEO メタデータ生成 */
export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  image,
  type = 'website',
  noIndex = false,
}: PageMetadataParams): Metadata {
  const desc = description?.trim() || SITE_TAGLINE
  const pageTitle = absoluteTitle ? { absolute: title } : title
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`
  const ogImage = resolveMetadataImage(image)

  return {
    title: pageTitle,
    description: desc,
    openGraph: {
      title: fullTitle,
      description: desc,
      type,
      locale: 'ja_JP',
      siteName: SITE_NAME,
      url: path,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [ogImage.startsWith('http') ? ogImage : absoluteUrl(ogImage)],
    },
    alternates: {
      canonical: path,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
          },
        },
  }
}

export { DEFAULT_POST_IMAGE, SITE_NAME }
