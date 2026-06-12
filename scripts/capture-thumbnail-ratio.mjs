/**
 * 4:5 サムネイル比率のスクリーンショット（PC・スマホ）
 * node scripts/capture-thumbnail-ratio.mjs [baseUrl]
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const base = process.argv[2] || 'http://localhost:3000'
const outDir = path.join(process.cwd(), 'public', 'screenshots', 'thumbnail-4x5')
await mkdir(outDir, { recursive: true })

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'pc', width: 1280, height: 900 },
]

const browser = await chromium.launch()

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } })
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })

  // 人気
  await page.locator('#popular').scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  const popularBox = await page.locator('#popular .grid').first().boundingBox()
  if (popularBox) {
    await page.screenshot({
      path: path.join(outDir, `${viewport.name}-popular.png`),
      clip: {
        x: Math.max(0, popularBox.x - 8),
        y: Math.max(0, popularBox.y - 40),
        width: Math.min(popularBox.width + 16, viewport.width),
        height: Math.min(popularBox.height + 48, viewport.height - popularBox.y),
      },
    })
  }

  // 最新
  await page.locator('#latest').scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  const latestBox = await page.locator('#latest .grid').first().boundingBox()
  if (latestBox) {
    await page.screenshot({
      path: path.join(outDir, `${viewport.name}-latest.png`),
      clip: {
        x: Math.max(0, latestBox.x - 8),
        y: Math.max(0, latestBox.y - 40),
        width: Math.min(latestBox.width + 16, viewport.width),
        height: Math.min(latestBox.height + 48, viewport.height - latestBox.y),
      },
    })
  }

  // 検索結果（学校）
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.getByRole('button', { name: '学校の記事', exact: true }).click()
  await page.waitForTimeout(1200)
  await page.locator('#search-results').scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const searchBox = await page.locator('#search-results .grid').first().boundingBox()
  if (searchBox) {
    await page.screenshot({
      path: path.join(outDir, `${viewport.name}-search-school.png`),
      clip: {
        x: Math.max(0, searchBox.x - 8),
        y: Math.max(0, searchBox.y - 48),
        width: Math.min(searchBox.width + 16, viewport.width),
        height: Math.min(searchBox.height + 56, viewport.height - searchBox.y),
      },
    })
  }

  // 学校一覧
  await page.goto(`${base}/schools`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForTimeout(800)
  const schoolsGrid = page.locator('.grid').first()
  const schoolsBox = await schoolsGrid.boundingBox()
  if (schoolsBox) {
    await page.screenshot({
      path: path.join(outDir, `${viewport.name}-schools-list.png`),
      clip: {
        x: Math.max(0, schoolsBox.x - 8),
        y: Math.max(0, schoolsBox.y - 8),
        width: Math.min(schoolsBox.width + 16, viewport.width),
        height: Math.min(schoolsBox.height + 16, 520),
      },
    })
  }

  // 部活一覧
  await page.goto(`${base}/clubs`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForTimeout(800)
  const clubsBox = await page.locator('.grid').first().boundingBox()
  if (clubsBox) {
    await page.screenshot({
      path: path.join(outDir, `${viewport.name}-clubs-list.png`),
      clip: {
        x: Math.max(0, clubsBox.x - 8),
        y: Math.max(0, clubsBox.y - 8),
        width: Math.min(clubsBox.width + 16, viewport.width),
        height: Math.min(clubsBox.height + 16, 520),
      },
    })
  }

  // 企業（TOP #companies）
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.locator('#companies').scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  const companiesBox = await page.locator('#companies .grid').first().boundingBox()
  if (companiesBox) {
    await page.screenshot({
      path: path.join(outDir, `${viewport.name}-companies-top.png`),
      clip: {
        x: Math.max(0, companiesBox.x - 8),
        y: Math.max(0, companiesBox.y - 40),
        width: Math.min(companiesBox.width + 16, viewport.width),
        height: Math.min(companiesBox.height + 48, viewport.height - companiesBox.y),
      },
    })
  }

  // 比率計測
  const ratioCheck = await page.evaluate(() => {
    const container = document.querySelector('#popular .grid a div[class*="aspect"]')
      ?? document.querySelector('#popular .grid article div.relative')
    if (!container) return null
    const rect = container.getBoundingClientRect()
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      ratio: (rect.width / rect.height).toFixed(3),
      expected: (4 / 5).toFixed(3),
    }
  })
  console.log(viewport.name, 'ratio', ratioCheck)

  await page.close()
}

await browser.close()
console.log('saved to', outDir)
