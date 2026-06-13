import Link from 'next/link'
import FadeInSection from '@/components/home/FadeInSection'
import { DESIGN_BANNER_LINK_CLASS, HOME_SPECIAL_FEATURES } from '@/lib/home-layout'

/** 特集バナー（初期3件） */
export default function SpecialFeaturesSection() {
  return (
    <FadeInSection
      id="special"
      aria-label="特集"
      className="scroll-mt-4 border-t border-magazine-border bg-white px-6 py-16"
    >
      <h2 className="font-magazine-rounded text-xl font-bold text-magazine-title">特集</h2>
      <div className="mt-8 space-y-4">
        {HOME_SPECIAL_FEATURES.map((feature) => (
          <Link
            key={feature.id}
            href={feature.href}
            className={`${DESIGN_BANNER_LINK_CLASS} bg-gradient-to-r ${feature.gradient}`}
          >
            <div className="relative aspect-[5/2] md:aspect-[5/2]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 py-5 md:px-10">
                <p className="text-[11px] font-bold tracking-[0.18em] text-[#E8C872]">SPECIAL</p>
                <h3 className="mt-2 font-magazine-rounded text-xl font-bold leading-snug text-white md:text-2xl">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85 md:text-[15px]">{feature.deck}</p>
                <span className="mt-4 inline-flex w-fit items-center rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition-colors group-hover:bg-white/20">
                  記事を見る
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </FadeInSection>
  )
}
