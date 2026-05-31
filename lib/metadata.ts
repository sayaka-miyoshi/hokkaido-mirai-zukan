import type { Metadata } from 'next'

const SITE_NAME = '北海道未来図鑑'

type PageMetadataParams = {
  title: string
  description: string
  path: string
}

/** 各ページの SEO メタデータ生成 */
export function createPageMetadata({ title, description, path }: PageMetadataParams): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      locale: 'ja_JP',
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
    alternates: {
      canonical: path,
    },
  }
}

export { SITE_NAME }
