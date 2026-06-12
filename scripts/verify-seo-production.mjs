const base = 'https://hokkaido-mirai-zukan.vercel.app'

async function fetchText(url) {
  const res = await fetch(url)
  return {
    url,
    status: res.status,
    text: await res.text(),
    contentType: res.headers.get('content-type'),
  }
}

function parseMeta(html) {
  const get = (re) => {
    const match = html.match(re)
    return match
      ? match[1]
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
      : null
  }

  return {
    title: get(/<title>([^<]*)<\/title>/i),
    description: get(/name="description" content="([^"]*)"/i),
    ogTitle: get(/property="og:title" content="([^"]*)"/i),
    ogDescription: get(/property="og:description" content="([^"]*)"/i),
    ogImage: get(/property="og:image" content="([^"]*)"/i),
    ogSiteName: get(/property="og:site_name" content="([^"]*)"/i),
    twitterCard: get(/name="twitter:card" content="([^"]*)"/i),
    canonical: get(/rel="canonical" href="([^"]*)"/i),
  }
}

const [robots, sitemap, home, post, ogImage] = await Promise.all([
  fetchText(`${base}/robots.txt`),
  fetchText(`${base}/sitemap.xml`),
  fetchText(`${base}/`),
  fetchText(`${base}/post/1`),
  fetchText(`${base}/opengraph-image`),
])

const sitemapCount = (sitemap.text.match(/<loc>/g) || []).length
const sampleUrls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .slice(0, 5)
  .map((match) => match[1])

console.log(
  JSON.stringify(
    {
      robots: {
        status: robots.status,
        body: robots.text.trim(),
      },
      sitemap: {
        status: sitemap.status,
        urlCount: sitemapCount,
        sampleUrls,
      },
      ogImage: {
        status: ogImage.status,
        contentType: ogImage.contentType,
        bytes: ogImage.text.length,
      },
      home: {
        status: home.status,
        ...parseMeta(home.text),
      },
      post1: {
        status: post.status,
        ...parseMeta(post.text),
      },
    },
    null,
    2,
  ),
)
