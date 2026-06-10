import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'

/** 北海道未来図鑑とは（エディトリアル） */
export default function AboutSection() {
  return (
    <section aria-label="北海道未来図鑑とは" className="py-4">
      <p className="text-[11px] tracking-[0.2em] text-hokkaido-sky font-semibold mb-2">ABOUT</p>
      <h2 className="text-2xl font-bold text-hokkaido-deep leading-snug">{SITE_NAME}とは</h2>
      <p className="mt-6 text-[15px] leading-[1.9] text-gray-700">{SITE_TAGLINE}</p>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        学校・部活・企業・行政の現場を取材し、知られていない挑戦を記事と動画で届けるWebマガジンです。
      </p>
    </section>
  )
}
