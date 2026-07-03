import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EntityPageLayout from '@/components/EntityPageLayout'
import ExternalLinks from '@/components/ExternalLinks'
import PostGrid from '@/components/PostGrid'
import { buildClubSummary } from '@/lib/entity-summary'
import { createSportsOrganizationJsonLd } from '@/lib/json-ld'
import { createPageMetadata } from '@/lib/metadata'
import { getClubExternalLinks } from '@/lib/external-links'
import { getFetchResult, getPostsByClubSlug } from '@/lib/queries'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getPostsByClubSlug(slug)
  if (!result) return {}

  const description = buildClubSummary(result.name, result.posts)

  return createPageMetadata({
    title: `${result.name}の投稿一覧`,
    description,
    path: urls.club(slug),
  })
}

export default async function ClubPage({ params }: PageProps) {
  const { slug } = await params
  const [fetchResult, result] = await Promise.all([
    getFetchResult(),
    getPostsByClubSlug(slug),
  ])
  if (!result) notFound()

  const seoPath = urls.club(slug)
  const description = buildClubSummary(result.name, result.posts)
  const sportName = result.posts.find((post) => post.sportCategory.trim())?.sportCategory.trim()

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
      extraJsonLd={
        sportName
          ? [
              createSportsOrganizationJsonLd({
                name: sportName,
                description,
                path: seoPath,
              }),
            ]
          : []
      }
    >
      <ExternalLinks links={getClubExternalLinks(result.posts)} />

      <section>
        <h2 className="mb-3 text-lg font-bold">部活の記事</h2>
        <PostGrid posts={result.posts} />
      </section>

      {result.relatedPosts.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">同じ競技の記事</h2>
          <PostGrid posts={result.relatedPosts} />
        </section>
      )}
    </EntityPageLayout>
  )
}
