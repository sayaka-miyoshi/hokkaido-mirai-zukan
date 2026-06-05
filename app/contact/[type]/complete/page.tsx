import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ContactPageLayout, { ContactCompleteActions } from '@/components/ContactPageLayout'
import { getContactFormConfig } from '@/lib/contact/forms'
import { createPageMetadata } from '@/lib/metadata'
import { urls } from '@/lib/urls'

type PageProps = {
  params: Promise<{ type: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params
  const config = getContactFormConfig(type)
  if (!config?.enabled) return {}

  return createPageMetadata({
    title: `${config.successTitle} | ${config.pageTitle}`,
    description: config.successMessage.replace('\n', ' '),
    path: urls.contactComplete(type),
  })
}

export default async function ContactCompletePage({ params }: PageProps) {
  const { type } = await params
  const config = getContactFormConfig(type)

  if (!config?.enabled) notFound()

  return (
    <ContactPageLayout
      title={config.successTitle}
      description="お問い合わせを受け付けました。"
      breadcrumbLabel={config.menuLabel}
    >
      <div className="text-center py-3 sm:py-4">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-hokkaido-ice text-2xl text-hokkaido-deep"
          aria-hidden="true"
        >
          ✓
        </div>
        {config.successMessage.split('\n').map((line) => (
          <p key={line} className="text-gray-600 leading-relaxed text-sm sm:text-base">
            {line}
          </p>
        ))}
      </div>

      <ContactCompleteActions formType={type} />
    </ContactPageLayout>
  )
}
