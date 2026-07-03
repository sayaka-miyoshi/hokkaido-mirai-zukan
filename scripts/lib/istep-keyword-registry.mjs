import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { DM_CATEGORY } from './dm-suggest.mjs'
import { absPath, ENTRY_URLS, postPath, schoolPath, sportPath, withIstepUtm } from './istep-urls.mjs'
import { resolveSchoolSlug } from './istep-school-slug.mjs'
import { buildIstepReplyMessage, normalizeKeyword } from './istep-messages.mjs'
import { resolvePriority } from './istep-priority.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SYNONYM_PATH = resolve(__dirname, '../../data/istep-synonym-groups.json')

const KEYWORD_MAX = 16

function dmUrl(path, { dmGroup, campaign } = {}) {
  return withIstepUtm(path, { dmGroup, campaign })
}

/** @typedef {{ id: string, type: string, primaryKeyword: string, keywords: string[], category: string, url: string, urlType: string, message: string, postCount: number, postIds: string[], sheetRows: number[], priority: string, notes: string, isPopular: boolean }} KeywordGroup */

function loadSynonymConfig() {
  try {
    return JSON.parse(readFileSync(SYNONYM_PATH, 'utf8'))
  } catch {
    return { groupOverrides: {}, keywordBlacklist: [] }
  }
}

function truncateKeyword(text) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) return ''
  if (trimmed.length <= KEYWORD_MAX) return trimmed
  return trimmed.slice(0, KEYWORD_MAX)
}

function uniqueKeywords(list, { preserveVariants = false } = {}) {
  const seen = new Set()
  const result = []
  for (const raw of list) {
    const kw = preserveVariants
      ? truncateKeyword(String(raw ?? '').trim())
      : truncateKeyword(normalizeKeyword(raw))
    if (!kw || seen.has(kw)) continue
    seen.add(kw)
    result.push(kw)
  }
  return result
}

function sportAutoAliases(sportName) {
  const aliases = []
  if (sportName === 'バドミントン') aliases.push('バトミントン')
  if (sportName === 'バスケットボール') aliases.push('バスケ')
  if (sportName.length <= 12) {
    aliases.push(`女子${sportName}`, `男子${sportName}`)
  }
  return aliases
}

function buildEntryGroups() {
  return [
    {
      id: 'entry:schools',
      type: 'entry',
      primaryKeyword: '学校',
      keywords: ['学校', '大学', '高校'],
      category: '入口',
      url: dmUrl(ENTRY_URLS.schools, { dmGroup: 'entry:schools', campaign: 'schools' }),
      urlType: 'entry',
      message: buildIstepReplyMessage('学校', '入口'),
      postCount: 0,
      postIds: [],
      sheetRows: [],
      notes: 'カテゴリ入口 /schools',
      isPopular: false,
    },
    {
      id: 'entry:clubs',
      type: 'entry',
      primaryKeyword: '部活',
      keywords: ['部活', 'クラブ', 'サークル'],
      category: '入口',
      url: dmUrl(ENTRY_URLS.clubs, { dmGroup: 'entry:clubs', campaign: 'clubs' }),
      urlType: 'entry',
      message: buildIstepReplyMessage('部活動', '入口'),
      postCount: 0,
      postIds: [],
      sheetRows: [],
      notes: 'カテゴリ入口 /clubs',
      isPopular: false,
    },
    {
      id: 'entry:companies',
      type: 'entry',
      primaryKeyword: '企業',
      keywords: ['企業', '会社', '職場'],
      category: '入口',
      url: dmUrl(ENTRY_URLS.companies, { dmGroup: 'entry:companies', campaign: 'companies' }),
      urlType: 'entry',
      message: buildIstepReplyMessage('企業', '入口'),
      postCount: 0,
      postIds: [],
      sheetRows: [],
      notes: 'カテゴリ入口 /companies',
      isPopular: false,
    },
    {
      id: 'entry:tourism',
      type: 'entry',
      primaryKeyword: '観光',
      keywords: ['観光', '旅行', 'イベント'],
      category: '入口',
      url: dmUrl(ENTRY_URLS.tourism, { dmGroup: 'entry:tourism', campaign: 'tourism' }),
      urlType: 'entry',
      message: buildIstepReplyMessage('観光', '入口'),
      postCount: 0,
      postIds: [],
      sheetRows: [],
      notes: 'カテゴリ入口 /tourism',
      isPopular: false,
    },
    {
      id: 'entry:home',
      type: 'entry',
      primaryKeyword: '未来図鑑',
      keywords: ['未来図鑑'],
      category: '入口',
      url: dmUrl(ENTRY_URLS.home, { dmGroup: 'entry:home', campaign: 'home' }),
      urlType: 'entry',
      message: `コメントありがとうございます！

北海道未来図鑑へようこそ！
学校・部活・企業の情報を探せます。
こちらからご覧ください。`,
      postCount: 0,
      postIds: [],
      sheetRows: [],
      notes: 'サイト名コメント用',
      isPopular: false,
    },
    {
      id: 'topic:factory',
      type: 'topic',
      primaryKeyword: '工場',
      keywords: ['工場'],
      category: DM_CATEGORY.COMPANY,
      url: dmUrl(ENTRY_URLS.companies, { dmGroup: 'topic:factory', campaign: 'factory' }),
      postCount: 0,
      postIds: [],
      sheetRows: [],
      notes: '工場系は企業一覧へ',
      isPopular: false,
    },
  ]
}

