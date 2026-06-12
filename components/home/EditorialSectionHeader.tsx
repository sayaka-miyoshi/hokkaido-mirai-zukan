import type { SectionEyebrowKey } from '@/lib/magazine-design'
import { SECTION_EYEBROW_STYLES } from '@/lib/magazine-design'

type EditorialSectionHeaderProps = {
  eyebrow: string
  title: string
  description?: string
}

function eyebrowStyle(eyebrow: string): string {
  const key = eyebrow as SectionEyebrowKey
  return SECTION_EYEBROW_STYLES[key] ?? 'bg-magazine-sky text-magazine-title'
}

/** 雑誌セクション見出し */
export default function EditorialSectionHeader({
  eyebrow,
  title,
  description,
}: EditorialSectionHeaderProps) {
  return (
    <header>
      <p
        className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.18em] ${eyebrowStyle(eyebrow)}`}
      >
        {eyebrow}
      </p>
      <h2 className="mt-4 font-magazine-rounded text-[1.65rem] font-bold leading-snug text-magazine-title">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm leading-[1.9] text-magazine-muted">{description}</p>
      )}
    </header>
  )
}
