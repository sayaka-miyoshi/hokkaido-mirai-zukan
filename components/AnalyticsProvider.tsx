'use client'

import { Suspense, useEffect } from 'react'
import GaRouteTracker from '@/components/GaRouteTracker'
import { initTrafficAttribution } from '@/lib/analytics/track-client'

/** 初回着地の流入元判定 + ルート変更時の page_view */
export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTrafficAttribution()
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <GaRouteTracker />
      </Suspense>
      {children}
    </>
  )
}
