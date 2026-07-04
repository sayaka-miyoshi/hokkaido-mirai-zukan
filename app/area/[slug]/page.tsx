import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import EntityPageLayout from '@/components/EntityPageLayout'
import PageViewTracker from '@/components/PageViewTracker'
import PostGrid from '@/components/PostGrid'
import { createPageMetadata } from '@/lib/metadata'
import { getFetchResult, getPostsByAreaSlug } from '@/lib/queries'
import { isAsciiSlug, normalizeAreaSlugParam } from '@/lib/slugs'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getPostsByAreaSlug(slug)
  if (!result) return {}

  return createPageMetadata({
    title: `${result.areaName}エリアの投稿一覧`,
    description: `${result.areaName}エリアの学校・部活・企業訪問に関する投稿を掲載しています。`,
    path: urls.area(result.slug),
  })
}

export default async function AreaPage({ params }: PageProps) {
  const { slug: rawSlug } = await params
  const normalizedSlug = normalizeAreaSlugParam(rawSlug)

  // 旧日本語 URL（/area/洞爺湖）→ ASCII slug へリダイレクト
  if (!isAsciiSlug(rawSlug) || rawSlug !== normalizedSlug) {
    redirect(urls.area(normalizedSlug))
  }

  const [fetchResult, result] = await Promise.all([
    getFetchResult(),
    getPostsByAreaSlug(normalizedSlug),
  ])
  if (!result) notFound()

  return (
    <EntityPageLayout
      title={`${result.areaName}エリア`}
      description={`${result.areaName}エリアに関する学校・部活・企業訪問の投稿一覧です。`}
      breadcrumbLabel={`${result.areaName}エリア`}
      seoPath={urls.area(result.slug)}
      count={result.posts.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
    >
      <PageViewTracker pageType="area" entitySlug={result.slug} />
      <PostGrid posts={result.posts} />
    </EntityPageLayout>
  )
}
