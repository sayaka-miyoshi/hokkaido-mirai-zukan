import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EntityPageLayout from '@/components/EntityPageLayout'
import EntityLinkChips from '@/components/EntityLinkChips'
import ExternalLinks from '@/components/ExternalLinks'
import PostGrid from '@/components/PostGrid'
import { getCompanyCrossLinks } from '@/lib/entity-cross-links'
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
    title: `${result.name}の企業訪問・仕事紹介`,
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
  const crossLinks = getCompanyCrossLinks(fetchResult.posts, result.name)

  return (
    <EntityPageLayout
      title={result.name}
      description={description}
      breadcrumbLabel={result.name}
      breadcrumbItems={[
        { label: 'ホーム', href: urls.home() },
        { label: '企業一覧', href: urls.companies() },
        { label: result.name },
      ]}
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

      <EntityLinkChips title="関連ページ" links={crossLinks} />

      <section>
        <h2 className="mb-3 text-lg font-bold">企業の記事</h2>
        <PostGrid posts={result.posts} />
      </section>

      {result.relatedPosts.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">企業関連記事</h2>
          <PostGrid posts={result.relatedPosts} />
        </section>
      )}
    </EntityPageLayout>
  )
}
