import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { M_PLUS_Rounded_1c, Noto_Sans_JP } from 'next/font/google'
import { createRootMetadata } from '@/lib/metadata'
import './globals.css'

const magazineRounded = M_PLUS_Rounded_1c({
  weight: ['400', '700', '800'],
  variable: '--font-magazine-rounded',
  display: 'swap',
})

const sans = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = createRootMetadata()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${magazineRounded.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-white font-sans text-magazine-text antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
