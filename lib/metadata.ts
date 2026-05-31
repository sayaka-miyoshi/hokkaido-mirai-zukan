import type { Metadata } from 'next'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

type PageMetadataParams = {
  title: string
  description?: string
  path: string
}

/** 各ページの SEO メタデータ生成 */
export function createPageMetadata({ title, description, path }: PageMetadataParams): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`
  const desc = description ?? SITE_TAGLINE

  return {
    title: fullTitle,
    description: desc,
    openGraph: {
      title: fullTitle,
      description: desc,
      type: 'website',
      locale: 'ja_JP',
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
    },
    alternates: {
      canonical: path,
    },
  }
}

export { SITE_NAME }
