/**
 * 公開前最終確認（本番URL）
 * node scripts/final-prelaunch-verify.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Papa from 'papaparse'
import { chromium } from 'playwright'

const base = process.env.VERIFY_BASE_URL || 'https://hokkaido-mirai-zukan.vercel.app'
const __dirname = dirname(fileURLToPath(import.meta.url))

function loadSheetUrl() {
  return readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
    .match(/^NEXT_PUBLIC_SHEET_CSV_URL=(.+)$/m)?.[1]
    ?.trim()
}

function parsePublishStatus(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return false
  if (['0', '非公開', 'false', 'no', 'off', '×', '✗'].includes(normalized)) return false
  if (['1', '公開', 'true', 'yes', 'on', '○', '◯', '✓'].includes(normalized)) return true
  return false
}

function parseMeta(html) {
  const get = (re) => html.match(re)?.[1] ?? null
  return {
    title: get(/<title>([^<]*)<\/title>/i),
    description: get(/name="description" content="([^"]*)"/i),
    ogImage: get(/property="og:image" content="([^"]*)"/i),
  }
}

const issues = []

async function fetchStatus(path) {
  const res = await fetch(`${base}${path}`, { redirect: 'follow' })
  const ct = res.headers.get('content-type') ?? ''
  let body = ''
  if (ct.includes('text') || ct.includes('xml')) body = await res.text()
  return { status: res.status, contentType: ct, body }
}

// --- Spreadsheet publish count ---
const sheetUrl = loadSheetUrl()
let publishStats = null
if (sheetUrl) {
  const csv = await (await fetch(sheetUrl)).text()
  const parsed = Papa.parse(csv, { skipEmptyLines: true })
  const col = Object.fromEntries(parsed.data[0].map((h, i) => [h, i]))
  const rows = parsed.data.slice(1).filter((r) => r[col['投稿タイトル']]?.trim())
  const published = rows.filter((r) => parsePublishStatus(r[col['公開']]))
  const unpublished = rows.filter(
    (r) => String(r[col['公開']] ?? '').trim() && !parsePublishStatus(r[col['公開']]),
  )
  const emptyPublish = rows.filter((r) => !String(r[col['公開']] ?? '').trim())
  publishStats = {
    totalRows: rows.length,
    published: published.length,
    explicitUnpublished: unpublished.length,
    emptyPublishColumn: emptyPublish.length,
  }
  if (emptyPublish.length > 0) {
    issues.push({
      area: '公開記事数',
      problem: `「公開」列が空欄の行が ${emptyPublish.length} 件あり、サイトでは非公開扱いになります`,
    })
  }
}

// --- Static endpoints ---
const robots = await fetchStatus('/robots.txt')
const sitemap = await fetchStatus('/sitemap.xml')
const ogImage = await fetchStatus('/opengraph-image')
const favicon = await fetchStatus('/icon.svg')
const notFound = await fetchStatus('/does-not-exist-prelaunch-check')
const operator = await fetchStatus('/operator')
const contact = await fetchStatus('/contact/publication')
const home = await fetchStatus('/')

if (robots.status !== 200) issues.push({ area: 'robots.txt', problem: `HTTP ${robots.status}` })
else if (!robots.body.includes('Sitemap:')) {
  issues.push({ area: 'robots.txt', problem: 'Sitemap 行がありません' })
}

if (sitemap.status !== 200) issues.push({ area: 'サイトマップ', problem: `HTTP ${sitemap.status}` })
else {
  const locCount = (sitemap.body.match(/<loc>/g) || []).length
  if (locCount === 0) issues.push({ area: 'サイトマップ', problem: 'URLが0件です' })
  if (!sitemap.body.includes('/operator')) {
    issues.push({
      area: 'サイトマップ',
      problem: '/operator が含まれていません（未デプロイまたは sitemap 未更新）',
    })
  }
}

if (ogImage.status !== 200 || !ogImage.contentType.includes('image')) {
  issues.push({ area: 'OG画像', problem: `HTTP ${ogImage.status} / ${ogImage.contentType}` })
}

if (favicon.status !== 200) {
  issues.push({ area: 'favicon', problem: `HTTP ${favicon.status}` })
}

if (notFound.status !== 404) {
  issues.push({ area: '404ページ', problem: `存在しないURLが HTTP ${notFound.status} を返しています（404であるべき）` })
} else if (!/404|見つかり|not found/i.test(notFound.body)) {
  issues.push({
    area: '404ページ',
    problem: '404ステータスは返るが、ユーザー向けの案内文が弱い（カスタム not-found ページ未作成）',
  })
}

if (operator.status !== 200) {
  issues.push({
    area: '運営者ページ',
    problem: `/operator が HTTP ${operator.status}（TOPからリンクすると404になります）`,
  })
}

if (contact.status !== 200) {
  issues.push({ area: 'お問い合わせフォーム', problem: `/contact/publication が HTTP ${contact.status}` })
} else if (!contact.body.includes('<form')) {
  issues.push({ area: 'お問い合わせフォーム', problem: 'フォーム要素が見つかりません' })
}

const homeMeta = parseMeta(home.body)
if (!homeMeta.ogImage) {
  issues.push({ area: 'OG画像', problem: 'トップページに og:image メタタグがありません' })
}

// --- Mobile + contact form ---
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true })

await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 90000 })
const mobileHome = await page.evaluate(() => ({
  latestCols: document.querySelector('#latest .grid')
    ? getComputedStyle(document.querySelector('#latest .grid')).gridTemplateColumns.split(' ').filter(Boolean)
        .length
    : 0,
  horizontalScroll: document.documentElement.scrollWidth > window.innerWidth + 2,
  operatorSection: !!document.querySelector('#operator'),
  operatorLink: [...document.querySelectorAll('a')].some((a) => a.getAttribute('href')?.includes('/operator')),
}))

if (mobileHome.latestCols !== 2) {
  issues.push({ area: 'スマホ表示', problem: `最新コンテンツが ${mobileHome.latestCols} 列（2列であるべき）` })
}
if (mobileHome.horizontalScroll) {
  issues.push({ area: 'スマホ表示', problem: 'トップページで横スクロールが発生しています' })
}
if (mobileHome.operatorLink && operator.status !== 200) {
  issues.push({
    area: 'スマホ表示',
    problem: 'TOPに /operator へのリンクがあるが、本番では404です',
  })
}

await page.goto(`${base}/contact/publication`, { waitUntil: 'domcontentloaded', timeout: 90000 })
const formCheck = await page.evaluate(() => ({
  fieldCount: document.querySelectorAll('input, textarea, select').length,
  hasSubmit: !!document.querySelector('button[type="submit"], input[type="submit"]'),
  hasNameField: !!document.querySelector('[name="name"], [name="お名前"], #name'),
}))

if (formCheck.fieldCount < 3 || !formCheck.hasSubmit) {
  issues.push({
    area: 'お問い合わせフォーム',
    problem: `入力項目 ${formCheck.fieldCount} 件 / 送信ボタン ${formCheck.hasSubmit ? 'あり' : 'なし'}`,
  })
}

await browser.close()

console.log(
  JSON.stringify(
    {
      base,
      publishStats,
      checks: {
        robots: robots.status,
        sitemapUrls: (sitemap.body.match(/<loc>/g) || []).length,
        sitemapHasOperator: sitemap.body.includes('/operator'),
        ogImage: { status: ogImage.status, type: ogImage.contentType },
        favicon: favicon.status,
        notFound: notFound.status,
        operator: operator.status,
        contact: contact.status,
        homeMeta,
        mobileHome,
        formCheck,
      },
      issueCount: issues.length,
      issues,
    },
    null,
    2,
  ),
)
