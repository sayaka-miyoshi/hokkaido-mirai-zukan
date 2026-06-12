import { chromium } from 'playwright'

const base = process.env.SCREENSHOT_BASE ?? 'http://localhost:3000'
const posts = [
  { id: '1', title: '札幌消防学校', row: 2 },
  { id: '44', title: '日本の性教育を考えよう', row: 45 },
]

function readImg(img) {
  if (!img) return { ok: false, reason: 'img要素なし' }
  const src = img.currentSrc || img.src || ''
  return {
    ok: img.complete && img.naturalWidth > 0 && !src.includes('default-post'),
    src,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    objectFit: getComputedStyle(img).objectFit,
  }
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(4000)

for (const post of posts) {
  const card = page.locator(`a[href="/post/${post.id}"]`).first()
  await card.scrollIntoViewIfNeeded().catch(() => {})
  await page.waitForTimeout(1000)

  const list = await card
    .evaluate((el) => {
      const container = el.querySelector('div[class*="aspect"]')
      const img = container?.querySelector('img')
      if (!img) return { ok: false, reason: 'img要素なし' }
      const src = img.currentSrc || img.src || ''
      return {
        ok: img.complete && img.naturalWidth > 0 && !src.includes('default-post'),
        src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        objectFit: getComputedStyle(img).objectFit,
      }
    })
    .catch(() => ({ ok: false, reason: 'カード未検出' }))

  await page.goto(`${base}/post/${post.id}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2500)

  const detail = await page
    .locator('article div.aspect-video')
    .first()
    .evaluate((el) => {
      const img = el.querySelector('img')
      if (!img) return { ok: false, reason: 'img要素なし' }
      const src = img.currentSrc || img.src || ''
      return {
        ok: img.complete && img.naturalWidth > 0 && !src.includes('default-post'),
        src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        objectFit: getComputedStyle(img).objectFit,
      }
    })
    .catch(() => ({ ok: false, reason: '詳細画像未検出' }))

  console.log(`=== ${post.title} (行${post.row} / post/${post.id}) ===`)
  console.log('一覧:', list.ok ? 'OK' : 'NG', JSON.stringify(list))
  console.log('詳細:', detail.ok ? 'OK' : 'NG', JSON.stringify(detail))
  console.log('')

  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1000)
}

await browser.close()
