import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type RevalidateBody = {
  source?: string
  paths?: string[]
  tags?: string[]
}

/**
 * スプレッドシート更新・build:artifacts 完了時にキャッシュを即時無効化
 * POST /api/revalidate
 * Authorization: Bearer ${REVALIDATE_SECRET}
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim()
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'REVALIDATE_SECRET not configured' }, { status: 503 })
  }

  const auth = request.headers.get('authorization')?.trim() ?? ''
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: RevalidateBody = {}
  try {
    body = (await request.json()) as RevalidateBody
  } catch {
    // body なしでも OK
  }

  const tags = body.tags?.length ? body.tags : ['posts']
  const paths = body.paths?.length
    ? body.paths
    : ['/', '/sitemap.xml', '/schools', '/clubs', '/companies', '/sports']

  for (const tag of tags) revalidateTag(tag, 'max')
  for (const path of paths) revalidatePath(path)

  return NextResponse.json({
    ok: true,
    source: body.source ?? 'manual',
    revalidated: { tags, paths },
    at: new Date().toISOString(),
  })
}
