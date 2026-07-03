/**
 * iSTEP キーワード運用パイプライン（一括同期）
 *
 * スプレッドシート更新後に実行:
 *   npm run istep:sync
 *
 * 処理:
 *   1. 公開CSVを読み込み
 *   2. キーワードグループを自動構築（同義語まとめ・URL解決・優先度判定）
 *   3. iSTEP登録用CSV・スプレッドシート貼り付け用CSVを出力
 */
import { mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Papa from 'papaparse'
import { fetchSheetCsvRaw } from './lib/sheet-csv.mjs'
import { loadPublishedPosts } from './lib/istep-post-loader.mjs'
import {
  buildKeywordRegistry,
  buildSheetSyncRows,
  expandToKeywordRows,
  summarizeRegistry,
} from './lib/istep-keyword-registry.mjs'
import { priorityLabel } from './lib/istep-priority.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const exportsDir = resolve(root, 'exports')

const REGISTRY_HEADERS = [
  'group_id',
  'keyword',
  'is_primary',
  'priority',
  'dm_category',
  'dm_url',
  'dm_message',
  'url_type',
  'post_count',
  'notes',
]

const ISTEP_REGISTER_HEADERS = ['dm_keyword', 'dm_url', 'dm_message', 'dm_category', 'priority', 'group_id']

const SHEET_SYNC_HEADERS = [
  'sheet_row',
  'dm_group_id',
  'dm_priority',
  'dm_keyword',
  'dm_url',
  'dm_message',
  'dm_category',
]

function parseArgs(argv) {
  let minPriority = 'B'
  for (const arg of argv) {
    if (arg === '--priority=A') minPriority = 'A'
    if (arg === '--priority=AB') minPriority = 'B'
    if (arg === '--priority=all') minPriority = 'C'
  }
  return { minPriority }
}

function writeCsv(path, rows, columns) {
  const body =
    rows.length > 0
      ? Papa.unparse(rows, { columns, header: true, newline: '\r\n' })
      : `${columns.join(',')}\r\n`
  writeFileSync(path, `\uFEFF${body}`, 'utf8')
}

function filterByMinPriority(rows, minPriority) {
  const order = { A: 0, B: 1, C: 2 }
  const max = order[minPriority] ?? 1
  return rows.filter((row) => (order[row.priority] ?? 9) <= max)
}

const { minPriority } = parseArgs(process.argv.slice(2))

let sheet
try {
  sheet = await fetchSheetCsvRaw()
} catch (error) {
  console.error(`❌ ${error.message}`)
  process.exit(1)
}

const posts = loadPublishedPosts(sheet)
const groups = buildKeywordRegistry(posts)
const keywordRows = expandToKeywordRows(groups)
const sheetSyncRows = buildSheetSyncRows(groups)
const summary = summarizeRegistry(groups, keywordRows)

mkdirSync(exportsDir, { recursive: true })

writeCsv(resolve(exportsDir, 'istep-keyword-registry.csv'), keywordRows, REGISTRY_HEADERS)

const registerRows = filterByMinPriority(keywordRows, minPriority).map((row) => ({
  dm_keyword: row.keyword,
  dm_url: row.dm_url,
  dm_message: row.dm_message,
  dm_category: row.dm_category,
  priority: row.priority,
  group_id: row.group_id,
}))

writeCsv(resolve(exportsDir, 'istep-register.csv'), registerRows, ISTEP_REGISTER_HEADERS)
writeCsv(
  resolve(exportsDir, 'istep-register-priority-A.csv'),
  registerRows.filter((r) => r.priority === 'A'),
  ISTEP_REGISTER_HEADERS,
)
writeCsv(resolve(exportsDir, 'istep-sheet-sync.csv'), sheetSyncRows, SHEET_SYNC_HEADERS)

const report = `# iSTEP 同期レポート

生成日時: ${new Date().toISOString()}

## サマリー

| 項目 | 件数 |
|------|------|
| 公開記事 | ${posts.length} |
| キーワードグループ | ${summary.groupCount} |
| iSTEP登録キーワード（全展開） | ${summary.keywordCount} |
| 優先度Aグループ | ${summary.byPriority.A ?? 0} |
| 優先度Bグループ | ${summary.byPriority.B ?? 0} |
| 優先度Cグループ | ${summary.byPriority.C ?? 0} |
| スプレッドシート同期行 | ${summary.postLinkedRows} |

## URL方針

| url_type | グループ数 |
|----------|-----------|
| 競技一覧 /sport/ | ${summary.sportListCount} |
| 学校一覧 /school/ | ${summary.schoolPageCount} |
| 記事直リンク /post/ | ${summary.postOnlyCount} |

## 出力ファイル

| ファイル | 用途 |
|----------|------|
| \`exports/istep-keyword-registry.csv\` | 管理マスタ（グループ×キーワード） |
| \`exports/istep-register.csv\` | iSTEP登録用（A+B、${registerRows.length}キーワード） |
| \`exports/istep-register-priority-A.csv\` | 優先度Aのみ |
| \`exports/istep-sheet-sync.csv\` | Z〜AE列貼り付け用 |

## 運用フロー

1. スプレッドシートに記事を追加・更新
2. \`npm run istep:sync\`
3. \`istep-sheet-sync.csv\` を Z〜AE に貼り付け（優先度・グループIDを反映）
4. \`istep-register-priority-A.csv\` から iSTEP に登録（A完了後にB）

## 同義語の追加

\`data/istep-synonym-groups.json\` の \`groupOverrides\` に追記して再実行。
`

writeFileSync(resolve(exportsDir, 'istep-sync-report.md'), report, 'utf8')

console.log('=== iSTEP キーワード同期 ===')
console.log(`公開記事: ${posts.length}件`)
console.log(`キーワードグループ: ${summary.groupCount}`)
console.log(`登録キーワード（全展開）: ${summary.keywordCount}`)
console.log(`  A: ${summary.byPriority.A ?? 0} / B: ${summary.byPriority.B ?? 0} / C: ${summary.byPriority.C ?? 0}`)
console.log('')
console.log('出力:')
console.log('  exports/istep-keyword-registry.csv')
console.log(`  exports/istep-register.csv (${registerRows.length}件, A+B)`)
console.log(`  exports/istep-register-priority-A.csv (${registerRows.filter((r) => r.priority === 'A').length}件)`)
console.log('  exports/istep-sheet-sync.csv')
console.log('  exports/istep-sync-report.md')
console.log('')
console.log('優先度:')
console.log(`  ${priorityLabel('A')} → istep-register-priority-A.csv`)
console.log(`  ${priorityLabel('B')} → istep-register.csv に含む`)
console.log(`  ${priorityLabel('C')} → registryのみ（記事増加後に再同期）`)

if (keywordRows.length > 0) {
  console.log('')
  console.log('サンプル（優先度A）:')
  for (const row of keywordRows.filter((r) => r.priority === 'A').slice(0, 5)) {
    console.log(`  [${row.priority}] ${row.keyword} → ${row.dm_url}`)
  }
}
