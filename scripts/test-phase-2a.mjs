/**
 * Phase 2A 本番確認
 * node scripts/test-phase-2a.mjs [baseUrl]
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

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

// ラクロス記事を検索して1件開く
await page.goto(`${base}/#browse`, { waitUntil: 'networkidle', timeout: 120000 })
await page.fill('#home-search', 'ラクロス')
await page.waitForTimeout(500)

const firstPost = page.locator('#search-results a[href*="/post/"]').first()
const postHref = await firstPost.getAttribute('href')
if (!postHref) {
  fail('ラクロス検索で記事が見つからない')
} else {
  pass(`ラクロス記事リンク: ${postHref}`)
  await page.goto(`${base}${postHref}`, { waitUntil: 'networkidle', timeout: 120000 })

  const bodyText = await page.locator('main').innerText()
  if (bodyText.includes('よくある質問')) pass('FAQセクション表示')
  else fail('FAQセクションなし')

  if (bodyText.includes('この記事について')) pass('見出し「この記事について」')
  else fail('見出し「この記事について」なし')

  if (bodyText.includes('基本情報')) pass('見出し「基本情報」')
  else fail('見出し「基本情報」なし')

  const faqSchema = await page.evaluate(() => {
    const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')]
    return scripts.some((script) => {
      try {
        const data = JSON.parse(script.textContent || '')
        const items = Array.isArray(data) ? data : [data]
        return items.some(
          (item) =>
            item['@type'] === 'FAQPage' ||
            item.mainEntity?.['@type'] === 'FAQPage' ||
            (Array.isArray(item.mainEntity) &&
              item.mainEntity.some((entry) => entry['@type'] === 'Question')),
        )
      } catch {
        return false
      }
    })
  })
  if (faqSchema) pass('FAQ JSON-LD あり')
  else fail('FAQ JSON-LD なし')

  const relatedText = await page.locator('aside[aria-label="関連記事"]').innerText().catch(() => '')
  if (relatedText.includes('同じ競技')) pass('関連記事「同じ競技」セクション')
  else fail(`関連記事「同じ競技」なし: ${relatedText.slice(0, 80)}`)
}

// 競技一覧ページ要約
await page.goto(`${base}/sport/${encodeURIComponent('ラクロス')}`, {
  waitUntil: 'networkidle',
  timeout: 120000,
})
const sportSummary = await page.locator('header p').first().innerText()
if (sportSummary.length >= 30) pass(`競技ページ要約 (${sportSummary.length}字)`)
else fail('競技ページ要約が短すぎる')

const sportSchema = await page.evaluate(() => {
  const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')]
  return scripts.some((script) => script.textContent?.includes('SportsOrganization'))
})
if (sportSchema) pass('SportsOrganization JSON-LD')
else fail('SportsOrganization JSON-LD なし')

await browser.close()
console.log(failed === 0 ? '\n✅ test-phase-2a 完了' : `\n❌ 失敗 ${failed}件`)
process.exit(failed === 0 ? 0 : 1)
