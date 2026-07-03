import { cell } from './sheet-csv.mjs'

const UNPUBLISHED = new Set(['0', '非公開', 'false', 'no', 'off', '×', '✗'])

function parsePublished(row, headerIndex) {
  const status = cell(row, headerIndex, '公開ステータス')
  if (status === '公開') return true
  if (status === '非公開' || status === '下書き') return false

  const legacy = cell(row, headerIndex, '公開').trim().toLowerCase()
  if (!legacy) return true
  if (UNPUBLISHED.has(legacy)) return false
  return true
}

function parsePopular(row, headerIndex) {
  const raw = cell(row, headerIndex, '人気表示').trim().toLowerCase()
  return ['1', 'true', 'yes', 'on', '○', '◯', '✓'].includes(raw)
}

/** 公開CSVから iSTEP 用の投稿配列を構築 */
export function loadPublishedPosts(sheet) {
  const posts = []
  let postId = 0

  for (const { sheetRow, row } of sheet.rows) {
    const title = cell(row, sheet.headerIndex, '投稿タイトル')
    if (!title) continue

    postId++
    if (!parsePublished(row, sheet.headerIndex)) continue

    posts.push({
      id: String(postId),
      sheetRow,
      title,
      genre: cell(row, sheet.headerIndex, 'ジャンル'),
      area: cell(row, sheet.headerIndex, 'エリア'),
      schoolName: cell(row, sheet.headerIndex, '学校名'),
      clubName: cell(row, sheet.headerIndex, '部活名'),
      companyName: cell(row, sheet.headerIndex, '企業名'),
      sportCategory: cell(row, sheet.headerIndex, '競技カテゴリ'),
      slug: cell(row, sheet.headerIndex, 'slug'),
      videoCategory: cell(row, sheet.headerIndex, '動画カテゴリ'),
      careerCategory: cell(row, sheet.headerIndex, '進路カテゴリ'),
      isPopular: parsePopular(row, sheet.headerIndex),
    })
  }

  return posts
}
