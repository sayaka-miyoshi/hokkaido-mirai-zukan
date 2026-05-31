import type { Metadata } from 'next'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_TAGLINE,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-hokkaido-page min-h-screen">{children}</body>
    </html>
  )
}
