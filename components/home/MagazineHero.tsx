'use client'

import Link from 'next/link'
import { useState } from 'react'
import { HERO_BG_IMAGE_PATH } from '@/lib/branding-paths'
import {
  HERO_STORY_LINES,
  SITE_CATCH_COPY,
  SITE_NAME,
  SITE_TAGLINE,
} from '@/lib/site'

type MagazineHeroProps = {
  exploreHref?: string
  contactHref?: string
  contactLabel?: string
}

/** 雑誌・特集風トップヒーロー */
export default function MagazineHero({
  exploreHref = '#posts',
  contactHref,
  contactLabel = '掲載・取材相談',
}: MagazineHeroProps) {
  const [bgError, setBgError] = useState(false)

  return (
    <header>
      {/* 1. メインビジュアル */}
      <div className="relative w-full aspect-[4/5] max-h-[70vh] bg-hokkaido-hero overflow-hidden">
        {!bgError ? (
          <img
            src={HERO_BG_IMAGE_PATH}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
            onError={() => setBgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-hokkaido-hero hokkaido-snow-pattern" aria-hidden="true" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <p className="text-[11px] tracking-[0.22em] text-white/80 mb-3">{SITE_NAME}</p>
          <h1 className="text-[1.75rem] font-bold leading-tight text-white whitespace-pre-line">
            {SITE_CATCH_COPY}
          </h1>
        </div>
      </div>

      {/* 2–4. キャッチ・ストーリー・CTA */}
      <div className="bg-[#FAFCFE] px-6 py-12">
        <p className="text-sm tracking-wide text-hokkaido-sky font-semibold">{SITE_TAGLINE}</p>

        <div className="mt-10 space-y-4 text-[15px] leading-[1.9] text-gray-700">
          {HERO_STORY_LINES.map((line, index) => (
            <p
              key={line}
              className={index === HERO_STORY_LINES.length - 1 ? 'font-bold text-hokkaido-deep' : ''}
            >
              {line}
            </p>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link
            href={exploreHref}
            className="inline-flex items-center justify-center rounded-full border border-hokkaido-deep px-6 py-3.5 text-sm font-bold text-hokkaido-deep hover:bg-hokkaido-deep hover:text-white transition-colors"
          >
            記事を探す
          </Link>
          {contactHref && (
            <Link
              href={contactHref}
              className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-medium text-gray-600 hover:text-hokkaido-deep transition-colors"
            >
              {contactLabel}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
