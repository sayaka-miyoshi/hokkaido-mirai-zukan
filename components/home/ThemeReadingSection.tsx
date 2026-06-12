'use client'

import Link from 'next/link'
import EditorialSectionHeader from '@/components/home/EditorialSectionHeader'
import type { MagazineTheme } from '@/lib/magazine-themes'
import { MAGAZINE_THEMES } from '@/lib/magazine-themes'
import { QUICK_SEARCH_CATEGORIES, THEME_SECTION } from '@/lib/home-layout'
import { CATEGORY_CARD_STYLES } from '@/lib/magazine-design'

type ThemeReadingSectionProps = {
  onSelectTheme: (theme: MagazineTheme) => void
  selectedGenre: string | null
}

function themeActionLabel(theme: MagazineTheme): string {
  if (theme.href) return '一覧へ'
  return '記事を探す'
}

const CARD_STYLE_BY_ID = {
  school: CATEGORY_CARD_STYLES.school,
  club: CATEGORY_CARD_STYLES.club,
  company: CATEGORY_CARD_STYLES.company,
  admin: CATEGORY_CARD_STYLES.admin,
} as const

/** テーマから読む（特集目次風・検索導線維持） */
export default function ThemeReadingSection({
  onSelectTheme,
  selectedGenre,
}: ThemeReadingSectionProps) {
  return (
    <section
      id="themes"
      aria-label="テーマから読む"
      className="scroll-mt-4 bg-magazine-sky px-6 py-20"
    >
      <EditorialSectionHeader
        eyebrow={THEME_SECTION.eyebrow}
        title={THEME_SECTION.title}
        description={THEME_SECTION.description}
      />

      <div className="mt-10 grid grid-cols-2 gap-3" aria-label="カテゴリから探す">
        {QUICK_SEARCH_CATEGORIES.map((category) => {
          const style = CARD_STYLE_BY_ID[category.id as keyof typeof CARD_STYLE_BY_ID]
          const isActive = 'genre' in category && selectedGenre === category.genre
          const cardClass = `flex min-h-[88px] flex-col items-center justify-center rounded-2xl border px-3 py-4 text-center transition-transform active:scale-[0.98] ${
            isActive ? 'ring-2 ring-magazine-title/20' : ''
          }`

          if ('href' in category && category.href) {
            return (
              <Link
                key={category.id}
                href={category.href}
                className={cardClass}
                style={{ backgroundColor: style.bg, borderColor: style.border }}
              >
                <span className="text-2xl" aria-hidden="true">
                  {style.emoji}
                </span>
                <span className="mt-2 font-magazine-rounded text-sm font-bold text-magazine-title">
                  {category.label}
                </span>
                <span className="mt-1 text-[10px] text-magazine-muted">一覧へ</span>
              </Link>
            )
          }

          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                onSelectTheme({ id: category.id, label: category.label, genre: category.genre })
              }
              className={cardClass}
              style={{ backgroundColor: style.bg, borderColor: style.border }}
            >
              <span className="text-2xl" aria-hidden="true">
                {style.emoji}
              </span>
              <span className="mt-2 font-magazine-rounded text-sm font-bold text-magazine-title">
                {category.label}
              </span>
              <span className="mt-1 text-[10px] text-magazine-muted">記事を探す</span>
            </button>
          )
        })}
      </div>

      <div className="mt-8 grid grid-cols-4 gap-1 rounded-2xl border border-magazine-border bg-white/70 px-2 py-3">
        {['学校', '部活', '企業', '進路'].map((label) => (
          <span
            key={label}
            className="text-center font-magazine-rounded text-[11px] font-bold text-magazine-title"
          >
            {label}
          </span>
        ))}
      </div>

      <nav aria-label="テーマ目次" className="mt-10 rounded-3xl bg-white px-5 py-2 shadow-magazine-sm">
        <p className="mb-2 px-1 pt-4 text-[10px] tracking-[0.16em] text-magazine-muted">テーマ一覧</p>
        <ol>
          {MAGAZINE_THEMES.map((theme) => {
            const isActive = theme.genre != null && selectedGenre === theme.genre
            const rowInner = (
              <>
                <span
                  className={`text-[15px] leading-relaxed ${
                    isActive ? 'font-bold text-magazine-title' : 'text-magazine-text'
                  }`}
                >
                  {theme.label}
                </span>
                <span
                  className="mx-3 mb-1 flex-1 border-b border-dotted border-gray-300/70"
                  aria-hidden="true"
                />
                <span className="text-[11px] text-magazine-muted">{themeActionLabel(theme)} →</span>
              </>
            )
            const rowClass = 'group flex w-full items-end py-6 text-left first:pt-2'

            return (
              <li key={theme.id} className="border-t border-magazine-border/70 first:border-t-0">
                {theme.href ? (
                  <Link href={theme.href} className={rowClass}>
                    {rowInner}
                  </Link>
                ) : (
                  <button type="button" onClick={() => onSelectTheme(theme)} className={rowClass}>
                    {rowInner}
                  </button>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </section>
  )
}