function buildSportGroups(posts) {
  const names = [...new Set(posts.map((p) => p.sportCategory.trim()).filter(Boolean))]
  return names.map((sportName) => {
    const related = posts.filter((p) => p.sportCategory.trim() === sportName)
    const keywords = uniqueKeywords([sportName, ...sportAutoAliases(sportName)], {
      preserveVariants: true,
    })
    return {
      id: `sport:${sportName}`,
      type: 'sport',
      primaryKeyword: sportName,
      keywords,
      category: DM_CATEGORY.CLUB,
      url: dmUrl(sportPath(sportName), { dmGroup: `sport:${sportName}`, campaign: sportName }),
      urlType: 'sport_list',
      message: buildIstepReplyMessage(sportName, DM_CATEGORY.CLUB),
      postCount: related.length,
      postIds: related.map((p) => p.id),
      sheetRows: related.map((p) => p.sheetRow),
      notes: `競技一覧 ${related.length}件`,
      isPopular: related.some((p) => p.isPopular),
    }
  })
}

function buildSchoolGroups(posts) {
  const names = [...new Set(posts.map((p) => p.schoolName.trim()).filter(Boolean))]
  return names.flatMap((schoolName) => {
    const related = posts.filter((p) => p.schoolName === schoolName)
    const slug = resolveSchoolSlug(posts, schoolName)
    const groupId = slug ? `school:${slug}` : `school:name:${schoolName}`
    const path = slug ? schoolPath(slug) : postPath(related[0].id)
    const url = dmUrl(path, { dmGroup: groupId, campaign: slug ?? schoolName })
    const urlType = slug ? 'school_page' : 'post_only'

    return [
      {
        id: groupId,
        type: 'school',
        primaryKeyword: truncateKeyword(schoolName),
        keywords: uniqueKeywords([schoolName]),
        category: DM_CATEGORY.SCHOOL,
        url,
        urlType,
        message: buildIstepReplyMessage(schoolName, DM_CATEGORY.SCHOOL),
        postCount: related.length,
        postIds: related.map((p) => p.id),
        sheetRows: related.map((p) => p.sheetRow),
        notes: slug ? `学校一覧 /school/${slug}` : `学校ページ未整備→代表記事`,
        isPopular: related.some((p) => p.isPopular),
      },
    ]
  })
}

function isFactoryPost(post) {
  const title = post.title ?? ''
  const video = post.videoCategory ?? ''
  return /工場|製造|見学/.test(`${title} ${video}`)
}

