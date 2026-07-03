'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CompanyContentSection from '@/components/home/CompanyContentSection'
import HomeBrowseSection from '@/components/home/HomeBrowseSection'
import HomePublishStatsSection from '@/components/home/HomePublishStatsSection'
import HomeSearchResultsSection from '@/components/home/HomeSearchResultsSection'
import LatestContentSection from '@/components/home/LatestContentSection'
import OperatorSection from '@/components/home/OperatorSection'
import PopularContentSection from '@/components/home/PopularContentSection'
import SpecialFeaturesSection from '@/components/home/SpecialFeaturesSection'
import StoryImageBlock from '@/components/home/StoryImageBlock'
import TopHero from '@/components/home/TopHero'
import type { Post } from '@/types/post'
import type { DataSource } from '@/types/fetch-result'
import { getEnabledContactMenuItems } from '@/lib/contact/forms'
import { parsePostDate } from '@/lib/dates'
import { COMPANY_CONTENT_MAX } from '@/lib/home-layout'
import { getCompanyRecommendedPosts } from '@/lib/company-recommended-posts'
import { resolveFilterResultHeading } from '@/lib/home-filter-labels'
import { getLatestContentPosts } from '@/lib/latest-content'
import { getPublishStats } from '@/lib/publish-stats'
import { resolvePopularContent } from '@/lib/popular-posts'
import { trackAnalyticsEvent } from '@/lib/analytics/track-client'
import { filterPostsBySearch } from '@/lib/post-search'
import { buildSearchSuggestionIndex } from '@/lib/search-suggestions'
import { postMatchesBrowseFilter, type BrowseFilter } from '@/lib/browse-categories'
import { STORY_ALT, STORY_IMAGES } from '@/lib/story-assets'
import { INSTAGRAM_HANDLE, SITE_NAME } from '@/lib/site'
import { urls } from '@/lib/urls'
import DataFetchAlert from './DataFetchAlert'

type SearchContainerProps = {
  posts: Post[]
  dataSource: DataSource
  dataError?: string
  entityLinkMap?: Record<string, { label: string; href: string }>
}

/**
 * TOPページ構成
 * ① Hero ② 検索 ③ 人気 ④ 最新 ⑤ 企業 ⑥ 特集 ⑦ ストーリー04 ⑧ 運営者 ⑨ フッター
 */
