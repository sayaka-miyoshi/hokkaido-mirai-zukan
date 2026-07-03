/**
 * Phase 2B 実装検証
 * node scripts/test-phase-2b.mjs
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveTrafficSource } from '../lib/attribution.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
let failed = 0

function pass(msg) {
  console.log('✅', msg)
}

function fail(msg) {
  console.log('❌', msg)
  failed++
}

console.log('=== 1. 流入元判定 ===')
const cases = [
  [{ searchParams: { utm_source: 'istep', utm_medium: 'dm' }, referrer: '' }, 'istep'],
  [{ searchParams: { utm_source: 'instagram' }, referrer: '' }, 'instagram'],
  [{ searchParams: {}, referrer: 'https://www.google.co.jp/' }, 'google'],
  [{ searchParams: {}, referrer: 'https://www.instagram.com/' }, 'instagram'],
  [{ searchParams: {}, referrer: '' }, 'direct'],
]
for (const [input, expected] of cases) {
  const actual = resolveTrafficSource(input)
  if (actual === expected) pass(`${expected}: OK`)
  else fail(`expected ${expected}, got ${actual}`)
}

console.log('\n=== 2. 成果物 JSON ===')
for (const file of ['search-index.json', 'entity-graph.json', 'ranking-snapshot.json']) {
  const path = join(root, 'public', 'data', file)
  if (!existsSync(path)) {
    fail(`${file} なし`)
    continue
  }
  try {
    const json = JSON.parse(readFileSync(path, 'utf8'))
    pass(`${file} (version ${json.version ?? '?'})`)
  } catch {
    fail(`${file} JSON パース失敗`)
  }
}

console.log('\n=== 3. 意図タクソノミー ===')
const intentsPath = join(root, 'data', 'search-intents.json')
const intents = JSON.parse(readFileSync(intentsPath, 'utf8'))
const intentCount = Object.keys(intents).length
if (intentCount >= 20) pass(`search-intents.json: ${intentCount} 件`)
else fail(`search-intents.json: ${intentCount} 件（20件以上必要）`)

console.log('\n=== 4. 必須ファイル ===')
const required = [
  'lib/attribution.ts',
  'lib/analytics/events.ts',
  'lib/analytics/track-client.ts',
  'lib/search-index.ts',
  'types/ranking.ts',
  'app/api/revalidate/route.ts',
  'scripts/build-artifacts.mjs',
  'scripts/build-search-index.mjs',
  'scripts/build-entity-graph.mjs',
  'scripts/aggregate-analytics.mjs',
]
for (const rel of required) {
  if (existsSync(join(root, rel))) pass(rel)
  else fail(`${rel} なし`)
}

console.log(failed === 0 ? '\n✅ Phase 2B テスト OK' : `\n❌ ${failed} 件失敗`)
process.exit(failed === 0 ? 0 : 1)
