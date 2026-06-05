/**
 * 既存 slug が変わっていないか data/slug-snapshot.json と照合
 * 実行: npm run verify:slugs
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const snapshotPath = resolve(root, 'data/slug-snapshot.json')

function loadCsvUrl() {
  const env = readFileSync(resolve(root, '.env.local'), 'utf8')
  return env.match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)?.[1]?.trim()
}

const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'))
const byRow = Object.fromEntries(snapshot.slugs.map((s) => [s.row, s.slug]))

const url = loadCsvUrl()
if (!url) {
  console.error('NEXT_PUBLIC_SHEET_CSV_URL 未設定')
  process.exit(1)
}

const rows = Papa.parse(await (await fetch(url)).text(), {
  header: true,
  skipEmptyLines: true,
}).data

const changed = []
const cleared = []
let matched = 0

rows.forEach((row, i) => {
  const rowNum = i + 2
  const title = row['投稿タイトル']?.trim()
  const slug = row['slug']?.trim() || ''
  const prev = byRow[rowNum]
  if (prev === undefined) return
  if (!slug) {
    cleared.push({ row: rowNum, title, was: prev })
  } else if (slug !== prev) {
    changed.push({ row: rowNum, title, was: prev, now: slug })
  } else {
    matched += 1
  }
})

console.log(`スナップショット: ${snapshot.capturedAt}（${snapshot.count}件）`)
console.log(`一致: ${matched}件`)

if (changed.length > 0) {
  console.error('\n❌ slug が変更された行:')
  changed.forEach((c) => console.error(`  - ${c.title}: ${c.was} → ${c.now}`))
}

if (cleared.length > 0) {
  console.error('\n⚠ slug が空になった行（既存SEOに注意）:')
  cleared.forEach((c) => console.error(`  - ${c.title}: 以前は ${c.was}`))
}

const headers = rows[0] ? Object.keys(rows[0]) : []
const hasSlugCandidate = headers.includes('slug候補')
const hasSport = headers.includes('競技カテゴリ')
console.log('\nCSV列:', hasSport ? '競技カテゴリあり' : '競技カテゴリなし', '/',
  hasSlugCandidate ? 'slug候補あり（サイト未使用）' : 'slug候補なし')

if (changed.length > 0) process.exit(1)
console.log('\n✅ スナップショット上の slug は変更されていません')
