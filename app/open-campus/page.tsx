import type { Metadata } from 'next'
import OpenCampusGrid from '@/components/OpenCampusGrid'
import EntityPageLayout from '@/components/EntityPageLayout'
import { OPEN_CAMPUS_SECTION } from '@/lib/home-layout'
import { createPageMetadata } from '@/lib/metadata'
import { getOpenCampusPosts } from '@/lib/open-campus-posts'
import { getFetchResult } from '@/lib/queries'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: OPEN_CAMPUS_SECTION.title,
  description: OPEN_CAMPUS_SECTION.deck,
  path: urls.openCampus(),
})

/** オープンキャンパス特集 — G列またはH列がオープンキャンパスの記事一覧 */
export default async function OpenCampusPage() {
  const fetchResult = await getFetchResult()
  const openCampusPosts = getOpenCampusPosts(fetchResult.posts)

  return (
    <EntityPageLayout
      title={OPEN_CAMPUS_SECTION.title}
      description={OPEN_CAMPUS_SECTION.deck}
      breadcrumbLabel="オープンキャンパス特集"
      seoPath={urls.openCampus()}
      count={openCampusPosts.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
    >
      <OpenCampusGrid posts={openCampusPosts} />
    </EntityPageLayout>
  )
}
