/**
 * 本番で g/collect が飛ぶことを Playwright で確認
 * node scripts/verify-ga4-collect.mjs
 */
import { chromium } from 'playwright'

const base = 'https://www.hokkaido-miraizukan.jp'
const expectedId = process.env.EXPECTED_GA_ID || 'G-JEEYE86YNZ'
let failed = 0

function pass(m) {
  console.log('✅', m)
}
function fail(m) {
  console.log('❌', m)
  failed++
}

async function waitForDeploy(page) {
  for (let i = 1; i <= 40; i++) {
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    const html = await page.content()
    if (html.includes(expectedId) && (html.includes('window.gtag') || html.includes('ga4-init'))) {
      console.log(`デプロイ反映 (attempt ${i})`)
      return true
    }
    // also check via evaluate after scripts load
    await page.waitForTimeout(2000)
    const hasGtag = await page.evaluate(() => typeof window.gtag === 'function')
    const hasId = await page.evaluate(
      (id) => JSON.stringify(window.dataLayer || []).includes(id),
      expectedId,
    )
    if (hasGtag && hasId) {
      console.log(`デプロイ反映 via runtime (attempt ${i})`)
      return true
    }
    console.log(`attempt ${i}: 待機中...`)
    await page.waitForTimeout(8000)
  }
  return false
}

const browser = await chromium.launch()
const page = await browser.newPage()
const collectUrls = []

page.on('request', (req) => {
  const url = req.url()
  if (url.includes('google-analytics.com/g/collect') || url.includes('/g/collect')) {
    collectUrls.push(url)
  }
})

console.log('=== デプロイ待機 ===')
if (!(await waitForDeploy(page))) {
  fail('GA4 初期化が本番に反映されていません')
  await browser.close()
  process.exit(1)
}

console.log('\n=== window.gtag / collect ===')
await page.goto(`${base}/post/4`, { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {})
await page.waitForTimeout(4000)

const runtime = await page.evaluate((id) => {
  return {
    hasGtag: typeof window.gtag === 'function',
    hasDataLayer: Array.isArray(window.dataLayer),
    dataLayerHasId: JSON.stringify(window.dataLayer || []).includes(id),
    measurementScripts: [...document.scripts]
      .map((s) => s.src)
      .filter((s) => s.includes('googletagmanager') || s.includes('google-analytics')),
  }
}, expectedId)

console.log(runtime)

if (runtime.hasGtag) pass('window.gtag が存在')
else fail('window.gtag が存在しない')

if (
  runtime.dataLayerHasId ||
  runtime.measurementScripts.some((s) => s.includes(expectedId))
) {
  pass(`測定ID ${expectedId} が読み込まれている`)
} else if (runtime.measurementScripts.length > 0) {
  pass('gtag.js スクリプト読み込みあり')
} else {
  fail('測定ID / gtag.js 未検出')
}

const toNew = collectUrls.filter((u) => u.includes(expectedId) || u.includes('tid='))
if (collectUrls.length > 0) {
  pass(`g/collect 送信: ${collectUrls.length} 件`)
  console.log('sample:', collectUrls[0].slice(0, 160))
} else {
  // POST body の場合 URL に tid が無いことがある — request の postData も見る
  fail('g/collect リクエストが 0 件（Network で collect が見えない状態）')
}

await browser.close()
process.exit(failed === 0 ? 0 : 1)
