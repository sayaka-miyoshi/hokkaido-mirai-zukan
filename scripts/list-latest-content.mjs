/**
 * 最新コンテンツ10件のタイトル・投稿日・ジャンルを出力
 * node scripts/list-latest-content.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

function loadEnv() {
  try {
    const text = readFileSync(envPath, 'utf8')
    for (const line of text.split('\n')) {
      const m = line.match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/)
      if (m) return m[1].trim()
    }
  } catch {
    return ''
  }
  return ''
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
  const trimmed = String(dateStr).trim()
  const slashNormalized = trimmed.replace(/\//g, '-')
  let time = Date.parse(slashNormalized)
  if (!Number.isNaN(time)) return time
  const japanese = trimmed.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日?/)
  if (japanese) {
    const [, year, month, day] = japanese
    time = Date.parse(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    if (!Number.isNaN(time)) return time
  }
  return 0
}

const url = process.env.NEXT_PUBLIC_SHEET_CSV_URL?.trim() || loadEnv()
if (!url) {
  console.error('NEXT_PUBLIC_SHEET_CSV_URL not set')
  process.exit(1)
}

const res = await fetch(url, { headers: { Accept: 'text/csv' } })
const text = await res.text()
const parsed = Papa.parse(text, { skipEmptyLines: true })
const headers = parsed.data[0]
const col = Object.fromEntries(headers.map((h, i) => [h, i]))

const rows = parsed.data.slice(1).filter((row) => row[col['投稿タイトル']]?.trim())

const posts = rows
  .map((row) => ({
    title: row[col['投稿タイトル']]?.trim() ?? '',
    genre: row[col['ジャンル']]?.trim() ?? '',
    date: row[col['投稿日']]?.trim() ?? '',
    isPublished: col['公開'] != null ? parsePublishStatus(row[col['公開']]) : true,
  }))
  .filter((post) => post.isPublished)
  .sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))
  .slice(0, 10)

console.log('最新コンテンツ10件（投稿日降順・公開のみ）')
console.log('---')
for (const [index, post] of posts.entries()) {
  console.log(`${index + 1}. ${post.date} | ${post.genre} | ${post.title}`)
}

const genres = posts.reduce((acc, post) => {
  acc[post.genre] = (acc[post.genre] ?? 0) + 1
  return acc
}, {})
console.log('---')
console.log('ジャンル内訳:', genres)
