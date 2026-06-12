'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import CompanyContentSection from '@/components/home/CompanyContentSection'
import HomeBrowseSection from '@/components/home/HomeBrowseSection'
import LatestContentSection from '@/components/home/LatestContentSection'
import OperatorSection from '@/components/home/OperatorSection'
import PopularContentSection from '@/components/home/PopularContentSection'
import SpecialFeaturesSection from '@/components/home/SpecialFeaturesSection'
import StoryImageBlock from '@/components/home/StoryImageBlock'
import TopHero from '@/components/home/TopHero'
import { POST_SEARCH_FIELDS } from '@/types/post'
import type { Post } from '@/types/post'
import type { DataSource } from '@/types/fetch-result'
import { getEnabledContactMenuItems } from '@/lib/contact/forms'
import { parsePostDate } from '@/lib/dates'
import { COMPANY_CONTENT_MAX } from '@/lib/home-layout'
import { getCompanyRecommendedPosts } from '@/lib/company-recommended-posts'
import { getLatestContentPosts } from '@/lib/latest-content'
import { resolvePopularContent } from '@/lib/popular-posts'
import { STORY_ALT, STORY_IMAGES } from '@/lib/story-assets'
import { INSTAGRAM_HANDLE, SITE_NAME } from '@/lib/site'
import { urls } from '@/lib/urls'
import DataFetchAlert from './DataFetchAlert'

type SearchContainerProps = {
  posts: Post[]
  dataSource: DataSource
  dataError?: string
}

/**
 * TOPページ構成
 * ① Hero ② ストーリー02 ③ 検索 ④ 人気 ⑤ 最新 ⑥ 企業 ⑦ 特集 ⑧ ストーリー04 ⑨ 運営者 ⑩ フッター
 */
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

  const scrollToResults = () => {
    document.getElementById('popular')?.scrollIntoView({ behavior: 'smooth' })
  }

  const popularEntries = useMemo(() => resolvePopularContent(posts), [posts])

  const latestPosts = useMemo(() => getLatestContentPosts(posts), [posts])

  const companyPosts = useMemo(
    () => getCompanyRecommendedPosts(posts, COMPANY_CONTENT_MAX),
    [posts],
  )

  const browseSectionProps = {
    keyword,
    onKeywordChange: setKeyword,
    selectedGenre,
    onGenreChange: (genre: string | null) => {
      setSelectedGenre(genre)
      scrollToResults()
    },
    selectedArea,
    onAreaChange: (area: string | null) => {
      setSelectedArea(area)
      scrollToResults()
    },
    selectedVideoCategory,
    onVideoCategoryChange: (id: string | null) => {
      setSelectedVideoCategory(id)
      scrollToResults()
    },
    selectedCareerCategory,
    onCareerCategoryChange: (category: string | null) => {
      setSelectedCareerCategory(category)
      scrollToResults()
    },
    videoCategories,
    careerCategories,
    hasActiveFilter: Boolean(hasActiveFilter),
    filteredCount: filtered.length,
    totalCount: posts.length,
    onClearFilters: clearFilters,
    onShowResults: scrollToResults,
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopHero />

      <StoryImageBlock
        id="story-02"
        src={STORY_IMAGES.story02}
        alt={STORY_ALT.story02}
        animate={false}
      />

      <main className="mx-auto w-full flex-1">
        <div className="mx-auto max-w-lg">
          <HomeBrowseSection {...browseSectionProps} />
        </div>

        <div className="mx-auto w-full max-w-lg md:max-w-4xl lg:max-w-5xl">
          <PopularContentSection entries={popularEntries} />

          <LatestContentSection posts={latestPosts} />

          <CompanyContentSection posts={companyPosts} />

          <SpecialFeaturesSection />
        </div>

        <div className="mx-auto w-full max-w-lg">
          <StoryImageBlock id="story-04" src={STORY_IMAGES.story04} alt={STORY_ALT.story04} />
        </div>

        <div className="mx-auto w-full max-w-lg md:max-w-4xl lg:max-w-5xl">
          <OperatorSection />
        </div>

        <div className="mx-auto w-full max-w-lg">
        {dataSource !== 'sheet' && (
          <div className="px-6 pb-8">
            <DataFetchAlert source={dataSource} totalCount={posts.length} error={dataError} />
          </div>
        )}
        </div>
      </main>

      <footer className="border-t border-magazine-border bg-magazine-sky py-12 text-center text-xs text-magazine-muted">
        {publicationContact && (
          <p className="mb-3">
            <Link href={urls.contact('publication')} className="font-medium text-hokkaido-sky hover:underline">
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
