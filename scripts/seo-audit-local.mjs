const BASE = process.argv[2] || 'http://localhost:3001'

const PAGES = ['/', '/school/hokkaido-university', '/mock', '/post/1']

function canonical(html) {
  const m = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)
  if (m) return m[1]
  const m2 = html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i)
  return m2?.[1] ?? null
}

function flattenJsonLd(data) {
  if (Array.isArray(data)) return data.flatMap((item) => flattenJsonLd(item))
  if (data && typeof data === 'object' && Array.isArray(data['@graph'])) {
    return flattenJsonLd(data['@graph'])
  }
  return [data]
}

for (const path of PAGES) {
  const html = await fetch(`${BASE}${path}`).then((r) => r.text())
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]
  const desc = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1]
  const robots = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]*)"/i)?.[1]
  const ld = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => {
      try {
        return JSON.parse(m[1])
      } catch {
        return null
      }
    })
    .filter(Boolean)
  const types = ld.flatMap((block) => flattenJsonLd(block).map((item) => item['@type']).filter(Boolean))

  console.log(
    JSON.stringify(
      { path, title, canonical: canonical(html), description: desc?.slice(0, 80), robots, jsonLdTypes: types },
      null,
      2,
    ),
  )
}
