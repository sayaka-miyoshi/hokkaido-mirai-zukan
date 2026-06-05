/**
 * 画像URL診断
 * 実行: node scripts/diagnose-images.mjs
 */
import Papa from 'papaparse'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

const REQUIRED = ['投稿タイトル', 'ジャンル', 'エリア', '説明文', '投稿日', 'slug']

function loadUrl() {
  try {
    return readFileSync(envPath, 'utf8').match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)?.[1]?.trim()
  } catch {
    return process.env.NEXT_PUBLIC_SHEET_CSV_URL
  }
}

function extractDriveId(url) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m?.[1]) return m[1]
  }
  try {
    const u = new URL(url)
    if (u.hostname.includes('drive.google.com')) return u.searchParams.get('id')
  } catch {}
  return null
}

function getCandidates(raw) {
  const trimmed = raw.trim()
  const out = []
  const id = extractDriveId(trimmed)
  if (id) {
    out.push(`https://drive.google.com/uc?export=view&id=${id}`)
    out.push(`https://drive.google.com/thumbnail?id=${id}&sz=w1000`)
  } else if (/^https?:\/\//i.test(trimmed)) {
    out.push(trimmed)
  }
  return out
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Range: 'bytes=0-512',
        'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0',
      },
    })
    const ct = res.headers.get('content-type') ?? ''
    return { ok: res.ok || res.status === 206, status: res.status, contentType: ct }
  } catch (e) {
    return { ok: false, status: e.message, contentType: '' }
  }
}

const url = loadUrl()
if (!url) {
  console.error('NEXT_PUBLIC_SHEET_CSV_URL 未設定')
  process.exit(1)
}

const text = await (await fetch(url)).text()
const rows = Papa.parse(text, { skipEmptyLines: true }).data
const headers = rows[0].map((h) => h.trim().replace(/^\uFEFF/, ''))
const map = Object.fromEntries(headers.map((h, i) => [h, i]))
const missing = REQUIRED.filter((h) => !headers.includes(h))
if (missing.length) {
  console.error('必須列不足:', missing.join('、'))
  process.exit(1)
}

const imageIdx = map['画像URL']
console.log('=== 列名ベース取得 ===')
console.log('「画像URL」列 index:', imageIdx, imageIdx != null ? 'OK' : '列なし')

const get = (row, col) => (row[map[col]] ?? '').trim()

const posts = rows.slice(1).filter((r) => r.some((c) => c?.trim())).map((row, i) => ({
  id: String(i + 1),
  title: get(row, '投稿タイトル'),
  imageUrl: imageIdx != null ? (row[imageIdx] ?? '').trim() : '',
  instagramUrl: get(row, 'InstagramURL'),
}))

const empty = posts.filter((p) => !p.imageUrl)
const withUrl = posts.filter((p) => p.imageUrl)

console.log('\n=== サマリー ===')
console.log('総件数:', posts.length)
console.log('画像URL 空欄:', empty.length, '件（No Image は正常）')
console.log('画像URL あり:', withUrl.length, '件')

console.log('\n=== 空欄記事（先頭10件）===')
empty.slice(0, 10).forEach((p) => console.log(`[${p.id}] ${p.title}`))

console.log('\n=== URLありだが取得失敗 ===')
const failed = []
for (const p of withUrl) {
  const candidates = getCandidates(p.imageUrl)
  let ok = false
  let detail = null
  for (const c of candidates) {
    detail = await checkUrl(c)
    if (detail.ok && (detail.contentType.startsWith('image/') || detail.contentType.includes('octet-stream'))) {
      ok = true
      break
    }
    if (detail.ok && detail.contentType.includes('text/html')) {
      detail = { ...detail, note: 'HTML返却（共有設定またはURL形式の可能性）' }
    }
  }
  if (!ok) failed.push({ ...p, candidates, detail })
}

console.log('失敗:', failed.length, '件')
failed.forEach((p) => {
  console.log('\n---')
  console.log(`[${p.id}] ${p.title}`)
  console.log('  元URL:', p.imageUrl.slice(0, 100))
  console.log('  変換候補:', p.candidates[0] ?? 'なし')
  console.log('  結果:', p.detail?.status, p.detail?.contentType, p.detail?.note ?? '')
})

console.log('\n=== URLありで取得成功 ===')
console.log(withUrl.length - failed.length, '件')
