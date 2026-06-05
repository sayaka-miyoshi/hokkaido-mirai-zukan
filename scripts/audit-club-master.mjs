/**
 * 本シートCSVの 部活名+学校名 と data/部活マスター.csv を照合（任意）
 * 実行: npm run club-master:audit
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const masterPath = resolve(root, 'data/部活マスター.csv')

function loadEnvUrl() {
  const env = readFileSync(resolve(root, '.env.local'), 'utf8')
  return env.match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)?.[1]?.trim()
}

const url = loadEnvUrl()
if (!url) {
  console.error('NEXT_PUBLIC_SHEET_CSV_URL が未設定です')
  process.exit(1)
}

const rows = Papa.parse(await (await fetch(url)).text(), {
  header: true,
  skipEmptyLines: true,
}).data

const used = new Map()
for (const r of rows) {
  const club = r['部活名']?.trim()
  const school = r['学校名']?.trim()
  if (!club) continue
  const key = `${club}|${school}`
  if (!used.has(key)) {
    used.set(key, {
      club,
      school,
      sns: r['部活SNS']?.trim() || '',
      cat: r['動画カテゴリ']?.trim() || r['進路カテゴリ']?.trim() || '',
    })
  }
}

console.log('本シート: 部活あり行', [...used.values()].length, '組（部活名+学校名でユニーク）')

if (!existsSync(masterPath)) {
  console.log('\nℹ data/部活マスター.csv はまだありません（スプレッドシート上で作成後、エクスポート可）')
  console.log('サンプル（先頭5件）:')
  ;[...used.values()].slice(0, 5).forEach((v) => console.log(' ', v))
  process.exit(0)
}

const masterRows = Papa.parse(readFileSync(masterPath, 'utf8'), {
  header: true,
  skipEmptyLines: true,
}).data
const master = new Set(
  masterRows.map((r) => `${r['部活名']?.trim()}|${r['学校名']?.trim()}`).filter((k) => !k.endsWith('|')),
)

const missing = [...used.keys()].filter((k) => !master.has(k))
console.log('マスター登録:', master.size, '組')
if (missing.length === 0) console.log('✅ 未登録の組み合わせはありません')
else {
  console.log('⚠ マスター未登録:')
  missing.forEach((k) => console.log('  -', k.replace('|', ' @ ')))
}
