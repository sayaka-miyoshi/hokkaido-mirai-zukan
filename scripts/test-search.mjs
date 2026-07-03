/**
 * 検索強化のE2E確認（スマホ幅 390px）
 * node scripts/test-search.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const base = process.argv[2] || 'http://localhost:3000'
const keywords = [
  '北海道大学',
  '札幌大学',
  'バドミントン',
  'バトミントン',
  'ラクロス',
  '部活',
  'YOSAKOI',
  'zzzznotfound',
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

let failed = 0

await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })

const placeholder = await page.getAttribute('#home-search', 'placeholder')
console.log('placeholder:', placeholder)
if (!placeholder?.includes('競技名')) {
  console.log('❌ プレースホルダーに競技名が含まれていません')
  failed++
} else {
  console.log('✅ プレースホルダーOK')
}

const sportChips = await page.locator('#browse button').filter({ hasText: /^(アメフト|バドミントン|ラクロス|YOSAKOI)/ }).count()
console.log('sport quick chips (sample):', sportChips)
if (sportChips === 0) {
  console.log('❌ 競技クイックチップが見つかりません')
  failed++
} else {
  console.log('✅ 競技クイックチップあり')
}

for (const keyword of keywords) {
  await page.fill('#home-search', '')
  await page.fill('#home-search', keyword)
  await page.waitForTimeout(400)

  if (keyword === 'zzzznotfound') {
    await page.getByRole('button', { name: /記事を見る/ }).click()
    await page.waitForTimeout(400)
    const emptyText = await page.locator('#search-results').innerText()
    const ok = emptyText.includes('該当する記事がありません')
    console.log(keyword, ok ? '✅ 0件文言OK' : '❌ 0件文言NG', { emptyText: emptyText.slice(0, 80) })
    if (!ok) failed++
    continue
  }

  const result = await page.evaluate(() => {
    const text = document.body.innerText
    const match = text.match(/(\d+)件 \/ 全(\d+)件/)
    const section = document.querySelector('#search-results')
    const cards = section ? section.querySelectorAll('a[href*="/post/"]').length : 0
    return {
      filtered: match ? Number(match[1]) : null,
      total: match ? Number(match[2]) : null,
      resultCards: cards,
      hasResultsSection: !!section,
    }
  })

  const ok = result.filtered != null && result.filtered > 0
  console.log(keyword, ok ? '✅' : '❌', result)
  if (!ok) failed++
}

// 競技チップタップ
const chip = page.locator('#browse button', { hasText: 'バドミントン' }).first()
if (await chip.count()) {
  await chip.click()
  await page.waitForTimeout(600)
  const chipResult = await page.evaluate(() => ({
    input: document.querySelector('#home-search')?.value,
    hasSection: !!document.querySelector('#search-results'),
  }))
  const chipOk = chipResult.input === 'バドミントン' && chipResult.hasSection
  console.log('chip バドミントン', chipOk ? '✅' : '❌', chipResult)
  if (!chipOk) failed++
}

await browser.close()
console.log(failed === 0 ? '\n✅ test-search 完了' : `\n❌ test-search 失敗 (${failed})`)
process.exit(failed === 0 ? 0 : 1)
