/**
 * サジェストUI確認
 * node scripts/test-search-suggest-ui.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const base = process.argv[2] || 'http://localhost:3000'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })

for (const query of ['北', 'ラ']) {
  await page.fill('#home-search', '')
  await page.fill('#home-search', query)
  await page.waitForTimeout(400)

  const labels = await page.evaluate(() =>
    [...document.querySelectorAll('[role="listbox"] [role="option"]')].map((el) => el.textContent?.trim()),
  )

  console.log(`「${query}」`, labels.length, '件')
  labels.forEach((label) => console.log(`  - ${label}`))
}

await browser.close()
