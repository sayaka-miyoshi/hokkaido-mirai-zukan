import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EntityPageLayout from '@/components/EntityPageLayout'
import ExternalLinks from '@/components/ExternalLinks'
import PostGrid from '@/components/PostGrid'
import { buildCompanySummary } from '@/lib/entity-summary'
import { createBusinessOrganizationJsonLd } from '@/lib/json-ld'
import { createPageMetadata } from '@/lib/metadata'
import { getCompanyExternalLinks } from '@/lib/external-links'
import { getFetchResult, getPostsByCompanySlug } from '@/lib/queries'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getPostsByCompanySlug(slug)
  if (!result) return {}

  const description = buildCompanySummary(result.name, result.posts)

  return createPageMetadata({
    title: `${result.name}の投稿一覧`,
    description,
    path: urls.company(slug),
  })
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params
  const [fetchResult, result] = await Promise.all([
    getFetchResult(),
    getPostsByCompanySlug(slug),
  ])
  if (!result) notFound()

  const seoPath = urls.company(slug)
  const description = buildCompanySummary(result.name, result.posts)
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
        createBusinessOrganizationJsonLd({
          name: result.name,
          description,
          path: seoPath,
          areas,
        }),
      ]}
    >
      <ExternalLinks links={getCompanyExternalLinks(result.posts)} />
      <PostGrid posts={result.posts} />
    </EntityPageLayout>
  )
}