function buildCompanyGroups(posts) {
  const companyPosts = posts.filter(
    (p) => p.genre === '企業訪問' || (p.companyName && isFactoryPost(p)),
  )

  const names = [...new Set(companyPosts.map((p) => p.companyName.trim()).filter(Boolean))]
  const groups = []

  for (const companyName of names) {
    const related = companyPosts.filter((p) => p.companyName === companyName)
    const uniqueTitles = [...new Set(related.map((p) => p.title))]
    if (related.length === 1 && uniqueTitles.length === 1) {
      groups.push({
        id: `post:${related[0].id}`,
        type: 'company_post',
        primaryKeyword: truncateKeyword(companyName || related[0].title),
        keywords: uniqueKeywords([companyName, related[0].title]),
        category: DM_CATEGORY.COMPANY,
        url: dmUrl(postPath(related[0].id), {
          dmGroup: `post:${related[0].id}`,
          campaign: companyName || related[0].title,
        }),
        urlType: 'post_only',
        message: buildIstepReplyMessage(companyName || related[0].title, DM_CATEGORY.COMPANY),
        postCount: 1,
        postIds: [related[0].id],
        sheetRows: [related[0].sheetRow],
        notes: '固有コンテンツ（記事直リンク）',
        isPopular: related[0].isPopular,
      })
      continue
    }

    groups.push({
      id: `company:${companyName}`,
      type: 'company',
      primaryKeyword: truncateKeyword(companyName),
      keywords: uniqueKeywords([companyName]),
      category: DM_CATEGORY.COMPANY,
      url: dmUrl(ENTRY_URLS.companies, { dmGroup: `company:${companyName}`, campaign: companyName }),
      postCount: related.length,
      postIds: related.map((p) => p.id),
      sheetRows: related.map((p) => p.sheetRow),
      notes: `企業一覧 /companies（${related.length}件）`,
      isPopular: related.some((p) => p.isPopular),
    })
  }

  return groups
}

function buildTourismGroups(posts) {
  const tourismPosts = posts.filter((p) =>
    ['観光', 'イベント', '行政・自治体'].includes(p.genre),
  )

  const topicMap = new Map()
  for (const post of tourismPosts) {
    if (/雪まつり/.test(post.title)) {
      const key = 'topic:snow-festival'
      if (!topicMap.has(key)) {
        topicMap.set(key, { label: '雪まつり', posts: [] })
      }
      topicMap.get(key).posts.push(post)
      continue
    }

    if (post.companyName && post.companyName.length <= KEYWORD_MAX) {
      const key = `tourism:${post.companyName}`
      if (!topicMap.has(key)) {
        topicMap.set(key, { label: post.companyName, posts: [post] })
      } else {
        topicMap.get(key).posts.push(post)
      }
      continue
    }

    const key = `post:${post.id}`
    topicMap.set(key, { label: truncateKeyword(post.title.split(/[｜|／/・—–-]/)[0]), posts: [post] })
  }

  return [...topicMap.entries()].map(([id, { label, posts: related }]) => {
    const useTourismList = related.length >= 2 && !id.startsWith('post:')
    const path = useTourismList ? ENTRY_URLS.tourism : postPath(related[0].id)
    const url = dmUrl(path, { dmGroup: id, campaign: label })

    return {
      id,
      type: 'tourism',
      primaryKeyword: label,
      keywords: uniqueKeywords([label, ...related.map((p) => p.title)]),
      category: DM_CATEGORY.TOURISM_CULTURE,
      url,
      urlType: useTourismList ? 'tourism_list' : 'post_only',
      message: buildIstepReplyMessage(label, DM_CATEGORY.TOURISM_CULTURE),
      postCount: related.length,
      postIds: related.map((p) => p.id),
      sheetRows: related.map((p) => p.sheetRow),
      notes: useTourismList ? '観光一覧 /tourism' : '個別記事',
      isPopular: related.some((p) => p.isPopular),
    }
  })
}

function mergeGroupOverrides(groups, config) {
  const overrides = config.groupOverrides ?? {}
  const blacklist = new Set(config.keywordBlacklist ?? [])

  const merged = groups.map((group) => {
    const override = overrides[group.id] ?? {}
    const extraAliases = override.aliases ?? []
    const keywords = uniqueKeywords(
      [group.primaryKeyword, ...group.keywords, ...extraAliases],
      { preserveVariants: true },
    )
    const filtered = keywords.filter((kw) => !blacklist.has(kw))
    const priority = resolvePriority(group, override)

    return {
      ...group,
      keywords: filtered.length > 0 ? filtered : [group.primaryKeyword],
      priority,
      manualPriority: override.priority ?? '',
    }
  })

  return merged.filter((g) => g.keywords.length > 0)
}

