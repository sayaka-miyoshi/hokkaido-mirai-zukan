/**
 * カテゴリから探す UI の本番確認（390px）
 * node scripts/test-category-browse.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const base = (process.argv[2] || 'https://www.hokkaido-miraizukan.jp').replace(/\/$/, '')
let failed = 0

function fail(msg) {
  console.log('❌', msg)
  failed++
}

function pass(msg) {
  console.log('✅', msg)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto(`${base}/#browse`, { waitUntil: 'networkidle', timeout: 120000 })

const bodyText = await page.locator('#browse').innerText()

if (bodyText.includes('カテゴリから探す')) pass('カテゴリから探すセクション表示')
else fail('カテゴリから探すセクションなし')

if (bodyText.includes('人気検索')) pass('人気検索表示')
else fail('人気検索なし')

for (const label of ['学校', '部活動', '企業', '札幌市', '観光']) {
  if (bodyText.includes(label)) pass(`大カテゴリ「${label}」表示`)
  else fail(`大カテゴリ「${label}」なし`)
}

if (!bodyText.includes('サッカー')) pass('0件カテゴリ「サッカー」非表示')
else fail('0件のサッカーが表示されている')

const searchBox = page.locator('#home-search')
const box = await searchBox.boundingBox()
if (box && box.height >= 40) pass(`検索入力の高さ OK (${Math.round(box.height)}px)`)
else fail('検索入力が小さすぎる')

await page.getByRole('button', { name: /部活動/ }).click()
await page.waitForTimeout(300)
const lacrosseBtn = page.locator('#browse button', { hasText: /^ラクロス/ }).first()
if (await lacrosseBtn.count()) pass('部活動展開でラクロス表示')
else fail('部活動サブカテゴリにラクロスなし')

await lacrosseBtn.click()
await page.waitForTimeout(600)
const filterResult = await page.evaluate(() => {
  const match = document.body.innerText.match(/(\d+)件 \/ 全(\d+)件/)
  const section = document.querySelector('#search-results')
  const cards = section ? section.querySelectorAll('a[href*="/post/"]').length : 0
  return { filtered: match ? Number(match[1]) : null, cards, hasSection: !!section }
})
if (filterResult.hasSection && filterResult.filtered === 4 && filterResult.cards === 4) {
  pass(`ラクロス絞り込み 4件 (cards=${filterResult.cards})`)
} else {
  fail(`ラクロス絞り込み NG ${JSON.stringify(filterResult)}`)
}

const hokudaiLink = page.locator('#browse a', { hasText: '北海道大学' }).first()
const hokudaiHref = await hokudaiLink.getAttribute('href')
if (hokudaiHref?.includes('/school/hokkaido-university')) {
  pass(`iSTEP導線URL 北海道大学 → ${hokudaiHref}`)
} else {
  fail(`北海道大学リンク NG: ${hokudaiHref}`)
}

const lacrosseLink = page.locator('#browse a', { hasText: /^ラクロス$/ }).first()
const lacrosseHref = await lacrosseLink.getAttribute('href')
if (lacrosseHref?.includes('/sport/') && lacrosseHref.includes('%E3%83%A9%E3%82%AF%E3%83%AD%E3%82%B9')) {
  pass(`iSTEP導線URL ラクロス → ${lacrosseHref}`)
} else if (lacrosseHref?.includes('/sport/')) {
  pass(`iSTEP導線URL ラクロス → ${lacrosseHref}`)
} else {
  fail(`ラクロスリンク NG: ${lacrosseHref}`)
}

await browser.close()
console.log(failed === 0 ? '\n✅ test-category-browse 完了' : `\n❌ 失敗 ${failed}件`)
process.exit(failed === 0 ? 0 : 1)
