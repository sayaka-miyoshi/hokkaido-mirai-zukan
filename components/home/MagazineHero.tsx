'use client'

import Link from 'next/link'
import { useState } from 'react'
import { HERO_BG_IMAGE_PATH, HERO_IMAGE_OBJECT_POSITION } from '@/lib/branding-paths'
import { HERO_STORY_LINES, SITE_CATCH_COPY, SITE_NAME } from '@/lib/site'

type MagazineHeroProps = {
  exploreHref?: string
}

/**
 * 雑誌・特集風トップヒーロー
 * 将来の写真（北大フォーミュラ / 吹奏楽 / 消防学校 / 企業取材）を
 * 中央やや上に収める object-position を前提にレイアウト
 */
export default function MagazineHero({ exploreHref = '#browse' }: MagazineHeroProps) {
  const [bgError, setBgError] = useState(false)

  return (
    <header className="flex h-[100svh] min-h-[640px] max-h-[900px] flex-col overflow-hidden bg-black">
      <div className="relative h-[46svh] min-h-[220px] max-h-[420px] shrink-0 overflow-hidden">
        {!bgError ? (
          <img
            src={HERO_BG_IMAGE_PATH}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: HERO_IMAGE_OBJECT_POSITION }}
            onError={() => setBgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-hokkaido-hero hokkaido-snow-pattern" aria-hidden="true" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black"
        />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col bg-gradient-to-b from-black via-black to-black/95 px-6 pb-8 pt-5">
        <p className="shrink-0 text-[11px] tracking-[0.26em] text-white/60 font-semibold">
          {SITE_NAME}
        </p>

        <h1 className="mt-4 shrink-0 text-[clamp(1.75rem,8.2vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-white whitespace-pre-line">
          {SITE_CATCH_COPY}
        </h1>

        <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain">
          {HERO_STORY_LINES.map((line, index) => (
            <p
              key={line}
              className={`text-[13px] leading-[1.85] sm:text-[14px] ${
                index === HERO_STORY_LINES.length - 1
                  ? 'font-semibold text-white'
                  : 'text-white/78'
              }`}
            >
              {line}
            </p>
          ))}
        </div>

        <div className="mt-5 shrink-0 pt-2">
          <Link
            href={exploreHref}
            className="inline-flex items-center justify-center rounded-full border border-white/70 px-7 py-3 text-sm font-bold text-white hover:bg-white hover:text-hokkaido-deep transition-colors"
          >
            記事を探す
          </Link>
        </div>
      </div>
    </header>
  )
}
