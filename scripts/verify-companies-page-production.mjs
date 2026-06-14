const BASE = 'https://www.hokkaido-miraizukan.jp'

async function check(path, follow = false) {
  const r = await fetch(`${BASE}${path}`, { redirect: follow ? 'follow' : 'manual' })
  let canonical = null
  let robotsMeta = null
  let cardCount = null
  if (r.status === 200 && path === '/companies') {
    const html = await r.text()
    const canon =
      html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) ||
      html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i)
    const robots = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i)
    canonical = canon?.[1] ?? null
    robotsMeta = robots?.[1] ?? null
    cardCount = (html.match(/CompanyGridCard|aspect-\[4\/5\]/g) || []).length
  }
  return {
    path,
    status: r.status,
    location: r.headers.get('location'),
    xRobotsTag: r.headers.get('x-robots-tag'),
    canonical,
    robotsMeta,
    cardCount,
  }
}

const manual = await Promise.all([
  check('/companies'),
  check('/company'),
  check('/school'),
  check('/club'),
])

const companiesFollow = await check('/companies', true)
const robotsText = await fetch(`${BASE}/robots.txt`).then((r) => r.text())
const sitemapText = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text())

console.log(
  JSON.stringify(
    {
      base: BASE,
      manual,
      companiesFollow,
      robots: {
        body: robotsText.trim(),
        blocksCompanies: /Disallow:\s*\/compan/i.test(robotsText),
      },
      sitemap: {
        hasCompanies: sitemapText.includes('/companies'),
        companiesUrl: sitemapText.match(/<loc>([^<]*\/companies)<\/loc>/)?.[1] ?? null,
        vercelCount: (sitemapText.match(/vercel\.app/g) || []).length,
      },
      deployOk:
        manual.find((x) => x.path === '/companies')?.status === 200 &&
        manual.find((x) => x.path === '/companies')?.canonical === `${BASE}/companies` &&
        manual.find((x) => x.path === '/company')?.status === 301 &&
        manual.find((x) => x.path === '/school')?.status === 301 &&
        manual.find((x) => x.path === '/club')?.status === 301 &&
        sitemapText.includes('/companies'),
    },
    null,
    2,
  ),
)
