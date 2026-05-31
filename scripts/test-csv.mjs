/**
 * Googleスプレッドシート CSV 接続テスト
 * 実行: node scripts/test-csv.mjs
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
  '説明文', '投稿日', 'slug',
]

function loadUrl() {
  try {
    const env = readFileSync(envPath, 'utf8')
    const match = env.match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)
    return match?.[1]?.trim()
  } catch {
    return process.env.NEXT_PUBLIC_SHEET_CSV_URL
  }
}

const url = loadUrl()
if (!url) {
  console.error('❌ NEXT_PUBLIC_SHEET_CSV_URL が設定されていません')
  process.exit(1)
}

console.log('URL:', url)
console.log('---')

const res = await fetch(url)
console.log('HTTP:', res.status, res.statusText)

if (!res.ok) {
  console.error('❌ 取得失敗')
  process.exit(1)
}

const text = await res.text()
const result = Papa.parse(text, { skipEmptyLines: true })
const headers = (result.data[0] ?? []).map((h) => h.trim().replace(/^\uFEFF/, ''))

console.log('列数:', headers.length)
console.log('ヘッダー:', headers.join(' | '))

const missing = HEADERS.filter((h) => !headers.includes(h))
if (missing.length > 0) {
  console.error('❌ 不足している列:', missing.join('、'))
  process.exit(1)
}

const rows = result.data.slice(1).filter((r) => r.some((c) => c?.trim()))
console.log('✅ 接続成功')
console.log('取得件数:', rows.length, '件')
if (rows[0]) {
  const titleIdx = headers.indexOf('投稿タイトル')
  console.log('1件目:', rows[0][titleIdx])
}
