/**
 * AI検索向け SEO 監査（本番）
 * node scripts/audit-ai-seo.mjs
 */
const base = 'https://www.hokkaido-miraizukan.jp'

const pages = [
  { path: '/', name: 'home' },
  { path: '/post/4', name: 'post' },
  { path: '/post/278', name: 'post-area' },
  { path: '/area/toyako', name: 'area' },
  { path: '/school/hokkaido-university', name: 'school' },
  { path: '/company/ningyo-joruri', name: 'company' },
  { path: '/operator', name: 'operator' },
]

function pick(html, re) {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`
  const globalRe = new RegExp(re.source, flags)
  return [...html.matchAll(globalRe)].map((m) => m[1]?.trim()).filter(Boolean)
}

function first(html, re) {
  return pick(html, re)[0] ?? ''
}

function jsonLdBlocks(html) {
  return pick(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi).map((raw) => {
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }).filter(Boolean)
}

function collectTypes(node, out = new Set()) {
  if (!node || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    for (const item of node) collectTypes(item, out)
    return out
  }
  if (node['@type']) {
    const t = node['@type']
    if (Array.isArray(t)) t.forEach((x) => out.add(x))
    else out.add(t)
  }
  if (node['@graph']) collectTypes(node['@graph'], out)
  for (const v of Object.values(node)) {
    if (v && typeof v === 'object') collectTypes(v, out)
  }
  return out
}

let issues = 0
function pass(msg) {
  console.log('✅', msg)
}
function warn(msg) {
  console.log('⚠️ ', msg)
}
function fail(msg) {
  console.log('❌', msg)
  issues++
}

console.log('=== AI検索向け SEO 監査 ===\n')

for (const page of pages) {
  console.log(`--- ${page.name} (${page.path}) ---`)
  const res = await fetch(`${base}${page.path}`)
  const html = await res.text()
  if (res.status !== 200) {
    fail(`${page.path} HTTP ${res.status}`)
    continue
  }

  const title = first(html, /<title>([^<]*)<\/title>/i)
  const desc = first(html, /<meta name="description" content="([^"]*)"/i)
  const canonical = first(html, /<link rel="canonical" href="([^"]*)"/i)
  const ogTitle = first(html, /<meta property="og:title" content="([^"]*)"/i)
  const ogDesc = first(html, /<meta property="og:description" content="([^"]*)"/i)
  const ogImage = first(html, /<meta property="og:image" content="([^"]*)"/i)
  const ogUrl = first(html, /<meta property="og:url" content="([^"]*)"/i)
  const ogType = first(html, /<meta property="og:type" content="([^"]*)"/i)

  if (title) pass(`title: ${title.slice(0, 60)}`)
  else fail('title なし')

  if (desc && desc.length >= 40) pass(`description: ${desc.length}字`)
  else if (desc) warn(`description 短い: ${desc.length}字`)
  else fail('description なし')

  if (canonical.startsWith(base)) pass(`canonical: ${canonical}`)
  else fail(`canonical 不正: ${canonical}`)

  if (ogTitle && ogDesc && ogImage && ogUrl) pass(`OGP: type=${ogType || '?'}`)
  else fail(`OGP 不足 title=${!!ogTitle} desc=${!!ogDesc} image=${!!ogImage} url=${!!ogUrl}`)

  const types = new Set()
  for (const block of jsonLdBlocks(html)) collectTypes(block, types)
  const typeList = [...types].sort().join(', ')
  pass(`JSON-LD types: ${typeList || '(なし)'}`)

  if (page.name === 'home' && !types.has('Organization')) fail('home に Organization なし')
  if (page.name === 'home' && !types.has('WebSite')) fail('home に WebSite なし')
  if (page.name.startsWith('post') && !types.has('Article')) fail('post に Article なし')
  if (page.name.startsWith('post') && !types.has('BreadcrumbList')) fail('post に BreadcrumbList なし')
  if (page.name !== 'home' && page.name !== 'operator' && !types.has('BreadcrumbList')) {
    warn(`${page.name} に BreadcrumbList なし`)
  }

  const imgs = [...html.matchAll(/<img[^>]*>/gi)].map((m) => m[0])
  const missingAlt = imgs.filter((tag) => !/\balt=/i.test(tag))
  const emptyAlt = imgs.filter((tag) => /\balt=""/.test(tag) || /\balt=''/.test(tag))
  if (missingAlt.length === 0) pass(`img alt 属性あり (${imgs.length}枚, empty=${emptyAlt.length})`)
  else fail(`alt なし img: ${missingAlt.length}`)

  const hasBreadcrumbNav =
    html.includes('breadcrumb') || html.includes('パンくず') || /aria-label="[^"]*パンくず/.test(html)
  if (page.path !== '/') {
    if (hasBreadcrumbNav || types.has('BreadcrumbList')) pass('パンくず（UI or JSON-LD）あり')
    else warn('パンくず UI が見つからない')
  }

  console.log('')
}

// 404
const notFound = await fetch(`${base}/this-page-does-not-exist-seo-audit`)
const nfHtml = await notFound.text()
console.log('--- 404 ---')
if (notFound.status === 404) pass('存在しないURLは HTTP 404')
else fail(`404 が ${notFound.status}`)
if (nfHtml.includes('<title>')) pass(`404 title: ${first(nfHtml, /<title>([^<]*)<\/title>/i)}`)
else warn('404 に title なし')

// robots / sitemap
console.log('\n--- robots / sitemap ---')
const robots = await (await fetch(`${base}/robots.txt`)).text()
if (robots.includes('Sitemap: https://www.hokkaido-miraizukan.jp/sitemap.xml')) {
  pass('robots.txt sitemap 正しい')
} else fail('robots.txt sitemap 不正')

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text()
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
pass(`sitemap.xml ${locs.length} URL`)
if (locs.every((u) => u.startsWith(base))) pass('sitemap 全 www')
else fail('sitemap に www 以外')

// llms.txt
const llms = await fetch(`${base}/llms.txt`)
console.log('\n--- llms.txt ---')
if (llms.status === 200) pass('llms.txt あり')
else warn('llms.txt なし（追加を検討）')

// Core Web Vitals proxy: response headers / HTML size
console.log('\n--- パフォーマンス指標（簡易） ---')
const perf = await fetch(`${base}/post/4`)
const html = await perf.text()
const ttfb = perf.headers.get('x-vercel-cache') || 'n/a'
pass(`post/4 HTML ${Math.round(html.length / 1024)}KB, x-vercel-cache=${ttfb}`)
const hasLazy = html.includes('loading="lazy"') || html.includes('loading=lazy')
if (hasLazy) pass('画像 lazy-load あり')
else warn('loading=lazy が見つからない（Next Image の場合は正常なことも）')

console.log(issues === 0 ? '\n✅ 重大な問題なし' : `\n❌ 要対応 ${issues} 件`)
process.exit(issues === 0 ? 0 : 1)
