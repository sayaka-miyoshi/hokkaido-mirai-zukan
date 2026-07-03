/**
 * iSTEP UTM 着地 + istep_landing 本番確認
 * node scripts/verify-istep-utm-production.mjs
 */
import { chromium } from 'playwright'

const base = 'https://www.hokkaido-miraizukan.jp'
const landingUrl = `${base}/companies?utm_source=istep&utm_medium=dm&utm_campaign=test&dm_group=entry:companies`

const browser = await chromium.launch()
const page = await browser.newPage()

const gaHits = []
page.on('request', (req) => {
  const url = req.url()
  if (url.includes('google-analytics.com/g/collect') || url.includes('google-analytics.com/mp/collect')) {
    gaHits.push(url)
  }
})

await page.goto(landingUrl, { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {})
await page.waitForTimeout(2000)

const istepHit = gaHits.some((u) => u.includes('istep_landing') || u.includes('utm_source'))
const html = await page.content()
const okScript = html.includes('G-JEEYE86YNZ')

console.log(okScript ? '✅ GA4 スクリプト読み込み' : '❌ GA4 未検出')
console.log(gaHits.length > 0 ? `✅ GA4 イベント送信: ${gaHits.length} 件` : '⚠️  GA4 送信未検出（Realtime で確認）')
console.log(`着地URL: ${landingUrl}`)

await browser.close()
