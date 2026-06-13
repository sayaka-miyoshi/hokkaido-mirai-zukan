/**
 * 本番SEO最終確認
 * node scripts/seo-audit-production.mjs
 */
const BASE = process.argv[2]?.replace(/\/$/, '') || 'https://hokkaido-miraizukan.jp'

const PAGES = [
  { name: 'TOP', path: '/' },
  { name: '記事詳細', path: '/post/1' },
  { name: '学校ページ', path: '/school/hokkaido-university' },
  { name: '運営者', path: '/operator' },
  { name: 'お問い合わせ', path: '/contact/publication' },
  { name: '完了ページ', path: '/contact/publication/complete' },
  { name: 'mock', path: '/mock' },
]

function meta(html, property) {
  const og = html.match(
    new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]*)"`, 'i'),
  )
  if (og) return og[1]
  const name = html.match(new RegExp(`<meta[^>]+name="${property}"[^>]+content="([^"]*)"`, 'i'))
  if (name) return name[1]
  const rev = html.match(
    new RegExp(`<meta[^>]+content="([^"]*)"[^>]+property="${property}"`, 'i'),
  )
  if (rev) return rev[1]
  const revName = html.match(
    new RegExp(`<meta[^>]+content="([^"]*)"[^>]+name="${property}"`, 'i'),
  )
  return revName?.[1] ?? null
}

function canonical(html) {
  const m = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)
  if (m) return m[1]
  const m2 = html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i)
  return m2?.[1] ?? null
}

function title(html) {
  return html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? null
}

function robotsMeta(html) {
  return meta(html, 'robots')
}

function jsonLdBlocks(html) {
  const blocks = []
  const re = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1]))
    } catch {
      blocks.push({ parseError: true })
    }
  }
  return blocks
}

function flattenJsonLd(data) {
  if (Array.isArray(data)) return data.flatMap((item) => flattenJsonLd(item))
  if (data && typeof data === 'object' && Array.isArray(data['@graph'])) {
    return flattenJsonLd(data['@graph'])
  }
  return [data]
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' })
  return { status: res.status, text: await res.text(), url: res.url }
}

const report = {
  base: BASE,
  checkedAt: new Date().toISOString(),
  robots: null,
  sitemap: null,
  pages: [],
  issues: [],
  ok: [],
}

// robots.txt
{
  const { status, text } = await fetchText(`${BASE}/robots.txt`)
  report.robots = {
    status,
    body: text.trim(),
    hasAllowRoot: /Allow:\s*\//i.test(text),
    hasSitemap: /Sitemap:\s*https:\/\/[^/]+\/sitemap\.xml/i.test(text),
    disallowsComplete: /Disallow:\s*\/contact\/publication\/complete/i.test(text),
    disallowsMock: /Disallow:\s*\/mock/i.test(text),
  }
  if (status !== 200) report.issues.push('robots.txt が 200 ではありません')
  else report.ok.push('robots.txt: HTTP 200')
  if (report.robots.hasAllowRoot) report.ok.push('robots.txt: Allow / あり')
  else report.issues.push('robots.txt: Allow / がありません')
  if (report.robots.hasSitemap) report.ok.push('robots.txt: sitemap URL 正しい')
  else report.issues.push('robots.txt: sitemap URL が不正')
  if (report.robots.disallowsMock) report.ok.push('robots.txt: /mock を Disallow')
  else report.issues.push('robots.txt: /mock の Disallow がありません')
}

// sitemap.xml
{
  const { status, text } = await fetchText(`${BASE}/sitemap.xml`)
  const urls = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  report.sitemap = {
    status,
    urlCount: urls.length,
    hasHome: urls.includes(`${BASE}/`),
    hasPost: urls.some((u) => u.includes('/post/')),
    hasOperator: urls.includes(`${BASE}/operator`),
    hasComplete: urls.some((u) => u.includes('/contact/') && u.includes('/complete')),
    sample: urls.slice(0, 5),
  }
  if (status !== 200) report.issues.push('sitemap.xml が 200 ではありません')
  else report.ok.push(`sitemap.xml: HTTP 200（${urls.length} URL）`)
  if (report.sitemap.hasHome) report.ok.push('sitemap.xml: TOP を含む')
  else report.issues.push('sitemap.xml: TOP がありません')
  if (report.sitemap.hasPost) report.ok.push('sitemap.xml: 記事URL を含む')
  else report.issues.push('sitemap.xml: 記事URL がありません')
  if (report.sitemap.hasComplete) {
    report.issues.push('sitemap.xml: 完了ページ（noindex想定）が含まれています')
  } else {
    report.ok.push('sitemap.xml: 完了ページは除外')
  }
}

