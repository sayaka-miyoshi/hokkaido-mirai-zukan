'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()

type GtagFn = (...args: unknown[]) => void

/**
 * App Router のクライアント遷移でも page_view を送る
 * （初回ロードは gtag config の send_page_view が担当）
 */
export default function GaRouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirst = useRef(true)

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    const query = searchParams?.toString()
    const pagePath = query ? `${pathname}?${query}` : pathname
    const gtag = (window as Window & { gtag?: GtagFn }).gtag
    if (!gtag) return

    gtag('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
    })
  }, [pathname, searchParams])

  return null
}
