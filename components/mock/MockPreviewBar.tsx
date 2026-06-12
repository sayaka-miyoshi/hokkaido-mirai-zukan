import Link from 'next/link'
import { MOCK_VARIANTS, type MockVariantId } from '@/lib/mock-design'

type MockPreviewBarProps = {
  active: MockVariantId
}

/** デザイン確認用の固定バー（モックページのみ） */
export default function MockPreviewBar({ active }: MockPreviewBarProps) {
  return (
    <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50/95 px-4 py-3 backdrop-blur-sm">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-amber-800">DESIGN MOCK</p>
      <p className="mt-1 text-xs text-amber-900/80">本番トップとは別ページです</p>
      <div className="mt-3 flex gap-2">
        {(Object.keys(MOCK_VARIANTS) as MockVariantId[]).map((id) => {
          const variant = MOCK_VARIANTS[id]
          const isActive = id === active
          return (
            <Link
              key={id}
              href={`/mock/${variant.slug}`}
              className={`flex-1 rounded-lg px-2 py-2 text-center text-[11px] font-medium transition-colors ${
                isActive
                  ? 'bg-[#1A3348] text-white'
                  : 'border border-amber-200 bg-white text-[#1A3348]'
              }`}
            >
              {variant.label}
            </Link>
          )
        })}
        <Link
          href="/mock"
          className="shrink-0 rounded-lg border border-amber-200 bg-white px-2 py-2 text-[11px] text-[#1A3348]"
        >
          一覧
        </Link>
      </div>
    </div>
  )
}
