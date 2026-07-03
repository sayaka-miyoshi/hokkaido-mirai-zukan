import type { ReactNode } from 'react'
import type { DataSource } from '@/types/fetch-result'
import JsonLd from '@/components/JsonLd'
import { createBreadcrumbJsonLd, createCollectionPageJsonLd } from '@/lib/json-ld'
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
  /** 構造化データ・canonical 用のページパス */
  seoPath?: string
  /** CollectionPage 以外の追加 JSON-LD */
  extraJsonLd?: Record<string, unknown>[]
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
  seoPath,
  extraJsonLd = [],
  children,
}: EntityPageLayoutProps) {
  return (
    <div className="min-h-screen">
      {seoPath && (
        <JsonLd
          data={[
            createBreadcrumbJsonLd([
              { name: 'ホーム', href: urls.home() },
              { name: breadcrumbLabel, href: seoPath },
            ]),
            createCollectionPageJsonLd({
              name: title,
              description,
              path: seoPath,
            }),
            ...extraJsonLd,
          ]}
        />
      )}
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
          <p className="mt-3 text-base leading-relaxed text-gray-600">{description}</p>
          <p className="text-sm text-gray-500 mt-3">{count}件の記事</p>
        </header>
        {children}
      </main>
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-hokkaido-ice">
        <p>© 2026 {INSTAGRAM_HANDLE} | {SITE_NAME}</p>
      </footer>
    </div>
  )
}
