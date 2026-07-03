import type { TrafficSource } from '@/lib/attribution'

/** 分析イベント名（GA4 event name 兼 Vercel track name） */
export type AnalyticsEventName =
  | 'page_view'
  | 'search_query'
  | 'search_result_click'
  | 'related_click'
  | 'popular_click'
  | 'istep_landing'

export type PageType =
  | 'home'
  | 'post'
  | 'school'
  | 'club'
  | 'sport'
  | 'company'
  | 'area'
  | 'listing'
  | 'other'

export type AnalyticsEventPayload = {
  page_view: {
    page_type: PageType
    post_id?: string
    entity_slug?: string
    referrer_source: TrafficSource
    path: string
  }
  search_query: {
    query: string
    result_count: number
    referrer_source: TrafficSource
  }
  search_result_click: {
    query: string
    post_id: string
    position: number
    referrer_source: TrafficSource
  }
  related_click: {
    from_post_id: string
    to_post_id: string
    section: string
    referrer_source: TrafficSource
  }
  popular_click: {
    post_id: string
    rank: number
    source: string
    referrer_source: TrafficSource
  }
  istep_landing: {
    utm_source: string
    utm_campaign: string
    dm_group: string
    path: string
    referrer_source: TrafficSource
  }
}

export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const flag = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED?.trim().toLowerCase()
  if (flag === '0' || flag === 'false' || flag === 'off') return false
  return true
}

export function getGaMeasurementId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || undefined
}
