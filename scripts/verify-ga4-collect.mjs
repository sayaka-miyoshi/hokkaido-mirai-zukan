/**
 * 本番で g/collect が飛ぶことを Playwright で確認
 * node scripts/verify-ga4-collect.mjs
 */
import { chromium } from 'playwright'

const base = 'https://www.hokkaido-miraizukan.jp'
const expectedId = process.env.EXPECTED_GA_ID || 'G-9Q0MGFPBZ6'
let failed = 0

function pass(m) {
  console.log('✅', m)
}
function fail(m) {
  console.log('❌', m)
  failed++
}

function isCollectUrl(url) {
  return (
    url.includes('/g/collect') ||
    url.includes('google-analytics.com/g/collect') ||
    url.includes('analytics.google.com/g/collect')
  )
}

async function waitForDeploy(page) {
  for (let i = 1; i <= 40; i++) {
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await page.waitForTimeout(2500)
    const html = await page.content()
    const hasNewSnippet =
      html.includes('_next-ga') ||
      html.includes('@next/third-parties') ||
      (html.includes(expectedId) && !html.includes('send_page_view":false') && !html.includes("send_page_view: false"))

    const runtime = await page.evaluate((id) => {
      const scripts = [...document.scripts].map((s) => s.src + (s.id || ''))
      return {
        hasGtag: typeof window.gtag === 'function',
        hasId: JSON.stringify(window.dataLayer || []).includes(id),
        hasNextGa: scripts.some((s) => s.includes('gtag/js') && s.includes(id)),
        config: JSON.stringify(window.dataLayer || []),
      }
    }, expectedId)

    const configOk =
      runtime.config.includes(expectedId) && !runtime.config.includes('"send_page_view":false')

    if ((hasNewSnippet || runtime.hasNextGa) && runtime.hasId && configOk) {
      console.log(`デプロイ反映 (attempt ${i})`)
      return true
    }
    console.log(`attempt ${i}: 待機中... hasGtag=${runtime.hasGtag} hasId=${runtime.hasId}`)
    await page.waitForTimeout(8000)
  }
  return false
}

const browser = await chromium.launch()
const page = await browser.newPage()
const collectUrls = []

page.on('request', (req) => {
  const url = req.url()
  if (isCollectUrl(url)) collectUrls.push(url)
})

console.log('=== デプロイ待機 ===')
if (!(await waitForDeploy(page))) {
  fail('GA4 新実装が本番に反映されていません')
  await browser.close()
  process.exit(1)
}

console.log('\n=== window.gtag / collect ===')
collectUrls.length = 0
await page.goto(`${base}/post/4`, { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {})
await page.waitForTimeout(5000)

const runtime = await page.evaluate((id) => {
  return {
    hasGtag: typeof window.gtag === 'function',
    hasDataLayer: Array.isArray(window.dataLayer),
    dataLayerHasId: JSON.stringify(window.dataLayer || []).includes(id),
    sendPageViewDisabled: JSON.stringify(window.dataLayer || []).includes('"send_page_view":false'),
    measurementScripts: [...document.scripts]
      .map((s) => s.src)
      .filter((s) => s.includes('googletagmanager') || s.includes('google-analytics')),
  }
}, expectedId)

console.log(runtime)

if (runtime.hasGtag) pass('window.gtag が存在')
else fail('window.gtag が存在しない')

if (runtime.dataLayerHasId) pass(`測定ID ${expectedId} が dataLayer にある`)
else fail(`測定ID ${expectedId} が dataLayer にない`)

if (runtime.sendPageViewDisabled) fail('send_page_view: false のまま（旧実装）')
else pass('send_page_view は無効化されていない')

if (collectUrls.length > 0) {
  pass(`g/collect 送信: ${collectUrls.length} 件`)
  console.log('sample:', collectUrls[0].slice(0, 200))
  if (collectUrls.some((u) => u.includes(expectedId))) {
    pass(`新プロパティ ${expectedId} へ送信`)
  }
} else {
  fail('g/collect リクエストが 0 件')
}

await browser.close()
console.log(failed === 0 ? '\n✅ GA4 collect 確認 OK' : `\n⚠️  ${failed} 件失敗`)
process.exit(failed === 0 ? 0 : 1)
