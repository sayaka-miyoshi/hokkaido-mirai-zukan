'use client'

import Link from 'next/link'
import { useState, useMemo, type ReactNode } from 'react'
import { POST_SEARCH_FIELDS } from '@/types/post'
import type { Post } from '@/types/post'
import type { DataSource } from '@/types/fetch-result'
import { getEnabledContactMenuItems } from '@/lib/contact/forms'
import { parsePostDate } from '@/lib/dates'
import { getPopularPosts } from '@/lib/popular-posts'
import {
  CATEGORY_FILTERS,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  POPULAR_AREAS,
  SITE_NAME,
  SITE_TAGLINE,
} from '@/lib/site'
import { urls } from '@/lib/urls'
import DataFetchAlert from './DataFetchAlert'
import PostCard from './PostCard'

type SearchContainerProps = {
  posts: Post[]
  dataSource: DataSource
  dataError?: string
}

function SectionTitle({ icon, label, accent }: { icon: string; label: string; accent: string }) {
  return (
    <h2 className="text-sm font-bold text-hokkaido-deep mb-3 flex items-center gap-2">
      <span className={`w-1 h-5 rounded-full ${accent}`} aria-hidden="true" />
      <span aria-hidden="true">{icon}</span>
      {label}
    </h2>
  )
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
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95
        ${active
          ? 'bg-hokkaido-deep text-white border-hokkaido-deep'
          : 'bg-white text-gray-600 border-gray-200 hover:border-hokkaido-sky'
        }`}
    >
      {children}
    </button>
  )
}

export default function SearchContainer({ posts, dataSource, dataError }: SearchContainerProps) {
  const [keyword, setKeyword] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<string | null>(null)
  const [selectedCareerCategory, setSelectedCareerCategory] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)

  const videoCategories = useMemo(
    () => [...new Set(posts.map((p) => p.videoCategory).filter(Boolean))].sort(),
    [posts],
  )

  const careerCategories = useMemo(
    () => [...new Set(posts.map((p) => p.careerCategory).filter(Boolean))].sort(),
    [posts],
  )

  const recruitmentCount = useMemo(
    () => posts.filter((p) => p.recruitmentInfo.trim()).length,
    [posts],
  )

  const popularPosts = useMemo(() => getPopularPosts(posts), [posts])
  const contactMenuItems = useMemo(() => getEnabledContactMenuItems(), [])

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

  return (
    <div className="min-h-screen flex flex-col bg-hokkaido-page">
      {/* ヒーロー + 大きな検索バー */}
      <header className="relative bg-hokkaido-hero text-white hokkaido-snow-pattern shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-hokkaido-deep/20 pointer-events-none" />
        <div className="relative max-w-lg mx-auto px-4 pt-6 pb-8">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-[11px] font-medium text-white/75 mb-1 tracking-wide">
                ❄️ HOKKAIDO NAVI
              </p>
              <h1 className="text-xl font-bold leading-snug">{SITE_NAME}</h1>
              <p className="text-xs text-white/80 mt-1.5 leading-relaxed">{SITE_TAGLINE}</p>
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 mt-1 text-[11px] font-bold bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full backdrop-blur-sm transition-colors border border-white/20"
            >
              {INSTAGRAM_HANDLE}
            </a>
          </div>

          {/* 大きな検索バー */}
          <div className="relative">
            <span
              className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-400"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="学校名・部活名・企業名で検索..."
              className="w-full pl-14 pr-12 py-4 rounded-2xl border-0 bg-white text-gray-800 shadow-xl text-base font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-white/40"
              aria-label="キーワード検索"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                aria-label="検索をクリア"
              >
                ✕
              </button>
            )}
          </div>

          {recruitmentCount > 0 && (
            <p className="mt-3 text-center text-[11px] text-white/90">
              📣 募集情報あり <span className="font-bold">{recruitmentCount}件</span>
            </p>
          )}

          {contactMenuItems.length > 0 && (
            <nav aria-label="メニュー" className="mt-4 flex flex-wrap justify-center gap-2">
              {contactMenuItems.map((item) => (
                <Link
                  key={item.type}
                  href={urls.contact(item.type)}
                  className="text-[11px] font-bold bg-white/15 hover:bg-white/25 px-4 py-2 rounded-full border border-white/20 transition-colors"
                >
                  {item.menuLabel}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-7">
        <DataFetchAlert source={dataSource} totalCount={posts.length} error={dataError} />

        {/* 一覧から探す */}
        <section aria-label="一覧から探す">
          <SectionTitle icon="🧭" label="一覧から探す" accent="bg-hokkaido-lavender" />
          <div className="grid grid-cols-3 gap-2">
            {[
              { href: urls.schools(), emoji: '🏫', label: '学校' },
              { href: urls.clubs(), emoji: '⚽', label: '部活' },
              { href: urls.sports(), emoji: '🏅', label: '競技' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1.5 min-h-[4.5rem] rounded-2xl border-2 border-white bg-white shadow-md text-sm font-bold text-gray-700 hover:border-hokkaido-sky transition-all active:scale-95"
              >
                <span className="text-2xl" aria-hidden>{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* カテゴリボタン */}
        <section aria-label="カテゴリ">
          <SectionTitle icon="🏷️" label="カテゴリ" accent="bg-hokkaido-sky" />
          <div className="grid grid-cols-3 gap-2.5">
            {CATEGORY_FILTERS.map(({ emoji, label, genre }) => {
              const active = selectedGenre === genre
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(active ? null : genre)}
                  className={`flex flex-col items-center justify-center gap-2 min-h-[5.5rem] py-3 px-2 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95
                    ${active
                      ? 'bg-hokkaido-deep text-white border-hokkaido-deep shadow-lg scale-[1.02]'
                      : 'bg-white text-gray-700 border-white shadow-md hover:border-hokkaido-sky hover:shadow-lg'
                    }`}
                >
                  <span className="text-3xl leading-none" aria-hidden="true">{emoji}</span>
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* 人気コンテンツ（人気表示=1 かつ人気順入力済み・最大10件） */}
        {popularPosts.length > 0 && (
          <section aria-label="人気コンテンツ">
            <SectionTitle icon="🔥" label="人気コンテンツ" accent="bg-orange-400" />
            <div className="grid grid-cols-2 gap-3">
              {popularPosts.map((post) => (
                <PostCard key={`popular-${post.id}`} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* 人気エリア */}
        <section aria-label="人気エリア">
          <SectionTitle icon="📍" label="人気エリア" accent="bg-hokkaido-forest" />
          <div className="grid grid-cols-2 gap-2.5">
            {POPULAR_AREAS.map((area) => {
              const active = selectedArea === area
              const count = posts.filter((p) => p.area === area).length
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => setSelectedArea(active ? null : area)}
                  className={`flex items-center justify-between py-3.5 px-4 rounded-2xl font-bold text-sm border-2 transition-all active:scale-95
                    ${active
                      ? 'bg-hokkaido-lake text-white border-hokkaido-lake shadow-lg'
                      : 'bg-white text-gray-700 border-white shadow-md hover:border-hokkaido-sky'
                    }`}
                >
                  <span>{area}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-hokkaido-ice text-hokkaido-deep'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* 詳細フィルター（折りたたみ） */}
        {(videoCategories.length > 0 || careerCategories.length > 0) && (
          <details className="group rounded-2xl bg-white/80 border border-hokkaido-ice shadow-sm overflow-hidden">
            <summary className="px-4 py-3 text-xs font-bold text-hokkaido-deep cursor-pointer list-none flex items-center justify-between">
              <span>🔎 もっと絞り込む</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-4 pb-4 space-y-4 border-t border-hokkaido-ice">
              {videoCategories.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-2">動画カテゴリ</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {videoCategories.map((category) => (
                      <FilterChip
                        key={category}
                        active={selectedVideoCategory === category}
                        onClick={() =>
                          setSelectedVideoCategory(
                            selectedVideoCategory === category ? null : category,
                          )
                        }
                      >
                        {category}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              )}
              {careerCategories.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-2">進路カテゴリ</p>
                  <div className="flex gap-1.5 flex-wrap">
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
                </div>
              )}
            </div>
          </details>
        )}

        {/* 最新投稿 */}
        <section aria-label="最新投稿">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle icon="✨" label="最新投稿" accent="bg-hokkaido-lavender" />
            {hasActiveFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-hokkaido-sky font-bold hover:underline -mt-3"
              >
                クリア
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-4">
            全{posts.length}件中 <span className="font-bold text-hokkaido-deep">{filtered.length}件</span>を表示
          </p>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-white border border-hokkaido-ice shadow-sm">
              <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
              <p className="font-bold text-gray-600">該当する投稿が見つかりませんでした</p>
              <p className="text-sm text-gray-400 mt-2">キーワードや条件を変えてみてください</p>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-bold text-hokkaido-sky hover:underline"
                >
                  すべて表示する
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-hokkaido-ice bg-white/60 space-y-2">
        {contactMenuItems.map((item) => (
          <p key={item.type}>
            <Link href={urls.contact(item.type)} className="text-hokkaido-sky font-bold hover:underline">
              {item.menuLabel}
            </Link>
          </p>
        ))}
        <p>© 2026 {INSTAGRAM_HANDLE}</p>
        <p className="mt-0.5">{SITE_NAME}</p>
      </footer>
    </div>
  )
}
