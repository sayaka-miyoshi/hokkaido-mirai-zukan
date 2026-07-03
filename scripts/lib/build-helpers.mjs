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
  if (companyPost?.slug) return companyPost.slug
  return posts.find((p) => p.companyName === companyName && p.slug)?.slug
}

export function getSportSlug(name) {
  return encodeURIComponent(name.trim())
}

export function getAreaSlug(area) {
  const map = {
    札幌: 'sapporo',
    旭川: 'asahikawa',
    函館: 'hakodate',
    小樽: 'otaru',
    帯広: 'obihiro',
    釧路: 'kushiro',
    北見: 'kitami',
    室蘭: 'muroran',
  }
  return map[area.trim()] ?? area.trim().toLowerCase().replace(/\s+/g, '-')
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
      isPopular: parsePopularFlag(cell(row, sheet.headerIndex, '人気表示')),
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
