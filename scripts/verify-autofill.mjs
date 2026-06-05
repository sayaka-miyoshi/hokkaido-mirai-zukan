/**
 * CSVの直近行で自動入力列を表示
 * 実行: npm run verify:autofill
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const url = readFileSync(resolve(root, '.env.local'), 'utf8')
  .match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)?.[1]
  ?.trim()

if (!url) {
  console.error('NEXT_PUBLIC_SHEET_CSV_URL 未設定')
  process.exit(1)
}

const rows = Papa.parse(await (await fetch(url)).text(), {
  header: true,
  skipEmptyLines: true,
}).data

const school = process.argv[2]?.trim()
const club = process.argv[3]?.trim()

let targetRows = rows.slice(-5)
if (school || club) {
  targetRows = rows.filter((r) => {
    if (school && (r['学校名']?.trim() ?? '') !== school) return false
    if (club && (r['部活名']?.trim() ?? '') !== club) return false
    return Boolean(r['投稿タイトル']?.trim())
  })
  console.log(`検索: 学校名=${school || '任意'} / 部活名=${club || '任意'}`)
} else {
  const withTitle = rows.filter((r) => r['投稿タイトル']?.trim())
  if (withTitle.length > 0) {
    targetRows = withTitle.slice(-5)
    console.log(`全${rows.length}件 / タイトルあり末尾${targetRows.length}行`)
  } else {
    console.log(`全${rows.length}件 / 末尾${targetRows.length}行（空行のみの可能性）`)
  }
}
console.log('')

const fields = [
  '投稿タイトル',
  '学校名',
  '部活名',
  'slug',
  '学校公式サイト',
  '学校SNS',
  '部活SNS',
  '競技カテゴリ',
  'slug候補',
]

for (let i = 0; i < targetRows.length; i++) {
  const row = targetRows[i]
  const rowNum = rows.indexOf(row) + 2
  console.log(`--- 行 ${rowNum} ---`)
  for (const f of fields) {
    const v = row[f]?.trim() ?? ''
    console.log(`  ${f}: ${v || '（空）'}`)
  }
  console.log('')
}

const slugEmptyWithTitle = rows.filter(
  (r) => !(r.slug?.trim()) && (r['投稿タイトル']?.trim())
)
const slugCandidateCount = rows.filter((r) => r['slug候補']?.trim()).length
if (slugEmptyWithTitle.length > 0 && slugCandidateCount === 0) {
  console.log(
    `⚠ slug未確定 ${slugEmptyWithTitle.length} 行あるのに slug候補が 0 件 → シート1の Y2 数式を確認（docs/トラブルシュート_Y列_slug候補.md）`
  )
}
