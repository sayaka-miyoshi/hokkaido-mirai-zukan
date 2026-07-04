/**
 * GA4 週次 CSV が無い期間のブートストラップランキング
 * スプレッドシート人気表示 + 新着をスコア化して ranking-snapshot.json を生成
 *
 * npm run ranking:bootstrap
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  loadPublishedPostsForBuild,
  resolveClubSlug,
  resolveCompanySlug,
  resolveSchoolSlug,
  getSportSlug,
} from './lib/build-helpers.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'public', 'data', 'ranking-snapshot.json')
const WEIGHTS = { pageViews: 0.4, searchClicks: 0.3, instagramLandings: 0.3 }

function parseDate(value) {
  const t = Date.parse(String(value ?? '').replace(/\//g, '-'))
  return Number.isFinite(t) ? t : 0
}

function scorePost(post, indexByRecency) {
  let pageViews = 1
  let searchClicks = 0
  let instagramLandings = 0

  if (post.isPopular) {
    pageViews += 50
    const order = Number(post.popularOrder)
    if (Number.isFinite(order) && order > 0) {
      pageViews += Math.max(0, 30 - order * 3)
    }
  }

  // 新しい記事ほど微増（最大20）
  pageViews += Math.max(0, 20 - indexByRecency)

  if (post.genre === '企業訪問') searchClicks += 2
  if (post.sportCategory?.trim()) searchClicks += 1
  if (post.instagramUrl?.trim()) instagramLandings += 3

  return { pageViews, searchClicks, instagramLandings, istepLandings: 0 }
}

function computeScore(metrics) {
  const total =
    metrics.pageViews * WEIGHTS.pageViews +
    metrics.searchClicks * WEIGHTS.searchClicks +
    metrics.instagramLandings * WEIGHTS.instagramLandings
  return {
    total: Math.round(total * 100) / 100,
    pageViews: metrics.pageViews,
    searchClicks: metrics.searchClicks,
    instagramLandings: metrics.instagramLandings,
    computedAt: new Date().toISOString(),
  }
}

function aggregateEntity(posts, nameField, type, slugFn, urlFn) {
  const map = new Map()
  for (const post of posts) {
    const name = String(post[nameField] ?? '').trim()
    if (!name) continue
    if (!map.has(name)) {
      map.set(name, {
        metrics: { pageViews: 0, searchClicks: 0, instagramLandings: 0, istepLandings: 0 },
        postIds: [],
      })
    }
    const bucket = map.get(name)
    bucket.postIds.push(post.id)
    const m = post._metrics
    bucket.metrics.pageViews += m.pageViews
    bucket.metrics.searchClicks += m.searchClicks
    bucket.metrics.instagramLandings += m.instagramLandings
  }

  return [...map.entries()]
    .map(([name, data]) => {
      const slug = slugFn(name)
      return {
        id: `${type}:${slug || name}`,
        type,
        name,
        slug,
        url: urlFn(slug || name),
        postIds: data.postIds,
        metrics: data.metrics,
        score: computeScore(data.metrics),
      }
    })
    .sort((a, b) => b.score.total - a.score.total)
}

const posts = await loadPublishedPostsForBuild()
const byRecency = [...posts].sort((a, b) => parseDate(b.date) - parseDate(a.date))
const recencyIndex = new Map(byRecency.map((p, i) => [p.id, i]))

for (const post of posts) {
  post._metrics = scorePost(post, recencyIndex.get(post.id) ?? 99)
}

const postEntries = posts
  .map((post) => ({
    id: `post:${post.id}`,
    type: 'post',
    name: post.title,
    slug: post.id,
    url: `/post/${post.id}`,
    postIds: [post.id],
    metrics: post._metrics,
    score: computeScore(post._metrics),
  }))
  .sort((a, b) => b.score.total - a.score.total)

const snapshot = {
  version: 1,
  generatedAt: new Date().toISOString(),
  period: {
    start: '',
    end: '',
    label: 'ブートストラップ（人気表示+新着。GA4週次CSVで上書き可）',
  },
  weights: WEIGHTS,
  posts: postEntries,
  schools: aggregateEntity(
    posts,
    'schoolName',
    'school',
    (name) => resolveSchoolSlug(posts, name),
    (slug) => `/school/${slug}`,
  ),
  clubs: aggregateEntity(
    posts,
    'clubName',
    'club',
    (name) => resolveClubSlug(posts, name),
    (slug) => `/club/${slug}`,
  ),
  sports: aggregateEntity(
    posts,
    'sportCategory',
    'sport',
    (name) => getSportSlug(name),
    (slug) => `/sport/${slug}`,
  ),
  companies: aggregateEntity(
    posts.filter((p) => p.genre === '企業訪問'),
    'companyName',
    'company',
    (name) => resolveCompanySlug(posts, name),
    (slug) => `/company/${slug}`,
  ),
}

writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
console.log(`✅ ranking-snapshot.json: posts=${snapshot.posts.length}`)
console.log(`   TOP5: ${snapshot.posts.slice(0, 5).map((p) => p.name).join(' / ')}`)
