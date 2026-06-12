import Link from 'next/link'
import { urls } from '@/lib/urls'

/** ⑧ 掲載・取材相談（強化版） */
export default function ContactPublicationSection() {
  return (
    <section
      id="contact"
      aria-label="掲載・取材相談"
      className="scroll-mt-4 border-t border-magazine-border bg-white px-6 py-20"
    >
      <h2 className="font-magazine-rounded text-[1.35rem] font-bold leading-[1.45] text-magazine-title">
        北海道の魅力を
        <br />
        一緒に発信しませんか？
      </h2>
      <ul className="mt-8 space-y-3 text-sm text-magazine-text">
        {['学校', '部活', '企業', '自治体', 'イベント'].map((item) => (
          <li key={item} className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-magazine-coral" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm font-medium text-magazine-title">取材依頼受付中</p>
      <Link
        href={urls.contact('publication')}
        className="mt-8 flex min-h-[52px] w-full items-center justify-center rounded-full bg-magazine-title text-base font-bold text-white shadow-magazine transition-opacity hover:opacity-90"
      >
        掲載・取材のお問い合わせ
      </Link>
    </section>
  )
}
