import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EntityPageLayout from '@/components/EntityPageLayout'
import EntityLinkChips from '@/components/EntityLinkChips'
import PostGrid from '@/components/PostGrid'
import { getSportCrossLinks } from '@/lib/entity-cross-links'
import { buildSportSummary } from '@/lib/entity-summary'
import { createSportsOrganizationJsonLd } from '@/lib/json-ld'
import { createPageMetadata } from '@/lib/metadata'
import { parsePostDate } from '@/lib/dates'
import { getFetchResult, getPostsBySportSlug } from '@/lib/queries'
import { buildPostScoreMap, loadRankingSnapshot, sortPostsByRanking } from '@/lib/ranking/load-ranking'
import {
  buildFeaturedSportDescription,
  buildFeaturedSportTitle,
  FEATURED_SPORTS,
  isFeaturedSport,
} from '@/lib/sport-page-copy'
import { getSportSlug } from '@/lib/sport-slugs'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getPostsBySportSlug(slug)
  if (!result) return {}

  const description = isFeaturedSport(result.name)
    ? buildFeaturedSportDescription(result.name, result.posts.length)
    : buildSportSummary(result.name, result.posts)

  return createPageMetadata({
    title: buildFeaturedSportTitle(result.name),
    description,
    path: urls.sport(slug),
  })
}

export default async function SportCategoryPage({ params }: PageProps) {
  const { slug } = await params
  const [fetchResult, result, snapshot] = await Promise.all([
    getFetchResult(),
    getPostsBySportSlug(slug),
    loadRankingSnapshot(),
  ])
  if (!result) notFound()

  const scoreMap = buildPostScoreMap(snapshot)
  const rankedPosts = sortPostsByRanking(result.posts, scoreMap, parsePostDate)
  const featuredPosts = rankedPosts.slice(0, 3)
  const restPosts = rankedPosts.slice(3)

  const seoPath = urls.sport(slug)
  const description = isFeaturedSport(result.name)
    ? buildFeaturedSportDescription(result.name, result.posts.length)
    : buildSportSummary(result.name, result.posts)
  const crossLinks = getSportCrossLinks(fetchResult.posts, result.name)
  const featured = isFeaturedSport(result.name)

  const otherFeatured = FEATURED_SPORTS.filter((name) => name !== result.name).map((name) => ({
    name,
    href: urls.sport(getSportSlug(name)),
  }))

  return (
    <EntityPageLayout
      title={result.name}
      description={description}
      breadcrumbLabel={result.name}
      breadcrumbItems={[
        { label: 'ホーム', href: urls.home() },
        { label: '競技一覧', href: urls.sports() },
        { label: result.name },
      ]}
      seoPath={seoPath}
      count={result.posts.length}
      totalFetchedCount={fetchResult.posts.length}
      dataSource={fetchResult.source}
      dataError={fetchResult.error}
      extraJsonLd={[
        createSportsOrganizationJsonLd({
          name: result.name,
          description,
          path: seoPath,
        }),
      ]}
    >
      <EntityLinkChips title="関連ページ" links={crossLinks} />

      {featured && (
        <p className="mb-6 rounded-lg bg-magazine-cream px-4 py-3 text-sm leading-relaxed text-magazine-text">
          {description}
        </p>
      )}

      {featuredPosts.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold">人気の記事</h2>
          <PostGrid posts={featuredPosts} />
        </section>
      )}

      {restPosts.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">競技の記事</h2>
          <PostGrid posts={restPosts} />
        </section>
      )}

      {featured && otherFeatured.length > 0 && (
        <section className="mt-10 border-t border-hokkaido-ice pt-8">
          <h2 className="mb-3 text-lg font-bold">人気の競技を見る</h2>
          <ul className="flex flex-wrap gap-2">
            {otherFeatured.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="inline-block rounded-full bg-hokkaido-ice/60 px-4 py-2 text-sm font-medium text-hokkaido-sky hover:bg-hokkaido-ice"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </EntityPageLayout>
  )
}
