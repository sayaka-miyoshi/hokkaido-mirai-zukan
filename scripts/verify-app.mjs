/**
 * アプリ動作検証スクリプト
 * 実行: node scripts/verify-app.mjs
 */
import Papa from 'papaparse'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

const HEADERS = [
  '投稿タイトル', 'ジャンル', 'エリア', '学校名', '部活名', '企業名',
  '動画カテゴリ', '進路カテゴリ', '募集情報', 'InstagramURL', '画像URL',
  '投稿日', '説明文', 'slug',
]

const AREA_SLUG_MAP = {
  '札幌': 'sapporo', '函館': 'hakodate', '旭川': 'asahikawa', '釧路': 'kushiro',
  '帯広': 'obihiro', '北見': 'kitami', '小樽': 'otaru', '苫小牧': 'tomakomai',
  '北海道江別市': 'ebetsu', 'その他': 'other',
}

function getAreaSlug(area) {
  return AREA_SLUG_MAP[area] ?? area
}

function parsePosts(text) {
  const result = Papa.parse(text, { skipEmptyLines: true })
  const headers = result.data[0].map((h) => h.trim())
  const map = Object.fromEntries(HEADERS.map((h) => [h, headers.indexOf(h)]))
  const get = (r, h) => (r[map[h]] ?? '').trim()
  return result.data.slice(1)
    .filter((r) => r.some((c) => c?.trim()))
    .map((r, i) => ({
      id: String(i + 1),
      title: get(r, '投稿タイトル'),
      genre: get(r, 'ジャンル'),
      area: get(r, 'エリア'),
      schoolName: get(r, '学校名'),
      clubName: get(r, '部活名'),
      companyName: get(r, '企業名'),
      videoCategory: get(r, '動画カテゴリ'),
      careerCategory: get(r, '進路カテゴリ'),
      slug: get(r, 'slug'),
    }))
}

function resolveSchoolSlug(posts, schoolName) {
  return posts.find((p) => p.schoolName === schoolName && p.genre === '学校' && p.slug)?.slug
}

function resolveClubSlug(posts, clubName) {
  return posts.find((p) => p.clubName === clubName && p.genre === '部活' && p.slug)?.slug
    ?? posts.find((p) => p.clubName === clubName && p.slug)?.slug
}

function resolveCompanySlug(posts, name) {
  return posts.find((p) => p.companyName === name && p.genre === '企業訪問' && p.slug)?.slug
}

function filterPosts(posts, { keyword, genre, area, videoCategory, careerCategory }) {
  return posts.filter((p) => {
    const kw = !keyword || [p.schoolName, p.clubName, p.companyName].some((f) => f.includes(keyword))
    const g = !genre || p.genre === genre
    const a = !area || p.area === area
    const v = !videoCategory || p.videoCategory === videoCategory
    const c = !careerCategory || p.careerCategory === careerCategory
    return kw && g && a && v && c
  })
}

const url = readFileSync(envPath, 'utf8').match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)?.[1]?.trim()
if (!url) {
  console.error('❌ NEXT_PUBLIC_SHEET_CSV_URL 未設定')
  process.exit(1)
}

const res = await fetch(url)
if (!res.ok) {
  console.error('❌ CSV取得失敗', res.status)
  process.exit(1)
}

const posts = parsePosts(await res.text())
let failed = 0

console.log('=== ① データ読み込み ===')
console.log(`取得件数: ${posts.length} 件`)
if (posts.length !== 22) {
  console.log(`⚠️  22件想定ですが ${posts.length} 件です（空行・未公開行を確認してください）`)
}

console.log('\n=== ② 一覧表示 ===')
console.log(posts.length > 0 ? '✅ 投稿データあり' : '❌ 投稿なし')
if (posts.length === 0) failed++

console.log('\n=== ③ 検索機能 ===')
const tests = [
  { name: 'キーワード「北海」', fn: () => filterPosts(posts, { keyword: '北海' }).length > 0 },
  { name: 'ジャンル「部活」', fn: () => filterPosts(posts, { genre: '部活' }).length > 0 },
  { name: 'エリア「札幌」', fn: () => filterPosts(posts, { area: '札幌' }).length > 0 },
  { name: '動画カテゴリ「部活紹介」', fn: () => filterPosts(posts, { videoCategory: '部活紹介' }).length > 0 },
  { name: '進路カテゴリ「公務員」', fn: () => filterPosts(posts, { careerCategory: '公務員' }).length > 0 },
]
for (const t of tests) {
  const ok = t.fn()
  console.log(ok ? '✅' : '❌', t.name)
  if (!ok) failed++
}

console.log('\n=== ④ 投稿詳細 (/post/[id]) ===')
for (const p of posts) {
  if (!p.title) {
    console.log(`❌ ID ${p.id}: タイトル空`)
    failed++
  }
}
console.log(`✅ /post/1 〜 /post/${posts.length} が対象`)

console.log('\n=== ⑤ school / club / company URL ===')
const schools = [...new Set(posts.map((p) => p.schoolName).filter(Boolean))]
const clubs = [...new Set(posts.map((p) => p.clubName).filter(Boolean))]
const companies = [...new Set(posts.map((p) => p.companyName).filter(Boolean))]

for (const name of schools) {
  const slug = resolveSchoolSlug(posts, name)
  console.log(slug ? `✅ /school/${slug} → ${name}` : `⚠️  /school/* なし → ${name}（ジャンル「学校」の行なし）`)
}
for (const name of clubs) {
  const slug = resolveClubSlug(posts, name)
  console.log(slug ? `✅ /club/${slug} → ${name}` : `❌ /club/* なし → ${name}`)
  if (!slug) failed++
}
for (const name of companies) {
  const slug = resolveCompanySlug(posts, name)
  console.log(slug ? `✅ /company/${slug} → ${name}` : `❌ /company/* なし → ${name}`)
  if (!slug) failed++
}

console.log('\n=== エリアURL ===')
const areas = [...new Set(posts.map((p) => p.area).filter(Boolean))]
for (const area of areas) {
  const slug = getAreaSlug(area)
  const count = posts.filter((p) => p.area === area).length
  console.log(`✅ /area/${slug} → ${area} (${count}件)`)
}

console.log('\n=== 結果 ===')
if (failed === 0) {
  console.log('✅ 検証完了（警告除く）')
} else {
  console.log(`❌ ${failed} 件の問題あり`)
  process.exit(1)
}
