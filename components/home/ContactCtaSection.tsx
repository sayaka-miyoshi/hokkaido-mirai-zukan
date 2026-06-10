import Link from 'next/link'
import { urls } from '@/lib/urls'

type ContactCtaSectionProps = {
  menuLabel: string
}

export default function ContactCtaSection({ menuLabel }: ContactCtaSectionProps) {
  return (
    <section aria-label="掲載・取材相談">
      <div className="relative overflow-hidden rounded-3xl border border-hokkaido-sky/25 bg-gradient-to-br from-hokkaido-deep via-hokkaido-lake to-hokkaido-sky p-6 text-white shadow-[0_12px_40px_rgba(26,77,124,0.22)]">
        <div
          aria-hidden="true"
          className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-white/10 blur-xl"
        />

        <div className="relative">
          <p className="text-[11px] font-semibold tracking-widest text-white/75 mb-2">
            Contact
          </p>
          <h2 className="text-xl font-bold leading-snug">掲載・取材相談</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/90">
            学校・部活・企業の魅力を、一緒に未来へつなぎませんか。
            掲載や取材のご相談は、お気軽にお問い合わせください。
          </p>
          <Link
            href={urls.contact('publication')}
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-hokkaido-deep shadow-lg hover:bg-hokkaido-ice transition-colors active:scale-[0.99]"
          >
            {menuLabel}はこちら
          </Link>
        </div>
      </div>
    </section>
  )
}
