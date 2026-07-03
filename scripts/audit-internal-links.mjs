/**
 * 内部リンク到達性・孤立ページ監査
 * node --experimental-strip-types scripts/audit-internal-links.mjs
 */
import {
  collectCompanyNames,
  collectClubNames,
  collectSchoolNames,
  collectSportNames,
  filterSchoolPagePosts,
  filterSportPagePosts,
  partitionClubPagePosts,
  partitionCompanyPagePosts,
} from '../lib/entity-page-posts.ts'
import { getAreaSlug } from '../lib/slugs.ts'
import { getSportSlug } from '../lib/sport-slugs.ts'
import { urls } from './lib/urls-simple.mjs'
import { loadSheetPosts } from './lib/load-sheet-posts.mjs'

const INDEX_LINKS = [
  urls.schools(),
  urls.clubs(),
  urls.sports(),
  urls.companies(),
]

const MAX_CLICKS = 3

function longestCommonSlugPrefix(slugs) {
  const valid = slugs.filter(Boolean)
  if (valid.length === 0) return undefined
  if (valid.length === 1) {
    const parts = valid[0].split('-')
    if (parts.length >= 3) return parts.slice(0, -1).join('-')
    return valid[0]
  }
  const split = valid.map((s) => s.split('-'))
  const minLen = Math.min(...split.map((p) => p.length))
  let i = 0
  while (i < minLen && split.every((p) => p[i] === split[0][i])) i++
  if (i === 0) return undefined
  return split[0].slice(0, i).join('-')
}

function resolveSchoolSlug(posts, schoolName) {
  const schoolPost = posts.find(
    (p) => p.schoolName === schoolName && p.genre === '学校' && p.slug,
  )
  if (schoolPost?.slug) return schoolPost.slug
  const relatedSlugs = [
    ...new Set(posts.filter((p) => p.schoolName === schoolName && p.slug).map((p) => p.slug)),
  ]
  return longestCommonSlugPrefix(relatedSlugs)
}

function resolveClubSlug(posts, clubName) {
  const clubPost = posts.find((p) => p.clubName === clubName && p.genre === '部活' && p.slug)
  if (clubPost) return clubPost.slug
  return posts.find((p) => p.clubName === clubName && p.slug)?.slug
}

function resolveCompanySlug(posts, companyName) {
  const companyPost = posts.find(
    (p) => p.companyName === companyName && p.genre === '企業訪問' && p.slug,
  )
  if (companyPost?.slug) return companyPost.slug
  return posts.find((p) => p.companyName === companyName && p.slug)?.slug
}

function getRelatedClubsForSchool(posts, schoolName) {
  const clubNames = [
    ...new Set(
      posts.filter((p) => p.schoolName === schoolName && p.clubName.trim()).map((p) => p.clubName),
    ),
  ]
  return clubNames.flatMap((name) => {
    const slug = resolveClubSlug(posts, name)
    return slug ? [{ name, slug }] : []
  })
}

function addEdge(graph, from, to) {
  if (!graph.has(from)) graph.set(from, new Set())
  graph.get(from).add(to)
}

function normalize(path) {
  if (!path || path === '/') return '/'
  return path.replace(/\/$/, '') || '/'
}

const posts = await loadSheetPosts()
const graph = new Map()

// --- 全URL一覧 ---
const allUrls = new Set(['/'])
allUrls.add(urls.schools())
allUrls.add(urls.clubs())
allUrls.add(urls.sports())
allUrls.add(urls.companies())
allUrls.add(urls.openCampus())
allUrls.add(urls.operator())

for (const post of posts) allUrls.add(urls.post(post.id))

const schoolSlugs = new Map()
for (const name of collectSchoolNames(posts)) {
  const slug = resolveSchoolSlug(posts, name)
  if (slug) {
    schoolSlugs.set(name, slug)
    allUrls.add(urls.school(slug))
  }
}

const clubSlugs = new Map()
for (const name of collectClubNames(posts)) {
  const slug = resolveClubSlug(posts, name)
  if (slug) {
    clubSlugs.set(name, slug)
    allUrls.add(urls.club(slug))
  }
}

const sportNames = collectSportNames(posts)
for (const name of sportNames) allUrls.add(urls.sport(getSportSlug(name)))

const companySlugs = new Map()
for (const name of collectCompanyNames(posts)) {
  const slug = resolveCompanySlug(posts, name)
  if (slug) {
    companySlugs.set(name, slug)
    allUrls.add(urls.company(slug))
  }
}

const areas = [...new Set(posts.map((p) => p.area).filter(Boolean))]
for (const area of areas) allUrls.add(urls.area(getAreaSlug(area)))

// --- トップからのリンク ---
const home = '/'
const homeDirectLinks = [
  urls.sport('ラクロス'),
  urls.school('hokkaido-university'),
  urls.sport('YOSAKOI'),
  urls.schools(),
  urls.clubs(),
  urls.sports(),
  urls.companies(),
  urls.openCampus(),
  urls.operator(),
]
for (const href of homeDirectLinks) addEdge(graph, home, normalize(href))

// 人気・最新・企業グリッド（全投稿）
for (const post of posts) addEdge(graph, home, urls.post(post.id))

// --- 一覧 → エンティティ ---
for (const [, slug] of schoolSlugs) addEdge(graph, urls.schools(), urls.school(slug))
for (const [, slug] of clubSlugs) addEdge(graph, urls.clubs(), urls.club(slug))
for (const name of sportNames) addEdge(graph, urls.sports(), urls.sport(getSportSlug(name)))
for (const [, slug] of companySlugs) addEdge(graph, urls.companies(), urls.company(slug))

