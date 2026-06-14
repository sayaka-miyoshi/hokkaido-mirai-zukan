import type { MetadataRoute } from 'next'
import { getEnabledContactMenuItems } from '@/lib/contact/forms'
import {
  getAllAreaSlugs,
  getAllClubSlugs,
  getAllCompanySlugs,
  getAllPosts,
  getAllSchoolSlugs,
  getAllSportSlugs,
} from '@/lib/queries'
import { getSiteUrl } from '@/lib/site-url'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

function toLastModified(date: string): Date | undefined {
  const trimmed = date.trim()
  if (!trimmed) return undefined

  const slashMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (slashMatch) {
    const [, y, m, d] = slashMatch
    return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00.000Z`)
  }

  const parsed = Date.parse(trimmed)
  return Number.isNaN(parsed) ? undefined : new Date(parsed)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const [posts, areaSlugs, schoolSlugs, clubSlugs, companySlugs, sportSlugs] =
    await Promise.all([
      getAllPosts(),
      getAllAreaSlugs(),
      getAllSchoolSlugs(),
      getAllClubSlugs(),
      getAllCompanySlugs(),
      getAllSportSlugs(),
    ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}${urls.home()}`, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}${urls.operator()}`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}${urls.schools()}`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}${urls.clubs()}`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}${urls.companies()}`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}${urls.sports()}`, changeFrequency: 'weekly', priority: 0.8 },
  ]

  const contactPages: MetadataRoute.Sitemap = getEnabledContactMenuItems().map((item) => ({
    url: `${siteUrl}${urls.contact(item.type)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }))

  const areaPages: MetadataRoute.Sitemap = areaSlugs.map((slug) => ({
    url: `${siteUrl}${urls.area(slug)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const entityPages: MetadataRoute.Sitemap = [
    ...schoolSlugs.map((slug) => ({
      url: `${siteUrl}${urls.school(slug)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...clubSlugs.map((slug) => ({
      url: `${siteUrl}${urls.club(slug)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...companySlugs.map((slug) => ({
      url: `${siteUrl}${urls.company(slug)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...sportSlugs.map((slug) => ({
      url: `${siteUrl}${urls.sport(slug)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}${urls.post(post.id)}`,
    lastModified: toLastModified(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...contactPages, ...areaPages, ...entityPages, ...postPages]
}
