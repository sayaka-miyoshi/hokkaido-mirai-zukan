import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EntityPageLayout from '@/components/EntityPageLayout'
import EntityLinkChips from '@/components/EntityLinkChips'
import PostGrid from '@/components/PostGrid'
import { getSportCrossLinks } from '@/lib/entity-cross-links'
import { buildSportSummary } from '@/lib/entity-summary'
import { createSportsOrganizationJsonLd } from '@/lib/json-ld'
import { createPageMetadata } from '@/lib/metadata'
import { getFetchResult, getPostsBySportSlug } from '@/lib/queries'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getPostsBySportSlug(slug)
  if (!result) return {}

  const description = buildSportSummary(result.name, result.posts)

  return createPageMetadata({
    title: `北海道の${result.name}部活・活動記事`,
    description,
    path: urls.sport(slug),
  })
}

export default async function SportCategoryPage({ params }: PageProps) {
  const { slug } = await params
  const [fetchResult, result] = await Promise.all([
    getFetchResult(),
    getPostsBySportSlug(slug),
  ])
  if (!result) notFound()

  const seoPath = urls.sport(slug)
  const description = buildSportSummary(result.name, result.posts)
  const crossLinks = getSportCrossLinks(fetchResult.posts, result.name)

  return (
    <EntityPageLayout
      title={result.name}
      description={description}
      breadcrumbLabel={result.name}
      breadcrumbItems={[
        { label: 'ホーム', href: urls.home() },
        { label: '競技一覧', href: urls.sports() },
        { label: result.name },
      ]}
      seoPath={seoPath}
      count={result.posts.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
      extraJsonLd={[
        createSportsOrganizationJsonLd({
          name: result.name,
          description,
          path: seoPath,
        }),
      ]}
    >
      <EntityLinkChips title="関連ページ" links={crossLinks} />

      <section>
        <h2 className="mb-3 text-lg font-bold">競技の記事</h2>
        <PostGrid posts={result.posts} />
      </section>
    </EntityPageLayout>
  )
}
