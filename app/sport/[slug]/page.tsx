import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EntityPageLayout from '@/components/EntityPageLayout'
import PostGrid from '@/components/PostGrid'
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

  return createPageMetadata({
    title: `${result.name}の投稿一覧`,
    description: `競技カテゴリ「${result.name}」に関する部活動の投稿を掲載しています。`,
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

  return (
    <EntityPageLayout
      title={result.name}
      description={`競技カテゴリ「${result.name}」の投稿一覧です。`}
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
