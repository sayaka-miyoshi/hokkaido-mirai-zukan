/**
 * Googleスプレッドシート CSV 接続テスト
 * 実行: npm run test:csv
 */
import Papa from 'papaparse'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

const REQUIRED_COLUMNS = [
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

function buildColumnMap(headers) {
  const normalized = headers.map((h) => h.trim().replace(/^\uFEFF/, ''))
  const missing = REQUIRED_COLUMNS.filter((name) => !normalized.includes(name))
  if (missing.length > 0) {
    return { error: `不足している列: ${missing.join('、')}` }
  }
  const map = Object.fromEntries(
    REQUIRED_COLUMNS.map((name) => [name, normalized.indexOf(name)]),
  )
  return { map, normalized }
}

function rowToPost(row, map, id) {
  const post = { id }
  for (const columnName of REQUIRED_COLUMNS) {
    post[columnName] = row[map[columnName]]?.trim() ?? ''
  }
  return post
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
const headers = result.data[0] ?? []

const columnResult = buildColumnMap(headers)
if (columnResult.error) {
  console.error('❌', columnResult.error)
  process.exit(1)
}

console.log('列数:', columnResult.normalized.length, `(必須${REQUIRED_COLUMNS.length}列 + 追加列${columnResult.normalized.length - REQUIRED_COLUMNS.length}列)`)
console.log('ヘッダー:', columnResult.normalized.join(' | '))

const rows = result.data.slice(1).filter((r) => r.some((c) => c?.trim()))
const posts = rows.map((row, i) => rowToPost(row, columnResult.map, String(i + 1)))

console.log('✅ 接続成功（列名ベース取得）')
console.log('取得件数:', posts.length, '件')
if (posts[0]) {
  console.log('1件目:', posts[0]['投稿タイトル'])
}

// 列順入れ替えのシミュレーション（ヘッダーとデータを同じ順で並べ替え）
const reversedIndices = columnResult.normalized.map((_, i) => columnResult.normalized.length - 1 - i)
const reorderedHeaders = reversedIndices.map((i) => columnResult.normalized[i])
const reorderedRow = reversedIndices.map((i) => rows[0][i])
const reorderedMap = buildColumnMap(reorderedHeaders)
const reorderedPost = rowToPost(reorderedRow, reorderedMap.map, 'test')
if (reorderedPost['投稿タイトル'] === posts[0]['投稿タイトル']) {
  console.log('✅ 列順入れ替えテスト: OK')
} else {
  console.error('❌ 列順入れ替えテスト: 失敗')
  process.exit(1)
}
