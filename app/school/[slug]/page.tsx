import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EntityPageLayout from '@/components/EntityPageLayout'
import PostGrid from '@/components/PostGrid'
import { createPageMetadata } from '@/lib/metadata'
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

  return createPageMetadata({
    title: `${result.name}の投稿一覧`,
    description: `${result.name}に関する学校紹介・部活・企業訪問の投稿を掲載しています。`,
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

  return (
    <EntityPageLayout
      title={result.name}
      description={`${result.name}に関する投稿一覧です。部活動や学校イベント、企業訪問の記録をご覧いただけます。`}
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
