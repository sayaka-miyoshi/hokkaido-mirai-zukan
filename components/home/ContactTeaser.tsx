import Link from 'next/link'
import { CONTACT_SECTION } from '@/lib/home-layout'
import { urls } from '@/lib/urls'

/** 掲載・取材相談への導線 */
export default function ContactTeaser() {
  return (
    <section aria-label="お問い合わせ" className="border-t border-magazine-border bg-white px-6 py-16">
      <div className="rounded-3xl bg-magazine-mint px-6 py-8 shadow-magazine-sm">
        <h2 className="font-magazine-rounded text-lg font-bold text-magazine-title">
          {CONTACT_SECTION.title}
        </h2>
        <p className="mt-3 text-sm leading-[1.9] text-magazine-text">{CONTACT_SECTION.description}</p>
        <Link
          href={urls.contact('publication')}
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-magazine-title px-6 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          {CONTACT_SECTION.linkLabel}
        </Link>
      </div>
    </section>
  )
}
