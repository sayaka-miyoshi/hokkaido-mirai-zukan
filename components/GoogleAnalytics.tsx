import Script from 'next/script'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()

/**
 * Google Analytics 4
 * - サーバーコンポーネントで測定IDを埋め込み（ビルド時の NEXT_PUBLIC_ を確実に反映）
 * - window.gtag を明示的に公開（カスタムイベント送信用）
 * - send_page_view 有効（g/collect へ page_view を送信）
 */
export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = function gtag(){window.dataLayer.push(arguments);}
          window.gtag('js', new Date());
          window.gtag('config', '${GA_MEASUREMENT_ID}', {
            anonymize_ip: true,
            send_page_view: true
          });
        `}
      </Script>
    </>
  )
}

export function getEmbeddedGaMeasurementId(): string | undefined {
  return GA_MEASUREMENT_ID || undefined
}
