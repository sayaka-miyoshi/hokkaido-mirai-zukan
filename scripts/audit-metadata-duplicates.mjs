/**
 * title / description 重複チェック
 * node --experimental-strip-types scripts/audit-metadata-duplicates.mjs
 */
import {
  buildClubSummary,
  buildCompanySummary,
  buildSchoolSummary,
  buildSportSummary,
  resolvePostLeadSummary,
} from '../lib/entity-summary.ts'
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
import { SITE_NAME, SITE_TAGLINE } from '../lib/site.ts'
import { getAreaSlug } from '../lib/slugs.ts'
import { getSportSlug } from '../lib/sport-slugs.ts'
import { loadSheetPosts } from './lib/load-sheet-posts.mjs'

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

function pageTitle(title) {
  return `${title} | ${SITE_NAME}`
}

function findDuplicates(entries, key) {
  const map = new Map()
  for (const entry of entries) {
    const value = entry[key]
    if (!map.has(value)) map.set(value, [])
    map.get(value).push(entry)
  }
  return [...map.entries()].filter(([, list]) => list.length > 1)
}

const posts = await loadSheetPosts()
const metadata = []

metadata.push({
  path: '/',
  title: SITE_NAME,
  description: SITE_TAGLINE,
})

for (const post of posts) {
  metadata.push({
    path: `/post/${post.id}`,
    title: pageTitle(post.title),
    description: resolvePostLeadSummary(post),
  })
}

for (const name of collectSchoolNames(posts)) {
  const slug = resolveSchoolSlug(posts, name)
  const schoolPosts = filterSchoolPagePosts(posts, name)
  if (!slug || schoolPosts.length === 0) continue
  metadata.push({
    path: `/school/${slug}`,
    title: pageTitle(`${name} | 学校紹介・部活一覧`),
    description: buildSchoolSummary(name, schoolPosts),
  })
}

for (const name of collectClubNames(posts)) {
  const slug = resolveClubSlug(posts, name)
  const { clubPosts } = partitionClubPagePosts(posts, name)
  if (!slug || clubPosts.length === 0) continue
  const schoolName = clubPosts.find((p) => p.schoolName.trim())?.schoolName.trim()
  const title = schoolName
    ? pageTitle(`${schoolName} ${name}の活動記事`)
    : pageTitle(`${name}の投稿一覧`)
  metadata.push({ path: `/club/${slug}`, title, description: buildClubSummary(name, clubPosts) })
}

for (const name of collectSportNames(posts)) {
  const sportPosts = filterSportPagePosts(posts, name)
  if (sportPosts.length === 0) continue
  metadata.push({
    path: `/sport/${getSportSlug(name)}`,
    title: pageTitle(`北海道の${name}部活・活動記事`),
    description: buildSportSummary(name, sportPosts),
  })
}

for (const name of collectCompanyNames(posts)) {
  const slug = resolveCompanySlug(posts, name)
  const { companyPosts } = partitionCompanyPagePosts(posts, name)
  if (!slug || companyPosts.length === 0) continue
  metadata.push({
    path: `/company/${slug}`,
    title: pageTitle(`${name}の企業訪問・仕事紹介`),
    description: buildCompanySummary(name, companyPosts),
  })
}

const areas = [...new Set(posts.map((p) => p.area).filter(Boolean))]
for (const area of areas) {
  metadata.push({
    path: `/area/${getAreaSlug(area)}`,
    title: pageTitle(`${area}エリアの投稿一覧`),
    description: `${area}エリアの学校・部活・企業訪問に関する投稿を掲載しています。`,
  })
}

const titleDupes = findDuplicates(metadata, 'title')
const descDupes = findDuplicates(metadata, 'description')

const postTitleDupes = titleDupes.filter(([, pages]) => pages.every((p) => p.path.startsWith('/post/')))
const entityTitleDupes = titleDupes.filter(([, pages]) => pages.some((p) => !p.path.startsWith('/post/')))

console.log('=== メタデータ重複チェック ===')
console.log(`チェック対象: ${metadata.length} ページ`)
console.log(`title 重複（記事）: ${postTitleDupes.length} 組 ※同一タイトルの別投稿`)
console.log(`title 重複（エンティティ）: ${entityTitleDupes.length} 組`)
console.log(`description 重複: ${descDupes.length} 組`)

let failed = 0

if (entityTitleDupes.length > 0) {
  failed++
  console.log('\n❌ エンティティページ title 重複:')
  for (const [title, pages] of entityTitleDupes.slice(0, 10)) {
    console.log(`\n  「${title}」`)
    for (const p of pages.slice(0, 5)) console.log(`    - ${p.path}`)
  }
} else {
  console.log('\n✅ エンティティページ title 重複なし')
}

if (postTitleDupes.length > 0) {
  console.log(`\n⚠️  記事 title 重複: ${postTitleDupes.length} 組（スプレッドシートの投稿タイトル要確認）`)
  for (const [title, pages] of postTitleDupes.slice(0, 5)) {
    console.log(`  「${title.slice(0, 40)}」→ ${pages.map((p) => p.id ?? p.path).join(', ')}`)
  }
}

if (descDupes.length > 0) {
  console.log('\n⚠️  description 重複（要確認）:')
  for (const [desc, pages] of descDupes.slice(0, 10)) {
    console.log(`\n  「${desc.slice(0, 60)}…」`)
    for (const p of pages.slice(0, 5)) console.log(`    - ${p.path}`)
    if (pages.length > 5) console.log(`    ...他 ${pages.length - 5} 件`)
  }
} else {
  console.log('✅ description 重複なし')
}

// 部活・競技の汎用タイトル重複を特別警告
if (entityTitleDupes.length > 0) {
  const generic = entityTitleDupes.filter(([t]) => t.includes('の投稿一覧'))
  if (generic.length > 0) {
    console.log(`\n⚠️  「〇〇の投稿一覧」形式の title 重複: ${generic.length} 組`)
  }
}

process.exit(failed === 0 ? 0 : 1)
