/**
 * AIチャット検索向け search-index.json を生成
 * npm run build:search-index
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildKeywords,
  buildSearchText,
  getAreaSlug,
  getSportSlug,
  loadPublishedPostsForBuild,
  loadSearchIntents,
  matchIntents,
  parseFaqJson,
  resolveClubSlug,
  resolveCompanySlug,
  resolvePostLeadSummary,
  resolveSchoolSlug,
} from './lib/build-helpers.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'public', 'data', 'search-index.json')

function unique(values) {
  return [...new Set(values.map((v) => String(v ?? '').trim()).filter(Boolean))]
}

function buildEntityIndex(posts, type, nameField, slugResolver) {
  const map = new Map()
  for (const post of posts) {
    const name = String(post[nameField] ?? '').trim()
    if (!name) continue
    const slug = slugResolver(posts, name)
    if (!slug) continue
    const key = `${type}:${name}`
    if (!map.has(key)) {
      map.set(key, {
        id: `${type}:${slug}`,
        name,
        slug,
        url: `/${type}/${slug}`,
        postIds: [],
        keywords: [name],
      })
    }
    map.get(key).postIds.push(post.id)
  }
  return [...map.values()]
}

function buildAreaIndex(posts) {
  const map = new Map()
  for (const post of posts) {
    const name = String(post.area ?? '').trim()
    if (!name) continue
    const slug = getAreaSlug(name)
    const key = `area:${slug}`
    if (!map.has(key)) {
      map.set(key, { id: `area:${slug}`, name, slug, url: `/area/${slug}`, postIds: [], keywords: [name] })
    }
    map.get(key).postIds.push(post.id)
  }
  return [...map.values()]
}

const posts = await loadPublishedPostsForBuild()
const intentTaxonomy = loadSearchIntents()

const documents = posts.map((post) => {
  const schoolSlug = post.schoolName?.trim() ? resolveSchoolSlug(posts, post.schoolName.trim()) : ''
  const clubSlug = post.clubName?.trim() ? resolveClubSlug(posts, post.clubName.trim()) : ''
  const companySlug = post.companyName?.trim() ? resolveCompanySlug(posts, post.companyName.trim()) : ''
  const sportSlug = post.sportCategory?.trim() ? getSportSlug(post.sportCategory) : ''
  const areaSlug = post.area?.trim() ? getAreaSlug(post.area) : ''
  const summary = resolvePostLeadSummary(post)
  const faq = parseFaqJson(post.faqJson)
  const keywords = buildKeywords(post)
  const intents = matchIntents(post, intentTaxonomy)
  const relatedEntityIds = unique([
    schoolSlug ? `school:${schoolSlug}` : '',
    clubSlug ? `club:${clubSlug}` : '',
    companySlug ? `company:${companySlug}` : '',
    sportSlug ? `sport:${sportSlug}` : '',
    areaSlug ? `area:${areaSlug}` : '',
  ])

  const filters = {
    genre: post.genre || undefined,
    schoolName: post.schoolName?.trim() || undefined,
    schoolSlug: schoolSlug || undefined,
    clubName: post.clubName?.trim() || undefined,
    clubSlug: clubSlug || undefined,
    companyName: post.companyName?.trim() || undefined,
    companySlug: companySlug || undefined,
    sportCategory: post.sportCategory?.trim() || undefined,
    sportSlug: sportSlug || undefined,
    careerCategory: post.careerCategory?.trim() || undefined,
    area: post.area?.trim() || undefined,
    areaSlug: areaSlug || undefined,
  }

  const embeddingText = [
    post.title,
    summary,
    keywords.join(' '),
    faq.map((item) => `${item.q} ${item.a}`).join(' '),
    intents.join(' '),
  ]
    .join('\n')
    .trim()

  return {
    id: `post:${post.id}`,
    type: 'post',
    title: post.title,
    summary,
    url: `/post/${post.id}`,
    genre: post.genre,
    keywords,
    intents,
    faq,
    filters,
    searchText: buildSearchText([post.title, summary, keywords, intents, faq.flatMap((f) => [f.q, f.a])]),
    embeddingText,
    relatedEntityIds,
    publishedAt: post.date || '',
    postId: post.id,
  }
})

const index = {
  version: 1,
  generatedAt: new Date().toISOString(),
  documentCount: documents.length,
  documents,
  entities: {
    schools: buildEntityIndex(posts, 'school', 'schoolName', resolveSchoolSlug),
    clubs: buildEntityIndex(posts, 'club', 'clubName', resolveClubSlug),
    sports: buildEntityIndex(posts, 'sport', 'sportCategory', (_, name) => getSportSlug(name)),
    companies: buildEntityIndex(posts, 'company', 'companyName', resolveCompanySlug),
    areas: buildAreaIndex(posts),
  },
  intentTaxonomy,
}

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8')

console.log(`✅ search-index.json: ${documents.length} documents → ${outPath}`)
