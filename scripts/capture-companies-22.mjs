/**
 * 企業セクション22件表示のレイアウト確認（PC・スマホ）
 * node scripts/capture-companies-22.mjs [baseUrl]
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const base = process.argv[2] || 'http://localhost:3000'
const outDir = path.join(process.cwd(), 'public', 'screenshots', 'companies-22')
await mkdir(outDir, { recursive: true })

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'pc', width: 1280, height: 900 },
]

const browser = await chromium.launch()

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } })
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.locator('#companies').scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)

  const info = await page.evaluate(() => {
    const section = document.querySelector('#companies')
    const grid = section?.querySelector('.grid')
    const cards = section?.querySelectorAll('a[href*="/post/"]') ?? []
    const gridStyle = grid ? getComputedStyle(grid) : null
    const gridRect = grid?.getBoundingClientRect()
    const cardRects = [...cards].map((el) => el.getBoundingClientRect())
    const overflowX = document.documentElement.scrollWidth > window.innerWidth + 2
    const widths = cardRects.map((r) => Math.round(r.width))
    const uniqueWidths = [...new Set(widths)]
    return {
      cardCount: cards.length,
      gridCols: gridStyle?.gridTemplateColumns ?? null,
      gridWidth: gridRect ? Math.round(gridRect.width) : null,
      viewportWidth: window.innerWidth,
      overflowX,
      cardWidthRange:
        widths.length > 0
          ? { min: Math.min(...widths), max: Math.max(...widths) }
          : null,
      uniformCardWidth: uniqueWidths.length <= 1,
    }
  })

  console.log(viewport.name, info)

  const sectionBox = await page.locator('#companies').boundingBox()
  if (sectionBox) {
    await page.screenshot({
      path: path.join(outDir, `${viewport.name}-companies-section.png`),
      clip: {
        x: 0,
        y: Math.max(0, sectionBox.y - 16),
        width: viewport.width,
        height: Math.min(sectionBox.height + 32, viewport.height - Math.max(0, sectionBox.y - 16)),
      },
    })
  }

  await page.screenshot({
    path: path.join(outDir, `${viewport.name}-companies-fullscroll.png`),
    fullPage: false,
  })

  await page.close()
}

await browser.close()
console.log('saved to', outDir)
