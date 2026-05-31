/** 投稿日文字列をタイムスタンプに変換（ソート用） */
export function parsePostDate(dateStr: string): number {
  if (!dateStr) return 0
  const normalized = dateStr.replace(/\//g, '-').trim()
  const time = Date.parse(normalized)
  return Number.isNaN(time) ? 0 : time
}
