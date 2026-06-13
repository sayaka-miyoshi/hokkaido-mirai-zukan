import type { Metadata } from 'next'
import EntityPageLayout from '@/components/EntityPageLayout'
import EntityIndexList from '@/components/EntityIndexList'
import { createPageMetadata } from '@/lib/metadata'
import { getFetchResult, getSchoolIndex } from '@/lib/queries'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: '学校から探す',
  description: '北海道の学校一覧から、関連する部活・投稿を探せます。',
  path: urls.schools(),
})

export default async function SchoolsIndexPage() {
  const [fetchResult, schools] = await Promise.all([getFetchResult(), getSchoolIndex()])

  return (
    <EntityPageLayout
      title="学校から探す"
      description="学校名を選ぶと、関連する部活と投稿一覧が表示されます。"
      breadcrumbLabel="学校一覧"
      seoPath={urls.schools()}
      count={schools.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
    >
      <EntityIndexList
        items={schools.map((school) => ({
          href: urls.school(school.slug),
          title: school.name,
          subtitle: school.areas.length > 0 ? `📍 ${school.areas.join('・')}` : undefined,
          count: school.postCount,
          emoji: '🏫',
        }))}
        emptyMessage="学校データがまだありません。"
      />
    </EntityPageLayout>
  )
}
