import { cell, fetchSheetCsvRaw } from './sheet-csv.mjs'

/** スプレッドシートからエンティティページ検証用の Post 一覧を読み込む */
export async function loadSheetPosts() {
  const sheet = await fetchSheetCsvRaw()
  const posts = []
  let id = 0

  for (const { row } of sheet.rows) {
    const title = cell(row, sheet.headerIndex, '投稿タイトル')
    if (!title) continue
    id++
    posts.push({
      id: String(id),
      title,
      genre: cell(row, sheet.headerIndex, 'ジャンル'),
      schoolName: cell(row, sheet.headerIndex, '学校名'),
      clubName: cell(row, sheet.headerIndex, '部活名'),
      companyName: cell(row, sheet.headerIndex, '企業名'),
      sportCategory: cell(row, sheet.headerIndex, '競技カテゴリ'),
      area: cell(row, sheet.headerIndex, 'エリア'),
      description: cell(row, sheet.headerIndex, '説明文'),
      aiSummary: cell(row, sheet.headerIndex, 'ai_summary'),
      slug: cell(row, sheet.headerIndex, 'slug'),
    })
  }

  return posts
}
