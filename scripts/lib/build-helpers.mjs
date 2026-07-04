/**
 * ビルドスクリプト共通: スプレッドシートから公開記事を読み込み
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cell, fetchSheetCsvRaw } from './sheet-csv.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

function parsePopularFlag(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return ['true', '1', 'yes', 'y', 'はい', '○', '◯', '✓', 'on'].includes(normalized)
}

function parsePublished(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return true
  return !['false', '0', 'no', 'n', 'いいえ', '非公開', '下書き', 'off'].includes(normalized)
}

function clamp(text, max = 160) {
  const normalized = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1)}…`
}

function unique(values) {
  return [...new Set(values.map((v) => String(v ?? '').trim()).filter(Boolean))]
}

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

export function resolveSchoolSlug(posts, schoolName) {
  const schoolPost = posts.find((p) => p.schoolName === schoolName && p.genre === '学校' && p.slug)
  if (schoolPost?.slug) return schoolPost.slug
  const relatedSlugs = unique(posts.filter((p) => p.schoolName === schoolName && p.slug).map((p) => p.slug))
  return longestCommonSlugPrefix(relatedSlugs)
}

export function resolveClubSlug(posts, clubName) {
  const clubPost = posts.find((p) => p.clubName === clubName && p.genre === '部活' && p.slug)
  if (clubPost) return clubPost.slug
  return posts.find((p) => p.clubName === clubName && p.slug)?.slug
}

export function resolveCompanySlug(posts, companyName) {
  const companyPost = posts.find(
    (p) => p.companyName === companyName && p.genre === '企業訪問' && p.slug,
  )
  return companyPost?.slug
}

export function getSportSlug(name) {
  return encodeURIComponent(name.trim())
}

/** lib/slugs.ts と同期（ASCII のみ） */
const AREA_SLUG_MAP = {
  札幌: 'sapporo',
  函館: 'hakodate',
  旭川: 'asahikawa',
  釧路: 'kushiro',
  帯広: 'obihiro',
  北見: 'kitami',
  小樽: 'otaru',
  苫小牧: 'tomakomai',
  千歳: 'chitose',
  富良野: 'furano',
  ニセコ: 'niseko',
  トマム: 'tomamu',
  洞爺湖: 'toyako',
  定山渓: 'jozankei',
  知床: 'shiretoko',
  十勝: 'tokachi',
  檜山: 'hiyama',
  厚岸: 'akkeshi',
  音更町: 'otofuke',
  士幌町: 'shihoro',
  鹿部町: 'shikabe',
  七飯町: 'nanae',
  松前町: 'matsumae',
  長沼町: 'naganuma',
  当別町: 'tobetsu',
  当麻町: 'toma',
  美瑛町: 'biei',
  標津町: 'shibetsu',
  別海町: 'betsukai',
  留寿都村: 'rusutsu',
  岩内郡: 'iwanai',
  北海道江別市: 'ebetsu',
  江別市: 'ebetsu',
  江別: 'ebetsu',
  北海道恵庭市: 'eniwa',
  恵庭市: 'eniwa',
  恵庭: 'eniwa',
  北海道石狩市: 'ishikari',
  石狩市: 'ishikari',
  石狩: 'ishikari',
  北海道美唄市: 'bibai',
  美唄市: 'bibai',
  美唄: 'bibai',
  北海道北広島市: 'kitahiroshima',
  北広島市: 'kitahiroshima',
  北広島: 'kitahiroshima',
  北海道伊達市: 'date',
  伊達市: 'date',
  伊達: 'date',
  室蘭: 'muroran',
  東京都: 'tokyo',
  東京: 'tokyo',
  名古屋: 'nagoya',
  兵庫県: 'hyogo',
  その他: 'other',
}

function isAsciiSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

export function getAreaSlug(area) {
  const trimmed = String(area ?? '').trim()
  if (!trimmed) return 'other'
  if (AREA_SLUG_MAP[trimmed]) return AREA_SLUG_MAP[trimmed]

  const withoutHokkaido = trimmed.replace(/^北海道/, '')
  if (withoutHokkaido !== trimmed) {
    const mapped = AREA_SLUG_MAP[withoutHokkaido] ?? AREA_SLUG_MAP[`${withoutHokkaido}市`]
    if (mapped) return mapped
  }

  const withSuffix =
    AREA_SLUG_MAP[`${trimmed}市`] ?? AREA_SLUG_MAP[`${trimmed}町`] ?? AREA_SLUG_MAP[`${trimmed}村`]
  if (withSuffix) return withSuffix

  const ascii = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (ascii && isAsciiSlug(ascii)) return ascii

  let hash = 0
  for (let i = 0; i < trimmed.length; i++) {
    hash = (Math.imul(31, hash) + trimmed.charCodeAt(i)) | 0
  }
  return `area-${(hash >>> 0).toString(36)}`
}

