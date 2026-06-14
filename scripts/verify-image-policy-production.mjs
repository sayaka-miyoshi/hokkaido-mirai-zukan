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

async function checkDetailFrame(page) {
  const locator = page.locator('article > div.relative.aspect-\\[4\\/5\\]').first()
  if ((await locator.count()) === 0) {
    return { label: 'post detail frame', ok: false, reason: 'frame not found' }
  }
  return locator.evaluate((frame) => {
    const img = frame.querySelector('img')
    const fr = frame.getBoundingClientRect()
    const frameRatio = fr.height > 0 ? fr.width / fr.height : null
    const frameStyle = getComputedStyle(frame)
    const imgStyle = img ? getComputedStyle(img) : null
    return {
      label: 'post detail',
      ok: Boolean(img?.complete && img.naturalWidth > 0),
      objectFit: imgStyle?.objectFit ?? null,
      frameBorderRadius: frameStyle.borderRadius,
      aspectClass: frame.className.includes('aspect-[4/5]'),
      frameRatio: frameRatio != null ? Number(frameRatio.toFixed(3)) : null,
      frameSize: `${Math.round(fr.width)} × ${Math.round(fr.height)}`,
      maxWidth: frameStyle.maxWidth,
    }
  })
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
const detail = await checkDetailFrame(page)

await page.goto(`${BASE}/post/44`, { waitUntil: 'networkidle', timeout: 120000 })
await page.waitForTimeout(1500)
const detail916 = await checkDetailFrame(page)

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
      detail916,
      schoolList,
      deployOk:
        story02Removed &&
        heroImg.borderRadius === '0px' &&
        banner.borderRadius === '0px' &&
        popular.objectFit === 'cover' &&
        companies.objectFit === 'cover' &&
        companies.frameRatio != null &&
        Math.abs(companies.frameRatio - 0.8) < 0.05 &&
        detail.objectFit === 'contain' &&
        detail916.objectFit === 'contain' &&
        detail.frameRatio != null &&
        detail916.frameRatio != null &&
        Math.abs(detail.frameRatio - 0.8) < 0.05 &&
        Math.abs(detail916.frameRatio - 0.8) < 0.05 &&
        detail.frameSize === detail916.frameSize &&
        schoolList.objectFit === 'cover' &&
        popular.frameBorderRadius === '0px' &&
        companies.frameBorderRadius === '0px' &&
        detail.frameBorderRadius === '0px',
    },
    null,
    2,
  ),
)

await browser.close()
