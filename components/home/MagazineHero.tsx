'use client'

import Link from 'next/link'
import { useState } from 'react'
import LogoStampA from '@/components/brand/LogoStampA'
import { HERO_INTERVIEW_IMAGE_PATH, HERO_IMAGE_OBJECT_POSITION_MOBILE } from '@/lib/branding-paths'
import {
  HERO_CTA_DISCOVER,
  HERO_CTA_FEATURED,
  HERO_STORY_LINES,
  SITE_CATCH_COPY,
} from '@/lib/site'

/** 特集扉型ヒーロー（白背景・A-3・スマホ最優先） */
export default function MagazineHero() {
  const [imgError, setImgError] = useState(false)

  return (
    <header className="bg-white px-6 pb-12 pt-8">
      <div className="flex items-start justify-between gap-4">
        <LogoStampA size="compact" />
        <div className="pt-1 text-right">
          <p className="font-magazine-rounded text-[10px] tracking-[0.22em] text-magazine-muted">
            VOL.01
          </p>
          <p className="mt-1 text-[10px] tracking-[0.12em] text-magazine-muted">WEB MAGAZINE</p>
        </div>
      </div>

      <div className="relative mx-auto mt-8 w-full overflow-hidden rounded-3xl bg-magazine-sky shadow-sm">
        {!imgError ? (
          <img
            src={HERO_INTERVIEW_IMAGE_PATH}
            alt="企業・工場での取材風景"
            className="aspect-[4/5] w-full object-cover"
            style={{ objectPosition: HERO_IMAGE_OBJECT_POSITION_MOBILE }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center bg-magazine-sky text-sm text-magazine-muted">
            取材写真
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-white/95 px-5 py-5 backdrop-blur-[2px]">
          <h1 className="font-magazine-rounded text-[1.55rem] font-bold leading-[1.28] tracking-[-0.02em] text-magazine-title whitespace-pre-line">
            {SITE_CATCH_COPY}
          </h1>
        </div>
      </div>

      <div className="mx-auto mt-8 space-y-3">
        {HERO_STORY_LINES.map((line, index) => (
          <p
            key={line}
            className={`text-[14px] leading-[2.05] ${
              index === HERO_STORY_LINES.length - 1
                ? 'font-medium text-magazine-title'
                : 'text-magazine-text'
            }`}
          >
            {line}
          </p>
        ))}
      </div>

      <div className="mx-auto mt-10 flex flex-col gap-3">
        <Link
          href="#featured-stories"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-magazine-title px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {HERO_CTA_FEATURED}
          <span aria-hidden="true">↓</span>
        </Link>
        <Link
          href="#themes"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-magazine-border bg-white text-sm font-medium text-magazine-title transition-colors hover:bg-magazine-cream"
        >
          {HERO_CTA_DISCOVER}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  )
}
