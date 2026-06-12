import type { Metadata } from 'next'
import Link from 'next/link'
import { MOCK_VARIANTS } from '@/lib/mock-design'

export const metadata: Metadata = {
  title: 'デザインモック一覧 | 北海道未来図鑑',
  robots: { index: false, follow: false },
}

export default function MockIndexPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-amber-800">DESIGN MOCK</p>
      <h1 className="mt-2 text-xl font-bold text-[#1A3348]">トップページ デザイン確認</h1>
      <p className="mt-4 text-sm leading-[1.85] text-gray-600">
        本番トップ（/）は変更していません。スマホで以下の2案を確認してください。
      </p>

      <ul className="mt-8 space-y-4">
        {Object.values(MOCK_VARIANTS).map((variant) => (
          <li key={variant.id}>
            <Link
              href={`/mock/${variant.slug}`}
              className="block rounded-2xl border border-[#E8EEF2] bg-[#F7F9FB] px-5 py-5 transition-colors hover:border-hokkaido-sky/40"
            >
              <p className="text-[11px] tracking-[0.12em] text-hokkaido-sky">{variant.label}</p>
              <p className="mt-2 font-bold text-[#1A3348]">{variant.title}</p>
              <p className="mt-2 text-sm text-gray-600">{variant.description}</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-xs text-gray-400">
        本番サイト:{' '}
        <Link href="/" className="text-hokkaido-sky underline">
          /
        </Link>
      </p>
    </div>
  )
}
