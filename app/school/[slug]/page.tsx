import type { Metadata } from 'next'
import Link from 'next/link'
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
    title: `${result.name} | 学校紹介・部活一覧`,
    description: `${result.name}の関連部活と投稿一覧。部活動や学校イベントの記録をご覧いただけます。`,
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
      description={`${result.name}の関連部活と投稿一覧です。`}
      breadcrumbLabel={result.name}
      count={result.posts.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
    >
      {result.clubs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">関連部活</h2>
          <ul className="flex flex-wrap gap-2">
            {result.clubs.map((club) => (
              <li key={club.slug}>
                <Link
                  href={urls.club(club.slug)}
                  className="inline-flex items-center gap-1 rounded-full border border-hokkaido-ice bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-pink-300 hover:text-pink-600"
                >
                  <span aria-hidden>⚽</span>
                  {club.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold mb-3">関連投稿一覧</h2>
        <PostGrid posts={result.posts} />
      </section>
    </EntityPageLayout>
  )
}
