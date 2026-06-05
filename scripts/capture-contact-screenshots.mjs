import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../public/screenshots')
const base = process.env.SCREENSHOT_BASE ?? 'http://localhost:3002'

mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
})

await page.goto(`${base}/contact/publication`, { waitUntil: 'networkidle' })
await page.screenshot({
  path: resolve(outDir, 'contact-form-mobile.png'),
  fullPage: true,
})

await page.goto(`${base}/contact/publication/complete`, { waitUntil: 'networkidle' })
await page.screenshot({
  path: resolve(outDir, 'contact-complete-mobile.png'),
  fullPage: true,
})

await browser.close()
console.log('Saved screenshots to public/screenshots/')
