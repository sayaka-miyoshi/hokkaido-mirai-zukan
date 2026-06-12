/**
 * サジェスト候補の動作確認
 * node scripts/test-search-suggestions.mjs
 */
import { readFileSync } from 'node:fs'
import Papa from 'papaparse'
import {
  buildSearchSuggestionIndex,
  filterSearchSuggestions,
} from '../lib/search-suggestions.ts'

function loadSheetUrl() {
  return readFileSync('.env.local', 'utf8').match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)?.[1]?.trim()
}

function parsePublish(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return false
  if (['0', '非公開', 'false', 'no', 'off', '×', '✗'].includes(normalized)) return false
  if (['1', '公開', 'true', 'yes', 'on', '○', '◯', '✓'].includes(normalized)) return true
  return false
}

const url = loadSheetUrl()
if (!url) {
  console.error('NEXT_PUBLIC_SHEET_CSV_URL not set')
  process.exit(1)
}

const csv = await (await fetch(url)).text()
const parsed = Papa.parse(csv, { skipEmptyLines: true })
const col = Object.fromEntries(parsed.data[0].map((h, i) => [h, i]))
const rows = parsed.data.slice(1).filter((row) => row[col['投稿タイトル']]?.trim())

const posts = rows.map((row, index) => ({
  id: String(index + 1),
  title: row[col['投稿タイトル']]?.trim() ?? '',
  schoolName: row[col['学校名']]?.trim() ?? '',
  clubName: row[col['部活名']]?.trim() ?? '',
  companyName: row[col['企業名']]?.trim() ?? '',
  sportCategory: row[col['競技カテゴリ']]?.trim() ?? '',
  isPublished: col['公開'] != null ? parsePublish(row[col['公開']]) : true,
}))

const index = buildSearchSuggestionIndex(posts)
console.log('index size', index.length)

for (const query of ['北', 'ラ']) {
  const items = filterSearchSuggestions(index, query)
  console.log(`\n「${query}」→ ${items.length}件`)
  items.forEach((item) => console.log(`  - ${item.label}`))
}

const titleOnly = index.filter((item) =>
  posts.some(
    (post) =>
      post.title === item.label &&
      post.schoolName !== item.label &&
      post.clubName !== item.label &&
      post.companyName !== item.label &&
      post.sportCategory !== item.label,
  ),
)
console.log('\ntitle-only entries in index (should be 0):', titleOnly.length)
