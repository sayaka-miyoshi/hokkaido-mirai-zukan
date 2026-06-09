import type { Metadata } from 'next'
import { createRootMetadata } from '@/lib/metadata'
import './globals.css'

export const metadata: Metadata = createRootMetadata()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-hokkaido-page min-h-screen">{children}</body>
    </html>
  )
}
