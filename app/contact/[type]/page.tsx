import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ContactForm from '@/components/ContactForm'
import ContactPageLayout from '@/components/ContactPageLayout'
import { getContactPreviewMessages, isContactPreviewMode } from '@/lib/contact/config'
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
    title: config.pageTitle,
    description: config.pageDescription.replace(/\n+/g, ' '),
    path: urls.contact(type),
  })
}

export default async function ContactPage({ params }: PageProps) {
  const { type } = await params
  const config = getContactFormConfig(type)

  if (!config?.enabled) notFound()

  return (
    <ContactPageLayout
      title={config.pageTitle}
      description={config.pageDescription}
      breadcrumbLabel={config.menuLabel}
      previewMode={isContactPreviewMode()}
      previewMessages={getContactPreviewMessages()}
    >
      <ContactForm
        config={config}
        recaptchaSiteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
      />
    </ContactPageLayout>
  )
}
