/** 流入元（GA4 custom dimension / Vercel event 共通） */
export type TrafficSource = 'instagram' | 'google' | 'istep' | 'direct' | 'other'

const INSTAGRAM_HOSTS = ['instagram.com', 'www.instagram.com', 'l.instagram.com']
const GOOGLE_HOSTS = ['google.com', 'www.google.com', 'google.co.jp', 'www.google.co.jp']

function readParam(
  params: URLSearchParams | Record<string, string | undefined> | undefined,
  key: string,
): string {
  if (!params) return ''
  if (params instanceof URLSearchParams) return params.get(key)?.trim() ?? ''
  return params[key]?.trim() ?? ''
}

function hostFromReferrer(referrer: string): string {
  if (!referrer) return ''
  try {
    return new URL(referrer).hostname.toLowerCase()
  } catch {
    return ''
  }
}

/**
 * 初回セッションの流入元を判定（Instagram / Google / iSTEP / 直接 / その他）
 * GA4 の session source と Vercel カスタムイベントで同じロジックを使う
 */
export function resolveTrafficSource(input: {
  searchParams?: URLSearchParams | Record<string, string | undefined>
  referrer?: string
}): TrafficSource {
  const utmSource = readParam(input.searchParams, 'utm_source').toLowerCase()
  const utmMedium = readParam(input.searchParams, 'utm_medium').toLowerCase()
  const dmGroup = readParam(input.searchParams, 'dm_group')

  if (utmSource === 'istep' || utmMedium === 'dm' || dmGroup) return 'istep'
  if (utmSource === 'instagram' || utmMedium === 'instagram') return 'instagram'
  if (utmSource === 'google' || utmMedium === 'organic') return 'google'

  const host = hostFromReferrer(input.referrer ?? '')
  if (!host) return 'direct'
  if (INSTAGRAM_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return 'instagram'
  if (GOOGLE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return 'google'

  return 'other'
}

/** sessionStorage キー（初回着地の流入元を保持） */
export const TRAFFIC_SOURCE_STORAGE_KEY = 'hmz_traffic_source'

export function persistTrafficSource(source: TrafficSource): void {
  if (typeof window === 'undefined') return
  try {
    if (!sessionStorage.getItem(TRAFFIC_SOURCE_STORAGE_KEY)) {
      sessionStorage.setItem(TRAFFIC_SOURCE_STORAGE_KEY, source)
    }
  } catch {
    // private mode 等
  }
}

export function readPersistedTrafficSource(): TrafficSource | null {
  if (typeof window === 'undefined') return null
  try {
    const value = sessionStorage.getItem(TRAFFIC_SOURCE_STORAGE_KEY)
    if (
      value === 'instagram' ||
      value === 'google' ||
      value === 'istep' ||
      value === 'direct' ||
      value === 'other'
    ) {
      return value
    }
  } catch {
    // ignore
  }
  return null
}
