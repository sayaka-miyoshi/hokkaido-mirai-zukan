'use client'

import { useState, useMemo } from 'react'
import { POST_SEARCH_FIELDS } from '@/types/post'
import type { Post } from '@/types/post'
import { GENRES, GENRE_FILTER_STYLES } from '@/lib/genres'
import PostCard from './PostCard'

const AREAS = ['すべて', '札幌', '函館', '旭川', '釧路', '帯広', '北見', '小樽', '苫小牧', 'その他']

export default function SearchContainer({ posts }: { posts: Post[] }) {
  const [keyword, setKeyword] = useState('')
  const [selectedArea, setSelectedArea] = useState('すべて')
  const [selectedGenre, setSelectedGenre] = useState('すべて')

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesKeyword =
        keyword === '' ||
        POST_SEARCH_FIELDS.some((field) => post[field].includes(keyword))
      const matchesArea = selectedArea === 'すべて' || post.area === selectedArea
      const matchesGenre = selectedGenre === 'すべて' || post.genre === selectedGenre
      return matchesKeyword && matchesArea && matchesGenre
    })
  }, [posts, keyword, selectedArea, selectedGenre])

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="instagram-gradient p-0.5 rounded-xl">
            <div className="bg-white rounded-[10px] p-1.5">
              <span className="text-2xl">🏫</span>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">北海道未来図鑑</h1>
            <p className="text-xs text-gray-400">@insta.sayakans</p>
          </div>
          <a
            href="https://www.instagram.com/insta.sayakans/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto instagram-gradient text-white text-xs font-bold px-4 py-2 rounded-full"
          >
            Instagramを見る
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* キャッチコピー */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">北海道未来図鑑</h2>
          <p className="text-gray-500 text-sm mt-1">学校名・企業名・地域・競技名などで検索できます</p>
        </div>

        {/* 検索バー */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="学校名・企業名・地域・競技名などで検索..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* ジャンル絞り込み */}
        <div className="mb-3">
          <p className="text-xs font-bold text-gray-500 mb-2">ジャンル</p>
          <div className="flex gap-2 flex-wrap">
            {GENRES.map((genre) => {
              const style = GENRE_FILTER_STYLES[genre]
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all
                    ${selectedGenre === genre
                      ? style.active
                      : `bg-white text-gray-600 border-gray-200 ${style.hover}`
                    }`}
                >
                  {genre}
                </button>
              )
            })}
          </div>
        </div>

        {/* エリア絞り込み */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-500 mb-2">エリア</p>
          <div className="flex gap-2 flex-wrap">
            {AREAS.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all
                  ${selectedArea === area
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                  }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* 件数表示 */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length}件見つかりました
        </p>

        {/* 投稿カード一覧 */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((post, i) => (
              <PostCard key={i} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold">該当する投稿が見つかりませんでした</p>
            <p className="text-sm mt-1">キーワードやエリアを変えてみてください</p>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="text-center py-8 text-xs text-gray-400">
        <p>© 2026 @insta.sayakans | 北海道未来図鑑</p>
      </footer>
    </div>
  )
}
