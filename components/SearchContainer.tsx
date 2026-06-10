'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import AboutSection from '@/components/home/AboutSection'
import CategoryEditorialSection from '@/components/home/CategoryEditorialSection'
import FeatureArticle from '@/components/home/FeatureArticle'
import MagazineHero from '@/components/home/MagazineHero'
import OperatorSection from '@/components/home/OperatorSection'
import { POST_SEARCH_FIELDS } from '@/types/post'
import type { Post } from '@/types/post'
import type { DataSource } from '@/types/fetch-result'
import { getEnabledContactMenuItems } from '@/lib/contact/forms'
import { parsePostDate } from '@/lib/dates'
import { getPopularPosts } from '@/lib/popular-posts'
import { CATEGORY_FILTERS, INSTAGRAM_HANDLE, POPULAR_AREAS, SITE_NAME } from '@/lib/site'
import { urls } from '@/lib/urls'
import DataFetchAlert from './DataFetchAlert'

type SearchContainerProps = {
  posts: Post[]
  dataSource: DataSource
  dataError?: string
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
        ${active
          ? 'bg-hokkaido-deep text-white border-hokkaido-deep'
          : 'bg-white text-gray-600 border-gray-200 hover:border-hokkaido-sky'
        }`}
    >
      {children}
    </button>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="mb-10">
      <p className="text-[11px] tracking-[0.2em] text-hokkaido-sky font-semibold mb-2">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold text-hokkaido-deep leading-snug">{title}</h2>
      {description && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{description}</p>
      )}
    </div>
  )
}

export default function SearchContainer({
  posts,
  dataSource,
  dataError,
}: SearchContainerProps) {
  const [keyword, setKeyword] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<string | null>(null)
  const [selectedCareerCategory, setSelectedCareerCategory] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)

  const videoCategories = useMemo(() => {
    const options = new Map<string, string>()
    for (const post of posts) {
      if (!post.videoCategory) continue
      options.set(post.videoCategory, post.videoCategoryLabel || post.videoCategory)
    }
    return [...options.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ja'))
  }, [posts])

  const careerCategories = useMemo(
    () => [...new Set(posts.map((p) => p.careerCategory).filter(Boolean))].sort(),
    [posts],
  )

  const popularPosts = useMemo(() => getPopularPosts(posts), [posts])
  const contactMenuItems = useMemo(() => getEnabledContactMenuItems(), [])
  const publicationContact = contactMenuItems.find((item) => item.type === 'publication')

  const filtered = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesKeyword =
          keyword === '' ||
          POST_SEARCH_FIELDS.some((field) => String(post[field]).includes(keyword))
        const matchesGenre = !selectedGenre || post.genre === selectedGenre
        const matchesVideo =
          !selectedVideoCategory || post.videoCategory === selectedVideoCategory
        const matchesCareer =
          !selectedCareerCategory || post.careerCategory === selectedCareerCategory
        const matchesArea = !selectedArea || post.area === selectedArea
        return matchesKeyword && matchesGenre && matchesVideo && matchesCareer && matchesArea
      })
      .sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))
  }, [posts, keyword, selectedGenre, selectedVideoCategory, selectedCareerCategory, selectedArea])

  const hasActiveFilter =
    keyword !== '' ||
    selectedGenre ||
    selectedVideoCategory ||
    selectedCareerCategory ||
    selectedArea

  const clearFilters = () => {
    setKeyword('')
    setSelectedGenre(null)
    setSelectedVideoCategory(null)
    setSelectedCareerCategory(null)
    setSelectedArea(null)
  }

  const latestPosts = filtered.slice(0, 12)
  const featuredPosts =
    popularPosts.length > 0
      ? popularPosts
      : filtered.slice(0, 3)
  const [leadFeature, ...restFeatures] = featuredPosts

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFE]">
      <MagazineHero
        contactHref={publicationContact ? urls.contact('publication') : undefined}
        contactLabel={publicationContact?.menuLabel}
      />

      <main className="flex-1 max-w-lg mx-auto w-full">
        <div className="px-6 py-4">
          <DataFetchAlert source={dataSource} totalCount={posts.length} error={dataError} />
        </div>

        {/* 5. 特集記事 */}
        {leadFeature && (
          <section aria-label="特集記事" className="px-6 py-12 border-t border-hokkaido-ice/60">
            <SectionIntro
              eyebrow="FEATURE"
              title="特集"
              description="いま、北海道で頑張る人たちのストーリー。"
            />
            <FeatureArticle post={leadFeature} featured priority />
            {restFeatures.slice(0, 2).map((post) => (
              <FeatureArticle key={`feature-${post.id}`} post={post} />
            ))}
          </section>
        )}

        {/* 6. カテゴリ */}
        <div className="px-6 py-12 border-t border-hokkaido-ice/60">
          <CategoryEditorialSection />
        </div>

        {/* 7. 新着記事 + 記事を探す */}
        <section
          id="posts"
          aria-label="新着記事"
          className="scroll-mt-4 px-6 py-12 border-t border-hokkaido-ice/60 bg-white/50"
        >
          <SectionIntro
            eyebrow="LATEST"
            title="新着記事"
            description="学校・部活・企業の最新コンテンツ。"
          />

          <div className="mb-8">
            <label htmlFor="home-search" className="sr-only">
              キーワード検索
            </label>
            <div className="relative">
              <input
                id="home-search"
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="学校名・部活名・企業名で検索..."
                className="w-full rounded-full border border-hokkaido-ice bg-white px-5 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-hokkaido-sky/30"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                  aria-label="検索をクリア"
                >
                  クリア
                </button>
              )}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map(({ label, genre }) => (
              <FilterChip
                key={genre}
                active={selectedGenre === genre}
                onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              >
                {label}
              </FilterChip>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {POPULAR_AREAS.map((area) => (
              <FilterChip
                key={area}
                active={selectedArea === area}
                onClick={() => setSelectedArea(selectedArea === area ? null : area)}
              >
                {area}
              </FilterChip>
            ))}
          </div>

          {(videoCategories.length > 0 || careerCategories.length > 0) && (
            <details className="group mb-8 text-sm">
              <summary className="cursor-pointer text-gray-500 hover:text-hokkaido-deep list-none">
                さらに絞り込む
              </summary>
              <div className="mt-4 space-y-4">
                {videoCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {videoCategories.map(({ id, label }) => (
                      <FilterChip
                        key={id}
                        active={selectedVideoCategory === id}
                        onClick={() =>
                          setSelectedVideoCategory(
                            selectedVideoCategory === id ? null : id,
                          )
                        }
                      >
                        {label}
                      </FilterChip>
                    ))}
                  </div>
                )}
                {careerCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {careerCategories.map((category) => (
                      <FilterChip
                        key={category}
                        active={selectedCareerCategory === category}
                        onClick={() =>
                          setSelectedCareerCategory(
                            selectedCareerCategory === category ? null : category,
                          )
                        }
                      >
                        {category}
                      </FilterChip>
                    ))}
                  </div>
                )}
              </div>
            </details>
          )}

          {hasActiveFilter && (
            <div className="mb-6 flex items-center justify-between text-xs text-gray-500">
              <span>
                全{posts.length}件中 <strong className="text-hokkaido-deep">{filtered.length}件</strong>
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="font-medium text-hokkaido-sky hover:underline"
              >
                条件をクリア
              </button>
            </div>
          )}

          {latestPosts.length > 0 ? (
            <div>
              {latestPosts.map((post) => (
                <FeatureArticle key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-medium text-gray-600">該当する記事が見つかりませんでした</p>
              <p className="mt-2 text-sm text-gray-400">キーワードや条件を変えてみてください</p>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm text-hokkaido-sky hover:underline"
                >
                  すべて表示する
                </button>
              )}
            </div>
          )}
        </section>

        <div className="px-6 py-12 border-t border-hokkaido-ice/60 space-y-12">
          <OperatorSection />
          <AboutSection />
        </div>
      </main>

      <footer className="py-10 text-center text-xs text-gray-400 border-t border-hokkaido-ice bg-white space-y-2">
        {publicationContact && (
          <p>
            <Link href={urls.contact('publication')} className="text-hokkaido-sky hover:underline">
              {publicationContact.menuLabel}
            </Link>
          </p>
        )}
        <p>© 2026 {INSTAGRAM_HANDLE}</p>
        <p>{SITE_NAME}</p>
      </footer>
    </div>
  )
}
