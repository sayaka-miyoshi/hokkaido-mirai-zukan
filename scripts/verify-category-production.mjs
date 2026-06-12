/**
 * 本番カテゴリ導線の実確認（見出し・件数・記事比較・スクショ）
 * node scripts/verify-category-production.mjs
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const base = 'https://hokkaido-mirai-zukan.vercel.app'
const outDir = path.join(process.cwd(), 'public', 'screenshots', 'category-verify')
await mkdir(outDir, { recursive: true })

const categories = [
  { button: '学校の記事', expectedHeading: '学校の記事' },
  { button: '部活の記事', expectedHeading: '部活の記事' },
  { button: '企業の記事', expectedHeading: '企業の記事' },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

async function captureLatestBaseline() {
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.waitForTimeout(1000)

  const latest = await page.evaluate(() => {
    const section = document.querySelector('#latest')
    const cards = section
      ? [...section.querySelectorAll('a[href*="/post/"]')].map((a) => ({
          href: a.getAttribute('href'),
          title: a.textContent?.trim().slice(0, 80),
        }))
      : []
    return {
      visible: !!section,
      count: cards.length,
      cards,
      heading: section?.querySelector('h2')?.textContent?.trim() ?? null,
    }
  })

  await page.screenshot({ path: path.join(outDir, '00-latest-baseline.png'), fullPage: false })
  return latest
}

const latestBaseline = await captureLatestBaseline()
console.log('=== 最新コンテンツ（フィルタなし）===')
console.log(JSON.stringify(latestBaseline, null, 2))

const results = []

for (const { button, expectedHeading } of categories) {
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.getByRole('button', { name: button, exact: true }).click()
  await page.waitForTimeout(1200)

  const data = await page.evaluate(({ expectedHeading }) => {
    const searchResults = document.querySelector('#search-results')
    const latest = document.querySelector('#latest')
    const popular = document.querySelector('#popular')

    const pickCards = (root) =>
      root
        ? [...root.querySelectorAll('a[href*="/post/"]')].map((a) => ({
            href: a.getAttribute('href'),
            title: a.textContent?.trim().slice(0, 100),
          }))
        : []

    const searchCards = pickCards(searchResults)
    const latestCards = pickCards(latest)
    const countMatch = document.body.innerText.match(/(\d+)件 \/ 全\d+件/)

    return {
      expectedHeading,
      filterCount: countMatch ? Number(countMatch[1]) : null,
      searchResultsVisible: !!searchResults,
      latestVisible: !!latest,
      popularVisible: !!popular,
      searchHeading: searchResults?.querySelector('h2')?.textContent?.trim() ?? null,
      searchDescription:
        searchResults?.querySelector('p')?.textContent?.trim().slice(0, 120) ?? null,
      searchCardCount: searchCards.length,
      latestCardCount: latestCards.length,
      firstSearchCards: searchCards.slice(0, 5),
      firstLatestCards: latestCards.slice(0, 5),
      sameAsLatest:
        searchCards.length > 0 &&
        latestCards.length > 0 &&
        searchCards.slice(0, 5).map((c) => c.href).join('|') ===
          latestCards.slice(0, 5).map((c) => c.href).join('|'),
      viewportHasSearchResults: (() => {
        const top = searchResults?.getBoundingClientRect().top
        return top != null && top >= -80 && top < window.innerHeight * 0.6
      })(),
    }
  }, { expectedHeading })

  const slug = button.replace(/の記事$/, '').replace('企業', 'company').replace('学校', 'school').replace('部活', 'club')
  await page.screenshot({ path: path.join(outDir, `${slug}-after-click.png`), fullPage: true })

  results.push({ button, ...data })
  console.log(`\n=== ${button} ===`)
  console.log(JSON.stringify(data, null, 2))
}

await browser.close()

console.log('\n=== SUMMARY ===')
for (const r of results) {
  console.log(
    `${r.button}: heading=${r.searchHeading}, cards=${r.searchCardCount}, latestVisible=${r.latestVisible}, sameAsLatest=${r.sameAsLatest}, inViewport=${r.viewportHasSearchResults}`,
  )
}

console.log(`\nScreenshots: ${outDir}`)
