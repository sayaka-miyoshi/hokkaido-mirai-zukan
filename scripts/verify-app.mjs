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

const REQUIRED_HEADERS = [
  '投稿タイトル', 'ジャンル', 'エリア', '説明文', '投稿日', 'slug',
]

const OPTIONAL_HEADERS = [
  '公開',
  '画像URL',
  '学校名', '部活名', '企業名', '動画カテゴリ', '進路カテゴリ',
  '募集情報', '募集情報URL', 'InstagramURL',
  '学校公式サイト', '学校SNS', '部活SNS', '企業公式サイト', '企業SNS',
  '人気表示', '人気順',
]

const AREA_SLUG_MAP = {
  '札幌': 'sapporo', '函館': 'hakodate', '旭川': 'asahikawa', '釧路': 'kushiro',
  '帯広': 'obihiro', '北見': 'kitami', '小樽': 'otaru', '苫小牧': 'tomakomai',
  '北海道江別市': 'ebetsu', 'その他': 'other',
}

function getAreaSlug(area) {
  return AREA_SLUG_MAP[area] ?? area
}

function parsePopularFlag(value) {
  const normalized = (value ?? '').trim().toLowerCase()
  return ['true', '1', 'yes', 'y', 'はい', '○', '◯', '✓', 'on'].includes(normalized)
}

function parsePopularOrder(value) {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : null
}

function parsePublishStatus(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return false
  if (['0', '非公開', 'false', 'no', 'off', '×', '✗'].includes(normalized)) return false
  if (['1', '公開', 'true', 'yes', 'on', '○', '◯', '✓'].includes(normalized)) return true
  return false
}

function parsePostDate(dateStr) {
  if (!dateStr) return 0
  const time = Date.parse(dateStr.replace(/\//g, '-').trim())
  return Number.isNaN(time) ? 0 : time
}

function getPopularPosts(posts) {
  return posts
    .filter((p) => p.isPopular && p.popularOrder != null)
    .sort((a, b) => a.popularOrder - b.popularOrder)
    .slice(0, 10)
}

function parsePosts(text) {
  const result = Papa.parse(text, { skipEmptyLines: true })
  const headers = result.data[0].map((h) => h.trim())
  const missingRequired = REQUIRED_HEADERS.filter((h) => !headers.includes(h))
  if (missingRequired.length > 0) {
    throw new Error(`必須列が不足: ${missingRequired.join('、')}`)
  }
  const map = Object.fromEntries(
    [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS]
      .filter((h) => headers.includes(h))
      .map((h) => [h, headers.indexOf(h)]),
  )
  const get = (r, h) => (map[h] == null ? '' : (r[map[h]] ?? '').trim())
  return result.data.slice(1)
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
      videoCategory: get(r, '動画カテゴリ'),
      careerCategory: get(r, '進路カテゴリ'),
      slug: get(r, 'slug'),
      date: get(r, '投稿日'),
      isPopular: map['人気表示'] != null ? parsePopularFlag(r[map['人気表示']]) : false,
      popularOrder: map['人気順'] != null ? parsePopularOrder(r[map['人気順']]) : null,
      isPublished:
        map['公開'] != null
          ? parsePublishStatus(get(r, '公開'))
          : false,
    }))
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
  if (i === 0) return undefined
  return split[0].slice(0, i).join('-')
}

function resolveSchoolSlug(posts, schoolName) {
  const schoolPost = posts.find((p) => p.schoolName === schoolName && p.genre === '学校' && p.slug)
  if (schoolPost?.slug) return schoolPost.slug
  const relatedSlugs = [...new Set(
    posts.filter((p) => p.schoolName === schoolName && p.slug).map((p) => p.slug),
  )]
  return longestCommonSlugPrefix(relatedSlugs)
}

function resolveClubSlug(posts, clubName) {
  return posts.find((p) => p.clubName === clubName && p.genre === '部活' && p.slug)?.slug
    ?? posts.find((p) => p.clubName === clubName && p.slug)?.slug
}

function resolveCompanySlug(posts, name) {
  return (
    posts.find((p) => p.companyName === name && p.genre === '企業訪問' && p.slug)?.slug
    ?? posts.find((p) => p.companyName === name && p.slug)?.slug
  )
}

