import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EntityPageLayout from '@/components/EntityPageLayout'
import ExternalLinks from '@/components/ExternalLinks'
import PostGrid from '@/components/PostGrid'
import { buildSchoolSummary } from '@/lib/entity-summary'
import { createEducationalOrganizationJsonLd } from '@/lib/json-ld'
import { createPageMetadata } from '@/lib/metadata'
import { getSchoolExternalLinks } from '@/lib/external-links'
import { getFetchResult, getPostsBySchoolSlug } from '@/lib/queries'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getPostsBySchoolSlug(slug)
  if (!result) return {}

  const description = buildSchoolSummary(result.name, result.posts)

  return createPageMetadata({
    title: `${result.name} | 学校紹介・部活一覧`,
    description,
    path: urls.school(slug),
  })
}

export default async function SchoolPage({ params }: PageProps) {
  const { slug } = await params
  const [fetchResult, result] = await Promise.all([
    getFetchResult(),
    getPostsBySchoolSlug(slug),
  ])
  if (!result) notFound()

  const seoPath = urls.school(slug)
  const description = buildSchoolSummary(result.name, result.posts)
  const areas = [...new Set(result.posts.map((post) => post.area.trim()).filter(Boolean))]

  return (
    <EntityPageLayout
      title={result.name}
      description={description}
      breadcrumbLabel={result.name}
      seoPath={seoPath}
      count={result.posts.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
      extraJsonLd={[
        createEducationalOrganizationJsonLd({
          name: result.name,
          description,
          path: seoPath,
          areas,
        }),
      ]}
    >
      <ExternalLinks links={getSchoolExternalLinks(result.posts)} />

      {result.clubs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">関連部活</h2>
          <ul className="flex flex-wrap gap-2">
            {result.clubs.map((club) => (
              <li key={club.slug}>
                <Link
                  href={urls.club(club.slug)}
                  className="inline-flex items-center gap-1 rounded-full border border-hokkaido-ice bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-pink-300 hover:text-pink-600"
                >
                  <span aria-hidden>⚽</span>
                  {club.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">学校の記事</h2>
        <PostGrid posts={result.posts} />
      </section>
    </EntityPageLayout>
  )
}
