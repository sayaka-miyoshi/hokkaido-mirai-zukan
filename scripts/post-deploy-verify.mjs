/**
 * デプロイ後本番確認
 * node scripts/post-deploy-verify.mjs
 */
import { chromium } from 'playwright'

const base = process.env.VERIFY_BASE_URL || 'https://hokkaido-mirai-zukan.vercel.app'

async function fetchStatus(path) {
  const res = await fetch(`${base}${path}`, { redirect: 'follow' })
  const ct = res.headers.get('content-type') ?? ''
  const body = ct.includes('text') || ct.includes('xml') ? await res.text() : ''
  return { status: res.status, body }
}

const issues = []
const results = {}

// 1. TOP
const home = await fetchStatus('/')
results.home = { status: home.status, ok: home.status === 200 && home.body.includes('北海道未来図鑑') }
if (!results.home.ok) issues.push('TOPページが表示されません')

// 2. /operator
const operator = await fetchStatus('/operator')
results.operator = { status: operator.status, ok: operator.status === 200 }
if (!results.operator.ok) issues.push(`/operator が HTTP ${operator.status}`)

// 3. sitemap
const sitemap = await fetchStatus('/sitemap.xml')
results.sitemap = {
  status: sitemap.status,
  hasOperator: sitemap.body.includes('/operator'),
}
if (sitemap.status !== 200 || !results.sitemap.hasOperator) {
  issues.push('sitemap.xml に /operator が含まれていません')
}

// 4. contact
const contact = await fetchStatus('/contact/publication')
results.contact = {
  status: contact.status,
  hasForm: contact.body.includes('<form'),
}
if (contact.status !== 200 || !results.contact.hasForm) {
  issues.push('お問い合わせフォームに遷移できません')
}

// 5. Mobile + company count (Playwright)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true })

await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 120000 })

const mobileHome = await page.evaluate(() => {
  const latest = document.querySelector('#latest')
  const latestGrid = latest?.querySelector('.grid')
  const latestCols = latestGrid
    ? getComputedStyle(latestGrid).gridTemplateColumns.split(' ').filter(Boolean).length
    : 0
  const latestCards = latest ? latest.querySelectorAll('a[href*="/post/"]').length : 0

  const companyRoot = document.querySelector('#companies')
  const companyCards = companyRoot
    ? companyRoot.querySelectorAll('a[href*="/post/"]').length
    : 0

  return {
    latestSection: !!latest,
    latestCols,
    latestCards,
    companySection: !!companyRoot,
    companyCards,
  }
})

results.mobileHome = mobileHome

if (!mobileHome.latestSection || mobileHome.latestCards === 0) {
  issues.push('スマホ表示で最新コンテンツが表示されていません')
}
if (!mobileHome.companySection || mobileHome.companyCards !== 22) {
  issues.push(`北海道の企業を知ろうが ${mobileHome.companyCards} 件（22件であるべき）`)
}

// contact link from TOP
const contactLink = await page.evaluate(() =>
  [...document.querySelectorAll('a')].some((a) => a.getAttribute('href')?.includes('/contact/')),
)
results.contactLinkFromTop = contactLink
if (!contactLink) issues.push('TOPからお問い合わせへのリンクが見つかりません')

await browser.close()

console.log(
  JSON.stringify(
    {
      base,
      deployed: results.operator.ok && results.sitemap.hasOperator,
      results,
      issueCount: issues.length,
      issues,
      ready: issues.length === 0,
    },
    null,
    2,
  ),
)

process.exit(issues.length === 0 ? 0 : 1)