export function resolvePostLeadSummary(post) {
  const manual = String(post.aiSummary ?? '').trim()
  if (manual) return manual
  const description = String(post.description ?? '').trim()
  if (description) return clamp(description, 160)
  const parts = [post.schoolName, post.clubName, post.companyName, post.sportCategory]
    .map((p) => String(p ?? '').trim())
    .filter(Boolean)
  if (parts.length > 0) return clamp(`${parts.join('・')}に関する紹介記事です。`)
  return clamp(post.title, 160)
}

export function parseFaqJson(raw) {
  const trimmed = String(raw ?? '').trim()
  if (!trimmed) return []
  try {
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null
        const q = String(entry.q ?? entry.question ?? '').trim()
        const a = String(entry.a ?? entry.answer ?? '').trim()
        return q && a ? { q, a } : null
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

export function buildKeywords(post) {
  const base = unique([
    post.title,
    post.genre,
    post.schoolName,
    post.clubName,
    post.companyName,
    post.sportCategory,
    post.careerCategory,
    post.area,
    post.videoCategoryLabel,
  ])
  if (post.schoolName?.includes('北海道大学')) base.push('北大')
  return base
}

export function buildSearchText(parts) {
  return parts
    .flat()
    .map((p) => String(p ?? '').trim().toLowerCase())
    .filter(Boolean)
    .join(' ')
}

export async function loadPublishedPostsForBuild() {
  const sheet = await fetchSheetCsvRaw()
  const posts = []
  let id = 0

  for (const { row } of sheet.rows) {
    const title = cell(row, sheet.headerIndex, '投稿タイトル')
    if (!title) continue
    if (!parsePublished(cell(row, sheet.headerIndex, '公開'))) continue

    id++
    posts.push({
      id: String(id),
      title,
      genre: cell(row, sheet.headerIndex, 'ジャンル'),
      area: cell(row, sheet.headerIndex, 'エリア'),
      schoolName: cell(row, sheet.headerIndex, '学校名'),
      clubName: cell(row, sheet.headerIndex, '部活名'),
      companyName: cell(row, sheet.headerIndex, '企業名'),
      sportCategory: cell(row, sheet.headerIndex, '競技カテゴリ'),
      careerCategory: cell(row, sheet.headerIndex, '進路カテゴリ'),
      description: cell(row, sheet.headerIndex, '説明文'),
      date: cell(row, sheet.headerIndex, '投稿日'),
      slug: cell(row, sheet.headerIndex, 'slug'),
      aiSummary: cell(row, sheet.headerIndex, 'ai_summary'),
      faqJson: cell(row, sheet.headerIndex, 'faq_json'),
      videoCategoryLabel: cell(row, sheet.headerIndex, '動画カテゴリ'),
      instagramUrl: cell(row, sheet.headerIndex, 'InstagramURL'),
      isPopular: parsePopularFlag(cell(row, sheet.headerIndex, '人気表示')),
      popularOrder: (() => {
        const n = Number(cell(row, sheet.headerIndex, '人気順'))
        return Number.isFinite(n) ? n : null
      })(),
    })
  }

  return posts
}

export function loadSearchIntents() {
  const path = join(root, 'data', 'search-intents.json')
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function matchIntents(post, intentTaxonomy) {
  const matched = []
  for (const [intent, rule] of Object.entries(intentTaxonomy)) {
    let ok = true
    if (rule.genre && post.genre !== rule.genre) ok = false
    if (rule.sportCategory && post.sportCategory?.trim() !== rule.sportCategory) ok = false
    if (rule.careerCategory && post.careerCategory?.trim() !== rule.careerCategory) ok = false
    if (rule.schoolName && post.schoolName?.trim() !== rule.schoolName) ok = false
    if (ok && rule.keywords?.length) {
      const haystack = buildSearchText([
        post.title,
        post.description,
        post.schoolName,
        post.clubName,
        post.companyName,
        post.sportCategory,
        post.careerCategory,
        post.area,
      ])
      const keywordHit = rule.keywords.some((kw) => haystack.includes(kw.toLowerCase()))
      if (!keywordHit) ok = false
    }
    if (ok) matched.push(intent)
  }
  return matched
}
