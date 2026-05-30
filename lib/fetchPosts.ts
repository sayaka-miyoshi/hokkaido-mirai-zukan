import Papa from 'papaparse'

export interface Post {
  title: string
  genre: string
  area: string
  instagramUrl: string
  imageUrl: string
  date: string
  description: string
}

export async function fetchPosts(): Promise<Post[]> {
  const url = process.env.NEXT_PUBLIC_SHEET_CSV_URL
  if (!url) {
    console.warn('NEXT_PUBLIC_SHEET_CSV_URL が設定されていません')
    return []
  }

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('スプレッドシートの取得に失敗しました')
    const text = await res.text()

    const result = Papa.parse<string[]>(text, { skipEmptyLines: true })
    const rows = result.data.slice(1) // 1行目はヘッダーなのでスキップ

    return rows.map((row) => ({
      title:        row[0] ?? '',
      genre:        row[1] ?? '',
      area:         row[2] ?? '',
      instagramUrl: row[3] ?? '',
      imageUrl:     row[4] ?? '',
      date:         row[5] ?? '',
      description:  row[6] ?? '',
    }))
  } catch (error) {
    console.error('データの取得エラー:', error)
    return []
  }
}
