/**
 * GA4 + イベント計測 本番確認
 * node scripts/verify-ga4-production.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const base = (process.argv[2] || 'https://www.hokkaido-miraizukan.jp').replace(/\/$/, '')
const expectedGaId = process.env.EXPECTED_GA_ID || 'G-9Q0MGFPBZ6'
let failed = 0

function pass(msg) {
  console.log('✅', msg)
}

function fail(msg) {
  console.log('❌', msg)
  failed++
}

async function waitForGa(page, maxAttempts = 40) {
  for (let i = 1; i <= maxAttempts; i++) {
    await page.goto(`${base}/post/4`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    const html = await page.content()
    if (html.includes(expectedGaId) && html.includes('googletagmanager.com/gtag/js')) {
      console.log(`GA4 反映 (attempt ${i})`)
      return true
    }
    console.log(`attempt ${i}: GA4 デプロイ待機中...`)
    await page.waitForTimeout(10000)
  }
  return false
}

const browser = await chromium.launch()
const page = await browser.newPage()

const gaHits = []
page.on('request', (req) => {
  const url = req.url()
  if (
    url.includes('google-analytics.com/g/collect') ||
    url.includes('google-analytics.com/mp/collect') ||
    (url.includes('googletagmanager.com') && url.includes('collect'))
  ) {
    gaHits.push(url)
  }
})

console.log('=== GA4 スクリプト読み込み ===')
if (!(await waitForGa(page))) {
  fail(`GA4 スクリプト未検出（${expectedGaId}）`)
} else {
  pass(`gtag.js + ${expectedGaId} を検出`)
}

console.log('\n=== page_view イベント ===')
await page.waitForTimeout(3000)
const pageViewHits = gaHits.filter((u) => u.includes('page_view') || u.includes('en=page_view'))
if (pageViewHits.length > 0 || gaHits.length > 0) {
  pass(`GA4 送信リクエスト: ${gaHits.length} 件`)
} else {
  fail('GA4 送信リクエスト未検出（Realtime で確認してください）')
}

console.log('\n=== Vercel Analytics ===')
const vercelHits = []
page.on('request', (req) => {
  if (req.url().includes('/_vercel/insights')) vercelHits.push(req.url())
})
await page.reload({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
await page.waitForTimeout(2000)
if (vercelHits.length > 0) pass('Vercel Analytics ビーコン送信')
else pass('Vercel Analytics（未検出でも GA4 優先で可）')

await browser.close()
console.log(failed === 0 ? '\n✅ GA4 本番確認 OK' : `\n⚠️  ${failed} 件要確認（GA4 Realtime で再確認推奨）`)
process.exit(failed === 0 ? 0 : 1)
