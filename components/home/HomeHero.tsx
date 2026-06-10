'use client'

import { useState } from 'react'
import { HERO_BG_IMAGE_PATH } from '@/lib/branding-paths'
import { HERO_STORY_LINES, SITE_NAME } from '@/lib/site'

type HomeHeroProps = {
  keyword: string
  onKeywordChange: (value: string) => void
  onKeywordClear: () => void
  recruitmentCount: number
}

export default function HomeHero({
  keyword,
  onKeywordChange,
  onKeywordClear,
  recruitmentCount,
}: HomeHeroProps) {
  const [bgError, setBgError] = useState(false)
  const hasHeroBg = !bgError

  return (
    <header
      className={`relative overflow-hidden ${
        hasHeroBg
          ? 'text-hokkaido-deep'
          : 'bg-hokkaido-hero text-white hokkaido-snow-pattern'
      }`}
    >
      {hasHeroBg ? (
        <>
          <img
            src={HERO_BG_IMAGE_PATH}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
            onError={() => setBgError(true)}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-white/96 via-sky-50/90 to-hokkaido-ice/95"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-white/55 via-transparent to-hokkaido-sky/10"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-hokkaido-deep/25 pointer-events-none"
        />
      )}

      <div className="relative max-w-lg mx-auto px-4 pt-8 pb-8">
        <p
          className={`text-[11px] font-semibold tracking-[0.2em] mb-4 ${
            hasHeroBg ? 'text-hokkaido-sky' : 'text-white/80'
          }`}
        >
          🗻 {SITE_NAME}
        </p>

        <div
          className={`space-y-2 mb-6 ${
            hasHeroBg ? 'text-hokkaido-deep' : 'text-white'
          }`}
        >
          {HERO_STORY_LINES.map((line, index) => (
            <p
              key={line}
              className={`leading-relaxed ${
                index === HERO_STORY_LINES.length - 1
                  ? 'text-base font-bold mt-3'
                  : index === 0
                    ? 'text-[1.05rem] font-bold'
                    : 'text-sm'
              } ${hasHeroBg ? '' : 'text-white/95'}`}
            >
              {line}
            </p>
          ))}
        </div>

        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400"
            aria-hidden="true"
          >
            🔍
          </span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="学校名・部活名・企業名で検索..."
            className="w-full pl-12 pr-11 py-3.5 rounded-2xl border border-hokkaido-ice/80 bg-white text-gray-800 shadow-lg text-base font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-hokkaido-sky/25"
            aria-label="キーワード検索"
          />
          {keyword && (
            <button
              type="button"
              onClick={onKeywordClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              aria-label="検索をクリア"
            >
              ✕
            </button>
          )}
        </div>

        {recruitmentCount > 0 && (
          <p
            className={`mt-3 text-center text-[11px] ${
              hasHeroBg ? 'text-hokkaido-deep/75' : 'text-white/90'
            }`}
          >
            📣 募集・求人情報 <span className="font-bold">{recruitmentCount}件</span>
          </p>
        )}
      </div>
    </header>
  )
}
