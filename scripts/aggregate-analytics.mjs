/**
 * 週次分析集計 → ranking-snapshot.json
 * npm run aggregate:analytics -- [events.csv]
 *
 * 入力 CSV 列（GA4 エクスポート or Vercel 週次 CSV を正規化）:
 * event_name, post_id, page_type, entity_slug, referrer_source, count
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'papaparse'
import {
  loadPublishedPostsForBuild,
  resolveClubSlug,
  resolveCompanySlug,
  resolveSchoolSlug,
  getSportSlug,
} from './lib/build-helpers.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'public', 'data', 'ranking-snapshot.json')
const csvPath = process.argv[2]

const WEIGHTS = { pageViews: 0.4, searchClicks: 0.3, instagramLandings: 0.3 }

function emptyMetrics() {
  return { pageViews: 0, searchClicks: 0, instagramLandings: 0, istepLandings: 0 }
}

function computeScore(metrics) {
  const total =
    metrics.pageViews * WEIGHTS.pageViews +
    metrics.searchClicks * WEIGHTS.searchClicks +
    metrics.instagramLandings * WEIGHTS.instagramLandings
  const now = new Date().toISOString()
  return {
    total: Math.round(total * 100) / 100,
    pageViews: metrics.pageViews,
    searchClicks: metrics.searchClicks,
    instagramLandings: metrics.instagramLandings,
    computedAt: now,
  }
}

function addMetric(bucket, key, field, count) {
  if (!bucket.has(key)) bucket.set(key, emptyMetrics())
  bucket.get(key)[field] += count
}

const posts = await loadPublishedPostsForBuild()
const postMetrics = new Map()
const schoolMetrics = new Map()
const clubMetrics = new Map()
const sportMetrics = new Map()
const companyMetrics = new Map()

const schoolPosts = new Map()
const clubPosts = new Map()
const sportPosts = new Map()
const companyPosts = new Map()

for (const post of posts) {
  if (post.schoolName?.trim()) {
    const name = post.schoolName.trim()
    if (!schoolPosts.has(name)) schoolPosts.set(name, [])
    schoolPosts.get(name).push(post.id)
  }
  if (post.clubName?.trim()) {
    const name = post.clubName.trim()
    if (!clubPosts.has(name)) clubPosts.set(name, [])
    clubPosts.get(name).push(post.id)
  }
  if (post.sportCategory?.trim()) {
    const name = post.sportCategory.trim()
    if (!sportPosts.has(name)) sportPosts.set(name, [])
    sportPosts.get(name).push(post.id)
  }
  if (post.companyName?.trim()) {
    const name = post.companyName.trim()
    if (!companyPosts.has(name)) companyPosts.set(name, [])
    companyPosts.get(name).push(post.id)
  }
}

if (csvPath) {
  const text = readFileSync(csvPath, 'utf8')
  const { data } = parse(text, { header: true, skipEmptyLines: true })

  for (const row of data) {
    const event = String(row.event_name ?? row.event ?? '').trim()
    const count = Number(row.count ?? row.event_count ?? 1) || 1
    const postId = String(row.post_id ?? '').trim()
    const source = String(row.referrer_source ?? '').trim()

    if (event === 'page_view' && postId) {
      addMetric(postMetrics, postId, 'pageViews', count)
      if (source === 'instagram') addMetric(postMetrics, postId, 'instagramLandings', count)
      if (source === 'istep') addMetric(postMetrics, postId, 'istepLandings', count)
    }
    if (event === 'search_result_click' && postId) {
      addMetric(postMetrics, postId, 'searchClicks', count)
    }
    if (event === 'istep_landing' && postId) {
      addMetric(postMetrics, postId, 'istepLandings', count)
    }
  }

  for (const [name, ids] of schoolPosts) {
    const metrics = emptyMetrics()
    for (const id of ids) {
      const m = postMetrics.get(id)
      if (!m) continue
      metrics.pageViews += m.pageViews
      metrics.searchClicks += m.searchClicks
      metrics.instagramLandings += m.instagramLandings
      metrics.istepLandings += m.istepLandings
    }
    schoolMetrics.set(name, metrics)
  }
  for (const [name, ids] of clubPosts) {
    const metrics = emptyMetrics()
    for (const id of ids) {
      const m = postMetrics.get(id)
      if (!m) continue
      metrics.pageViews += m.pageViews
      metrics.searchClicks += m.searchClicks
      metrics.instagramLandings += m.instagramLandings
      metrics.istepLandings += m.istepLandings
    }
    clubMetrics.set(name, metrics)
  }
  for (const [name, ids] of sportPosts) {
    const metrics = emptyMetrics()
    for (const id of ids) {
      const m = postMetrics.get(id)
      if (!m) continue
      metrics.pageViews += m.pageViews
      metrics.searchClicks += m.searchClicks
      metrics.instagramLandings += m.instagramLandings
      metrics.istepLandings += m.istepLandings
    }
    sportMetrics.set(name, metrics)
  }
  for (const [name, ids] of companyPosts) {
    const metrics = emptyMetrics()
    for (const id of ids) {
      const m = postMetrics.get(id)
      if (!m) continue
      metrics.pageViews += m.pageViews
      metrics.searchClicks += m.searchClicks
      metrics.instagramLandings += m.instagramLandings
      metrics.istepLandings += m.istepLandings
    }
    companyMetrics.set(name, metrics)
  }
} else {
  console.log('ℹ️  イベント CSV 未指定 — 空の ranking-snapshot を更新します')
}

function toEntries(metricMap, type, nameToMeta) {
  return [...metricMap.entries()]
    .map(([name, metrics]) => {
      const meta = nameToMeta(name)
      return {
        id: `${type}:${meta.slug ?? name}`,
        type,
        name,
        slug: meta.slug,
        url: meta.url,
        postIds: meta.postIds,
        metrics,
        score: computeScore(metrics),
      }
    })
    .sort((a, b) => b.score.total - a.score.total)
}

const snapshot = {
  version: 1,
  generatedAt: new Date().toISOString(),
  period: {
    start: process.env.RANKING_PERIOD_START ?? '',
    end: process.env.RANKING_PERIOD_END ?? '',
    label: process.env.RANKING_PERIOD_LABEL ?? (csvPath ? '週次集計' : '未集計'),
  },
  weights: WEIGHTS,
  posts: toEntries(postMetrics, 'post', (id) => ({
    slug: id,
    url: `/post/${id}`,
    postIds: [id],
  })),
  schools: toEntries(schoolMetrics, 'school', (name) => ({
    slug: resolveSchoolSlug(posts, name),
    url: `/school/${resolveSchoolSlug(posts, name) ?? ''}`,
    postIds: schoolPosts.get(name) ?? [],
  })),
  clubs: toEntries(clubMetrics, 'club', (name) => ({
    slug: resolveClubSlug(posts, name),
    url: `/club/${resolveClubSlug(posts, name) ?? ''}`,
    postIds: clubPosts.get(name) ?? [],
  })),
  sports: toEntries(sportMetrics, 'sport', (name) => ({
    slug: getSportSlug(name),
    url: `/sport/${getSportSlug(name)}`,
    postIds: sportPosts.get(name) ?? [],
  })),
  companies: toEntries(companyMetrics, 'company', (name) => ({
    slug: resolveCompanySlug(posts, name),
    url: `/company/${resolveCompanySlug(posts, name) ?? ''}`,
    postIds: companyPosts.get(name) ?? [],
  })),
}

writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
console.log(`✅ ranking-snapshot.json → ${outPath}`)
console.log(`   posts: ${snapshot.posts.length}, schools: ${snapshot.schools.length}`)
