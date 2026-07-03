'use client'

import Script from 'next/script'
import { getGaMeasurementId } from '@/lib/analytics/events'

/** Google Analytics 4（NEXT_PUBLIC_GA_MEASUREMENT_ID 設定時のみ読み込み） */
export default function GoogleAnalytics() {
  const measurementId = getGaMeasurementId()
  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: false,
            custom_map: { dimension1: 'traffic_source' }
          });
        `}
      </Script>
    </>
  )
}
