import Link from 'next/link'
import type { ReactNode } from 'react'
import ContactPreviewNotice from './ContactPreviewNotice'
import SiteHeader from './SiteHeader'
import Breadcrumb from './Breadcrumb'
import { INSTAGRAM_HANDLE, SITE_NAME } from '@/lib/site'
import { urls } from '@/lib/urls'

type ContactPageLayoutProps = {
  title: string
  description?: string
  breadcrumbLabel: string
  previewMode?: boolean
  previewMessages?: string[]
  children: ReactNode
}

export default function ContactPageLayout({
  title,
  description,
  breadcrumbLabel,
  previewMode = false,
  previewMessages = [],
  children,
}: ContactPageLayoutProps) {
  return (
    <div className="min-h-screen bg-hokkaido-page">
      <SiteHeader />
      <main className="max-w-xl mx-auto px-4 py-6 sm:py-8">
        <Breadcrumb
          items={[
            { label: 'ホーム', href: urls.home() },
            { label: breadcrumbLabel },
          ]}
        />

        <div className="rounded-2xl bg-hokkaido-hero text-white px-5 py-6 sm:px-6 sm:py-7 mb-5 shadow-sm hokkaido-snow-pattern">
          <h1 className="text-xl sm:text-2xl font-bold leading-snug">{title}</h1>
          {description && (
            <div className="mt-2.5 space-y-2.5">
              {description
                .split('\n\n')
                .filter(Boolean)
                .map((paragraph) => (
                  <p key={paragraph} className="text-sm text-white/90 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
            </div>
          )}
        </div>

        {previewMode && (
          <ContactPreviewNotice className="mb-4" messages={previewMessages} />
        )}

        <div className="rounded-2xl bg-white/95 border border-hokkaido-ice shadow-sm p-5 sm:p-7">
          {children}
        </div>

        <p className="mt-5 text-[11px] text-gray-400 leading-relaxed text-center px-2">
          ご入力いただいた情報は、お問い合わせへのご返信以外には使用しません。
        </p>
      </main>
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-hokkaido-ice bg-white/60">
        <p>© 2026 {INSTAGRAM_HANDLE} | {SITE_NAME}</p>
      </footer>
    </div>
  )
}

export function ContactCompleteActions({ formType }: { formType: string }) {
  return (
    <div className="flex flex-col gap-3 mt-6">
      <Link
        href={urls.home()}
        className="w-full rounded-xl bg-hokkaido-deep text-white font-bold py-3.5 text-sm text-center shadow-sm hover:opacity-95 transition-opacity"
      >
        トップページへ戻る
      </Link>
      <Link
        href={urls.contact(formType)}
        className="w-full rounded-xl border border-hokkaido-ice bg-white text-hokkaido-deep font-medium py-3.5 text-sm text-center hover:border-hokkaido-sky transition-colors"
      >
        もう一度お問い合わせする
      </Link>
    </div>
  )
}
