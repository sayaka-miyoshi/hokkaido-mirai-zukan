'use client'

import { useEffect } from 'react'
import { initTrafficAttribution } from '@/lib/analytics/track-client'

/** 初回着地の流入元判定 + iSTEP UTM 計測 */
export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTrafficAttribution()
  }, [])

  return children
}
