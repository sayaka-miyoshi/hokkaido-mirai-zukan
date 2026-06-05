/**
 * 本番ビルド起動中のサーバーに対し、主要URLが 404 にならないか確認
 * 使い方:
 *   ターミナル1: npm run build && npm run start
 *   ターミナル2: npm run verify:urls
 * または: node scripts/verify-urls.mjs http://localhost:3000
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const base = process.argv[2]?.replace(/\/$/, '') || 'http://localhost:3000'

const envPath = resolve(__dirname, '../.env.local')
const csvUrl = readFileSync(envPath, 'utf8')
  .match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)?.[1]
  ?.trim()

if (!csvUrl) {
  console.error('❌ NEXT_PUBLIC_SHEET_CSV_URL 未設定')
  process.exit(1)
}

const AREA_SLUG_MAP = {
  札幌: 'sapporo',
  函館: 'hakodate',
  旭川: 'asahikawa',
  釧路: 'kushiro',
  帯広: 'obihiro',
  北見: 'kitami',
  小樽: 'otaru',
  苫小牧: 'tomakomai',
  北海道江別市: 'ebetsu',
  その他: 'other',
}

function getAreaSlug(area) {
  return AREA_SLUG_MAP[area] ?? area
}

function parsePublishedPosts(text) {
  const result = Papa.parse(text, { skipEmptyLines: true })
  const headers = result.data[0].map((h) => h.trim())
  const map = Object.fromEntries(headers.map((h, i) => [h, i]))
  const get = (r, h) => (map[h] == null ? '' : (r[map[h]] ?? '').trim())

  return result.data
    .slice(1)
    .filter((r) => r.some((c) => c?.trim()))
    .filter((r) => get(r, '投稿タイトル'))
    .map((r, i) => ({
      id: String(i + 1),
      title: get(r, '投稿タイトル'),
      genre: get(r, 'ジャンル'),
      area: get(r, 'エリア'),
      schoolName: get(r, '学校名'),
      clubName: get(r, '部活名'),
      companyName: get(r, '企業名'),
      sportCategory: get(r, '競技カテゴリ'),
      slug: get(r, 'slug'),
      isPublished: get(r, '公開') !== '非公開',
    }))
    .filter((p) => p.isPublished)
}

function longestCommonSlugPrefix(slugs) {
  const valid = slugs.filter(Boolean)
  if (valid.length === 0) return undefined
  if (valid.length === 1) {
    const parts = valid[0].split('-')
    if (parts.length >= 3) return parts.slice(0, -1).join('-')
    return valid[0]
  }
  const split = valid.map((s) => s.split('-'))
  const minLen = Math.min(...split.map((p) => p.length))
  let i = 0
  while (i < minLen && split.every((p) => p[i] === split[0][i])) i++
  return i === 0 ? undefined : split[0].slice(0, i).join('-')
}

function resolveSchoolSlug(posts, schoolName) {
  const schoolPost = posts.find((p) => p.schoolName === schoolName && p.genre === '学校' && p.slug)
  if (schoolPost?.slug) return schoolPost.slug
  return longestCommonSlugPrefix(
    [...new Set(posts.filter((p) => p.schoolName === schoolName && p.slug).map((p) => p.slug))],
  )
}

function resolveClubSlug(posts, clubName) {
  return (
    posts.find((p) => p.clubName === clubName && p.genre === '部活' && p.slug)?.slug
    ?? posts.find((p) => p.clubName === clubName && p.slug)?.slug
  )
}

function resolveCompanySlug(posts, name) {
  return (
    posts.find((p) => p.companyName === name && p.genre === '企業訪問' && p.slug)?.slug
    ?? posts.find((p) => p.companyName === name && p.slug)?.slug
  )
}

const csvRes = await fetch(csvUrl)
if (!csvRes.ok) {
  console.error('❌ CSV取得失敗', csvRes.status)
  process.exit(1)
}

const posts = parsePublishedPosts(await csvRes.text())
const paths = new Set(['/', '/schools', '/clubs', '/sports'])

for (const p of posts) {
  paths.add(`/post/${p.id}`)
}

for (const name of [...new Set(posts.map((p) => p.schoolName).filter(Boolean))]) {
  const slug = resolveSchoolSlug(posts, name)
  if (slug) paths.add(`/school/${slug}`)
}

for (const name of [...new Set(posts.map((p) => p.clubName).filter(Boolean))]) {
  const slug = resolveClubSlug(posts, name)
  if (slug) paths.add(`/club/${slug}`)
}

for (const name of [...new Set(posts.map((p) => p.companyName).filter(Boolean))]) {
  const slug = resolveCompanySlug(posts, name)
  if (slug) paths.add(`/company/${slug}`)
}

for (const area of [...new Set(posts.map((p) => p.area).filter(Boolean))]) {
  paths.add(`/area/${getAreaSlug(area)}`)
}

for (const sport of [...new Set(posts.map((p) => p.sportCategory.trim()).filter(Boolean))]) {
  paths.add(`/sport/${encodeURIComponent(sport)}`)
}

console.log(`ベースURL: ${base}`)
console.log(`チェック対象: ${paths.size} URL（公開投稿 ${posts.length} 件ベース）\n`)

const failures = []
let ok = 0
const sorted = [...paths].sort()

// 同時大量アクセスだと CSV 取得が失敗するため逐次チェック
for (let i = 0; i < sorted.length; i++) {
  const path = sorted[i]
  const url = `${base}${path}`
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (res.status === 404) {
      failures.push({ path, status: 404 })
      console.log(`❌ 404 ${path}`)
    } else if (res.status >= 400) {
      failures.push({ path, status: res.status })
      console.log(`❌ ${res.status} ${path}`)
    } else {
      ok++
    }
  } catch (err) {
    failures.push({ path, status: 'ERR', detail: String(err) })
    console.log(`❌ ERR ${path}`, err.message)
  }
  if (i < sorted.length - 1) {
    await new Promise((r) => setTimeout(r, 50))
  }
}

console.log(`\n=== 結果 ===`)
console.log(`✅ ${ok} / ${paths.size}`)
if (failures.length === 0) {
  console.log('✅ 404 となる URL はありません')
} else {
  console.log(`❌ 問題 ${failures.length} 件`)
  process.exit(1)
}