// --- エンティティ相互リンク + 記事 ---
for (const [name, slug] of schoolSlugs) {
  const path = urls.school(slug)
  const schoolPosts = filterSchoolPagePosts(posts, name)
  if (schoolPosts.length === 0) continue
  const clubs = getRelatedClubsForSchool(posts, name)
  for (const link of INDEX_LINKS) addEdge(graph, path, normalize(link))
  for (const club of clubs) addEdge(graph, path, urls.club(club.slug))
  for (const post of schoolPosts) {
    if (post.sportCategory.trim()) {
      addEdge(graph, path, urls.sport(getSportSlug(post.sportCategory)))
    }
    if (post.area) addEdge(graph, path, urls.area(getAreaSlug(post.area)))
    addEdge(graph, path, urls.post(post.id))
  }
}

for (const [name, slug] of clubSlugs) {
  const path = urls.club(slug)
  const { clubPosts, relatedPosts } = partitionClubPagePosts(posts, name)
  if (clubPosts.length === 0) continue
  const schoolName = clubPosts.find((p) => p.schoolName)?.schoolName
  if (schoolName && schoolSlugs.has(schoolName)) {
    addEdge(graph, path, urls.school(schoolSlugs.get(schoolName)))
  }
  const sport = clubPosts.find((p) => p.sportCategory.trim())?.sportCategory.trim()
  if (sport) addEdge(graph, path, urls.sport(getSportSlug(sport)))
  for (const link of INDEX_LINKS) addEdge(graph, path, normalize(link))
  for (const post of [...clubPosts, ...relatedPosts]) addEdge(graph, path, urls.post(post.id))
}

for (const name of sportNames) {
  const path = urls.sport(getSportSlug(name))
  const sportPosts = filterSportPagePosts(posts, name)
  if (sportPosts.length === 0) continue
  for (const link of INDEX_LINKS) addEdge(graph, path, normalize(link))
  for (const post of sportPosts) {
    if (post.clubName && clubSlugs.has(post.clubName)) {
      addEdge(graph, path, urls.club(clubSlugs.get(post.clubName)))
    }
    if (post.schoolName && schoolSlugs.has(post.schoolName)) {
      addEdge(graph, path, urls.school(schoolSlugs.get(post.schoolName)))
    }
    addEdge(graph, path, urls.post(post.id))
  }
}

for (const [name, slug] of companySlugs) {
  const path = urls.company(slug)
  const { companyPosts, relatedPosts } = partitionCompanyPagePosts(posts, name)
  if (companyPosts.length === 0) continue
  for (const link of INDEX_LINKS) addEdge(graph, path, normalize(link))
  for (const post of [...companyPosts, ...relatedPosts]) {
    if (post.area) addEdge(graph, path, urls.area(getAreaSlug(post.area)))
    addEdge(graph, path, urls.post(post.id))
  }
}

// エリアページ
for (const area of areas) {
  const path = urls.area(getAreaSlug(area))
  for (const link of INDEX_LINKS) addEdge(graph, path, normalize(link))
  for (const post of posts.filter((p) => getAreaSlug(p.area) === getAreaSlug(area))) {
    addEdge(graph, path, urls.post(post.id))
  }
}

// 記事 → エンティティ
for (const post of posts) {
  const postPath = urls.post(post.id)
  if (post.schoolName) {
    const slug = schoolSlugs.get(post.schoolName)
    if (slug) addEdge(graph, postPath, urls.school(slug))
  }
  if (post.clubName) {
    const slug = clubSlugs.get(post.clubName)
    if (slug) addEdge(graph, postPath, urls.club(slug))
  }
  if (post.sportCategory.trim()) {
    addEdge(graph, postPath, urls.sport(getSportSlug(post.sportCategory)))
  }
  if (post.companyName && post.genre === '企業訪問') {
    const slug = companySlugs.get(post.companyName)
    if (slug) addEdge(graph, postPath, urls.company(slug))
  }
  if (post.area) addEdge(graph, postPath, urls.area(getAreaSlug(post.area)))
  addEdge(graph, postPath, home)
}

// BFS
const depth = new Map([['/', 0]])
const queue = ['/']
while (queue.length > 0) {
  const current = queue.shift()
  const nextDepth = depth.get(current) + 1
  for (const neighbor of graph.get(current) ?? []) {
    const n = normalize(neighbor)
    if (!depth.has(n)) {
      depth.set(n, nextDepth)
      queue.push(n)
    }
  }
}

const unreachable = [...allUrls].map(normalize).filter((url) => !depth.has(url))
const deepPages = [...depth.entries()].filter(([, d]) => d > MAX_CLICKS)

console.log('=== 内部リンク到達性監査 ===')
console.log(`全ページ数: ${allUrls.size}`)
console.log(`到達可能: ${depth.size}`)
console.log(`孤立（トップから未到達）: ${unreachable.length}`)
console.log(`${MAX_CLICKS}クリック超: ${deepPages.length}`)

if (unreachable.length > 0) {
  console.log('\n❌ 孤立ページ（先頭20件）:')
  for (const url of unreachable.slice(0, 20)) console.log(' ', url)
}

if (deepPages.length > 0) {
  console.log(`\n⚠️  ${MAX_CLICKS}クリック超（先頭15件）:`)
  for (const [url, d] of deepPages.sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`  ${d}クリック: ${url}`)
  }
}

const failed = unreachable.length
console.log(failed === 0 ? '\n✅ 孤立ページなし' : `\n❌ 孤立ページ ${failed} 件`)
process.exit(failed === 0 ? 0 : 1)
