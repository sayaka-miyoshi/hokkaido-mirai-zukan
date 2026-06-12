/**
 * 公開前総合チェック
 * 実行: node scripts/prelaunch-check.mjs
 */
import Papa from 'papaparse'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadUrl() {
  return readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
    .match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)?.[1]?.trim()
}

function parsePublishStatus(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return false
  if (['0', '非公開', 'false', 'no', 'off', '×', '✗'].includes(normalized)) return false
  if (['1', '公開', 'true', 'yes', 'on', '○', '◯', '✓'].includes(normalized)) return true
  return false
}

function parsePopularFlag(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return ['true', '1', 'yes', 'y', 'はい', '○', '◯', '✓', 'on'].includes(normalized)
}

function parsePopularOrder(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : null
}

function extractDriveId(url) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m?.[1]) return m[1]
  }
  return null
}

function getCandidates(raw) {
  const trimmed = raw.trim()
  const out = []
  const id = extractDriveId(trimmed)
  if (id) {
    out.push(`https://drive.google.com/uc?export=view&id=${id}`)
    out.push(`https://drive.google.com/thumbnail?id=${id}&sz=w1000`)
  } else if (/^https?:\/\//i.test(trimmed)) out.push(trimmed)
  return out
}

async function checkImageUrl(rawUrl) {
  if (!rawUrl.trim()) return { ok: false, reason: '画像URL空欄' }
  if (/drive\.google\.com\/drive\/folders\//i.test(rawUrl)) {
    return { ok: false, reason: 'URL形式エラー（Google DriveフォルダURL）' }
  }
  if (/drive\.google/i.test(rawUrl) && !extractDriveId(rawUrl)) {
    return { ok: false, reason: 'URL形式エラー（Google Drive）' }
  }
  const candidates = getCandidates(rawUrl)
  if (candidates.length === 0) return { ok: false, reason: 'URL形式エラー' }
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-512', 'User-Agent': 'Mozilla/5.0 Chrome/120' },
      })
      const ct = res.headers.get('content-type') ?? ''
      if ((res.ok || res.status === 206) && (ct.startsWith('image/') || ct.includes('octet-stream'))) {
        return { ok: true, reason: null }
      }
      if (ct.includes('text/html')) {
        return { ok: false, reason: 'Google Drive共有設定エラー（HTML返却）' }
      }
    } catch {
      // try next
    }
  }
  return { ok: false, reason: '画像読み込み失敗（HTTP取得不可）' }
}

function parseAll(text) {
  const parsed = Papa.parse(text, { skipEmptyLines: true })
  const headers = parsed.data[0].map((h) => String(h ?? '').trim().replace(/^\uFEFF/, ''))
  const map = Object.fromEntries(headers.map((h, i) => [h, i]))
  const get = (row, col) => (map[col] == null ? '' : String(row[map[col]] ?? '').trim())

  return parsed.data
    .slice(1)
    .filter((row) => row.some((c) => String(c ?? '').trim()) && get(row, '投稿タイトル'))
    .map((row, i) => ({
      id: String(i + 1),
      sheetRow: null,
      title: get(row, '投稿タイトル'),
      imageUrl: get(row, '画像URL'),
      isPublished: map['公開'] != null ? parsePublishStatus(get(row, '公開')) : false,
      publishRaw: get(row, '公開'),
      isPopular: map['人気表示'] != null ? parsePopularFlag(get(row, '人気表示')) : false,
      popularOrder: map['人気順'] != null ? parsePopularOrder(get(row, '人気順')) : null,
      schoolName: get(row, '学校名'),
      clubName: get(row, '部活名'),
      companyName: get(row, '企業名'),
      schoolOfficialSite: get(row, '学校公式サイト'),
      schoolSns: get(row, '学校SNS'),
      clubSns: get(row, '部活SNS'),
      companyOfficialSite: get(row, '企業公式サイト'),
      companySns: get(row, '企業SNS'),
      recruitmentInfoUrl: get(row, '募集情報URL'),
    }))
}

const url = loadUrl()
if (!url) {
  console.error('NEXT_PUBLIC_SHEET_CSV_URL 未設定')
  process.exit(1)
}

const text = await (await fetch(url)).text()
const allPosts = parseAll(text)
const published = allPosts.filter((p) => p.isPublished)
const unpublished = allPosts.filter((p) => !p.isPublished)