export default function SearchContainer({
  posts,
  dataSource,
  dataError,
  entityLinkMap = {},
}: SearchContainerProps) {
  const [keyword, setKeyword] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<string | null>(null)
  const [selectedCareerCategory, setSelectedCareerCategory] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [activeBrowseFilter, setActiveBrowseFilter] = useState<BrowseFilter | null>(null)
  const [scrollRequestId, setScrollRequestId] = useState(0)

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

  const suggestionIndex = useMemo(() => buildSearchSuggestionIndex(posts), [posts])

  const publishStats = useMemo(() => getPublishStats(posts), [posts])

  const filtered = useMemo(() => {
    const base = activeBrowseFilter
      ? posts.filter((post) => postMatchesBrowseFilter(post, activeBrowseFilter))
      : posts

    return filterPostsBySearch(base, {
      keyword,
      selectedGenre,
      selectedVideoCategory,
      selectedCareerCategory,
      selectedArea,
    }).sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))
  }, [
    posts,
    activeBrowseFilter,
    keyword,
    selectedGenre,
    selectedVideoCategory,
    selectedCareerCategory,
    selectedArea,
  ])

  const hasActiveFilter =
    keyword !== '' ||
    selectedGenre ||
    selectedVideoCategory ||
    selectedCareerCategory ||
    selectedArea ||
    activeBrowseFilter

  const clearFilters = () => {
    setKeyword('')
    setSelectedGenre(null)
    setSelectedVideoCategory(null)
    setSelectedCareerCategory(null)
    setSelectedArea(null)
    setActiveBrowseFilter(null)
  }

  const scrollToResults = useCallback(() => {
    setScrollRequestId((id) => id + 1)
  }, [])

  const applyBrowseFilter = useCallback(
    (filter: BrowseFilter) => {
      setActiveBrowseFilter(filter)
      setKeyword('')
      setSelectedGenre(null)
      setSelectedArea(null)
      setSelectedCareerCategory(null)
      setSelectedVideoCategory(null)
      scrollToResults()
    },
    [scrollToResults],
  )

  useEffect(() => {
    if (scrollRequestId === 0 || !hasActiveFilter) return

    const timer = window.setTimeout(() => {
      const target = document.getElementById('search-results')
      target?.classList.add('fade-up-visible')
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)

    return () => window.clearTimeout(timer)
  }, [
    scrollRequestId,
    hasActiveFilter,
    filtered.length,
    selectedGenre,
    selectedCareerCategory,
    selectedArea,
    selectedVideoCategory,
    keyword,
  ])

  useEffect(() => {
    if (!hasActiveFilter) return

    const query =
      keyword.trim() ||
      activeBrowseFilter?.sportCategory ||
      activeBrowseFilter?.genre ||
      activeBrowseFilter?.area ||
      activeBrowseFilter?.careerCategory ||
      activeBrowseFilter?.keyword ||
      [selectedGenre, selectedArea, selectedCareerCategory, selectedVideoCategory]
        .filter(Boolean)
        .join(' ')

    if (!query) return

    trackAnalyticsEvent('search_query', {
      query,
      result_count: filtered.length,
      referrer_source: 'direct',
    })
  }, [
    hasActiveFilter,
    keyword,
    activeBrowseFilter,
    selectedGenre,
    selectedArea,
    selectedCareerCategory,
    selectedVideoCategory,
    filtered.length,
  ])

  const filterResultHeading = useMemo(
    () =>
      resolveFilterResultHeading(
        {
          keyword,
          selectedGenre,
          selectedCareerCategory,
          selectedArea,
          selectedVideoCategory,
          videoCategoryLabel: videoCategories.find((item) => item.id === selectedVideoCategory)
            ?.label,
        },
        filtered.length,
      ),
    [
      filtered.length,
      keyword,
      selectedArea,
      selectedCareerCategory,
      selectedGenre,
      selectedVideoCategory,
      videoCategories,
    ],
  )

  const popularEntries = useMemo(() => resolvePopularContent(posts), [posts])

  const latestPosts = useMemo(() => getLatestContentPosts(posts), [posts])

  const companyPosts = useMemo(
    () => getCompanyRecommendedPosts(posts, COMPANY_CONTENT_MAX),
    [posts],
  )

  const browseSectionProps = {
    posts,
    keyword,
    onKeywordChange: (value: string) => {
      setKeyword(value)
      if (value.trim()) setActiveBrowseFilter(null)
    },
    onSelectSuggestion: () => {
      scrollToResults()
    },
    suggestionIndex,
    selectedGenre,
    selectedArea,
    selectedVideoCategory,
    onVideoCategoryChange: (id: string | null) => {
      setSelectedVideoCategory(id)
      setActiveBrowseFilter(null)
      scrollToResults()
    },
    selectedCareerCategory,
    onCareerCategoryChange: (category: string | null) => {
      setSelectedCareerCategory(category)
      setActiveBrowseFilter(null)
      scrollToResults()
    },
    videoCategories,
    careerCategories,
    onApplyBrowseSelection: applyBrowseFilter,
    activeBrowseFilter,
    hasActiveFilter: Boolean(hasActiveFilter),
    filteredCount: filtered.length,
    totalCount: posts.length,
    onClearFilters: clearFilters,
    onShowResults: scrollToResults,
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopHero />

      <main className="mx-auto w-full flex-1">
        <div className="mx-auto max-w-lg">
          <HomeBrowseSection {...browseSectionProps} />
          {!hasActiveFilter && <HomePublishStatsSection stats={publishStats} />}
        </div>

        {hasActiveFilter && (
          <div className="mx-auto w-full max-w-lg md:max-w-4xl lg:max-w-5xl">
            <HomeSearchResultsSection
              posts={filtered}
              title={filterResultHeading.title}
              description={filterResultHeading.description}
              onClearFilters={clearFilters}
              searchQuery={
                keyword.trim() ||
                activeBrowseFilter?.sportCategory ||
                activeBrowseFilter?.genre ||
                activeBrowseFilter?.area ||
                filterResultHeading.title
              }
            />
          </div>
        )}

        {!hasActiveFilter && (
        <div className="mx-auto w-full max-w-lg md:max-w-4xl lg:max-w-5xl">
          <PopularContentSection entries={popularEntries} entityLinkMap={entityLinkMap} />

          <LatestContentSection posts={latestPosts} />

          <CompanyContentSection posts={companyPosts} />

          <SpecialFeaturesSection />
        </div>
        )}

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
