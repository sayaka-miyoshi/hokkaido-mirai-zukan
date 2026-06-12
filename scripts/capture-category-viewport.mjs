/**
 * ビューポート内スクショ（#search-results 中心）
 * node scripts/capture-category-viewport.mjs [baseUrl]
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const base = process.argv[2] || 'https://hokkaido-mirai-zukan.vercel.app'
const outDir = path.join(process.cwd(), 'public', 'screenshots', 'category-verify')
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })
await page.locator('#latest').scrollIntoViewIfNeeded()
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(outDir, 'viewport-latest.png') })

const latestHrefs = await page.evaluate(() =>
  [...document.querySelectorAll('#latest a[href*="/post/"]')].slice(0, 5).map((a) => a.getAttribute('href')),
)

for (const button of ['学校の記事', '部活の記事', '企業の記事']) {
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.getByRole('button', { name: button, exact: true }).click()
  await page.waitForTimeout(1500)
  await page.locator('#search-results').scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)

  const info = await page.evaluate(() => {
    const sr = document.querySelector('#search-results')
    const latest = document.querySelector('#latest')
    const style = sr ? getComputedStyle(sr) : null
    return {
      searchHeading: sr?.querySelector('h2')?.textContent?.trim(),
      searchDesc: sr?.querySelector('p')?.textContent?.trim(),
      searchCount: sr?.querySelectorAll('a[href*="/post/"]').length ?? 0,
      latestVisible: !!latest,
      opacity: style?.opacity ?? null,
      firstHrefs: [...(sr?.querySelectorAll('a[href*="/post/"]') ?? [])]
        .slice(0, 5)
        .map((a) => a.getAttribute('href')),
    }
  })

  const slug = button.replace('の記事', '')
  const box = await page.locator('#search-results').boundingBox()
  if (box) {
    await page.screenshot({
      path: path.join(outDir, `viewport-${slug}.png`),
      clip: {
        x: Math.max(0, box.x),
        y: Math.max(0, box.y),
        width: Math.min(box.width, 390),
        height: Math.min(box.height, 700),
      },
    })
  }
  console.log(button, info, 'sameAsLatestTop5', info.firstHrefs?.join(',') === latestHrefs.join(','))
}

await browser.close()
