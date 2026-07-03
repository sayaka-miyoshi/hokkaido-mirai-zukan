'use client'

import { useEffect, useRef } from 'react'
import { trackAnalyticsEvent } from '@/lib/analytics/track-client'
import type { PageType } from '@/lib/analytics/events'

type PageViewTrackerProps = {
  pageType: PageType
  postId?: string
  entitySlug?: string
}

/** ページ表示時に page_view イベントを送信（GA4 連携前提） */
export default function PageViewTracker({ pageType, postId, entitySlug }: PageViewTrackerProps) {
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current) return
    sent.current = true

    trackAnalyticsEvent('page_view', {
      page_type: pageType,
      post_id: postId ?? '',
      entity_slug: entitySlug ?? '',
      path: window.location.pathname,
      referrer_source: 'direct',
    })
  }, [pageType, postId, entitySlug])

  return null
}
