import Link from 'next/link'
import LogoStampA from '@/components/mock/LogoStampA'
import { HERO_INTERVIEW_IMAGE_PATH } from '@/lib/branding-paths'
import { HERO_CTA_FEATURED, HERO_STORY_LINES, SITE_CATCH_COPY } from '@/lib/site'

/** モック3：特集扉型ヒーロー */
export default function MockFeatureHero() {
  return (
    <header className="bg-white px-6 pb-10 pt-8">
      <div className="flex items-start justify-between gap-4">
        <LogoStampA size="compact" />
        <div className="pt-1 text-right">
          <p className="text-[10px] tracking-[0.22em] text-[#6B7C8F]">VOL.01</p>
          <p className="mt-1 text-[10px] tracking-[0.12em] text-[#6B7C8F]">WEB MAGAZINE</p>
        </div>
      </div>

      <div className="relative mx-auto mt-8 w-full max-w-[360px] overflow-hidden rounded-2xl bg-[#F7F9FB]">
        <img
            src={HERO_INTERVIEW_IMAGE_PATH}
          alt="学生や企業担当者への取材風景"
          className="aspect-[4/5] w-full object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 bg-white/95 px-5 py-5 backdrop-blur-[2px]">
          <h1 className="text-[1.5rem] font-bold leading-[1.28] tracking-[-0.02em] text-[#1A3348] whitespace-pre-line">
            {SITE_CATCH_COPY}
          </h1>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-[360px] space-y-3">
        {HERO_STORY_LINES.map((line, index) => (
          <p
            key={line}
            className={`text-[14px] leading-[2.0] ${
              index === HERO_STORY_LINES.length - 1
                ? 'font-medium text-[#1A3348]'
                : 'text-[#5A6B7C]'
            }`}
          >
            {line}
          </p>
        ))}
      </div>

      <Link
        href="#featured-stories"
        className="mx-auto mt-8 flex w-full max-w-[360px] items-center gap-2 text-sm font-medium text-[#1A3348]"
      >
        <span className="border-b border-[#1A3348]/30 pb-0.5">{HERO_CTA_FEATURED}</span>
        <span aria-hidden="true">↓</span>
      </Link>
    </header>
  )
}
