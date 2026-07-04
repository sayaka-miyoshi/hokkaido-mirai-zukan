'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { sendGAEvent } from '@next/third-parties/google'

/**
 * App Router のクライアント遷移でも page_view を送る
 * （初回ロードは @next/third-parties の gtag config が担当）
 */
export default function GaRouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    const query = searchParams?.toString()
    const pagePath = query ? `${pathname}?${query}` : pathname

    try {
      sendGAEvent('event', 'page_view', {
        page_path: pagePath,
        page_location: typeof window !== 'undefined' ? window.location.href : pagePath,
        page_title: typeof document !== 'undefined' ? document.title : '',
      })
    } catch {
      // GA 未初期化時
    }
  }, [pathname, searchParams])

  return null
}
