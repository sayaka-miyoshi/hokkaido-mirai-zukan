import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()

/**
 * Google Analytics 4
 * @next/third-parties/google を使い g/collect 送信を保証する
 */
export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null
  return <NextGoogleAnalytics gaId={GA_MEASUREMENT_ID} />
}
