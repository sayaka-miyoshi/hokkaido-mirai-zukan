import Link from 'next/link'
import { INSTAGRAM_URL, SITE_NAME, INSTAGRAM_HANDLE } from '@/lib/site'
import { urls } from '@/lib/urls'

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 bg-hokkaido-hero text-white shadow-md">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
        <Link href={urls.home()} className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0" aria-hidden="true">🗻</span>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{SITE_NAME}</p>
            <p className="text-[10px] text-white/70">{INSTAGRAM_HANDLE}</p>
          </div>
        </Link>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 text-[11px] font-bold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full transition-colors"
        >
          Instagram
        </a>
      </div>
    </header>
  )
}
