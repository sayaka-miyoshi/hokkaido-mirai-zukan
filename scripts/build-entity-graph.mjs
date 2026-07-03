/**
 * 関連記事グラフ entity-graph.json を生成
 * npm run build:entity-graph
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPublishedPostsForBuild } from './lib/build-helpers.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'public', 'data', 'entity-graph.json')
const RELATED_MAX = 6

function parsePostDate(value) {
  const t = Date.parse(String(value ?? ''))
  return Number.isFinite(t) ? t : 0
}

function sortByNewest(posts) {
  return [...posts].sort((a, b) => {
    const diff = parsePostDate(b.date) - parsePostDate(a.date)
    if (diff !== 0) return diff
    return a.id.localeCompare(b.id, 'ja')
  })
}

function pickPosts(candidates, usedIds, max) {
  const picked = sortByNewest(candidates.filter((post) => !usedIds.has(post.id))).slice(0, max)
  for (const post of picked) usedIds.add(post.id)
  return picked
}

function getRelatedSections(current, allPosts) {
  const pool = allPosts.filter((post) => post.id !== current.id)
  const usedIds = new Set()
  const sections = []

  const sportCategory = String(current.sportCategory ?? '').trim()
  if (sportCategory) {
    const posts = pickPosts(
      pool.filter(
        (post) =>
          String(post.sportCategory ?? '').trim() === sportCategory &&
          (String(post.schoolName ?? '').trim() !== String(current.schoolName ?? '').trim() ||
            String(post.clubName ?? '').trim() !== String(current.clubName ?? '').trim()),
      ),
      usedIds,
      RELATED_MAX,
    )
    if (posts.length > 0) {
      sections.push({ title: `同じ競技の記事（${sportCategory}）`, postIds: posts.map((p) => p.id) })
    }
  }

  const schoolName = String(current.schoolName ?? '').trim()
  if (schoolName) {
    const posts = pickPosts(
      pool.filter((post) => String(post.schoolName ?? '').trim() === schoolName),
      usedIds,
      RELATED_MAX,
    )
    if (posts.length > 0) sections.push({ title: `同じ学校の記事（${schoolName}）`, postIds: posts.map((p) => p.id) })
  }

  const clubName = String(current.clubName ?? '').trim()
  if (clubName) {
    const posts = pickPosts(
      pool.filter((post) => String(post.clubName ?? '').trim() === clubName),
      usedIds,
      RELATED_MAX,
    )
    if (posts.length > 0) sections.push({ title: `同じ部活の記事（${clubName}）`, postIds: posts.map((p) => p.id) })
  }

  const careerCategory = String(current.careerCategory ?? '').trim()
  if (careerCategory) {
    const posts = pickPosts(
      pool.filter(
        (post) =>
          String(post.careerCategory ?? '').trim() === careerCategory &&
          String(post.companyName ?? '').trim() &&
          post.genre === '企業訪問',
      ),
      usedIds,
      RELATED_MAX,
    )
    if (posts.length > 0) {
      sections.push({ title: `関連する企業（${careerCategory}）`, postIds: posts.map((p) => p.id) })
    }
  }

  if (sections.length === 0) {
    const posts = pickPosts(pool, usedIds, RELATED_MAX)
    if (posts.length > 0) sections.push({ title: '新着記事', postIds: posts.map((p) => p.id) })
  }

  return sections
}

const posts = await loadPublishedPostsForBuild()
const generatedAt = new Date().toISOString()
const nodes = {}

for (const post of posts) {
  nodes[post.id] = {
    postId: post.id,
    sections: getRelatedSections(post, posts),
    updatedAt: generatedAt,
  }
}

const graph = {
  version: 1,
  generatedAt,
  postCount: posts.length,
  nodes,
}

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, `${JSON.stringify(graph, null, 2)}\n`, 'utf8')

console.log(`✅ entity-graph.json: ${posts.length} posts → ${outPath}`)
