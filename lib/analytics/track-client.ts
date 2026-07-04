'use client'

import { track as vercelTrack } from '@vercel/analytics'
import {
  readPersistedTrafficSource,
  resolveTrafficSource,
  persistTrafficSource,
  type TrafficSource,
} from '@/lib/attribution'
import {
  getGaMeasurementId,
  isAnalyticsEnabled,
  type AnalyticsEventName,
  type AnalyticsEventPayload,
} from '@/lib/analytics/events'

type GtagFn = (...args: unknown[]) => void

function getGtag(): GtagFn | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as Window & { gtag?: GtagFn; dataLayer?: unknown[] }
  if (typeof w.gtag === 'function') return w.gtag

  // gtag 未初期化時は dataLayer 経由でキューイング
  w.dataLayer = w.dataLayer || []
  w.gtag = function gtag(...args: unknown[]) {
    w.dataLayer!.push(args)
  }
  return w.gtag
}

function flattenPayload(data: Record<string, string | number | boolean>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(data)) {
    out[key] = String(value)
  }
  return out
}

function currentTrafficSource(): TrafficSource {
  return (
    readPersistedTrafficSource() ??
    resolveTrafficSource({
      searchParams: new URLSearchParams(window.location.search),
      referrer: document.referrer,
    })
  )
}

/** 初回着地時に流入元を確定し、iSTEP UTM があれば istep_landing を送信 */
export function initTrafficAttribution(): TrafficSource {
  if (!isAnalyticsEnabled()) return 'direct'

  const params = new URLSearchParams(window.location.search)
  const source = resolveTrafficSource({
    searchParams: params,
    referrer: document.referrer,
  })
  persistTrafficSource(source)

  const utmSource = params.get('utm_source')?.trim() ?? ''
  const utmMedium = params.get('utm_medium')?.trim() ?? ''
  const dmGroup = params.get('dm_group')?.trim() ?? ''

  if (utmSource === 'istep' || utmMedium === 'dm' || dmGroup) {
    trackAnalyticsEvent('istep_landing', {
      utm_source: utmSource || 'istep',
      utm_campaign: params.get('utm_campaign')?.trim() ?? '',
      dm_group: dmGroup,
      path: window.location.pathname,
      referrer_source: source,
    })
  }

  return source
}

/** GA4 + Vercel Analytics へ同一イベントを送信 */
export function trackAnalyticsEvent<Name extends AnalyticsEventName>(
  name: Name,
  data: AnalyticsEventPayload[Name],
): void {
  if (!isAnalyticsEnabled()) return

  const referrer_source = ('referrer_source' in data
    ? data.referrer_source
    : currentTrafficSource()) as TrafficSource

  const payload = { ...data, referrer_source } as Record<string, string | number | boolean>
  const flat = flattenPayload(payload)

  try {
    vercelTrack(name, flat)
  } catch {
    // Vercel Analytics 未接続時
  }

  const gtag = getGtag()
  const gaId = getGaMeasurementId()
  if (gtag && gaId) {
    gtag('event', name, {
      ...flat,
      traffic_source: referrer_source,
      send_to: gaId,
    })
  }
}
