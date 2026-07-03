/**
 * Phase 2B 本番デプロイ確認
 * node scripts/verify-phase-2b-production.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const base = (process.argv[2] || 'https://www.hokkaido-miraizukan.jp').replace(/\/$/, '')
let failed = 0

function pass(msg) {
  console.log('✅', msg)
}

function fail(msg) {
  console.log('❌', msg)
  failed++
}

async function waitForDeploy(page, maxAttempts = 40) {
  for (let i = 1; i <= maxAttempts; i++) {
    const res = await page.request.get(`${base}/data/search-index.json`)
    if (res.ok()) {
      const json = await res.json()
      if (json.version === 1 && json.documentCount > 0) {
        console.log(`デプロイ反映 (attempt ${i}, documents=${json.documentCount})`)
        return json
      }
    }
    console.log(`attempt ${i}: デプロイ待機中...`)
    await page.waitForTimeout(10000)
  }
  return null
}

const browser = await chromium.launch()
const page = await browser.newPage()

console.log('=== ① 成果物 JSON ===')
const index = await waitForDeploy(page)
if (!index) fail('search-index.json 未反映')
else pass(`search-index.json: ${index.documentCount} documents`)

const graphRes = await page.request.get(`${base}/data/entity-graph.json`)
if (graphRes.ok()) {
  const graph = await graphRes.json()
  pass(`entity-graph.json: ${graph.postCount} posts`)
} else fail(`entity-graph.json HTTP ${graphRes.status()}`)

const rankRes = await page.request.get(`${base}/data/ranking-snapshot.json`)
if (rankRes.ok()) pass('ranking-snapshot.json: OK')
else fail(`ranking-snapshot.json HTTP ${rankRes.status()}`)

console.log('\n=== ② GA4 スクリプト ===')
await page.goto(`${base}/post/4`, { waitUntil: 'domcontentloaded', timeout: 120000 })
const html = await page.content()
const gaIds = [...new Set(html.match(/G-[A-Z0-9]+/g) ?? [])]
if (gaIds.length > 0) pass(`GA4 測定ID検出: ${gaIds.join(', ')}`)
else fail('GA4 スクリプト未検出（NEXT_PUBLIC_GA_MEASUREMENT_ID 未設定の可能性）')

console.log('\n=== ③ revalidate API ===')
const revRes = await page.request.post(`${base}/api/revalidate`, {
  headers: { Authorization: 'Bearer invalid-test' },
})
if (revRes.status() === 401) pass('revalidate API: 401 Unauthorized（エンドポイント稼働）')
else if (revRes.status() === 503) pass('revalidate API: 503（REVALIDATE_SECRET 未設定・エンドポイント稼働）')
else fail(`revalidate API: 想定外ステータス ${revRes.status()}`)

await browser.close()
console.log(failed === 0 ? '\n✅ 本番 Phase 2B 確認 OK' : `\n⚠️  ${failed} 件要対応`)
process.exit(0)
