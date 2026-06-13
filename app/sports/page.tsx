import type { Metadata } from 'next'
import EntityPageLayout from '@/components/EntityPageLayout'
import EntityIndexList from '@/components/EntityIndexList'
import { createPageMetadata } from '@/lib/metadata'
import { getFetchResult, getSportIndex } from '@/lib/queries'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: '競技カテゴリから探す',
  description: '競技・種目ごとに部活動の投稿を探せます。',
  path: urls.sports(),
})

export default async function SportsIndexPage() {
  const [fetchResult, sports] = await Promise.all([getFetchResult(), getSportIndex()])

  return (
    <EntityPageLayout
      title="競技カテゴリから探す"
      description="YOSAKOI・球技など、競技カテゴリ別の投稿一覧です。"
      breadcrumbLabel="競技カテゴリ一覧"
      seoPath={urls.sports()}
      count={sports.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
    >
      <EntityIndexList
        items={sports.map((sport) => ({
          href: urls.sport(sport.slug),
          title: sport.name,
          count: sport.postCount,
          emoji: '🏅',
        }))}
        emptyMessage="競技カテゴリがまだありません。部活マスターとX列の数式を確認してください。"
      />
    </EntityPageLayout>
  )
}
