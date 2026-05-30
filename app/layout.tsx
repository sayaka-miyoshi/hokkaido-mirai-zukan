import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '北海道未来図鑑',
  description: '北海道の学校・部活・企業訪問に関するInstagram投稿を検索できるサイトです。@insta.sayakans',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
