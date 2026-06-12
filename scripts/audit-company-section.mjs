/**
 * 「北海道の企業を知ろう」表示条件の確認
 * node scripts/audit-company-section.mjs
 */
import Papa from 'papaparse'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PRODUCTION = 'https://hokkaido-mirai-zukan.vercel.app'

function loadCsvUrl() {
  try {
    const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
    const match = env.match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)
    if (match) return match[1].trim()
  } catch {
    // ignore
  }
  return process.env.NEXT_PUBLIC_SHEET_CSV_URL
}

function parsePublishStatus(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return true
  if (['0', '非公開', 'false', 'no', 'off', '×', '✗'].includes(normalized)) return false
  if (['1', '公開', 'true', 'yes', 'on', '○', '◯', '✓'].includes(normalized)) return true
  return false
}

function parseFlag(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return false
  return ['true', '1', 'yes', 'はい', '○', '◯', '✓', 'on'].includes(normalized)
}

function parseOrder(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : null
}

function parsePostDate(dateStr) {
  if (!dateStr) return 0
  const trimmed = dateStr.trim()
  const slashNormalized = trimmed.replace(/\//g, '-')
  let time = Date.parse(slashNormalized)
  if (!Number.isNaN(time)) return time
  return 0
}

function isHokkaidoArea(area) {
  const trimmed = String(area ?? '').trim()
  if (!trimmed) return false
  const nonExact = new Set(['東京都', '東京', '大阪府', '大阪', '大阪市', '京都府', '京都', '愛知県', '名古屋', '福岡県', '福岡', '神奈川県', '横浜', '千葉県', '埼玉県'])
  if (nonExact.has(trimmed)) return false
  if (/^(東京都?|大阪(?:府|市)?|京都(?:府|市)?|愛知県?|福岡(?:県|市)?|神奈川(?:県|市)?|千葉(?:県|市)?|埼玉(?:県|市)?|兵庫(?:県|市)?|広島(?:県|市)?|宮城(?:県|市)?)/.test(trimmed)) return false
  const known = new Set(['札幌', '函館', '旭川', '釧路', '帯広', '北見', '小樽', '苫小牧', '北海道江別市'])
  if (trimmed.includes('北海道')) return true
  if (known.has(trimmed)) return true
  if (/(市|町|村)$/.test(trimmed) && !/(都|府|県)/.test(trimmed)) return true
  return false
}

function isEligible(row) {
  return parsePublishStatus(row['公開']) && String(row['企業名'] ?? '').trim() !== '' && isHokkaidoArea(row['エリア'])
}

function getCompanyRecommendedPosts(rows, max = 14) {
  const posts = rows.map((row, index) => ({
    id: String(index + 1),
    title: row['投稿タイトル']?.trim() ?? '',
    genre: row['ジャンル']?.trim() ?? '',
    area: row['エリア']?.trim() ?? '',
    companyName: row['企業名']?.trim() ?? '',
    date: row['投稿日']?.trim() ?? '',
    isPublished: parsePublishStatus(row['公開']),
    isCompanyRecommended: parseFlag(row['企業おすすめ']),
    companyRecommendedOrder: parseOrder(row['おすすめ順']),
  }))

  const result = []
  const usedIds = new Set()

  const recommended = posts
    .filter((post) => post.isCompanyRecommended && isEligible({ 公開: '公開', 企業名: post.companyName, エリア: post.area }) && post.isPublished)
    .sort((a, b) => {
      const aOrder = a.companyRecommendedOrder
      const bOrder = b.companyRecommendedOrder
      const aHas = aOrder != null
      const bHas = bOrder != null
      if (aHas && bHas) return aOrder - bOrder
      if (aHas && !bHas) return -1
      if (!aHas && bHas) return 1
      return 0
    })

  for (const post of recommended) {
    if (result.length >= max) break
    result.push(post)
    usedIds.add(post.id)
  }

  if (result.length < max) {
    const fallback = posts
      .filter((post) => !usedIds.has(post.id) && post.genre === '企業訪問' && post.isPublished && post.companyName && isHokkaidoArea(post.area))
      .sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))
    for (const post of fallback) {
      if (result.length >= max) break
      result.push(post)
    }
  }

  return result
}

// 本番HTMLから表示中カードを取得
async function fetchProductionCards() {
  const res = await fetch(`${PRODUCTION}/`)
  const html = await res.text()
  const sectionMatch = html.match(/id="companies"[\s\S]*?<\/section>/i)
  if (!sectionMatch) return []

  const cards = []
  const re = /<a[^>]+href="(\/post\/[^"]+)"[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi
  let m
  const chunk = sectionMatch[0]
  while ((m = re.exec(chunk)) !== null) {
    cards.push({ href: m[1], title: m[2].trim() })
  }
  return cards
}

const csvUrl = loadCsvUrl()
if (!csvUrl) {
  console.error('NEXT_PUBLIC_SHEET_CSV_URL not found')
  process.exit(1)
}

const res = await fetch(csvUrl)
const csvText = await res.text()
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })
const rows = parsed.data

const displayed = getCompanyRecommendedPosts(rows, 14)
const flaggedCount = rows.filter(
  (row) => parseFlag(row['企業おすすめ']) && isEligible(row),
).length
const hokkaidoCompanyCount = rows.filter(
  (row) => row['ジャンル']?.trim() === '企業訪問' && isEligible(row),
).length

const productionCards = await fetchProductionCards()

console.log('=== 表示条件ロジック（lib/company-recommended-posts.ts）===')
console.log('')
console.log('【共通条件】')
console.log('  ・公開 = true')
console.log('  ・企業名あり（空欄除外）')
console.log('  ・エリア = 北海道内（東京都など除外）')
console.log('')
console.log('【優先①】企業おすすめ = true → おすすめ順 昇順')
console.log('【補完②】不足分 → ジャンル=企業訪問・投稿日降順（北海道内のみ）')
console.log('  ・最大 14 件（不足時は取得できる件数のみ）')
console.log('')
console.log('=== スプレッドシート状況 ===')
console.log(`企業訪問（公開・企業名あり・北海道内）: ${hokkaidoCompanyCount} 件`)
console.log(`企業おすすめ=true（上記条件を満たす）: ${flaggedCount} 件`)
console.log(
  `現在のモード: ${flaggedCount > 0 ? 'おすすめ優先 + 北海道内で補完' : '北海道内フォールバックのみ'}`,
)
console.log('')
console.log('=== ロジック上の表示14件 ===')
for (const [i, post] of displayed.entries()) {
  console.log(
    `${String(i + 1).padStart(2, '0')}. [${post.area || 'エリア未設定'}] ${post.companyName || '（企業名なし）'} | ${post.title}`,
  )
}
console.log('')
console.log('=== エリア内訳（表示14件）===')
const areaCounts = displayed.reduce((acc, p) => {
  const key = p.area || '（エリア未設定）'
  acc[key] = (acc[key] ?? 0) + 1
  return acc
}, {})
for (const [area, count] of Object.entries(areaCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${area}: ${count}件`)
}
console.log('')
console.log(`=== 本番TOP #companies（${productionCards.length}件）===`)
for (const [i, card] of productionCards.entries()) {
  console.log(`${String(i + 1).padStart(2, '0')}. ${card.href} | ${card.title}`)
}
