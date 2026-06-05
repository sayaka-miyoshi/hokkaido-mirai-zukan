import type { Metadata } from 'next'
import EntityPageLayout from '@/components/EntityPageLayout'
import EntityIndexList from '@/components/EntityIndexList'
import { createPageMetadata } from '@/lib/metadata'
import { getClubIndex, getFetchResult } from '@/lib/queries'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: '部活から探す',
  description: '部活名から、練習風景や大会の投稿を探せます。',
  path: urls.clubs(),
})

export default async function ClubsIndexPage() {
  const [fetchResult, clubs] = await Promise.all([getFetchResult(), getClubIndex()])

  return (
    <EntityPageLayout
      title="部活から探す"
      description="部活名を選ぶと、関連する投稿一覧が表示されます。"
      breadcrumbLabel="部活一覧"
      count={clubs.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
    >
      <EntityIndexList
        items={clubs.map((club) => ({
          href: urls.club(club.slug),
          title: club.name,
          subtitle: club.schoolName ? `🏫 ${club.schoolName}` : undefined,
          count: club.postCount,
          emoji: '⚽',
        }))}
        emptyMessage="部活データがまだありません。"
      />
    </EntityPageLayout>
  )
}
