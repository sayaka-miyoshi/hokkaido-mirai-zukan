import Link from 'next/link'
import LogoStampA from '@/components/mock/LogoStampA'
import { HERO_INTERVIEW_IMAGE_PATH } from '@/lib/branding-paths'
import { HERO_CTA_FEATURED, HERO_STORY_LINES, SITE_CATCH_COPY } from '@/lib/site'

/** モック1：表紙型ヒーロー */
export default function MockCoverHero() {
  return (
    <header className="flex min-h-[85svh] flex-col bg-white px-6 pb-10 pt-8">
      <div className="flex justify-center">
        <LogoStampA size="hero" />
      </div>

      <div className="relative mx-auto mt-8 w-full max-w-[360px] overflow-hidden rounded-2xl bg-[#F7F9FB]">
        <img
          src={HERO_INTERVIEW_IMAGE_PATH}
          alt="学生や企業担当者への取材風景"
          className="aspect-[4/5] w-full object-cover object-center"
        />
      </div>

      <div className="mx-auto mt-10 w-full max-w-[360px]">
        <h1 className="text-[1.75rem] font-bold leading-[1.25] tracking-[-0.02em] text-[#1A3348] whitespace-pre-line">
          {SITE_CATCH_COPY}
        </h1>

        <div className="mt-8 border-t border-[#E8EEF2] pt-8">
          {HERO_STORY_LINES.map((line, index) => (
            <p
              key={line}
              className={`text-[14px] leading-[2.05] ${
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
          className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-[#1A3348]"
        >
          <span className="border-b border-[#1A3348]/30 pb-0.5">{HERO_CTA_FEATURED}</span>
          <span aria-hidden="true">↓</span>
        </Link>
      </div>
    </header>
  )
}