function dedupeGroupsByKeyword(groups) {
  const keywordOwner = new Map()
  const result = []

  const sorted = [...groups].sort((a, b) => {
    const p = { A: 0, B: 1, C: 2 }
    return (p[a.priority] ?? 9) - (p[b.priority] ?? 9) || b.postCount - a.postCount
  })

  for (const group of sorted) {
    const ownedKeywords = []
    for (const kw of group.keywords) {
      if (keywordOwner.has(kw)) continue
      keywordOwner.set(kw, group.id)
      ownedKeywords.push(kw)
    }
    if (ownedKeywords.length === 0) continue
    result.push({ ...group, keywords: ownedKeywords })
  }

  return result
}

/** 記事データからキーワードグループ一覧を構築 */
export function buildKeywordRegistry(posts) {
  const config = loadSynonymConfig()
  const entryGroups = buildEntryGroups()
  const sportGroups = buildSportGroups(posts)
  const schoolGroups = buildSchoolGroups(posts)
  const companyGroups = buildCompanyGroups(posts)
  const tourismGroups = buildTourismGroups(posts)

  const all = [...entryGroups, ...sportGroups, ...schoolGroups, ...companyGroups, ...tourismGroups]
  const merged = mergeGroupOverrides(all, config)

  const factoryPosts = posts.filter((p) => isFactoryPost(p))
  const factoryGroup = merged.find((g) => g.id === 'topic:factory')
  if (factoryGroup && factoryPosts.length > 0) {
    factoryGroup.postCount = factoryPosts.length
    factoryGroup.postIds = factoryPosts.map((p) => p.id)
    factoryGroup.sheetRows = factoryPosts.map((p) => p.sheetRow)
  }

  return dedupeGroupsByKeyword(merged)
}

/** グループを iSTEP 登録行（キーワード単位）に展開 */
export function expandToKeywordRows(groups) {
  const rows = []
  for (const group of groups) {
    for (const keyword of group.keywords) {
      rows.push({
        group_id: group.id,
        keyword,
        is_primary: keyword === group.primaryKeyword ? 'yes' : 'no',
        priority: group.priority,
        dm_category: group.category,
        dm_url: group.url,
        dm_message: group.message,
        url_type: group.urlType,
        post_count: String(group.postCount),
        notes: group.notes,
      })
    }
  }
  return rows.sort((a, b) => {
    const pg = a.priority.localeCompare(b.priority)
    if (pg !== 0) return pg
    if (a.group_id !== b.group_id) return a.group_id.localeCompare(b.group_id, 'ja')
    return a.keyword.localeCompare(b.keyword, 'ja')
  })
}

/** スプレッドシート Z〜AE 貼り付け用（記事行ごと） */
export function buildSheetSyncRows(groups) {
  const rows = []
  for (const group of groups) {
    for (const sheetRow of group.sheetRows) {
      rows.push({
        sheet_row: String(sheetRow),
        dm_group_id: group.id,
        dm_priority: group.priority,
        dm_keyword: group.primaryKeyword,
        dm_url: group.url,
        dm_message: group.message,
        dm_category: group.category,
      })
    }
  }
  return rows.sort((a, b) => Number(a.sheet_row) - Number(b.sheet_row))
}

export function summarizeRegistry(groups, keywordRows) {
  const byPriority = { A: 0, B: 0, C: 0 }
  for (const group of groups) {
    byPriority[group.priority] = (byPriority[group.priority] ?? 0) + 1
  }

  return {
    groupCount: groups.length,
    keywordCount: keywordRows.length,
    postLinkedRows: buildSheetSyncRows(groups).length,
    byPriority,
    sportListCount: groups.filter((g) => g.urlType === 'sport_list').length,
    schoolPageCount: groups.filter((g) => g.urlType === 'school_page').length,
    postOnlyCount: groups.filter((g) => g.urlType === 'post_only').length,
  }
}