// pages
for (const page of PAGES) {
  const { status, text } = await fetchText(`${BASE}${page.path}`)
  const pageTitle = title(text)
  const description = meta(text, 'description')
  const ogTitle = meta(text, 'og:title')
  const ogDescription = meta(text, 'og:description')
  const ogImage = meta(text, 'og:image')
  const ogUrl = meta(text, 'og:url')
  const ogType = meta(text, 'og:type')
  const twitterCard = meta(text, 'twitter:card')
  const canonicalUrl = canonical(text)
  const robots = robotsMeta(text)
  const googleVerify = meta(text, 'google-site-verification')
  const ldRaw = jsonLdBlocks(text)
  const ld = ldRaw.flatMap((block) => flattenJsonLd(block))
  const ldTypes = ld.map((item) => item['@type']).filter(Boolean)

  const entry = {
    name: page.name,
    path: page.path,
    status,
    title: pageTitle,
    description: description?.slice(0, 80),
    og: { title: ogTitle, description: ogDescription?.slice(0, 80), image: ogImage, url: ogUrl, type: ogType },
    twitterCard,
    canonical: canonicalUrl,
    robots,
    googleSiteVerification: Boolean(googleVerify),
    jsonLdTypes: ldTypes,
    indexable:
      status === 200 &&
      !/noindex/i.test(robots ?? '') &&
      page.path !== '/mock' &&
      !page.path.includes('/complete'),
  }

  report.pages.push(entry)

  if (status !== 200 && page.path !== '/mock') {
    report.issues.push(`${page.name} (${page.path}): HTTP ${status}`)
  }

  if (page.path === '/mock' || page.path.includes('/complete')) {
    if (/noindex/i.test(robots ?? '')) report.ok.push(`${page.name}: noindex 設定あり`)
    else report.issues.push(`${page.name}: noindex がありません`)
  } else if (status === 200) {
    if (!/noindex/i.test(robots ?? '')) report.ok.push(`${page.name}: index 可能`)
    else report.issues.push(`${page.name}: 意図せず noindex`)
  }

  if (status === 200 && !pageTitle) report.issues.push(`${page.name}: title なし`)
  if (status === 200 && !description) report.issues.push(`${page.name}: description なし`)
  if (status === 200 && !canonicalUrl) report.issues.push(`${page.name}: canonical なし`)
  if (status === 200 && !ogTitle) report.issues.push(`${page.name}: og:title なし`)
  if (status === 200 && !ogImage) report.issues.push(`${page.name}: og:image なし`)

  if (page.path === '/' && ldTypes.includes('WebSite')) report.ok.push('TOP: WebSite JSON-LD あり')
  if (page.path === '/post/1' && ldTypes.includes('Article')) report.ok.push('記事詳細: Article JSON-LD あり')
  if (page.path === '/post/1' && ldTypes.includes('BreadcrumbList')) report.ok.push('記事詳細: BreadcrumbList JSON-LD あり')
  if (page.path === '/operator' && ldTypes.includes('Person')) report.ok.push('運営者: Person JSON-LD あり')
  if (page.path === '/school/hokkaido-university' && ldTypes.includes('CollectionPage')) {
    report.ok.push('学校ページ: CollectionPage JSON-LD あり')
  }
  if (page.path === '/school/hokkaido-university' && ldTypes.includes('BreadcrumbList')) {
    report.ok.push('学校ページ: BreadcrumbList JSON-LD あり')
  }
  if (page.path === '/mock') {
    if (canonicalUrl?.includes('/mock')) report.ok.push('mock: canonical が自身 URL')
    else report.issues.push('mock: canonical が /mock を指していません')
  }
}

report.summary = {
  indexablePagesChecked: report.pages.filter((p) => p.indexable).length,
  issueCount: report.issues.length,
  googleIndexReady: report.issues.filter((i) => !i.includes('mock')).length === 0,
}

console.log(JSON.stringify(report, null, 2))
