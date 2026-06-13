import type { MetadataRoute } from 'next'
import { getEnabledContactMenuItems } from '@/lib/contact/forms'
import { getSiteUrl } from '@/lib/site-url'
import { urls } from '@/lib/urls'

export default function robots(): MetadataRoute.Robots {
  const completePaths = getEnabledContactMenuItems().map((item) =>
    urls.contactComplete(item.type),
  )

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...completePaths, '/mock', '/api/'],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    host: getSiteUrl(),
  }
}
