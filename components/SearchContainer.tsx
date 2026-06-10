'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import AboutSection from '@/components/home/AboutSection'
import CategoryEditorialSection from '@/components/home/CategoryEditorialSection'
import FeatureArticle from '@/components/home/FeatureArticle'
import HomeBrowseSection from '@/components/home/HomeBrowseSection'
import MagazineHero from '@/components/home/MagazineHero'
import OperatorSection from '@/components/home/OperatorSection'
import { POST_SEARCH_FIELDS } from '@/types/post'
import type { Post } from '@/types/post'
import type { DataSource } from '@/types/fetch-result'
import { getEnabledContactMenuItems } from '@/lib/contact/forms'
import { parsePostDate } from '@/lib/dates'
import { getEditorPickPosts } from '@/lib/editor-picks'
import { INSTAGRAM_HANDLE, SITE_NAME } from '@/lib/site'
import { urls } from '@/lib/urls'
import DataFetchAlert from './DataFetchAlert'

type SearchContainerProps = {
  posts: Post[]
  dataSource: DataSource
  dataError?: string
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

  const editorPicks = useMemo(() => getEditorPickPosts(posts), [posts])
  const editorPickIds = useMemo(() => new Set(editorPicks.map((post) => post.id)), [editorPicks])
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

  const filterByGenre = (genre: string) => {
    setSelectedGenre(genre)
    document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })
    document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth' })
  }

  const latestPosts = filtered.filter((post) => !editorPickIds.has(post.id)).slice(0, 12)

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFE]">
      <MagazineHero />

      <main className="flex-1 max-w-lg mx-auto w-full">
        {editorPicks.length > 0 && (
          <section
            id="editor-picks"
            aria-label="編集部おすすめ"
            className="scroll-mt-4 px-6 py-16"
          >
            <h2 className="text-2xl font-bold text-hokkaido-deep leading-snug">編集部おすすめ</h2>
            <div className="mt-12">
              {editorPicks.map((post, index) => (
                <FeatureArticle
                  key={`editor-${post.id}`}
                  post={post}
                  layout="feature"
                  priority={index === 0}
                />
              ))}
            </div>
          </section>
        )}

        <HomeBrowseSection
          keyword={keyword}
          onKeywordChange={setKeyword}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
          selectedVideoCategory={selectedVideoCategory}
          onVideoCategoryChange={setSelectedVideoCategory}
          selectedCareerCategory={selectedCareerCategory}
          onCareerCategoryChange={setSelectedCareerCategory}
          videoCategories={videoCategories}
          careerCategories={careerCategories}
          hasActiveFilter={Boolean(hasActiveFilter)}
          filteredCount={filtered.length}
          totalCount={posts.length}
          onClearFilters={clearFilters}
        />

        <div className="px-6 py-16 border-t border-hokkaido-ice/60">
          <CategoryEditorialSection onFilterGenre={filterByGenre} />
        </div>

        <section
          id="posts"
          aria-label="新着記事"
          className="scroll-mt-4 px-6 py-16 border-t border-hokkaido-ice/60"
        >
          <h2 className="text-2xl font-bold text-hokkaido-deep leading-snug">新着記事</h2>

          {latestPosts.length > 0 ? (
            <div className="mt-12">
              {latestPosts.map((post) => (
                <FeatureArticle
                  key={post.id}
                  post={post}
                  layout="title-first"
                  showMeta={false}
                  showReadLink={false}
                />
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

        <div className="px-6 py-16 border-t border-hokkaido-ice/60 space-y-16">
          <DataFetchAlert source={dataSource} totalCount={posts.length} error={dataError} />
          <OperatorSection />
          <AboutSection />
        </div>
      </main>

      <footer className="py-12 text-center text-xs text-gray-400 border-t border-hokkaido-ice bg-white space-y-2">
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
