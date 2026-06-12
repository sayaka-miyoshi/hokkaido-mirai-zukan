import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import DataFetchAlert from '@/components/DataFetchAlert'
import ExternalLinks from '@/components/ExternalLinks'
import JsonLd from '@/components/JsonLd'
import PostImage from '@/components/PostImage'
import RecruitmentBadge from '@/components/RecruitmentBadge'
import SiteHeader from '@/components/SiteHeader'
import { createPageMetadata } from '@/lib/metadata'
import { resolvePostImageUrl } from '@/lib/og-image'
import { createArticleJsonLd, createBreadcrumbJsonLd } from '@/lib/json-ld'
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
import { getGenreBadgeClass } from '@/lib/genres'
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

  return createPageMetadata({
    title: post.title,
    description: post.description,
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
  const pagePath = urls.post(id)
  const pageUrl = absoluteUrl(pagePath)
  const imageUrl = await resolvePostImageUrl(post.imageUrl, post.instagramUrl, post.genre)

  return (
    <div className="min-h-screen">
      <JsonLd
        data={[
          createArticleJsonLd({ post, imageUrl, pageUrl }),
          createBreadcrumbJsonLd([
            { name: 'ホーム', href: urls.home() },
            { name: post.title },
          ]),
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
            <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full text-white mb-3
              ${getGenreBadgeClass(post.genre)}`}>
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

          <div className="relative w-full aspect-video min-h-[180px] bg-hokkaido-ice rounded-2xl overflow-hidden mb-6">
            <PostImage
              src={post.imageUrl}
              alt={post.title}
              genre={post.genre}
              priority
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">{post.description}</p>

          <dl className="bg-white rounded-2xl shadow-sm p-5 space-y-3 text-sm mb-6">
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
      <footer className="text-center py-8 text-xs text-gray-400">
        <p>© 2026 {INSTAGRAM_HANDLE} | {SITE_NAME}</p>
      </footer>
    </div>
  )
}
