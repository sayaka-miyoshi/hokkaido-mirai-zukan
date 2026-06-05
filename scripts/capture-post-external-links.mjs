import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../public/screenshots')
const base = process.env.SCREENSHOT_BASE ?? 'http://localhost:3002'

const REQUIRED_LABELS = ['公式サイト', '公式SNS', '募集情報はこちら']

mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()

async function findPostDetailUrl(page) {
  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  const hrefs = await page.locator('a[href^="/post/"]').evaluateAll((anchors) =>
    [...new Set(anchors.map((a) => a.getAttribute('href')).filter(Boolean))],
  )

  for (const href of hrefs) {
    await page.goto(`${base}${href}`, { waitUntil: 'networkidle' })
    const hasAll = await Promise.all(
      REQUIRED_LABELS.map((label) => page.getByRole('link', { name: label }).count()),
    )
    if (hasAll.every((count) => count > 0)) {
      return `${base}${href}`
    }
  }

  throw new Error('No post detail page with all external links found')
}

async function captureFullPage(name, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 })
  const postUrl = await findPostDetailUrl(page)
  console.log('Capturing full page:', postUrl, name)
  await page.goto(postUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: resolve(outDir, name),
    fullPage: true,
  })
  await page.close()
  console.log('Saved', name)
}

async function captureLinksSection(name, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 })
  const postUrl = await findPostDetailUrl(page)
  await page.goto(postUrl, { waitUntil: 'networkidle' })
  const section = page.locator('section').filter({ hasText: '外部リンク' })
  await section.scrollIntoViewIfNeeded()
  await page.screenshot({
    path: resolve(outDir, name),
    fullPage: false,
  })
  await page.close()
  console.log('Saved', name)
}

await captureFullPage('post-detail-external-links-pc.png', { width: 1280, height: 900 })
await captureFullPage('post-detail-external-links-mobile.png', { width: 390, height: 844 })
await captureLinksSection('post-detail-external-links-section-pc.png', { width: 1280, height: 900 })
await captureLinksSection('post-detail-external-links-section-mobile.png', { width: 390, height: 844 })

await browser.close()
console.log('Done:', outDir)
