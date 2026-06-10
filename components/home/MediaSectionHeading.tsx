type MediaSectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
}

/** メディアサイト向けセクション見出し */
export default function MediaSectionHeading({
  eyebrow,
  title,
  description,
}: MediaSectionHeadingProps) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="text-[11px] font-semibold tracking-widest text-hokkaido-sky uppercase mb-1.5">
          {eyebrow}
        </p>
      )}
      <h2 className="text-lg font-bold text-hokkaido-deep leading-snug">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
      )}
    </div>
  )
}
