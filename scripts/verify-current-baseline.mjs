/**
 * 現行本番ベースライン確認（GA4 / タグ / sitemap / エリア）
 * node scripts/verify-current-baseline.mjs
 */
const base = 'https://www.hokkaido-miraizukan.jp'
const GA_ID = 'G-9Q0MGFPBZ6'
const RETIRED_GA_ID = 'G-JEEYE86YNZ'
let failed = 0

function pass(msg) {
  console.log('✅', msg)
}
function fail(msg) {
  console.log('❌', msg)
  failed++
}

// 1) Google tag / GA implementation on production HTML
const homeHtml = await (await fetch(`${base}/`)).text()
const postHtml = await (await fetch(`${base}/post/4`)).text()

if (homeHtml.includes(GA_ID) && postHtml.includes(GA_ID)) {
  pass(`本番 HTML に測定ID ${GA_ID}`)
} else {
  fail(`本番 HTML に ${GA_ID} がありません`)
}

if (!homeHtml.includes(RETIRED_GA_ID) && !postHtml.includes(RETIRED_GA_ID)) {
  pass(`無効ID ${RETIRED_GA_ID} は本番に含まれない`)
} else {
  fail(`無効ID ${RETIRED_GA_ID} が本番 HTML に残っています`)
}

if (homeHtml.includes(`googletagmanager.com/gtag/js?id=${GA_ID}`)) {
  pass('Google タグ（gtag.js）読み込みタグあり')
} else {
  fail('Google タグ（gtag.js）が見つかりません')
}

const gtagJs = await fetch(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`)
if (gtagJs.status === 200 && (gtagJs.headers.get('content-type') || '').includes('javascript')) {
  pass(`gtag/js?id=${GA_ID} → HTTP 200 (application/javascript)`)
} else {
  fail(`gtag/js?id=${GA_ID} → HTTP ${gtagJs.status}`)
}

const retiredGtag = await fetch(`https://www.googletagmanager.com/gtag/js?id=${RETIRED_GA_ID}`)
if (retiredGtag.status === 404) {
  pass(`${RETIRED_GA_ID} は Google 側 404（使用しない）`)
} else {
  console.log(`ℹ️  ${RETIRED_GA_ID} gtag status: ${retiredGtag.status}`)
}

// 2) Area page
const toyako = await fetch(`${base}/area/toyako`)
const legacyArea = await fetch(`${base}/area/${encodeURIComponent('洞爺湖')}`, {
  redirect: 'manual',
})
if (toyako.status === 200) pass('/area/toyako → 200')
else fail(`/area/toyako → ${toyako.status}`)
if (legacyArea.status === 308 || legacyArea.status === 307) {
  pass(`/area/洞爺湖 → ${legacyArea.status} ${legacyArea.headers.get('location')}`)
} else if (legacyArea.status === 200) {
  pass('/area/洞爺湖 → 200（リダイレクト後）')
} else {
  fail(`/area/洞爺湖 → ${legacyArea.status}`)
}

// 3) robots.txt + sitemap for Search Console
const robotsText = await (await fetch(`${base}/robots.txt`)).text()
const sitemapLine = robotsText.match(/^Sitemap:\s*(.+)$/im)?.[1]?.trim()
if (sitemapLine === `${base}/sitemap.xml`) {
  pass(`robots.txt Sitemap: ${sitemapLine}`)
} else {
  fail(`robots.txt Sitemap 不正: ${sitemapLine}`)
}

const sitemapRes = await fetch(`${base}/sitemap.xml`)
const sitemapText = await sitemapRes.text()
const locs = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const wwwCount = locs.filter((u) => u.startsWith(base)).length
const vercelCount = (sitemapText.match(/vercel\.app/g) || []).length

if (sitemapRes.status === 200) pass(`sitemap.xml HTTP 200（${locs.length} URL）`)
else fail(`sitemap.xml HTTP ${sitemapRes.status}`)

if (wwwCount === locs.length && locs.length > 0) {
  pass(`sitemap 全 URL が ${base} 配下`)
} else {
  fail(`sitemap に www 以外の URL があります（www=${wwwCount}/${locs.length}）`)
}

if (vercelCount === 0) pass('sitemap に vercel.app なし')
else fail(`sitemap に vercel.app が ${vercelCount} 件`)

const required = ['/', '/post/', '/area/toyako', '/schools', '/companies']
for (const path of required) {
  const found = locs.some((u) => (path === '/' ? u === `${base}/` || u === base : u.includes(path)))
  if (found) pass(`sitemap に ${path} 系あり`)
  else fail(`sitemap に ${path} がありません`)
}

console.log('\n--- sitemap サンプル ---')
for (const u of locs.slice(0, 5)) console.log(' ', u)

console.log(failed === 0 ? '\n✅ 現行ベースライン確認 OK' : `\n❌ ${failed} 件要対応`)
process.exit(failed === 0 ? 0 : 1)
