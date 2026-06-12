type LogoStampAProps = {
  size?: 'hero' | 'compact'
}

/** ロゴA：図鑑スタンプ型 */
export default function LogoStampA({ size = 'hero' }: LogoStampAProps) {
  const isHero = size === 'hero'

  return (
    <div
      className={`inline-flex flex-col items-center border border-[#E8EEF2] bg-white text-magazine-title font-magazine-rounded ${
        isHero ? 'w-full max-w-[320px] rounded-3xl px-6 py-5 shadow-sm' : 'rounded-2xl px-4 py-2.5'
      }`}
    >
      <p
        className={`font-bold tracking-[0.1em] ${
          isHero ? 'text-[1.35rem] leading-tight' : 'text-sm leading-none'
        }`}
      >
        北海道未来図鑑
      </p>
      {isHero && (
        <>
          <span className="mt-3 block h-px w-16 bg-[#E8EEF2]" aria-hidden="true" />
          <p className="mt-3 text-[10px] tracking-[0.28em] text-magazine-muted">WEB MAGAZINE</p>
        </>
      )}
    </div>
  )
}
