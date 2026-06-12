import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import OperatorPageContent from '@/components/operator/OperatorPageContent'
import { PROFILE_IMAGE_PATH } from '@/lib/branding-paths'
import { createBreadcrumbJsonLd, createPersonJsonLd } from '@/lib/json-ld'
import { createPageMetadata } from '@/lib/metadata'
import { OPERATOR_PAGE } from '@/lib/operator-page'
import { urls } from '@/lib/urls'

export const metadata: Metadata = createPageMetadata({
  title: OPERATOR_PAGE.title,
  description: OPERATOR_PAGE.description,
  path: urls.operator(),
  absoluteTitle: true,
  image: PROFILE_IMAGE_PATH,
})

export default function OperatorPage() {
  return (
    <>
      <JsonLd
        data={[
          createPersonJsonLd(),
          createBreadcrumbJsonLd([
            { name: 'ホーム', href: urls.home() },
            { name: OPERATOR_PAGE.breadcrumbLabel },
          ]),
        ]}
      />
      <OperatorPageContent />
    </>
  )
}
