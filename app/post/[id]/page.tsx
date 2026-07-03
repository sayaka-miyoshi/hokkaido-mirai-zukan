import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ArticleFaqSection from '@/components/ArticleFaqSection'
import Breadcrumb from '@/components/Breadcrumb'
import DataFetchAlert from '@/components/DataFetchAlert'
import ExternalLinks from '@/components/ExternalLinks'
import JsonLd from '@/components/JsonLd'
import PostThumbnail from '@/components/PostThumbnail'
import RecruitmentBadge from '@/components/RecruitmentBadge'
import RelatedPostsSection from '@/components/RelatedPostsSection'
import ContactTeaser from '@/components/home/ContactTeaser'
import SiteHeader from '@/components/SiteHeader'
import { getPostEntityLinks } from '@/lib/entity-cross-links'
import { resolvePostLeadSummary } from '@/lib/entity-summary'
import { resolvePostFaq } from '@/lib/faq-generator'
import { createPageMetadata } from '@/lib/metadata'
import { resolvePostImageUrl } from '@/lib/og-image'
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createFaqPageJsonLd,
} from '@/lib/json-ld'
import { absoluteUrl } from '@/lib/site-url'
import { getPostExternalLinks } from '@/lib/external-links'
import {
  getClubSlugForPost,
  getCompanySlugForPost,
  getFetchResult,
  getPostById,
  getSchoolSlugForPost,
} from '@/lib/queries'
import { getAreaSlug } from '@/lib/slugs'
import { getSportSlug } from '@/lib/sport-slugs'
import { getGenreBadgeClass } from '@/lib/genres'
import { getRelatedPostSections } from '@/lib/related-posts'
import { INSTAGRAM_HANDLE, SITE_NAME } from '@/lib/site'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getPostById(id)
  if (!post) return {}

  const imageUrl = await resolvePostImageUrl(post.imageUrl, post.instagramUrl, post.genre)
  const leadSummary = resolvePostLeadSummary(post)

  return createPageMetadata({
    title: post.title,
    description: leadSummary,
    path: urls.post(id),
    image: imageUrl,
    type: 'article',
  })
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const [fetchResult, post] = await Promise.all([
    getFetchResult(),
    getPostById(id),
  ])
  if (!post) notFound()

  const [schoolSlug, clubSlug, companySlug] = await Promise.all([
    getSchoolSlugForPost(post),
    getClubSlugForPost(post),
    getCompanySlugForPost(post),
  ])

  const areaSlug = getAreaSlug(post.area)
  const sportSlug = post.sportCategory.trim() ? getSportSlug(post.sportCategory) : ''
  const pagePath = urls.post(id)
  const pageUrl = absoluteUrl(pagePath)
  const imageUrl = await resolvePostImageUrl(post.imageUrl, post.instagramUrl, post.genre)
  const leadSummary = resolvePostLeadSummary(post)
  const faqItems = resolvePostFaq(post)
  const relatedSections = getRelatedPostSections(post, fetchResult.posts)
  const entityLinks = getPostEntityLinks(post, fetchResult.posts, {
    schoolSlug,
    clubSlug,
    companySlug,
    sportSlug: sportSlug || undefined,
    areaSlug,
  })
  const faqJsonLd = createFaqPageJsonLd(faqItems, pageUrl)

  return (
    <div className="min-h-screen">
      <JsonLd
        data={[
          createArticleJsonLd({ post, imageUrl, pageUrl, faqItems, leadSummary }),
          createBreadcrumbJsonLd([
            { name: 'ホーム', href: urls.home() },
            { name: post.title },
          ]),
          ...(faqJsonLd ? [faqJsonLd] : []),
        ]}
      />
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Breadcrumb
          items={[
            { label: 'ホーム', href: urls.home() },
            { label: post.title },
          ]}
        />
        <DataFetchAlert
          source={fetchResult.source}
          totalCount={fetchResult.posts.length}
          error={fetchResult.error}
        />

        <article>
          <header className="mb-6">
            <span
              className={`inline-block text-xs font-bold px-2 py-1 rounded-full text-white mb-3
              ${getGenreBadgeClass(post.genre)}`}
            >
              {post.genre}
            </span>
            <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>
            {post.recruitmentInfo.trim() && (
              <div className="mt-3">
                <RecruitmentBadge
                  text={post.recruitmentInfo}
                  className="text-xs px-3 py-1.5 rounded-full"
                />
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">{post.date}</p>
          </header>

          <p className="mb-6 text-base font-medium leading-relaxed text-gray-800">{leadSummary}</p>

          <PostThumbnail
            src={post.imageUrl}
            alt={post.title}
            genre={post.genre}
            priority
            variant="detail"
            sizes="(max-width: 768px) 100vw, 672px"
            frameClassName="mb-6"
          />

          <section className="mb-8" aria-labelledby="article-about-heading">
            <h2 id="article-about-heading" className="mb-3 text-lg font-bold text-gray-900">
              この記事について
            </h2>
            <p className="text-gray-700 leading-relaxed">{post.description}</p>
          </section>

          <section className="mb-8" aria-labelledby="article-facts-heading">
            <h2 id="article-facts-heading" className="mb-3 text-lg font-bold text-gray-900">
              基本情報
            </h2>
            <dl className="bg-white rounded-2xl shadow-sm p-5 space-y-3 text-sm">
              <div className="flex gap-2">
                <dt className="text-gray-400 w-24 shrink-0">エリア</dt>
                <dd>
                  <Link href={urls.area(areaSlug)} className="text-pink-500 hover:underline">
                    {post.area}
                  </Link>
                </dd>
              </div>
              {post.schoolName && schoolSlug && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-24 shrink-0">学校名</dt>
                  <dd>
                    <Link href={urls.school(schoolSlug)} className="text-pink-500 hover:underline">
                      {post.schoolName}
                    </Link>
                  </dd>
                </div>
              )}
              {post.clubName && clubSlug && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-24 shrink-0">部活名</dt>
                  <dd>
                    <Link href={urls.club(clubSlug)} className="text-pink-500 hover:underline">
                      {post.clubName}
                    </Link>
                  </dd>
                </div>
              )}
              {post.sportCategory.trim() && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-24 shrink-0">競技</dt>
                  <dd>
                    <Link href={urls.sport(sportSlug)} className="text-pink-500 hover:underline">
                      {post.sportCategory}
                    </Link>
                  </dd>
                </div>
              )}
              {post.companyName && companySlug && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-24 shrink-0">企業名</dt>
                  <dd>
                    <Link href={urls.company(companySlug)} className="text-pink-500 hover:underline">
                      {post.companyName}
                    </Link>
                  </dd>
                </div>
              )}
              {post.videoCategoryLabel && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-24 shrink-0">動画カテゴリ</dt>
                  <dd>{post.videoCategoryLabel}</dd>
                </div>
              )}
              {post.careerCategory && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-24 shrink-0">進路カテゴリ</dt>
                  <dd>{post.careerCategory}</dd>
                </div>
              )}
              {post.recruitmentInfo && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-24 shrink-0">募集情報</dt>
                  <dd>{post.recruitmentInfo}</dd>
                </div>
              )}
            </dl>
          </section>

          <ArticleFaqSection items={faqItems} />

          <ExternalLinks links={getPostExternalLinks(post)} />

          {post.instagramUrl && (
            <a
              href={post.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block instagram-gradient text-white font-bold px-6 py-3 rounded-full"
            >
              Instagramで見る →
            </a>
          )}
        </article>
      </main>

      <RelatedPostsSection sections={relatedSections} entityLinks={entityLinks} />
      <ContactTeaser />

      <footer className="text-center py-8 text-xs text-gray-400">
        <p>© 2026 {INSTAGRAM_HANDLE} | {SITE_NAME}</p>
      </footer>
    </div>
  )
}
