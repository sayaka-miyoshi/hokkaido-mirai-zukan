/**
 * 本番サイトの全内部リンクを巡回し 404 を検出
 * node scripts/audit-all-links-production.mjs [baseUrl]
 */
const base = (process.argv[2] || 'https://www.hokkaido-miraizukan.jp').replace(/\/$/, '')

const SKIP_EXT = /\.(css|js|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|json|xml|txt)$/i

function toPath(href, fromPath) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return null
  }
  if (href.startsWith('http://') || href.startsWith('https://')) {
    try {
      const u = new URL(href)
      if (u.origin !== new URL(base).origin) return null
      return u.pathname
    } catch {
      return null
    }
  }
  if (href.startsWith('//')) return null
  if (href.startsWith('/')) return href.split('?')[0].split('#')[0]
  // relative
  try {
    return new URL(href, `${base}${fromPath}`).pathname
  } catch {
    return null
  }
}

async function fetchHtml(path) {
  const res = await fetch(`${base}${path}`, { redirect: 'follow' })
  const finalUrl = res.url
  const finalPath = new URL(finalUrl).pathname
  return { status: res.status, path: finalPath, html: res.ok ? await res.text() : '' }
}

const queue = ['/']
const visited = new Set()
const statusByPath = new Map()
const failures = []

console.log(`=== 本番リンク巡回: ${base} ===`)

while (queue.length > 0) {
  const path = queue.shift()
  if (visited.has(path)) continue
  if (SKIP_EXT.test(path)) continue
  visited.add(path)

  let result
  try {
    result = await fetchHtml(path)
  } catch (error) {
    failures.push({ path, status: 0, error: String(error) })
    continue
  }

  statusByPath.set(path, result.status)
  if (result.status === 404) {
    failures.push({ path, status: 404 })
    continue
  }
  if (result.status >= 400) {
    failures.push({ path, status: result.status })
    continue
  }

  if (!result.html.includes('<')) continue

  const hrefs = [...result.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
  for (const href of hrefs) {
    const next = toPath(href, path)
    if (!next || visited.has(next) || SKIP_EXT.test(next)) continue
    if (next.startsWith('/api/')) continue
    queue.push(next)
  }
}

// エリア一覧（search-index）も明示チェック
try {
  const idx = await (await fetch(`${base}/data/search-index.json`)).json()
  for (const area of idx.entities?.areas ?? []) {
    const path = area.url?.startsWith('/') ? area.url : `/area/${area.slug}`
    if (!visited.has(path)) queue.push(path)
  }
  while (queue.length > 0) {
    const path = queue.shift()
    if (visited.has(path)) continue
    visited.add(path)
    const res = await fetch(`${base}${path}`, { redirect: 'follow' })
    statusByPath.set(path, res.status)
    if (res.status === 404) failures.push({ path, status: 404 })
    else if (res.status >= 400) failures.push({ path, status: res.status })
  }
} catch {
  // ignore
}

// 日本語エリア URL がリダイレクトされるか
const jpArea = '/area/' + encodeURIComponent('洞爺湖')
const jpRes = await fetch(`${base}${jpArea}`, { redirect: 'manual' })
console.log(`旧URL ${jpArea} → ${jpRes.status} ${jpRes.headers.get('location') || ''}`)

console.log(`巡回ページ数: ${visited.size}`)
console.log(`404/エラー: ${failures.length}`)

if (failures.length > 0) {
  console.log('\n❌ 失敗一覧:')
  for (const f of failures.slice(0, 50)) {
    console.log(`  ${f.status} ${f.path}${f.error ? ` (${f.error})` : ''}`)
  }
  process.exit(1)
}

console.log('\n✅ 本番内部リンクに 404 なし')
process.exit(0)
