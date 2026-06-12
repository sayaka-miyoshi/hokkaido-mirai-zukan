/**
 * TOPページ各セクションを Chromium（実ブラウザエンジン）で描画し、
 * セクション要素全体のスクリーンショットを取得する。
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const outDir = path.join(process.cwd(), 'public', 'screenshots', 'top-verify')
const baseUrl = process.env.CAPTURE_BASE_URL || 'http://localhost:3000'

const SECTIONS = [
  { id: 'popular', label: '人気コンテンツ', minCards: 6 },
  { id: 'latest', label: '最新コンテンツ', minCards: 9 },
  { id: 'companies', label: '北海道の企業を知ろう', minCards: 9 },
]

async function preparePage(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForSelector('#popular', { timeout: 90000 })
  await page.addStyleTag({
    content: `
      .fade-up { opacity: 1 !important; transform: none !important; }
      nextjs-portal, [data-nextjs-toast], #devtools-indicator { display: none !important; }
    `,
  })
  await page.evaluate(() => {
    document.querySelectorAll('.fade-up').forEach((el) => el.classList.add('fade-up-visible'))
  })
  await page.waitForTimeout(2000)
}

async function waitSectionReady(page, selector, minCards) {
  await page
    .waitForFunction(
      ({ sel, min }) => {
        const section = document.querySelector(sel)
        if (!section) return false
        const cards = section.querySelectorAll('article').length
        if (cards < min) return false
        const imgs = [...section.querySelectorAll('img')]
        if (imgs.length === 0) return true
        return imgs.every((img) => img.complete && img.getBoundingClientRect().height > 0)
      },
      { sel: selector, min: minCards },
      { timeout: 90000 },
    )
    .catch(() => {})
  await page.waitForTimeout(2500)
}

async function captureSection(page, selector, filename, minCards) {
  const el = page.locator(selector)
  await el.scrollIntoViewIfNeeded({ timeout: 60000 })
  await waitSectionReady(page, selector, minCards)
  await el.screenshot({
    path: path.join(outDir, filename),
    animations: 'disabled',
  })
}

async function verifySection(page, sectionId) {
  return page.evaluate((id) => {
    const section = document.querySelector(`#${id}`)
    const grid = section?.querySelector('.grid')
    const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length : 0
    const cards = section ? section.querySelectorAll('article').length : 0
    const srcs = section ? [...section.querySelectorAll('img')].map((img) => img.currentSrc || img.src) : []
    return {
      cols,
      cards,
      images: srcs.length,
      uniqueImages: new Set(srcs).size,
      defaultImages: srcs.filter((src) => src.includes('/images/default-')).length,
    }
  }, sectionId)
}

const browser = await chromium.launch({ headless: true })
await mkdir(outDir, { recursive: true })

const viewports = [
  { name: 'pc', width: 1280, height: 900, suffix: 'pc' },
  { name: 'mobile', width: 390, height: 844, suffix: 'mobile', isMobile: true },
]

const report = {}

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile ?? false,
    deviceScaleFactor: vp.isMobile ? 2 : 1,
  })

  await preparePage(page)
  report[vp.name] = {}

  let index = 1
  for (const section of SECTIONS) {
    const filename = `${String(index).padStart(2, '0')}-${section.id}-${vp.suffix}.png`
    await captureSection(page, `#${section.id}`, filename, section.minCards)
    report[vp.name][section.id] = await verifySection(page, section.id)
    index += 1
  }

  await page.close()
}

await browser.close()

console.log(JSON.stringify({ baseUrl, outDir, report }, null, 2))
