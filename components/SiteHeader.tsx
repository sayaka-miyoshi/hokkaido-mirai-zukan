import Link from 'next/link'
import { urls } from '@/lib/urls'

export default function SiteHeader() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
        <Link href={urls.home()} className="flex items-center gap-3">
          <div className="instagram-gradient p-0.5 rounded-xl">
            <div className="bg-white rounded-[10px] p-1.5">
              <span className="text-2xl">🏫</span>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">北海道未来図鑑</h1>
            <p className="text-xs text-gray-400">@insta.sayakans</p>
          </div>
        </Link>
        <a
          href="https://www.instagram.com/insta.sayakans/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto instagram-gradient text-white text-xs font-bold px-4 py-2 rounded-full"
        >
          Instagramを見る
        </a>
      </div>
    </header>
  )
}
