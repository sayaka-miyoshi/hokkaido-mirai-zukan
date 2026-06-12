/**
 * スプレッドシート47行目（4:5画像）の表示確認用スクリーンショット
 * 使い方: dev server 起動後
 *   node scripts/capture-row47-thumbnail.mjs
 */
import { chromium } from 'playwright'
import Papa from 'papaparse'
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../public/screenshots/row47-4x5')
const base = process.env.SCREENSHOT_BASE ?? 'http://localhost:3000'
const SHEET_ROW = Number(process.env.SHEET_ROW ?? 47)

function readCsvUrl() {
  const envPath = resolve(__dirname, '../.env.local')
  const env = readFileSync(envPath, 'utf8')
  const match = env.match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)
  if (!match?.[1]?.trim()) throw new Error('NEXT_PUBLIC_SHEET_CSV_URL 未設定')
  return match[1].trim()
}

function colLetter(index) {
  let n = index + 1
  let s = ''
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

async function getRow47Meta() {
  const url = readCsvUrl()
  const res = await fetch(url, { headers: { Accept: 'text/csv' } })
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`)
  const text = await res.text()
  const parsed = Papa.parse(text, { skipEmptyLines: false })
  const rows = parsed.data
  const headers = rows[0].map((h) => String(h ?? '').trim().replace(/^\uFEFF/, ''))
  const dataRow = rows[SHEET_ROW - 1]
  if (!dataRow) throw new Error(`行 ${SHEET_ROW} が見つかりません`)

  const get = (name) => {
    const idx = headers.indexOf(name)
    return idx >= 0 ? String(dataRow[idx] ?? '').trim() : ''
  }

  const imageIdx = headers.indexOf('画像URL')
  const title = get('投稿タイトル')

  const parsedPosts = Papa.parse(text, { skipEmptyLines: true })
  const postHeaders = parsedPosts.data[0].map((h) =>
    String(h ?? '').trim().replace(/^\uFEFF/, ''),
  )
  const titleIdx = postHeaders.indexOf('投稿タイトル')
  const dataRows = parsedPosts.data.slice(1).filter((row) => {
    if (!row.some((c) => String(c ?? '').trim())) return false
    return Boolean(String(row[titleIdx] ?? '').trim())
  })

  let postId = ''
  for (let i = 0; i < dataRows.length; i++) {
    if (String(dataRows[i][titleIdx] ?? '').trim() === title) {
      postId = String(i + 1)
      break
    }
  }

  return {
    sheetRow: SHEET_ROW,
    postId,
    title,
    slug: get('slug'),
    imageUrl: get('画像URL'),
    imageCol: imageIdx >= 0 ? colLetter(imageIdx) : '?',
    imageColIndex: imageIdx,
    genre: get('ジャンル'),
    area: get('エリア'),
    postUrl: postId ? `${base}/post/${postId}` : null,
  }
}

mkdirSync(outDir, { recursive: true })

const meta = await getRow47Meta()
writeFileSync(resolve(outDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8')
console.log('Row meta:', JSON.stringify(meta, null, 2))

if (!meta.postId) throw new Error('postId を特定できませんでした')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 120000 })
await page.waitForTimeout(3000)
await page.screenshot({ path: resolve(outDir, '01-home-top-mobile.png'), fullPage: false })

const card = page.locator(`a[href="/post/${meta.postId}"]`).first()
const cardCount = await card.count()
if (cardCount === 0) {
  await page.getByPlaceholder(/キーワード|検索/i).fill(meta.title.slice(0, 20))
  await page.waitForTimeout(1200)
}
await card.scrollIntoViewIfNeeded({ timeout: 60000 })
await page.waitForTimeout(800)
await page.locator(`a[href="/post/${meta.postId}"] img`).first().waitFor({ state: 'visible', timeout: 30000 })
await page.waitForTimeout(2000)
await card.screenshot({ path: resolve(outDir, '02-list-card-mobile.png') })

const listHero = card.locator('div.aspect-\\[4\\/5\\]').first()
const listImgInfo = await listHero.evaluate((el) => {
  const img = el.querySelector('img')
  if (!img) return null
  const rect = img.getBoundingClientRect()
  const container = el.getBoundingClientRect()
  return {
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    displayWidth: rect.width,
    displayHeight: rect.height,
    containerWidth: container.width,
    containerHeight: container.height,
    containerAspect: container.width / container.height,
    imageAspect: img.naturalWidth / img.naturalHeight,
    objectFit: getComputedStyle(img).objectFit,
    src: img.currentSrc || img.src,
  }
})

await page.goto(meta.postUrl, { waitUntil: 'domcontentloaded', timeout: 120000 })
await page.waitForTimeout(3000)
await page.screenshot({ path: resolve(outDir, '03-detail-top-mobile.png'), fullPage: false })

const hero = page.locator('article div.aspect-video').first()
await hero.screenshot({ path: resolve(outDir, '04-detail-hero-mobile.png') })

const imgInfo = await hero.evaluate((el) => {
  const img = el.querySelector('img')
  if (!img) return null
  const rect = img.getBoundingClientRect()
  const container = el.getBoundingClientRect()
  return {
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    displayWidth: rect.width,
    displayHeight: rect.height,
    containerWidth: container.width,
    containerHeight: container.height,
    objectFit: getComputedStyle(img).objectFit,
    src: img.currentSrc || img.src,
  }
})
writeFileSync(
  resolve(outDir, 'image-info.json'),
  JSON.stringify({ list: listImgInfo, detail: imgInfo }, null, 2),
  'utf8',
)

await browser.close()
console.log('Done:', outDir)
