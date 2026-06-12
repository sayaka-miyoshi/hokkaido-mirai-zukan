/**
 * カテゴリ導線クリックテスト
 * node scripts/test-category-filters.mjs [baseUrl]
 */
import { chromium } from 'playwright'

const base = process.argv[2] || 'https://hokkaido-mirai-zukan.vercel.app'

const categories = [
  { label: '学校の記事', genre: '学校' },
  { label: '部活の記事', genre: '部活' },
  { label: '企業の記事', genre: '企業訪問' },
  { label: '行政・自治体', genre: '行政・自治体' },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })

for (const { label } of categories) {
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(800)

  const result = await page.evaluate(({ expectedTitle }) => {
    const searchResults = document.querySelector('#search-results')
    const latest = document.querySelector('#latest')
    const searchCards = searchResults
      ? searchResults.querySelectorAll('a[href*="/post/"]').length
      : 0
    const latestVisible = !!latest
    const heading = searchResults?.querySelector('h2')?.textContent?.trim() ?? null
    const countText = document.body.innerText.match(/(\d+)件 \/ 全\d+件/)?.[1]
    const searchTop = searchResults?.getBoundingClientRect().top ?? null
    const viewportMid = window.innerHeight / 2
    const focusedSection =
      searchResults && searchTop != null && searchTop < viewportMid && searchTop > -120
        ? 'search-results'
        : 'other'

    return {
      filteredCount: countText ? Number(countText) : null,
      searchResultCards: searchCards,
      latestVisible,
      heading,
      headingMatches: heading === expectedTitle,
      focusedSection,
    }
  }, { expectedTitle: label === '企業の記事' ? '企業の記事' : label })

  console.log(label, result)
}

await browser.close()
