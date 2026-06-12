import Link from 'next/link'
import { MAGAZINE_THEMES } from '@/lib/magazine-themes'

/** モック3用：目次風テーマ（絵文字なし・信頼感） */
export default function MockThemeIndexSection() {
  return (
    <section aria-label="テーマから読む" className="border-t border-[#E8EEF2] px-6 py-16">
      <p className="text-[11px] tracking-[0.24em] text-hokkaido-sky/90 font-semibold">THEME</p>
      <h2 className="mt-3 text-[1.625rem] font-bold text-[#1A3348] leading-snug">テーマから読む</h2>
      <p className="mt-4 text-sm text-gray-500 leading-[1.85]">
        学校・部活・企業・行政から、テーマ別に記事を探せます。
      </p>

      <div className="mt-8 grid grid-cols-4 gap-2 border-y border-[#E8EEF2] py-4">
        {['学校', '部活', '企業', '行政'].map((label) => (
          <span
            key={label}
            className="text-center text-[11px] font-medium tracking-[0.06em] text-[#1A3348]"
          >
            {label}
          </span>
        ))}
      </div>

      <nav aria-label="テーマ目次" className="mt-8">
        <ol>
          {MAGAZINE_THEMES.map((theme) => {
            const action = theme.href ? '一覧へ' : '記事を探す'
            const row = (
              <>
                <span className="text-[15px] text-[#1A3348]">{theme.label}</span>
                <span
                  className="mx-3 mb-1 flex-1 border-b border-dotted border-gray-300/80"
                  aria-hidden="true"
                />
                <span className="text-[11px] text-gray-400">{action} →</span>
              </>
            )

            return (
              <li key={theme.id} className="border-t border-[#E8EEF2] first:border-t-0">
                {theme.href ? (
                  <Link href={theme.href} className="flex w-full items-end py-7">
                    {row}
                  </Link>
                ) : (
                  <div className="flex w-full items-end py-7">{row}</div>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </section>
  )
}
