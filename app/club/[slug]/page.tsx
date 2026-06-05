import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EntityPageLayout from '@/components/EntityPageLayout'
import ExternalLinks from '@/components/ExternalLinks'
import PostGrid from '@/components/PostGrid'
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

  return createPageMetadata({
    title: `${result.name}の投稿一覧`,
    description: `${result.name}に関する部活動の投稿を掲載しています。`,
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

  return (
    <EntityPageLayout
      title={result.name}
      description={`${result.name}に関する投稿一覧です。練習風景や大会の様子などをご覧いただけます。`}
      breadcrumbLabel={result.name}
      count={result.posts.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
    >
      <ExternalLinks links={getClubExternalLinks(result.posts)} />
      <PostGrid posts={result.posts} />
    </EntityPageLayout>
  )
}
