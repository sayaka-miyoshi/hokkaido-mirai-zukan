import Papa from 'papaparse'
import { DUMMY_POSTS, rowToPost } from '@/lib/data'
import type { Post } from '@/types/post'

export type { Post }

export async function fetchPosts(): Promise<Post[]> {
  const url = process.env.NEXT_PUBLIC_SHEET_CSV_URL
  if (!url) {
    console.warn('NEXT_PUBLIC_SHEET_CSV_URL が設定されていません。ダミーデータを使用します。')
    return DUMMY_POSTS
  }

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('スプレッドシートの取得に失敗しました')
    const text = await res.text()

    const result = Papa.parse<string[]>(text, { skipEmptyLines: true })
    const rows = result.data.slice(1) // 1行目はヘッダーなのでスキップ

    return rows.map(rowToPost)
  } catch (error) {
    console.error('データの取得エラー:', error)
    return DUMMY_POSTS
  }
}