console.log('━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('① 画像表示チェック')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━')

const emptyImage = allPosts.filter((p) => !p.imageUrl)
console.log(`画像URL空欄: ${emptyImage.length} 件`)

const imageFailures = []
for (const post of allPosts.filter((p) => p.imageUrl)) {
  const result = await checkImageUrl(post.imageUrl)
  if (!result.ok) {
    imageFailures.push({ ...post, reason: result.reason })
  }
}
console.log(`画像取得不可: ${imageFailures.length} 件`)

const noThumbnail = [
  ...emptyImage.map((p) => ({ ...p, reason: '画像URL空欄' })),
  ...imageFailures,
]
console.log(`\nサムネイル表示不可候補: ${noThumbnail.length} 件`)
noThumbnail.forEach((p) => {
  console.log(`- [${p.id}] ${p.title}`)
  console.log(`  原因: ${p.reason}`)
  console.log(`  URL: ${p.imageUrl || '(空)'}`)
})

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('② 公開記事チェック')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`全記事: ${allPosts.length} 件`)
console.log(`公開 (1/公開): ${published.length} 件`)
console.log(`非公開 (0/非公開/空): ${unpublished.length} 件`)
console.log('非公開記事は fetchPosts → filterPublishedPosts で除外 → 404/非表示')

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('③ 人気記事機能')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━')
const popularCandidates = published.filter((p) => p.isPopular && p.popularOrder != null)
const popularDisplay = [...popularCandidates]
  .sort((a, b) => a.popularOrder - b.popularOrder)
  .slice(0, 6)
console.log(`人気表示=1 かつ 人気順あり: ${popularCandidates.length} 件`)
console.log(`表示件数（最大6）: ${popularDisplay.length} 件`)
if (popularCandidates.length > 6) {
  console.log(`⚠ 7件以上 → 人気順1〜6のみ表示（${popularCandidates.length - 6} 件は除外）`)
}
popularDisplay.forEach((p, i) => {
  console.log(`  ${i + 1}. [順${p.popularOrder}] ${p.title}`)
})
const popularNoOrder = published.filter((p) => p.isPopular && p.popularOrder == null)
if (popularNoOrder.length) {
  console.log(`⚠ 人気表示=1 だが人気順未入力: ${popularNoOrder.length} 件`)
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('④ 外部リンク（URL未入力=非表示はコード側で実装済）')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━')
const linkFields = [
  'schoolOfficialSite',
  'schoolSns',
  'clubSns',
  'companyOfficialSite',
  'companySns',
  'recruitmentInfoUrl',
]
for (const field of linkFields) {
  const count = published.filter((p) => p[field]?.trim()).length
  console.log(`${field}: 入力 ${count} / ${published.length}`)
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('⑤ 検索チェック（部分一致）')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━')
const searchFields = ['title', 'schoolName', 'clubName', 'companyName']
const searchTests = [
  { label: '学校名「北海」', kw: '北海', field: 'schoolName' },
  { label: '部活名「ラクロス」', kw: 'ラクロス', field: 'clubName' },
  { label: '企業名「ゴム」', kw: 'ゴム', field: 'companyName' },
  { label: 'タイトル「祭り」', kw: '祭り', field: 'title' },
]
for (const t of searchTests) {
  const hits = published.filter((p) => String(p[t.field]).includes(t.kw))
  console.log(`${t.label}: ${hits.length} 件`)
}

const report = {
  generatedAt: new Date().toISOString(),
  image: {
    emptyUrl: emptyImage.length,
    fetchFailed: imageFailures.length,
    noThumbnail: noThumbnail.map((p) => ({
      id: p.id,
      title: p.title,
      postUrl: `/post/${p.id}`,
      imageUrl: p.imageUrl,
      reason: p.reason,
    })),
  },
  publish: { total: allPosts.length, published: published.length, unpublished: unpublished.length },
  popular: {
    candidates: popularCandidates.length,
    displayed: popularDisplay.length,
    list: popularDisplay.map((p) => ({ id: p.id, title: p.title, order: p.popularOrder })),
  },
}

mkdirSync(resolve(__dirname, '../docs'), { recursive: true })
writeFileSync(
  resolve(__dirname, '../docs/公開前チェック結果.json'),
  JSON.stringify(report, null, 2),
  'utf8',
)
