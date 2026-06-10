import Link from 'next/link'
import { CATEGORY_FILTERS } from '@/lib/site'
import { urls } from '@/lib/urls'

const CATEGORY_STORIES = [
  {
    genre: '学校',
    href: urls.schools(),
    lead: '校舎の空気、授業の様子、進路のリアルまで。',
    body: '学校紹介の記事から、自分に合う学びの場を見つけられます。',
  },
  {
    genre: '部活',
    href: urls.clubs(),
    lead: '練習の熱量、仲間の姿、部活の「今」が伝わる。',
    body: '競技や活動内容から、心が動く部活との出会いを。',
  },
  {
    genre: '企業訪問',
    href: '#posts',
    lead: '仕事の現場、人の想い、地域で挑戦する企業のストーリー。',
    body: '将来の選択肢を広げる、企業訪問の記事を掲載しています。',
  },
] as const

/** 学校・部活・企業カテゴリ（特集メディア風） */
export default function CategoryEditorialSection() {
  return (
    <section aria-label="カテゴリ" className="py-4">
      <div className="mb-10">
        <p className="text-[11px] tracking-[0.2em] text-hokkaido-sky font-semibold mb-2">
          CATEGORY
        </p>
        <h2 className="text-2xl font-bold text-hokkaido-deep leading-snug">
          学校・部活・企業から探す
        </h2>
      </div>

      <div className="space-y-0 divide-y divide-hokkaido-ice/80">
        {CATEGORY_STORIES.map((item) => {
          const filter = CATEGORY_FILTERS.find((entry) => entry.genre === item.genre)
          return (
            <Link
              key={item.genre}
              href={item.href}
              className="group block py-8 first:pt-0 last:pb-0"
            >
              <p className="text-[11px] tracking-[0.16em] text-gray-500 mb-2">
                {filter?.emoji} {filter?.label ?? item.genre}
              </p>
              <p className="text-lg font-bold text-hokkaido-deep leading-snug group-hover:text-hokkaido-sky transition-colors">
                {item.lead}
              </p>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.body}</p>
              <p className="mt-4 text-sm text-hokkaido-deep/70 group-hover:text-hokkaido-sky transition-colors">
                記事一覧へ →
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
