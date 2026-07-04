import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAsciiSlug, normalizeAreaSlugParam } from '@/lib/slugs'

/**
 * 旧日本語エリア URL（/area/洞爺湖）を ASCII slug へリダイレクト
 * ページ到達前に処理し、404 を防ぐ
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const match = pathname.match(/^\/area\/([^/]+)\/?$/)
  if (!match) return NextResponse.next()

  let rawSlug = match[1]
  try {
    rawSlug = decodeURIComponent(rawSlug)
  } catch {
    // keep
  }

  const normalized = normalizeAreaSlugParam(rawSlug)
  if (!isAsciiSlug(rawSlug) || rawSlug !== normalized) {
    const url = request.nextUrl.clone()
    url.pathname = `/area/${normalized}`
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/area/:path*'],
}
