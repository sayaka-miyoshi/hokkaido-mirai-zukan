import type { Metadata } from 'next'
import CompanyRecommendedGrid from '@/components/CompanyRecommendedGrid'
import EntityPageLayout from '@/components/EntityPageLayout'
import { getCompanyRecommendedPosts } from '@/lib/company-recommended-posts'
import { COMPANY_CONTENT_MAX, COMPANY_SECTION } from '@/lib/home-layout'
import { createPageMetadata } from '@/lib/metadata'
import { getFetchResult } from '@/lib/queries'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: COMPANY_SECTION.title,
  description: `${COMPANY_SECTION.lead} ${COMPANY_SECTION.description.replace(/\n/g, ' ')}`,
  path: urls.companies(),
})

/** 企業おすすめ記事一覧（TOP「北海道の企業を知ろう」と同内容） */
export default async function CompaniesIndexPage() {
  const fetchResult = await getFetchResult()
  const companyPosts = getCompanyRecommendedPosts(fetchResult.posts, COMPANY_CONTENT_MAX)

  return (
    <EntityPageLayout
      title={COMPANY_SECTION.title}
      description={COMPANY_SECTION.lead}
      breadcrumbLabel="企業一覧"
      seoPath={urls.companies()}
      count={companyPosts.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
    >
      <p className="mb-8 whitespace-pre-line text-sm leading-[1.85] text-gray-700">
        {COMPANY_SECTION.description}
      </p>
      <CompanyRecommendedGrid posts={companyPosts} />
    </EntityPageLayout>
  )
}
