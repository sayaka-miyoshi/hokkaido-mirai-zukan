import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../public/screenshots')
const base = process.env.SCREENSHOT_BASE ?? 'http://localhost:3002'
const formUrl = `${base}/contact/publication`

mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage()

async function shot(name, viewport, fullPage = true) {
  await page.setViewportSize(viewport)
  await page.goto(formUrl, { waitUntil: 'networkidle' })
  await page.screenshot({
    path: resolve(outDir, name),
    fullPage,
  })
  console.log('saved', name)
}

await shot('contact-form-pc.png', { width: 1280, height: 800 })
await shot('contact-form-mobile.png', { width: 390, height: 844 })

await page.setViewportSize({ width: 390, height: 844 })
await page.goto(formUrl, { waitUntil: 'networkidle' })
await page.fill('#organizationName', '北海道大学')
await page.fill('#contactName', '山田 太郎')
await page.fill('#email', 'yamada@example.com')
await page.fill('#instagram', '@insta.example')
await page.fill('#phone', '090-1234-5678')
await page.fill('#message', '部活動の取材について相談したいです。')
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(300)
await page.screenshot({
  path: resolve(outDir, 'contact-form-filling-mobile.png'),
  fullPage: true,
})
console.log('saved contact-form-filling-mobile.png')

await page.click('button[type="submit"]')
await page.waitForURL('**/contact/publication/complete', { timeout: 15000 })
await page.screenshot({
  path: resolve(outDir, 'contact-complete-mobile.png'),
  fullPage: true,
})
console.log('saved contact-complete-mobile.png')

await page.setViewportSize({ width: 1280, height: 800 })
await page.goto(`${base}/contact/publication/complete`, { waitUntil: 'networkidle' })
await page.screenshot({
  path: resolve(outDir, 'contact-complete-pc.png'),
  fullPage: true,
})
console.log('saved contact-complete-pc.png')

await browser.close()
