import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const outDir = path.join(process.cwd(), 'public', 'screenshots', 'top-verify')
const baseUrl = process.env.CAPTURE_BASE_URL || 'http://localhost:3000'

async function preparePage(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForSelector('#operator', { timeout: 90000 })
  await page.addStyleTag({
    content: `
      .fade-up { opacity: 1 !important; transform: none !important; }
      nextjs-portal, [data-nextjs-toast], #devtools-indicator { display: none !important; }
    `,
  })
  await page.evaluate(() => {
    document.querySelectorAll('.fade-up').forEach((el) => el.classList.add('fade-up-visible'))
  })
  await page.waitForTimeout(1500)
}

async function captureOperatorToFooter(page, filename) {
  await page.locator('#operator').scrollIntoViewIfNeeded({ timeout: 60000 })
  await page.waitForTimeout(800)

  const clip = await page.evaluate(() => {
    const operator = document.getElementById('operator')
    const footer = document.querySelector('footer')
    if (!operator || !footer) return null

    const opTop = operator.getBoundingClientRect().top + window.scrollY
    const footBottom = footer.getBoundingClientRect().bottom + window.scrollY
    const width = document.documentElement.clientWidth

    return {
      x: 0,
      y: Math.max(0, opTop - 8),
      width,
      height: footBottom - opTop + 16,
    }
  })

  if (!clip) throw new Error('operator or footer not found')

  await page.screenshot({
    path: path.join(outDir, filename),
    fullPage: true,
    clip,
    animations: 'disabled',
  })
}

const browser = await chromium.launch()
await mkdir(outDir, { recursive: true })

const viewports = [
  { suffix: 'pc', width: 1280, height: 900, isMobile: false },
  { suffix: 'mobile', width: 390, height: 844, isMobile: true, scale: 2 },
]

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    deviceScaleFactor: vp.scale ?? 1,
  })
  await preparePage(page)
  await captureOperatorToFooter(page, `operator-to-footer-${vp.suffix}.png`)
  await page.close()
}

console.log('Saved to', outDir)
