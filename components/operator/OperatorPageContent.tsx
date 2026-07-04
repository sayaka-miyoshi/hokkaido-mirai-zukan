import Link from 'next/link'
import OperatorProfileAvatar from '@/components/home/OperatorProfileAvatar'
import { SocialIcon } from '@/components/home/OperatorSocialIcons'
import SiteHeader from '@/components/SiteHeader'
import Breadcrumb from '@/components/Breadcrumb'
import { OPERATOR_SECTION } from '@/lib/home-layout'
import { OPERATOR_PAGE } from '@/lib/operator-page'
import { INSTAGRAM_HANDLE, SITE_NAME } from '@/lib/site'
import { urls } from '@/lib/urls'

/** 運営者詳細ページ本文 */
export default function OperatorPageContent() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: 'ホーム', href: urls.home() },
            { label: OPERATOR_PAGE.breadcrumbLabel },
          ]}
        />

        <article className="mt-8">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">
            <div className="shrink-0">
              <OperatorProfileAvatar className="h-36 w-36 md:h-40 md:w-40" />
            </div>

            <div className="w-full flex-1 text-center md:text-left">
              <h1 className="font-magazine-rounded text-2xl font-bold leading-snug text-magazine-title md:text-3xl">
                {OPERATOR_PAGE.h1}
              </h1>

              <ul
                className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start"
                aria-label="肩書き"
              >
                {OPERATOR_PAGE.titles.map((title) => (
                  <li key={title}>
                    <span className="inline-block rounded-full border border-[#E8C872]/60 bg-magazine-cream px-3 py-1 text-xs font-semibold text-[#B8922E]">
                      {title}
                    </span>
                  </li>
                ))}
              </ul>

              <section aria-label="SNS実績" className="mt-8">
                <h2 className="sr-only">SNS実績</h2>
                <ul className="space-y-3">
                  {OPERATOR_PAGE.socialAccounts.map((social) => (
                    <li key={social.platform}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 rounded-2xl border border-magazine-border bg-magazine-cream px-4 py-3 text-sm font-medium text-magazine-title transition-colors hover:border-hokkaido-sky hover:text-hokkaido-sky md:justify-start"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            social.platform === 'instagram'
                              ? 'bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white'
                              : social.platform === 'tiktok'
                                ? 'bg-black text-white'
                                : 'bg-[#ff0000] text-white'
                          }`}
                        >
                          <SocialIcon platform={social.platform} />
                        </span>
                        <span className="text-left">
                          <span className="block font-bold">
                            {social.label} {social.stat}
                          </span>
                          <span className="block text-xs text-magazine-muted">{social.handle}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <section className="mt-10 space-y-4 border-t border-magazine-border pt-10">
            <h2 className="font-magazine-rounded text-lg font-bold text-magazine-title">
              プロフィール
            </h2>
            {OPERATOR_PAGE.profileParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-[2] text-magazine-text">
                {paragraph}
              </p>
            ))}
          </section>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={urls.home()}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-magazine-border bg-white px-6 text-sm font-bold text-magazine-title transition-colors hover:border-hokkaido-sky hover:text-hokkaido-sky"
            >
              北海道未来図鑑トップへ
            </Link>
            <Link
              href={urls.contact('publication')}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-magazine-title px-6 text-sm font-bold text-white shadow-magazine transition-opacity hover:opacity-90"
            >
              {OPERATOR_SECTION.ctaLabel}
            </Link>
          </div>

          <p className="mt-8 text-center text-sm md:text-left">
            <Link href="/operator/seo" className="text-hokkaido-sky hover:underline">
              SEO・分析レポート（運用向け）→
            </Link>
          </p>
        </article>
      </main>

      <footer className="border-t border-magazine-border bg-magazine-sky py-10 text-center text-xs text-magazine-muted">
        <p>
          © 2026 {INSTAGRAM_HANDLE} | {SITE_NAME}
        </p>
      </footer>
    </div>
  )
}
