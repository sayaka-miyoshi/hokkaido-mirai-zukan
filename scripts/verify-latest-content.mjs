import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const outDir = path.join(process.cwd(), 'public', 'screenshots', 'top-verify')
const baseUrl = process.env.CAPTURE_BASE_URL || 'http://localhost:3000'

async function preparePage(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForSelector('#latest', { timeout: 90000 })
  await page.addStyleTag({
    content: `.fade-up { opacity: 1 !important; transform: none !important; }`,
  })
  await page.evaluate(() => {
    document.querySelectorAll('.fade-up').forEach((el) => el.classList.add('fade-up-visible'))
  })
  await page.waitForTimeout(1500)
}

async function captureLatestSection(page, filename) {
  const el = page.locator('#latest')
  await el.scrollIntoViewIfNeeded({ timeout: 60000 })
  await page.waitForTimeout(800)
  await el.screenshot({ path: path.join(outDir, filename), animations: 'disabled' })
}

const browser = await chromium.launch()
await mkdir(outDir, { recursive: true })

const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  deviceScaleFactor: 2,
})

await preparePage(page)

const latestItems = await page.evaluate(() => {
  const section = document.getElementById('latest')
  if (!section) return []

  return [...section.querySelectorAll('article')].slice(0, 10).map((article) => {
    const title = article.querySelector('h3')?.textContent?.trim() ?? ''
    const meta = article.querySelector('p')?.textContent?.trim() ?? ''
    return { title, meta }
  })
})

const genreSummary = await page.evaluate(() => {
  const section = document.getElementById('latest')
  if (!section) return {}
  const metas = [...section.querySelectorAll('article p')].map((p) => p.textContent?.trim() ?? '')
  return metas.reduce((acc, label) => {
    acc[label] = (acc[label] ?? 0) + 1
    return acc
  }, {})
})

await captureLatestSection(page, '07-latest-content-mobile.png')
await page.close()
await browser.close()

console.log(JSON.stringify({ latestItems, genreSummary }, null, 2))
