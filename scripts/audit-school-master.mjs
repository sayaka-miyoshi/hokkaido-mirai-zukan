/**
 * メインCSVの学校名と data/学校マスター.csv を照合
 * 実行: npm run school-master:audit
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnvUrl() {
  const env = readFileSync(resolve(root, '.env.local'), 'utf8')
  const m = env.match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)
  return m?.[1]?.trim()
}

function loadMasterNames() {
  const text = readFileSync(resolve(root, 'data/学校マスター.csv'), 'utf8')
  const rows = Papa.parse(text, { header: true, skipEmptyLines: true }).data
  return new Set(rows.map((r) => r['学校名']?.trim()).filter(Boolean))
}

const url = loadEnvUrl()
if (!url) {
  console.error('NEXT_PUBLIC_SHEET_CSV_URL が未設定です')
  process.exit(1)
}

const res = await fetch(url)
if (!res.ok) {
  console.error('CSV取得失敗', res.status)
  process.exit(1)
}

const rows = Papa.parse(await res.text(), { header: true, skipEmptyLines: true }).data
const used = new Set()
for (const r of rows) {
  const n = r['学校名']?.trim()
  if (n) used.add(n)
}

const master = loadMasterNames()
const missing = [...used].filter((n) => !master.has(n)).sort()
const unused = [...master].filter((n) => !used.has(n)).sort()

console.log('本シートで使用中の学校:', used.size, '校')
console.log('マスター登録数:', master.size, '校')
console.log('---')
if (missing.length === 0) {
  console.log('✅ 未登録の学校名はありません')
} else {
  console.log('⚠ マスター未登録（data/学校マスター.csv に追加してください）:')
  missing.forEach((n) => console.log('  -', n))
}
if (unused.length > 0) {
  console.log('---')
  console.log('ℹ マスターのみ存在（本シートでは未使用）:')
  unused.forEach((n) => console.log('  -', n))
}
