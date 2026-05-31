import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EntityPageLayout from '@/components/EntityPageLayout'
import PostGrid from '@/components/PostGrid'
import { createPageMetadata } from '@/lib/metadata'
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

  return createPageMetadata({
    title: `${result.name}の投稿一覧`,
    description: `${result.name}の企業訪問・見学に関する投稿を掲載しています。`,
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

  return (
    <EntityPageLayout
      title={result.name}
      description={`${result.name}に関する企業訪問・見学の投稿一覧です。`}
      breadcrumbLabel={result.name}
      count={result.posts.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
    >
      <PostGrid posts={result.posts} />
    </EntityPageLayout>
  )
}
