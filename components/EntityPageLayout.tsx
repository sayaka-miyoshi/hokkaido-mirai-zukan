import type { ReactNode } from 'react'
import type { DataSource } from '@/types/fetch-result'
import SiteHeader from './SiteHeader'
import Breadcrumb from './Breadcrumb'
import DataFetchAlert from './DataFetchAlert'
import { INSTAGRAM_HANDLE, SITE_NAME } from '@/lib/site'
import { urls } from '@/lib/urls'

type EntityPageLayoutProps = {
  title: string
  description: string
  breadcrumbLabel: string
  count: number
  dataSource?: DataSource
  dataError?: string
  totalFetchedCount?: number
  children: ReactNode
}

export default function EntityPageLayout({
  title,
  description,
  breadcrumbLabel,
  count,
  dataSource,
  dataError,
  totalFetchedCount,
  children,
}: EntityPageLayoutProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumb
          items={[
            { label: 'ホーム', href: urls.home() },
            { label: breadcrumbLabel },
          ]}
        />
        {dataSource && (
          <DataFetchAlert
            source={dataSource}
            totalCount={totalFetchedCount ?? count}
            error={dataError}
          />
        )}
        <header className="mb-6">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-500 text-sm mt-2">{description}</p>
          <p className="text-sm text-gray-500 mt-3">{count}件の投稿</p>
        </header>
        {children}
      </main>
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-hokkaido-ice">
        <p>© 2026 {INSTAGRAM_HANDLE} | {SITE_NAME}</p>
      </footer>
    </div>
  )
}
