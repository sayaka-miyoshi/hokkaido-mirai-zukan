/**
 * 本番/ローカルの検索動作確認
 * node scripts/test-search.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const base = process.argv[2] || 'https://hokkaido-mirai-zukan.vercel.app'
const keywords = ['北海道大学', '札幌大学', 'JR北海道', '女子ラクロス']

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })

const initial = await page.evaluate(() => {
  const text = document.body.innerText
  const totalMatch = text.match(/(\d+)件 \/ 全(\d+)件/)
  return { bodyHasHokudai: text.includes('北海道大学'), totalMatch }
})

console.log('initial', initial)

for (const keyword of keywords) {
  await page.fill('#home-search', '')
  await page.fill('#home-search', keyword)
  await page.waitForTimeout(500)

  const result = await page.evaluate(() => {
    const text = document.body.innerText
    const match = text.match(/(\d+)件 \/ 全(\d+)件/)
    const section = document.querySelector('#search-results')
    const cards = section ? section.querySelectorAll('a[href*="/post/"]').length : 0
    return {
      filtered: match ? Number(match[1]) : null,
      total: match ? Number(match[2]) : null,
      filterVisible: text.includes('件 / 全'),
      resultCards: cards,
      hasResultsSection: !!section,
    }
  })

  console.log(keyword, result)
}

await browser.close()