function loadVideoCategoryMaps() {
  const path = resolve(__dirname, '../data/動画カテゴリマスター.csv')
  const result = Papa.parse(readFileSync(path, 'utf8'), {
    header: true,
    skipEmptyLines: true,
  })
  const idToLabel = new Map()
  const labelToId = new Map()
  for (const row of result.data) {
    const id = row.ID?.trim()
    const label = row['表示名']?.trim()
    if (!id || !label) continue
    idToLabel.set(id, label)
    labelToId.set(label, id)
  }
  return { idToLabel, labelToId }
}

function normalizeVideoCategoryId(raw, maps) {
  const value = (raw ?? '').trim()
  if (!value) return ''
  if (maps.idToLabel.has(value)) return value
  return maps.labelToId.get(value) ?? value
}

function resolveVideoCategoryLabel(raw, maps) {
  const value = (raw ?? '').trim()
  if (!value) return ''
  if (maps.idToLabel.has(value)) return maps.idToLabel.get(value)
  if (maps.labelToId.has(value)) return value
  return value
}

function enrichPostsVideoCategories(posts, maps) {
  return posts.map((post) => {
    const raw = post.videoCategory
    return {
      ...post,
      videoCategory: normalizeVideoCategoryId(raw, maps),
      videoCategoryLabel: resolveVideoCategoryLabel(raw, maps),
    }
  })
}

function filterPosts(posts, { keyword, genre, area, videoCategory, careerCategory }, maps) {
  const normalizedVideoCategory = videoCategory
    ? normalizeVideoCategoryId(videoCategory, maps)
    : ''
  return posts.filter((p) => {
    const kw = !keyword || [p.title, p.schoolName, p.clubName, p.companyName].some((f) => f.includes(keyword))
    const g = !genre || p.genre === genre
    const a = !area || p.area === area
    const v = !normalizedVideoCategory || p.videoCategory === normalizedVideoCategory
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

const videoCategoryMaps = loadVideoCategoryMaps()
const posts = enrichPostsVideoCategories(
  parsePosts(await res.text()),
  videoCategoryMaps,
)
let failed = 0

console.log('=== ① データ読み込み ===')
console.log(`取得件数: ${posts.length} 件（投稿タイトルありのみ）`)
const slugCount = posts.filter((p) => p.slug).length
console.log(`slug 確定: ${slugCount} 件 / 未確定: ${posts.length - slugCount} 件`)
if (posts.length - slugCount > 0) {
  console.log('ℹ slug 未確定行は Y列候補を確認し N列に値のみ貼り付け')
}

console.log('\n=== ② 一覧表示 ===')
console.log(posts.length > 0 ? '✅ 投稿データあり' : '❌ 投稿なし')
if (posts.length === 0) failed++

console.log('\n=== ③ 検索機能 ===')
const tests = [
  { name: 'キーワード「北海」', fn: () => filterPosts(posts, { keyword: '北海' }, videoCategoryMaps).length > 0 },
  { name: 'ジャンル「部活」', fn: () => filterPosts(posts, { genre: '部活' }, videoCategoryMaps).length > 0 },
  { name: 'エリア「札幌」', fn: () => filterPosts(posts, { area: '札幌' }, videoCategoryMaps).length > 0 },
  { name: '動画カテゴリ「部活紹介」', fn: () => filterPosts(posts, { videoCategory: '部活紹介' }, videoCategoryMaps).length > 0 },
  { name: '進路カテゴリ「公務員」', fn: () => filterPosts(posts, { careerCategory: '公務員' }, videoCategoryMaps).length > 0 },
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
  const clubCount = posts.filter((p) => p.schoolName === name && p.clubName).length
  if (slug) {
    console.log(`✅ /school/${slug} → ${name}`)
  } else if (clubCount > 0) {
    console.log(`❌ /school/* なし → ${name}（部活投稿 ${clubCount} 件あり・slug推定失敗）`)
    failed++
  } else {
    console.log(`⚠️  /school/* なし → ${name}（学校名・部活名なし）`)
  }
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

console.log('\n=== ⑥ 人気コンテンツ ===')
const popularPosts = getPopularPosts(posts)
if (popularPosts.length === 0) {
  console.log('✅ 人気表示=true の記事 0件（セクション非表示）')
} else {
  console.log(`✅ 人気コンテンツ ${popularPosts.length} 件`)
  popularPosts.forEach((p, i) => {
    const orderLabel = `人気順${p.popularOrder}`
    console.log(`   ${i + 1}. ${p.title.slice(0, 30)} (${orderLabel})`)
  })
}

console.log('\n=== 結果 ===')
if (failed === 0) {
  console.log('✅ 検証完了（警告除く）')
} else {
  console.log(`❌ ${failed} 件の問題あり`)
  process.exit(1)
}
