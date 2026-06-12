/** 投稿日文字列をタイムスタンプに変換（ソート用） */
export function parsePostDate(dateStr: string): number {
  if (!dateStr) return 0

  const trimmed = dateStr.trim()
  if (!trimmed) return 0

  const slashNormalized = trimmed.replace(/\//g, '-')
  let time = Date.parse(slashNormalized)
  if (!Number.isNaN(time)) return time

  const japanese = trimmed.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日?/)
  if (japanese) {
    const [, year, month, day] = japanese
    time = Date.parse(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    if (!Number.isNaN(time)) return time
  }

  const dotted = trimmed.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})$/)
  if (dotted) {
    const [, year, month, day] = dotted
    time = Date.parse(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    if (!Number.isNaN(time)) return time
  }

  return 0
}
