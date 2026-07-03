/**
 * iステップ DM登録用 CSV エクスポート（キーワードグループ方式）
 *
 * 実行: npm run istep:export-dm
 * 出力: exports/istep-dm-export.csv
 *
 * 内部でキーワードレジストリを再構築し、優先度A+Bのキーワードを出力します。
 * フル同期は npm run istep:sync を使用してください。
 */
import { mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'
import { ISTEP_DM_EXPORT_HEADERS } from './lib/dm-columns.mjs'
import { fetchSheetCsvRaw } from './lib/sheet-csv.mjs'
import { loadPublishedPosts } from './lib/istep-post-loader.mjs'
import { buildKeywordRegistry, expandToKeywordRows } from './lib/istep-keyword-registry.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const defaultOutPath = resolve(root, 'exports/istep-dm-export.csv')

function parseArgs(argv) {
  let outPath = defaultOutPath
  let minPriority = 'B'
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out' && argv[i + 1]) outPath = resolve(process.cwd(), argv[++i])
    if (argv[i] === '--priority=A') minPriority = 'A'
    if (argv[i] === '--priority=all') minPriority = 'C'
  }
  return { outPath, minPriority }
}

function isValidHttpUrl(value) {
  return /^https?:\/\/.+/i.test(value)
}

const { outPath, minPriority } = parseArgs(process.argv.slice(2))
const order = { A: 0, B: 1, C: 2 }
const max = order[minPriority] ?? 1

let sheet
try {
  sheet = await fetchSheetCsvRaw()
} catch (error) {
  console.error(`❌ ${error.message}`)
  process.exit(1)
}

const posts = loadPublishedPosts(sheet)
const groups = buildKeywordRegistry(posts)
const keywordRows = expandToKeywordRows(groups).filter(
  (row) => (order[row.priority] ?? 9) <= max,
)

const exported = keywordRows
  .map((row) => ({
    dm_keyword: row.keyword,
    dm_url: row.dm_url,
    dm_message: row.dm_message,
    dm_category: row.dm_category,
  }))
  .sort((a, b) => {
    const c = a.dm_category.localeCompare(b.dm_category, 'ja')
    if (c !== 0) return c
    return a.dm_keyword.localeCompare(b.dm_keyword, 'ja')
  })

const warnings = []
for (const row of exported) {
  if (!row.dm_url) warnings.push(`キーワード「${row.dm_keyword}」: dm_url 空欄`)
  else if (!isValidHttpUrl(row.dm_url)) warnings.push(`キーワード「${row.dm_keyword}」: URL形式不正`)
  if (!row.dm_message) warnings.push(`キーワード「${row.dm_keyword}」: dm_message 空欄`)
}

const csvBody =
  exported.length > 0
    ? Papa.unparse(exported, { columns: ISTEP_DM_EXPORT_HEADERS, header: true, newline: '\r\n' })
    : `${ISTEP_DM_EXPORT_HEADERS.join(',')}\r\n`

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, `\uFEFF${csvBody}`, 'utf8')

console.log('=== iステップ DM CSV エクスポート（グループ方式） ===')
console.log(`出力: ${outPath}`)
console.log(`公開記事: ${posts.length} / キーワードグループ: ${groups.length}`)
console.log(`出力キーワード: ${exported.length}（優先度 ≤ ${minPriority}）`)
console.log('')
console.log('💡 フル同期: npm run istep:sync')
console.log('   → registry / sheet-sync / 優先度別CSV も同時生成')

if (warnings.length > 0) {
  console.log('')
  console.log('⚠ 警告:')
  for (const message of warnings.slice(0, 10)) console.log(`  - ${message}`)
}

console.log('')
console.log('列: ' + ISTEP_DM_EXPORT_HEADERS.join(', '))
