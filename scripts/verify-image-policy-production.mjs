import { chromium } from 'playwright'

const BASE = process.argv[2] || 'https://hokkaido-miraizukan.jp'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

async function checkImg(selector, label) {
  const locator = page.locator(selector).first()
  if ((await locator.count()) === 0) return { label, ok: false, reason: 'not found' }
  const result = await locator.evaluate((img) => {
    const frame = img.parentElement
    const frameRadius = frame ? getComputedStyle(frame).borderRadius : null
    const fr = frame?.getBoundingClientRect()
    const frameRatio = fr && fr.height > 0 ? fr.width / fr.height : null
    return {
      ok: img.complete && img.naturalWidth > 0,
      objectFit: getComputedStyle(img).objectFit,
      frameBorderRadius: frameRadius,
      aspectClass: frame?.className.includes('aspect-[4/5]') ?? false,
      frameRatio: frameRatio != null ? Number(frameRatio.toFixed(3)) : null,
    }
  })
  return { label, ...result }
}

await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 120000 })
await page.waitForTimeout(2000)

const html = await page.content()
const story02Removed = !html.includes('story-02')

const heroImg = await page.locator('header img').first().evaluate((img) => ({
  borderRadius: getComputedStyle(img).borderRadius,
}))

const banner = await page.locator('#special a').first().evaluate((el) => ({
  borderRadius: getComputedStyle(el).borderRadius,
}))

const popular = await checkImg('#popular .grid a img', 'popular')

await page.evaluate(() => document.getElementById('companies')?.scrollIntoView())
await page.waitForTimeout(1000)
const companies = await checkImg('#companies a img', 'companies')

await page.goto(`${BASE}/post/1`, { waitUntil: 'networkidle', timeout: 120000 })
await page.waitForTimeout(1500)
const detail = await checkImg('article img', 'post detail')

await page.goto(`${BASE}/school/sapporo-fire-school`, { waitUntil: 'networkidle', timeout: 120000 })
await page.waitForTimeout(1500)
const schoolList = await checkImg('main .grid a img', 'school list')

console.log(
  JSON.stringify(
    {
      base: BASE,
      story02Removed,
      heroImage: heroImg,
      specialBanner: banner,
      popular,
      companies,
      detail,
      schoolList,
      deployOk:
        story02Removed &&
        heroImg.borderRadius === '0px' &&
        banner.borderRadius === '0px' &&
        popular.objectFit === 'contain' &&
        companies.objectFit === 'contain' &&
        companies.frameRatio != null &&
        Math.abs(companies.frameRatio - 0.8) < 0.05 &&
        detail.objectFit === 'contain' &&
        schoolList.objectFit === 'contain' &&
        popular.frameBorderRadius === '0px' &&
        companies.frameBorderRadius === '0px',
    },
    null,
    2,
  ),
)

await browser.close()
