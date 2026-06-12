import Link from 'next/link'
import { OPERATOR_SECTION } from '@/lib/home-layout'
import { OPERATOR, OPERATOR_SOCIAL_LINKS } from '@/lib/site'
import { urls } from '@/lib/urls'
import OperatorProfileAvatar from './OperatorProfileAvatar'
import { SocialIcon } from './OperatorSocialIcons'

/** 運営者紹介（フッター直前） */
export default function OperatorSection() {
  return (
    <section
      id="operator"
      aria-label="運営者"
      className="scroll-mt-4 border-t border-magazine-border bg-white px-6 py-16"
    >
      <h2 className="font-magazine-rounded text-xl font-bold text-magazine-title">
        {OPERATOR_SECTION.title}
      </h2>

      <div className="mt-8 flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">
        <div className="shrink-0">
          <OperatorProfileAvatar className="h-28 w-28 md:h-32 md:w-32" />
        </div>

        <div className="w-full flex-1 text-center md:text-left">
          <p className="text-sm font-semibold tracking-wide text-[#B8922E]">{OPERATOR.titleLine}</p>
          <h3 className="mt-2 font-magazine-rounded text-2xl font-bold text-magazine-title">
            <Link href={urls.operator()} className="transition-colors hover:text-hokkaido-sky">
              {OPERATOR.name}
            </Link>
          </h3>
          <p className="mt-4 text-sm leading-[1.9] text-magazine-text">{OPERATOR.bio}</p>
          <p className="mt-3 text-sm leading-[1.9] text-magazine-muted">{OPERATOR.siteNote}</p>

          <Link
            href={urls.operator()}
            className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-full border-2 border-magazine-title bg-white px-6 text-sm font-bold text-magazine-title transition-colors hover:bg-magazine-cream md:w-auto md:min-w-[240px]"
          >
            運営者プロフィールを見る
          </Link>

          <ul className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
            {OPERATOR_SOCIAL_LINKS.map((social) => (
              <li key={social.platform}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-magazine-border bg-magazine-cream px-4 py-2 text-sm font-medium text-magazine-title transition-colors hover:border-hokkaido-sky hover:text-hokkaido-sky"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      social.platform === 'instagram'
                        ? 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white'
                        : social.platform === 'tiktok'
                          ? 'bg-black text-white'
                          : 'bg-[#ff0000] text-white'
                    }`}
                  >
                    <SocialIcon platform={social.platform} />
                  </span>
                  {social.label}
                </a>
              </li>
            ))}
          </ul>

          <Link
            href={urls.contact('publication')}
            className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-magazine-title px-6 text-base font-bold text-white shadow-magazine transition-opacity hover:opacity-90 md:w-auto md:min-w-[280px]"
          >
            {OPERATOR_SECTION.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
